const logger = require('../logger')();
const axios  = require('axios');

let countFollowers_ = function (pageName) {
    if (pageName === "" || pageName === null || pageName === undefined) {
        return -1;
    }

    let url = 'https://cdn.syndication.twimg.com/widgets/followbutton/info.json?screen_names=' + pageName;

    return axios.get(url)
        .then(response => {
            return parseInt(response.data[0]['followers_count']);
        })
        .catch(error => {
            logger.error("Twitter: error occur on getting followers count: `" + url + "`. " + error);
        });
};

module.exports = {
    countFollowers: countFollowers_
};