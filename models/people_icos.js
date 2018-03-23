module.exports = function(sequelize, Sequelize) {

    'use strict';

    let Model = sequelize.define('people_ico', {

        people_id: {
            type: Sequelize.INTEGER,
        },

        ico_name: {
            type: Sequelize.STRING,
        },

        title: {
            type: Sequelize.STRING,
        },

        group: {
            type: Sequelize.STRING,
        }

    }, {
        createdAt: false,
        updatedAt: false,
        underscored: true
    });

    return Model;

};
