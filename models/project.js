module.exports = function(sequelize, Sequelize) {

    'use strict';

    let Model = sequelize.define('projects', {

        id: {
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER
        },

        name: {
            type: Sequelize.TEXT,
            notEmpty: true
        },

        ticker: {
            type: Sequelize.TEXT,
            notEmpty: true
        },

        wallets: {
            type: Sequelize.TEXT,
            notEmpty: true
        }

    }, {
        updatedAt: false,
        underscored: true
    });

    Model.associate = function(models) {
        models.projects.hasMany(models.projects_prices, { as: "Prices" });
    };

    return Model;

};