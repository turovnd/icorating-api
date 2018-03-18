const logger = require('../logger')();
const axios  = require('axios');

let countFollowers_ = function (pageName) {
    if (pageName === "" || pageName === null || pageName === undefined) {
        return -1;
    }

    let url = 'https://www.reddit.com/r/' + pageName + '/about.json';

    return axios.get(url)
        .then(response => {
            return parseInt(response.data.data.subscribers)
        })
        .catch(error => {
            logger.error("Reddit: error occur on getting followers count: `" + url + "`. " + error);
            return -1;
        });
};

module.exports = {
    countFollowers: countFollowers_
};