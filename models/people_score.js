module.exports = function(sequelize, Sequelize) {

    'use strict';

    let Model = sequelize.define('people_score', {

       people_id: { // from API
            type: Sequelize.INTEGER,
        },

        score: { // from API
            type: Sequelize.DOUBLE,
        }

    }, {
        updatedAt: false,
        underscored: true
    });

    return Model;

};