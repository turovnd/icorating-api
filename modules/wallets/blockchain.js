const axios = require('axios');

module.exports = function (address, callback) {

    axios.get('https://blockchain.info/ru/q/getsentbyaddress/' + address)
        .then(function (response) {
            callback(null, parseFloat(response.data) / 100000000);
        })
        .catch(function (error) {
            callback(error);
        });

};