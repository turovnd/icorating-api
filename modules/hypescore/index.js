'use strict';
const models    = require('../../models');

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
 * Insert score to Table `icos_scores`
 * @param score - Object
 * @private
 */
let insertScoreToDB_ = function (score) {
    return models.icos_scores.findOne({
        where: {ico_id: score.ico_id},
        order: [["created_at", 'DESC']]
    })
        .then(oldscore => {

            for (let field in score) {
                if (score[field] === null || isNaN(score[field])) {
                    score[field] = -1;
                }

                if (oldscore !== null) {
                    if (score[field] === -1 && oldscore.getDataValue(field) !== -1) {
                        score[field] = oldscore.getDataValue(field);
                    }
                }
            }

            return models.icos_scores.create(score);

        });
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
        bing        : await require('./bind')(ico.name),
        total_visits: await require('./total_visits')(ico.website),
        mentions    : await require('./mainrest')(ico.name),
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
    let icos = await getAllIcos_();

    if (icos.length > 0) {
        for (let i in icos) {
            await update_(icos[i]);
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
    setInterval(updateIcoScores_,1000 * 60 * 60 * process.env.HYPESCORE_SCRAPER_TIME);
};

module.exports = {
    init            : initHypeScore_,
    updateScores    : updateIcoScoresFromRequest_,
};