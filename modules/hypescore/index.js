'use strict';
const models    = require('../../models');
const consts    = require('../../models/constants');
const { Op } = require('sequelize')
const moment = require('moment')
const logger = require('../logger')()
var slack = require('slack-notify')(process.env.SLACK_NOTIFY);
var request = require("request");
var querystring = require("querystring");
var escapeJSON = require('escape-json-node');

const crazyShit = {
    telegram:{ contentError:0, serverError:0, parsed:0, customError:0, _averageTime:0 },
    bitcointalk:{ contentError:0, serverError:0, parsed:0, customError:0, _averageTime:0 },
    twitter:{ contentError:0, serverError:0, parsed:0, customError:0, _averageTime:0 },
    facebook:{ contentError:0, serverError:0, parsed:0, customError:0, _averageTime:0 },
    reddit:{ contentError:0,  serverError:0, parsed:0, customError:0, _averageTime:0 },
    medium:{ contentError:0, serverError:0, parsed:0, customError:0, _averageTime:0 },
    bing:{ contentError:0, serverError:0, parsed:0, customError:0, _averageTime:0 },
    alexa_rank:{ contentError:0, serverError:0, parsed:0, customError:0, _averageTime:0 }
}


let isQualifiedStatNumber = function(crazyKey, crazyValue) {
    if( (typeof crazyKey === "object" && crazyKey !== null &&
        crazyKey.hasOwnProperty(crazyValue)
        && isObject(crazyKey[crazyValue])
        && crazyKey[crazyValue].hasOwnProperty('parsed')
        && crazyKey[crazyValue].hasOwnProperty('contentError')
        && crazyKey[crazyValue].hasOwnProperty('serverError')
        && crazyKey[crazyValue].hasOwnProperty('customError'))){
        return true
    }else{
        return false
    }
}
let composeStatsNotifyJson = function (chunkedStats,args) {
    var fieldsArr = [];
    for (let prop in chunkedStats) {
        if (isQualifiedStatNumber(chunkedStats, prop)) {
            fieldsArr.push({
                "title": prop,
                "value": chunkedStats[prop].parsed +" "
                + chunkedStats[prop].contentError +" "
                + chunkedStats[prop].serverError +" "
                + chunkedStats[prop].customError + "\n",
                // + chunkedStats[prop]._averageTime + " s.",
                "short": true,
                "thumb_url":"/assets/media/"+prop+".png"
            })

        }
    }
    let layout = {
        "attachments": [
            {
                "fields": fieldsArr,
                "color": "#F35A00",
                "fallback": args?args:'',
                // "pretext": "Optional text that appears above the attachment block",
                // "author_name": "Bobby Tables",
                // "author_link": "http://flickr.com/bobby/",
                "author_icon": "http://flickr.com/icons/bobby.jpg",
                // "title": "Slack API Documentation",
                // "title_link": "https://api.slack.com/",
                // "text": "more stats",

                // "image_url": "http://my-website.com/path/to/image.jpg",
                // "thumb_url": "http://example.com/path/to/thumb.png",
                "footer": "for %d period of time",
                "footer_icon": "https://platform.slack-edge.com/img/default_application_icon.png",
                "ts": 123456789
            }
        ]
    };




    return layout


}

let sendSlackNotifyEvent_ = function(text, args) {


    var opts =  { method: 'POST',
        url: process.env.SLACK_NOTIFY,
        headers:
            {   'cache-control': 'no-cache',
                'content-type': 'application/json'
            },
        json: composeStatsNotifyJson(text,args)

    };
    request(opts, function (error, response, body) {
        if (error) { return error }

        return body;
    });
}

/**
 * Utility function to check for object
 * @private
 */
let isObject = function(a) {
    return (!!a) && (a.constructor === Object);
};
/**
 * Get Not Finished YET ICOs from DB
 * @private
 */
let getNotFinishedIcos_ = function () {

    const Sequelize = require("sequelize");
    const sequelize = new Sequelize(
        process.env.DB_PROD_DATABASE,
        process.env.DB_PROD_USER,
        process.env.DB_PROD_PASSWORD,
        {
            host: process.env.DB_PROD_HOST,
            dialect: 'mysql',
            logging: false,
            freezeTableName: true,
            operatorsAliases: false
        }
    );
    return sequelize.query(
        `SELECT ico_descriptions.ico_id as id, ico_crowdsales.end_date_ico, 
        ico_descriptions.name, ico_links.site, ico_links.btctalk, ico_links.linkedin, 
        ico_links.twitter, ico_links.facebook, ico_links.instagram, ico_links.telegram, 
        ico_links.blog, ico_links.email, ico_links.youtube, ico_links.steemit, ico_links.reddit, 
        ico_links.medium, ico_links.github, ico_links.slack, ico_links.google_market, ico_links.apple_store
    FROM ico_descriptions
    INNER JOIN ico_crowdsales on ico_descriptions.ico_id = ico_crowdsales.ico_id
    INNER JOIN ico_links on ico_descriptions.ico_id = ico_links.ico_id 
    where ico_crowdsales.end_date_ico >= CURDATE() limit 10`
    ).then(allicos => {

        if (allicos.length > 0) {
            return allicos[0].map(ico => {

                var telegram = ico.telegram ? ico.telegram : '',
                    btctalk = ico.btctalk ? ico.btctalk : '',
                    twitter = ico.twitter ? ico.twitter : '',
                    facebook = ico.facebook ? ico.facebook : '',
                    reddit = ico.reddit ? ico.reddit : '',
                    medium = ico.medium ? ico.medium : '';


                return Object.assign(
                    {},
                    {
                        id:             ico.id,
                        name:           ico.name,
                        website:        ico.site,
                        telegram:       telegram.replace("https://telegram.me/", "@").replace("https://t.me/", "@").replace("http://t.me/", "@").replace(/\/$/, ''),
                        bitcointalk:    btctalk.replace("https://bitcointalk.org/index.php?topic=","").replace(/\/$/, ''),
                        twitter:        twitter.replace("https://twitter.com/","").replace(/\/$/, ''),
                        facebook:       facebook.replace("https://www.facebook.com/","").replace(/\/$/, ''),
                        reddit:         reddit.replace("https://www.reddit.com/r/","").replace("https://www.reddit.com/user/","").replace(/\/$/, ''),
                        medium:         medium.replace("https://medium.com/","@").replace("@@","@").replace(/\/$/, ''),
                    }
                );
            });
        }
  });
};

