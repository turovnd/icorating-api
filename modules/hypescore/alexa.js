const logger = require('../logger')();
const axios  = require('axios');
const awis = require('awis');
const url = require('url');
const client = awis({
    key: process.env.AWSACCESSKEYID,
    secret: process.env.AWSSECRETACCESSKEY
});
const util = require('util')


let countFollowers_ = function (pageName) {
    if (pageName === "" || pageName === null || pageName === undefined)
        return -1;

    if (pageName.search(/https:\/\/medium.com\/@/) !== -1)
        pageName = pageName.split('https://medium.com/')[1];

    pageName = pageName.replace(/\//g, '');

    let url = 'https://medium.com/' + pageName + '/?format=json';

    return axios.get(url)
        .then(response => {
            let data = JSON.parse(response.data.substring(response.data.search('{'), response.data.length)),
                userId = data.payload.user.userId;
            return parseInt(data['payload']['references']['SocialStats'][userId]['usersFollowedByCount']);
        })
        .catch(error => {
            logger.error("Medium: error occur on getting followers count: `" + url + "`. " + error);
            return -2;
        });
};

let countRank_ = function(ico){

    return new Promise(function(resolve, reject) {
        client({
            'Action': 'UrlInfo',
            'Url': url.parse(ico).hostname,
            'ResponseGroup': 'Related,TrafficData,ContentData'
        }, function (err, data) {

            if (err) {
                return -1

            } else {
                if (typeof data === "undefined" || typeof data.trafficData === "undefined"
                    || !data.trafficData.hasOwnProperty("rank")) {
                    return -2;
                }

                resolve( parseInt(data.trafficData.rank))
            }
        });
    })
}

let countDayRates_ = function(ico){
    client({
        'Action': 'TrafficHistory',
        'Url': url.parse(ico).hostname,
        'ResponseGroup': 'History',
        'Range': '1',
    }, function (err, data) {

        if (err){
            console.log(err)
        }else{
            console.log(url.parse(ico).hostname);
            console.log(data.trafficHistory.start);
            console.log(data.trafficHistory.historicalData.data);
            // console.log(data.trafficData.usageStatistics.usageStatistic)

        }

        // ...
    });
}

module.exports = {
    countFollowers: countFollowers_,
    countRank: countRank_,
    countMonthRates: countDayRates_,
};

