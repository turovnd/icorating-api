const logger = require('../logger')();
const axios  = require('axios');

let countFollows_ = function (pageName) {
    if (pageName === "" || pageName === null || pageName === undefined) {
        return 0;
    }
    return axios.get('https://www.reddit.com/r/' + pageName + '/about.json')
        .then(response => {
            return response.data.data.subscribers;
        })
        .catch(error => {
            logger.error("Reddit: error occur on getting fan count: " + error);
            return 0;
        });
};

module.exports = {
    countFollows: countFollows_
};