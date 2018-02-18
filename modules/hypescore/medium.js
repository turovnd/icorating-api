const logger = require('../logger')();
const axios  = require('axios');

let countFollows_ = function (pageName) {
    if (pageName === "" || pageName === null || pageName === undefined) {
        return 0;
    }
    return axios.get('https://medium.com/' + pageName + '/?format=json')
        .then(response => {
            let data = JSON.parse(response.data.substring(response.data.search('{'), response.data.length)),
                userId = data.payload.user.userId;
            return data['payload']['references']['SocialStats'][userId]['usersFollowedByCount'];
        })
        .catch(error => {
            logger.error("Medium: error occur on getting fan count: " + error);
            return 0;
        });
};

module.exports = {
    countFollows: countFollows_
};

