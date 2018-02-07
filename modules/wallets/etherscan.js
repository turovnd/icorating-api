const axios = require('axios');
const models = require('../../models');

/**
 * Get transactions by `address` and update them in DB
 * @param address
 * @param callback
 */
module.exports = function (address, callback) {

    axios.get('https://api.etherscan.io/api', {
            params: {
                module: 'account',
                action: 'txlist',
                address: address,
                sort: 'desc',
                startblock: 0,
                endblock: 99999999,
                apikey : process.env.API_ETHERSCAN
            }
        })
        .then(function (response) {
            let getTransactions = response.data.result,
                insertArray = [],
                current = {},
                currentValue = 0,
                totalValue = 0;

            // Update Address Transactions
            models.transactions.findAll({
                where: {address: address},
                order: [['timeStamp','DESC']]
            }).then(transactions => {
                if (transactions.length === 0) {
                    // save all transaction to DB
                    while (getTransactions.length !== 0) {
                        current = getTransactions.pop();
                        currentValue = parseFloat(current.value) / 1000000000000000000;
                        totalValue += currentValue;
                        insertArray.push({
                            address: address,
                            hash: current.hash,
                            timeStamp: current.timeStamp,
                            from: current.from,
                            to: current.to,
                            value: currentValue,
                            totalValue: totalValue
                        })
                    }
                } else {
                    // get last transaction from DB
                    let timeStamp = transactions[0].get('timeStamp'),
                        flag = true;

                    totalValue = transactions[0].get('totalValue');

                    while (flag) {
                        current = getTransactions.shift();
                        if (parseInt(current.timeStamp) === parseInt(timeStamp)) {
                            flag = false;
                        } else {
                            currentValue = parseFloat(current.value) / 1000000000000000000;
                            totalValue += currentValue;
                            insertArray.push({
                                address: address,
                                hash: current.hash,
                                timeStamp: current.timeStamp,
                                from: current.from,
                                to: current.to,
                                value: currentValue,
                                totalValue: totalValue
                            })
                        }
                    }
                }
                models.transactions.bulkCreate(insertArray).then(() => {
                    callback(null, totalValue);
                })
            });

        })
        .catch(function (error) {
            callback(error);
        });

};