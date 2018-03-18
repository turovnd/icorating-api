const tress      = require('tress');
const logger     = require('../logger')();
const models     = require('../../models');
const Exchanges  = require('../exchanges');
const blockchain = require('./blockchain');
const etherscan  = require('./etherscan');

// Get All Projects
let getAllProjects_ = function () {

    return models.projects.findAll({
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
                    }
                );

            });

        });

};

// Update Project
let updateProjectBalanceInDB_ = function (project) {
    return models.projects_prices.findOne({
        where: {project_id: project.id},
        order: [["created_at", 'DESC']]
    })
        .then(oldprice => {

            if (oldprice !== null) {
                if (project.price_btc === 0 && oldprice.getDataValue('price_btc') !== 0)
                    project.price_btc = oldprice.getDataValue('price_btc');
                if (project.price_eth === 0 && oldprice.getDataValue('price_eth') !== 0)
                    project.price_eth = oldprice.getDataValue('price_eth');
                if (project.price_usd === 0 && oldprice.getDataValue('price_usd') !== 0)
                    project.price_usd = oldprice.getDataValue('price_usd');
            }

            models.projects_prices.create({
                project_id: project.id,
                price_btc: project.price_btc,
                price_eth: project.price_eth,
                price_usd: project.price_usd,
                created_at: new Date()
            });

            return project;
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

        }, 1),

        complete = async function () {
            project.price_btc = priceArr.BTC;
            project.price_eth = priceArr.ETH;
            project.price_usd = priceArr.USD;
            project.updated_at = new Date();

            project = await updateProjectBalanceInDB_(project);

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
let updateWalletBalance_ = async function () {
    let projects = await getAllProjects_();
    let course = await getCourse_();

    if (projects.length > 0) {
        for (let i in projects) {
            updateAddressBalance_(projects[i], course, () => { } );
        }
    }
};

let initWallets_ = async function () {
    await updateWalletBalance_();
    setInterval(updateWalletBalance_, 1000*60*60*12);
};

module.exports = {
    init            : initWallets_,
    getCourse       : getCourse_,
    updateBalance   : updateAddressBalance_,
};