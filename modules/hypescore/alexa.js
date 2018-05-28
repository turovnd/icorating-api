const logger = require('../logger')();
const axios  = require('axios');
const awis = require('awis');
const url = require('url');
const client = awis({
    key: process.env.AWSACCESSKEYID,
    secret: process.env.AWSSECRETACCESSKEY
});


let countRank_ = function(ico){

    return new Promise(function(resolve, reject) {

        if(ico === '' || ico == null){
            resolve( -1 );
        }
        client({
            'Action': 'UrlInfo',
            'Url': url.parse(ico).hostname,
            'ResponseGroup': 'Related,TrafficData,ContentData'
        }, function (err, data) {

            if (err) {
                resolve( -2 );

            } else {
                if (typeof data === "undefined" || typeof data.trafficData === "undefined"
                    || !data.trafficData.hasOwnProperty("rank")) {
                    resolve( -1 );
                }

                if (isNaN(parseInt(data.trafficData.rank))){
                    resolve( -2 );
                }else{
                    resolve( parseInt(data.trafficData.rank))
                }
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

    });
}

module.exports = {
    countRank: countRank_,
    countMonthRates: countDayRates_,
};

