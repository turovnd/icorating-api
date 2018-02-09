module.exports = function(sequelize, Sequelize) {

    'use strict';

    let Model = sequelize.define('transactions', {

        address: {
            type: Sequelize.TEXT,
            notEmpty: true
        },

        hash: {
            type: Sequelize.TEXT,
            notEmpty: true
        },

        timestamp: {
            type: Sequelize.INTEGER,
            notEmpty: true
        },

        from: {
            type: Sequelize.TEXT
        },

        to: {
            type: Sequelize.TEXT
        },

        value: {
            type: Sequelize.DOUBLE
        },

        total_value: {
            type: Sequelize.DOUBLE
        },

    }, {
        timestamps: false,
        underscored: true
    });

    return Model;

};