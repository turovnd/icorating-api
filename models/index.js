module.exports = function (db, models) {
    models.project = db.define("project", require('./Project').model, require('./Project').methods);
};