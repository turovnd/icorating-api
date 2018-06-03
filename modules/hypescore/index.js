'use strict';
const models    = require('../../models');
const consts    = require('../../models/constants');
const { Op } = require('sequelize')
const moment = require('moment')
const logger = require('../logger')()

const division = 100
var slack = require('slack-notify')(process.env.SLACK_NOTIFY);
var request = require("request");
var os = require("os");
var querystring = require("querystring");
var escapeJSON = require('escape-json-node');

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
    where ico_crowdsales.end_date_ico >= CURDATE()`
    ).then(allicos => {

        if (allicos.length > 0) {
            return allicos[0].map(ico => {

                var telegram = ico.telegram ?
                    ico.telegram.replace("https://telegram.me/", "@").replace("https://t.me/", "@").replace("http://t.me/", "@").replace(/\/$/, '') : '',
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
                        telegram:       telegram,
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

let renderStatsNotifyJson = function (chunkedStats,args,countString, color) {
    var fieldsArr = [];
    var adoption = true;
    for (let prop in chunkedStats) {
        adoption = false;
        if (isQualifiedStatNumber(chunkedStats, prop)) {
            fieldsArr.push({
                "title": prop,
                "color":"#439FE0",
                "value": chunkedStats[prop].parsed +" "
                + chunkedStats[prop].contentError +" "
                + chunkedStats[prop].serverError +" "
                + chunkedStats[prop].customError + "\n",
                // + chunkedStats[prop]._averageTime + " s.",
                "short": true,
                // "thumb_url":"/assets/media/"+prop+".png"
            })

        }
    }
    let layout = {
        "attachments": [
            {
                "fields": fieldsArr,
                "color": color,
                "fallback": args?args:countString,
                "title": !(countString === "header") ? countString : "",
                // "author_name": args?args:"actual statistics",
                // "author_link": "http://flickr.com/bobby/",
                "author_icon": "http://flickr.com/icons/bobby.jpg",
                // "title": "Slack API Documentation",
                // "title_link": "https://api.slack.com/",
                "text": adoption ? "[0(parsed) 0(content error) 0(server error) 0(another error)]" : "",

                // "image_url": "http://my-website.com/path/to/image.jpg",
                // "thumb_url": "http://example.com/path/to/thumb.png",
                "footer": args?args:"avg time / 1 ico: "+Math.round(chunkedStats.telegram._averageTime) + " s" + " on: "+ os.hostname(),
                "footer_icon": "https://platform.slack-edge.com/img/default_application_icon.png",
                "ts": + Math.floor(Date.now() / 1000)

            }
        ]
    };




    return layout


}

let sendSlackNotifyEvent_ = function(text, args, count, color) {


    var opts =  { method: 'POST',
        url: process.env.SLACK_NOTIFY,
        headers:
            {   'cache-control': 'no-cache',
                'content-type': 'application/json'
            },
        json: renderStatsNotifyJson(text,args, count, color)

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
    var result = await insertScoreToDB_(scores);

    return scores;
};

/**
 * Update ICOs Scores every day
 * @private
 */
let updateIcoScores_ = async function () {
    let icos = await getNotFinishedIcos_();
    sendSlackNotifyEvent_({},"start web crawling '" + icos.length + "' icos on. " + os.hostname() + " with ui division by "+division,"header", "#439FE0");
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
                    icoStatsObj[_mediaSrc] = (!isNaN(parseFloat(icoStatsObj[_mediaSrc]))
                        && isFinite(icoStatsObj[_mediaSrc])) ? icoStatsObj[_mediaSrc] : -5;

                    switch (icoStatsObj[_mediaSrc]){
                        case -1:
                                analyticsDTO[_mediaSrc].contentError ++;
                            break;
                        case -2:
                                analyticsDTO[_mediaSrc].serverError++;
                            break;
                        default:
                            if (icoStatsObj[_mediaSrc] !== undefined && icoStatsObj[_mediaSrc] > 0 ) {
                                    analyticsDTO[_mediaSrc].parsed++;
                            }
                            if (icoStatsObj[_mediaSrc] !== undefined && icoStatsObj[_mediaSrc] < 0 ) {
                                analyticsDTO[_mediaSrc].customError++;
                            }
                            break;
                    }
                    if(!countChunkStats || (countPidOperations % division) == 0) {
                        analyticsDTO[_mediaSrc]._averageTime = avgChunkExecTime.join('').length / avgChunkExecTime.length
                    }
                }
            }
            avgChunkExecTime.push(timeSpent);
            countPidOperations++;


            logger.info(countPidOperations );
            if((countPidOperations % division) == 0) {
                console.log(countPidOperations + " .........")
                countChunkStats = countPidOperations;
                sendSlackNotifyEvent_(analyticsDTO, "", "currently processed: "+countPidOperations + " of: " + icos.length, "#e00032")
            }

        }





    }else{
        slack.note('parser did not worked because of no ico in query result');

    }

};

let gracefullHandler = function(options, err){

    console.log("gracefull shutdown");
    sendSlackNotifyEvent_({},"stop web crawling icos on. " + os.hostname(),"header", "#439FE0");
    // sendSlackNotifyEvent_({},"gracefull shutdown of web crawling operation","header", "#FF334B");

    if (options.cleanup) {
        console.log('clean')
    }
    if (err) {
        console.log(err.stack);
        console.log('err and clean')
    }
    if (options.exit) {
        console.log('err and clean')
        process.exit()
    }
}


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
    process.stdin.resume();
    //do something when app is closing
    process.on('exit', gracefullHandler.bind(null,{cleanup:true}));
    process.on('SIGINT', gracefullHandler.bind(null, {exit:true}));
    process.on('SIGUSR1', gracefullHandler.bind(null, {exit:true}));
    process.on('SIGUSR2', gracefullHandler.bind(null, {exit:true}));
    process.on('uncaughtException', gracefullHandler.bind(null, {exit:true}));


    await updateIcoScores_();
    setInterval(updateIcoScores_, 1000 * 60 * 60 * process.env.HYPESCORE_SCRAPER_TIME);


};

module.exports = {
    init            : initHypeScore_,
    updateScores    : updateIcoScoresFromRequest_,
};
