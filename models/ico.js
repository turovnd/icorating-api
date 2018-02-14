module.exports = function(sequelize, Sequelize) {

    'use strict';

    let Model = sequelize.define('icos', {

        id: {
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER,
            notEmpty: true
        },

        name: {
            type: Sequelize.TEXT,
            notEmpty: true
        },

        telegram: {
            type: Sequelize.STRING
        },

        bitcointalk: {
            type: Sequelize.STRING
        },

        twitter: {
            type: Sequelize.STRING
        },

        facebook: {
            type: Sequelize.STRING
        },

        reddit: {
            type: Sequelize.STRING
        },

        medium: {
            type: Sequelize.STRING
        },

        admin_score: {
            type: Sequelize.INTEGER
        },

    }, {
        underscored: true
    });

    Model.associate = function(models) {
        models.icos.hasMany(models.icos_scores, { as: "icoScores" });
    };

    return Model;

};