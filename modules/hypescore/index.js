'use strict';
const models    = require('../../models');
const { Op } = require('sequelize')
const moment = require('moment')
const logger = require('../logger')()
/**
 * Get all ICOs from DB
 * @private
 */
let getAllIcos_ = function () {

    return models.icos.findAll({
        order: [["created_at", 'DESC']]
    })
        .then(allicos => {

            return allicos.map(ico => {

                return Object.assign(
                    {},
                    {
                        id:             ico.getDataValue('id'),
                        name:           ico.getDataValue('name'),
                        website:        ico.getDataValue('website'),
                        telegram:       ico.getDataValue('telegram'),
                        bitcointalk:    ico.getDataValue('bitcointalk'),
                        twitter:        ico.getDataValue('twitter'),
                        facebook:       ico.getDataValue('facebook'),
                        reddit:         ico.getDataValue('reddit'),
                        medium:         ico.getDataValue('medium'),
                        admin_score:    ico.getDataValue('admin_score'),
                        updated_at:     ico.getDataValue('updated_at'),
                        created_at:     ico.getDataValue('created_at')
                    }
                );

            });

        });

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
    // return models.icos.findAll({
    //     where:{
    //         "end_date": {
    //             [Op.gte]: moment().subtract(1, 'days').toDate()
    //         }},
    //     order: [["created_at", 'DESC']]
    //     , logging: console.log}
    // )
    return sequelize.query(`SELECT ico_descriptions.ico_id as id, ico_crowdsales.end_date_ico, ico_descriptions.name, ico_links.site, ico_links.btctalk, ico_links.linkedin, ico_links.twitter, ico_links.facebook, ico_links.instagram, ico_links.telegram, ico_links.blog, ico_links.email, ico_links.youtube, ico_links.steemit, ico_links.reddit, ico_links.medium, ico_links.github, ico_links.slack, ico_links.google_market, ico_links.apple_store
    FROM ico_descriptions
    INNER JOIN ico_crowdsales on ico_descriptions.ico_id = ico_crowdsales.ico_id
    INNER JOIN ico_links on ico_descriptions.ico_id = ico_links.ico_id where ico_crowdsales.end_date_ico >= CURDATE()`)
        .then(allicos => {
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
                        // admin_score:    ico.getDataValue('admin_score'),
                        // updated_at:     ico.getDataValue('updated_at'),
                        // created_at:     ico.getDataValue('created_at')
                    }
                );

            });

        });

};

/**
 * Insert score to Table `icos_scores`
 * @param score - Object
 * @private
 */
let insertScoreToDB_ = function (score) {
    // return models.icos_scores.findOne({
    //     where: {ico_id: score.ico_id},
    //     order: [["created_at", 'DESC']]
    // })
    //     .then(oldscore => {
    //
    //         for (let field in score) {
    //             if (score[field] === null || isNaN(score[field])) {
    //                 score[field] = -2;
    //             }
    //
    //             if (oldscore !== null) {
    //                 if ((score[field] === -1 || score[field] === -2) && !(oldscore.getDataValue(field) === -1 || oldscore.getDataValue(field) === -2)) {
    //                     score[field] = oldscore.getDataValue(field);
    //                 }
    //             }
    //         }
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
        // month_alexa_rate : await require('./alexa').countMonthRates(ico.website),
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

    logger.info("started '", icos.length, "' icos")
    if (icos.length > 0) {



        for (let i in icos) {

            console.time(icos[i].name)
            var result = await update_(icos[i]);
            console.timeEnd(icos[i].name)

            logger.info(icos[i].name,"  iteration ", i, ", results: telegram: ",
                result.telegram, ", bitcointalk: ", result.bitcointalk, ", twitter: ",
                result.twitter, ", facebook: ", result.facebook, ", reddit: ", result.reddit,
                ", medium: ", result.medium, ", bing: ", result.bing, ", visits: ",result.total_visits,
                ", alexa: ",result.alexa_rank)
        }

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
