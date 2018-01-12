const axios      = require('axios');
const tress      = require('tress');
const logger     = require('./../logger')();
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
        case "delete":
            for (let i in projects) {
                if (parseInt(projects[i].id) === parseInt(project.id)) {
                    projects.splice(i, 1);
                }
            }
            break;
    }
};

// Get All Projects
let getProjects_ = function (callback) {
    axios.get(process.env.SITE + ":" + process.env.PORT + '/api/projects')
        .then(function (response) {
            projects = response.data.data;
            callback();
        })
        .catch(function (error) {
            logger.error("Error occurred on getting projects: " + error);
            setTimeout(getProjects_, 5000);
        });
};

// Update Project
let updateProject_ = function (project) {
    axios.put(process.env.SITE + ":" + process.env.PORT + '/api/project/' + project.id, project)
        .catch(function (error) {
            logger.error("Error occurred on updating project `id=" + project.id + "`: " + error);
            setTimeout(function () { updateProject_(project) }, 2000);
        });
};


// Get Poloniex Course Exchange
let getCourse_ = function (callback) {
    Exchanges.poloniex(function (error, object) {
        if (error) {
            logger.error("Error occurred on getting poloniex course: " + error);
            getCourse_(callback);
        } else {
            callback(object);
        }
    });
};

// Update Balance by Project Wallets
let updateBalance_ = function (project, done, course) {

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
            project.priceBTC = priceArr.BTC;
            project.priceETH = priceArr.ETH;
            project.priceUSD = priceArr.USD;
            project.dt_update = new Date();
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
let updateBalances_ = function (project, callback) {
    getCourse_(function (course) {
        if (project) {
            updateBalance_(project, callback, course);
        } else {
            if (projects.length > 0) {
                for (let i in projects) {
                    updateBalance_(projects[i], updateProject_, course);
                }
            }
        }
    })
};

let initWallets_ = function () {
    getProjects_(updateBalances_);
    setInterval(updateBalances_, 10*60*1000);
};

module.exports = {
    init            : initWallets_,
    updateBalances  : updateBalances_,
    updateProjects  : updateProjectsArr_
};