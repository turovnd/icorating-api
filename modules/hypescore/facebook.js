const logger   = require('../logger')();
const Facebook = require('facebook-node-sdk');

const facebook = new Facebook({ appId: '1861060970585441', secret: 'Cb4Ql8n0lbsb0JxBvOwFJqzaI80' });

let countFollows_ = function (pageName) {
    if (pageName === "" || pageName === null || pageName === undefined) {
        return 0;
    }
    return new Promise((resolve, reject) => {
        facebook.api('/' + pageName + '/?fields=fan_count', function(err, data) {
            if (err) reject(err);
            else resolve(data)
        });
    })
        .then(data => {
            return data.fan_count
        })
        .catch(err => {
            logger.error("Facebook: error occur on getting fan count: " + err.message);
            return 0;
        });
};

module.exports = {
    countFollows: countFollows_
};