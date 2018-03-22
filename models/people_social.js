module.exports = function(sequelize, Sequelize) {

    'use strict';

    let Model = sequelize.define('people_social', {

        people_id: {
            type: Sequelize.INTEGER,
        },

        site: {
            type: Sequelize.STRING,
        },

        url: {
            type: Sequelize.STRING,
        }

    }, {
        createdAt: false,
        updatedAt: false,
        underscored: true
    });

    return Model;

};