const axios = require('axios');

module.exports = function (callback) {

    axios.get('https://poloniex.com/public', {
            params:{
                command: "returnTicker"
            }
        })
        .then(function (response) {
            callback(null, {
                ETH_BTC: response.data.BTC_ETH.last,
                BTC_USD: response.data.USDT_BTC.last,
                ETH_USD: response.data.USDT_ETH.last
            });
        })
        .catch(function (error) {
            callback(error);
        });

};