module.exports = function(sequelize, Sequelize) {

    'use strict';

    let Model = sequelize.define('projects_prices', {

        project: { // Project ID
            type: Sequelize.INTEGER
        },

        priceBTC: {
            type: Sequelize.DOUBLE
        },

        priceETH: {
            type: Sequelize.DOUBLE
        },

        priceUSD: {
            type: Sequelize.DOUBLE
        }

    },{
        updatedAt: false,
    });

    Model.removeAttribute('id');

    return Model;

};