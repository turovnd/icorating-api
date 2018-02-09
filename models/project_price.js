module.exports = function(sequelize, Sequelize) {

    'use strict';

    let Model = sequelize.define('projects_prices', {

        project_id: { // Project ID
            type: Sequelize.INTEGER
        },

        price_btc: {
            type: Sequelize.DOUBLE
        },

        price_eth: {
            type: Sequelize.DOUBLE
        },

        price_usd: {
            type: Sequelize.DOUBLE
        }

    },{
        updatedAt: false,
    });

    Model.removeAttribute('id');

    return Model;

};