/**
 * Insert score to Table `icos_scores`
 * @param score - Object
 * @private
 */
let insertScoreToDB_ = function (score) {
    score.mentions = !isNaN(score.mentions) ? score.mentions : -2;
    return models.icos_scores.create(score);

};


/**
 * Call functions for updating score
 * @param ico - Object
 * @returns score - Object
 * @private
 */
let update_ = async function (ico) {


    let scores = {
        ico_id      : ico.id,
        telegram    : await require('./telegram').countChatMembers(ico.telegram),
        bitcointalk : await require('./bitcointalk').countFollowers(ico.bitcointalk),
        twitter     : await require('./twitter').countFollowers(ico.twitter),
        facebook    : await require('./facebook').countFollowers(ico.facebook),
        reddit      : await require('./reddit').countFollowers(ico.reddit),
        medium      : await require('./medium').countFollowers(ico.medium),
        bing        : await require('./bind')(ico.name, ico.website),
        total_visits: await require('./total_visits')(ico.website),
        mentions    : await require('./mainrest')(ico.name),
        alexa_rank   : await require('./alexa').countRank(ico.website),
        admin_score : 0,
        hype_score  : 0,
        created_at: new Date()
    };
    await insertScoreToDB_(scores);

    return scores;
};

/**
 * Update ICOs Scores every day
 * @private
 */
let updateIcoScores_ = async function () {
    let icos = await getNotFinishedIcos_();
    sendSlackNotifyEvent_("started '" + icos.length + "' icos","header");
    var analyticsDTO = {
        telegram:{ contentError:0, serverError:0, parsed:0, customError:0, _averageTime:0 },
        bitcointalk:{ contentError:0, serverError:0, parsed:0, customError:0, _averageTime:0 },
        twitter:{ contentError:0, serverError:0, parsed:0, customError:0, _averageTime:0 },
        facebook:{ contentError:0, serverError:0, parsed:0, customError:0, _averageTime:0 },
        reddit:{ contentError:0,  serverError:0, parsed:0, customError:0, _averageTime:0 },
        medium:{ contentError:0, serverError:0, parsed:0, customError:0, _averageTime:0 },
        bing:{ contentError:0, serverError:0, parsed:0, customError:0, _averageTime:0 },
        alexa_rank:{ contentError:0, serverError:0, parsed:0, customError:0, _averageTime:0 }
    };

    if (icos.length > 0) {
        var avgChunkExecTime = [], countPidOperations = 0, countChunkStats = null;

        for (let iterator in icos) {
            let localTime = Date.now();
            let icoStatsObj = await update_(icos[iterator]);
            let timeSpent = (Date.now() - localTime) / 1000;
            for (let _mediaSrc in icoStatsObj) {
                if(icoStatsObj.hasOwnProperty(_mediaSrc) && analyticsDTO.hasOwnProperty(_mediaSrc)){
                    icoStatsObj[_mediaSrc] =
                        (!isNaN(parseFloat(icoStatsObj[_mediaSrc])) && isFinite(icoStatsObj[_mediaSrc]) &&
                        icoStatsObj[_mediaSrc] > 0) ? icoStatsObj[_mediaSrc] : -5;

                    switch (icoStatsObj[_mediaSrc]){
                        case -1:
                                analyticsDTO[_mediaSrc].contentError ++;
                            break;
                        case -2:
                                analyticsDTO[_mediaSrc].serverError++;
                            break;
                        case -5:
                            analyticsDTO[_mediaSrc].customError++;
                            break;
                        default:
                                if (icoStatsObj[_mediaSrc] !== undefined && icoStatsObj[_mediaSrc] > 0 )
                                analyticsDTO[_mediaSrc].parsed ++;
                            break;
                    }
                    if(!countChunkStats || (countPidOperations % 5) == 0) {
                        analyticsDTO[_mediaSrc]._averageTime = avgChunkExecTime.join('').length / avgChunkExecTime.length
                    logger.info(analyticsDTO, "time",analyticsDTO[_mediaSrc]._averageTime)
                    }
                }
            }
            avgChunkExecTime.push(timeSpent);
            countPidOperations++;


            logger.info(countPidOperations );
            if((countPidOperations % 5) == 0) {
                console.log(countPidOperations + " .........")
                countChunkStats = countPidOperations;
                sendSlackNotifyEvent_(analyticsDTO)
            }

        }





    }else{
        slack.note('parser did not worked because of no ico in query result');

    }
};




/**
 * Update ICO Scores from request
 * @param ico - Object
 * @returns Object
 * @private
 */
let updateIcoScoresFromRequest_ = async function (ico) {
    ico.scores = await update_(ico);
    delete ico.scores.ico_id;
    return ico;
};


/**
 * Scraping hype_score every 24 hours
 * @private
 */
let initHypeScore_ = async function () {
    await updateIcoScores_();
    setInterval(updateIcoScores_, 1000 * 60 * 60 * process.env.HYPESCORE_SCRAPER_TIME);
};

module.exports = {
    init            : initHypeScore_,
    updateScores    : updateIcoScoresFromRequest_,
};
