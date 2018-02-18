const logger = require('../logger')();
const axios  = require('axios');

let countFollowers_ = function (pageName) {
    if (pageName === "" || pageName === null || pageName === undefined) {
        return 0;
    }
    return axios.get('https://www.reddit.com/r/' + pageName + '/about.json')
        .then(response => {
            return parseInt(response.data.data.subscribers);
        })
        .catch(error => {
            logger.error("Reddit: error occur on getting followers count: " + error);
            return 0;
        });
};

module.exports = {
    countFollowers: countFollowers_
};