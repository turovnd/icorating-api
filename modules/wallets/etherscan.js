const axios = require('axios');

module.exports = function (address, callback) {

    axios.get('https://api.etherscan.io/api', {
            params: {
                module: 'account',
                action: 'balance',
                address: address,
                tag: 'latest',
                apikey : process.env.API_ETHERSCAN
            }
        })
        .then(function (response) {
            callback(null, parseFloat(response.data.result) / 1000000000000000000);
        })
        .catch(function (error) {
            callback(error);
        });

};