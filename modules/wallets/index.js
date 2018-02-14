const tress      = require('tress');
const logger     = require('./../logger')();
const models     = require('../../models');
const Exchanges  = require('../exchanges');
const blockchain = require('./blockchain');
const etherscan  = require('./etherscan');

let projects = [];

// Update `projects` Array
let updateProjectsArr_ = function (action, project) {

    switch (action) {
        case "add":
            projects.push(project);
            break;
        case "update":
            for (let i in projects) {
                if (parseInt(projects[i].id) === parseInt(project.id)) {
                    projects[i] = project;
                    break;
                }
            }
            break;
        case "delete":
            for (let i in projects) {
                if (parseInt(projects[i].id) === parseInt(project.id)) {
                    projects.splice(i, 1);
                    break;
                }
            }
            break;
    }
};

// Get All Projects
let getAllProjects_ = function () {

    return models.projects.findAll({
        include: ["Prices"],
        order: [["created_at", 'DESC']]
    })
        .then(getProjects => {

            return getProjects.map(project => {

                return Object.assign(
                    {},
                    {
                        id          : project.getDataValue('id'),
                        name        : project.getDataValue('name'),
                        ticker      : project.getDataValue('ticker'),
                        wallets     : project.getDataValue('wallets'),
                        created_at  : project.getDataValue('created_at'),
                        price       : project.getPrices()[project.getPrices().length - 1] || {}
                    }
                );
            });
        });

};

// Update Project
let updateProjectBalanceInDB_ = function (project) {
    models.projects_prices.create({
        project_id: project.id,
        price_btc: project.price_btc,
        price_eth: project.price_eth,
        price_usd: project.price_usd,
        created_at: new Date()
    });
};


// Get Poloniex Course Exchange
let getCourse_ = async function () {

    let course = await Exchanges.poloniex();

    if (course.ETH_BTC === undefined) {
        logger.error("Error occurred on getting poloniex course: " + error);
        return getCourse_();
    } else {
        return course;
    }

};

// Update Balance by Project Wallets
let updateAddressBalance_ = function (project, course, done) {

    let priceArr  = { BTC: 0, ETH: 0, USD: 0 },

        queue = tress(function (address, callback) {

            if (address.length === 34) {

                // Bitcoin wallet​
                blockchain(address, function (err, object) {
                    if (!err) {
                        priceArr.BTC += parseFloat(object);
                        priceArr.ETH += (1 / parseFloat(course.ETH_BTC)) * parseFloat(object);
                        priceArr.USD += parseFloat(course.BTC_USD) * parseFloat(object);
                    }
                    callback()
                });

            } else if (address.length === 42) {

                // Ethereum​ ​wallet
                etherscan(address, function (err, object) {
                    if (!err) {
                        priceArr.BTC += parseFloat(course.ETH_BTC) * parseFloat(object);
                        priceArr.ETH += parseFloat(object);
                        priceArr.USD += parseFloat(course.ETH_USD) * parseFloat(object);
                    }
                    callback()
                });

            }

        }, 10),

        complete = function () {
            project.price_btc = priceArr.BTC;
            project.price_eth = priceArr.ETH;
            project.price_usd = priceArr.USD;
            project.updated_at = new Date();
            updateProjectBalanceInDB_(project);
            done(project);
        };


    let addresses  = project.wallets.split(','),
        hasAddress = false;

    for (let i in addresses) {
        if (addresses[i].length === 34 || addresses[i].length === 42) {
            queue.push(addresses[i])
            hasAddress = true;
        }
    }

    if (!hasAddress) {
        complete();
    }

    queue.drain = function () {
        complete();
    };

};

// Update All Project Wallets Balances
let updateWalletBalance_ = async function (project, callback) {
    let course = await getCourse_();

    if (project) {
        updateAddressBalance_(project, course, callback);
    } else {
        if (projects.length > 0) {
            for (let i in projects) {
                updateAddressBalance_(projects[i], course, () => {} );
            }
        }
    }
};

let initWallets_ = async function () {
    projects = await getAllProjects_();
    await updateWalletBalance_();
    setInterval(updateWalletBalance_, 1000*60*60*12);
};

module.exports = {
    init            : initWallets_,
    updateBalance   : updateWalletBalance_,
    updateProjects  : updateProjectsArr_
};