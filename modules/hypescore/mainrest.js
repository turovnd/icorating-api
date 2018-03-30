const logger  = require('../logger')();
const axios   = require('axios');

module.exports = (name) => {

    if (name === "" || name === null || name === undefined) {
        return -1;
    }

    let url = 'http://rss.mainrest.ru/keyword/' + process.env.MAINREST_GROUP + '/'+ name;

    return axios.get(url)
        .then(response => {
            return parseInt(response.data.count);
        })
        .catch(error => {
            logger.error('Mainrest: could not load page: `' + url + '`. ' + error);
            return -2;
        });

};