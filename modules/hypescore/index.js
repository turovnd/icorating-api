'use strict';
const models    = require('../../models');

// Array of all ICOs in DB
let icos = {};


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

                icos[parseInt(ico.getDataValue('id'))] = Object.assign(
                    {},
                    {
                        id:             ico.getDataValue('id'),
                        name:           ico.getDataValue('name'),
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
 * Update ICOs array
 * @param action - add|update|delete
 * @param ico - Object
 * @private
 */
let updateIcosArr_ = function (action, ico) {
    switch (action) {
        case "add":
            icos[parseInt(ico.id)] = ico;
            break;
        case "update":
            icos[parseInt(ico.id)] = ico;
            break;
        case "delete":
            delete icos[parseInt(ico.id)];
            break;
    }
};

/**
 * Insert score to Table `icos_scores`
 * @param score - Object
 * @private
 */
let insertScoreToDB_ = function (score) {
    models.icos_scores.create(score);
};


/**
 * Call functions for updating score
 * @param ico - Object
 * @returns score - Object
 * @private
 */
let update_ = async function (ico) {
    // TODO function with update score
    let score = {
        ico_id: ico.id,
        telegram: await require('./telegram').countChatMembers(ico.telegram),
        bitcointalk: 0,
        twitter: 0,
        facebook: await require('./facebook').countFollows(ico.facebook),
        reddit: await require('./reddit').countFollows(ico.reddit),
        medium: await require('./medium').countFollows(ico.medium),
        google: 0,
        total_visits: 0,
        mentions: 0,
        admin_score: 0,
        hype_score: 0,
        created_at: new Date()
    };

    insertScoreToDB_(score);

    return score;
};

/**
 * Update ICOs Scores every day
 * @private
 */
let updateIcoScores_ = async function () {
    if (icos !== undefined) {
        for (let i in icos) {
            update_(icos[i]);
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
    await getAllIcos_();
    await updateIcoScores_();
    setInterval(updateIcoScores_, 1000*60*60*24);
};

module.exports = {
    init            : initHypeScore_,
    updateScores    : updateIcoScoresFromRequest_,
    updateIcos      : updateIcosArr_
};