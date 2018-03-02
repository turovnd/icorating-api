'use strict';

const fs        = require("fs");
const path      = require("path");
const Sequelize = require("sequelize");
const sequelize = new Sequelize("mysql://" + process.env.DB_USER + ":" + process.env.DB_PASSWORD + "@" + process.env.DB_HOST + ":" + process.env.DB_PORT + "/" + process.env.DB_DATABASE, { logging: false, define: { charset: 'utf8', collate: 'utf8_general_ci'} });

let db = {};

fs
    .readdirSync(__dirname)
    .filter(file => {
        return (file.indexOf('.') !== 0) && (file !== "index.js") && (file.slice(-3) === '.js');
    })
    .forEach(file => {
        let model = sequelize.import(path.join(__dirname, file));
        db[model.name] = model;
    });


Object.keys(db).forEach(function(modelName) {
    if ("associate" in db[modelName]) {
        db[modelName].associate(db);
    }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;