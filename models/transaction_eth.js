module.exports = function(sequelize, Sequelize) {

    'use strict';

    let Model = sequelize.define('transaction_eth', {

        address: {
            type: Sequelize.STRING,
            notEmpty: true
        },

        hash: {
            type: Sequelize.STRING,
            notEmpty: true
        },

        timestamp: {
            type: Sequelize.INTEGER,
            notEmpty: true
        },

        from: {
            type: Sequelize.STRING
        },

        to: {
            type: Sequelize.STRING
        },

        value: {
            type: Sequelize.DOUBLE
        }

    }, {
        timestamps: false,
        underscored: true,
        freezeTableName: true
    });

    return Model;

};