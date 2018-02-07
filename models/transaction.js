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

        timeStamp: {
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

        totalValue: {
            type: Sequelize.DOUBLE
        },

    }, {
        timestamps: false,
        freezeTableName: true
    });

    Model.removeAttribute('id');

    return Model;

};