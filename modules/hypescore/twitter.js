const logger = require('../logger')();
const axios  = require('axios');

let countFollowers_ = function (pageName) {
    if (pageName === "" || pageName === null || pageName === undefined) {
        return 0;
    }
    return axios.get('https://cdn.syndication.twimg.com/widgets/followbutton/info.json?screen_names=' + pageName)
        .then(response => {
            return parseInt(response.data[0]['followers_count']);
        })
        .catch(error => {
            logger.error("Twitter: error occur on getting followers count: " + error);
            return 0;
        });
};

module.exports = {
    countFollowers: countFollowers_
};