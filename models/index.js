'use strict';
require('dotenv').config();

const fs        = require("fs");
const path      = require("path");
const Sequelize = require("sequelize");
const sequelize = new Sequelize(
    process.env.DB_DATABASE,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        dialect: 'mysql',
        logging: false,
        freezeTableName: true,
        operatorsAliases: false
    }
)
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