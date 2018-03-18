const logger   = require('../logger')();
const Facebook = require('facebook-node-sdk');

const facebook = new Facebook({ appId: process.env.FACEBOOK_APP_ID, secret: process.env.FACEBOOK_SECRET });

let countFollowers_ = function (pageName) {
    if (pageName === "" || pageName === null || pageName === undefined) {
        return -1;
    }
    return new Promise((resolve, reject) => {
        facebook.api('/' + pageName + '/?fields=fan_count', (err, data) => {
            if (err) reject(err);
            else resolve(data)
        });
    })
        .then(data => {
            return data.fan_count
        })
        .catch(err => {
            logger.error("Facebook: error occur on getting fan count: `" + pageName + "`. " + err.message);
            return -1;
        });
};

module.exports = {
    countFollowers: countFollowers_
};