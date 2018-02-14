module.exports = function(sequelize, Sequelize) {

    'use strict';

    let Model = sequelize.define('icos_scores', {

        ico_id: {
            type: Sequelize.INTEGER,
            notEmpty: true
        },

        telegram: {
            type: Sequelize.INTEGER
        },

        bitcointalk: {
            type: Sequelize.INTEGER
        },

        twitter: {
            type: Sequelize.INTEGER
        },

        facebook: {
            type: Sequelize.INTEGER
        },

        reddit: {
            type: Sequelize.INTEGER
        },

        medium: {
            type: Sequelize.INTEGER
        },

        google: {
            type: Sequelize.INTEGER
        },

        total_visits: {
            type: Sequelize.INTEGER
        },

        mentions: {
            type: Sequelize.INTEGER
        },

        admin_score: {
            type: Sequelize.INTEGER
        },

        hype_score: {
            type: Sequelize.INTEGER
        },

    }, {
        updatedAt: false,
        underscored: true
    });

    return Model;

};