require('dotenv').config();
const express    = require('express');
const path       = require('path');
const ejs        = require('ejs');
// const orm        = require('orm');
const bodyParser = require('body-parser');

const logger     = require('./modules/logger')();

let app = express();

/** Connect to DB */
// app.use(orm.express("mysql://" + process.env.DB_USER + ":" + process.env.DB_PASSWORD + "@" + process.env.DB_HOST + "/" + process.env.DB_DATABASE, {
//     define: require('./models')
// }));

var models = require("./models");

// //Sync Database
// models.sequelize.sync().then(function() {
//
//     console.log('Nice! Database looks fine')
//
// }).catch(function(err) {
//
//     console.log(err, "Something went wrong with the Database Update!")
//
// });

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.engine('html', ejs.renderFile);

// Body Parser MW
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Add headers
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Access-Control-Allow-Origin, Origin, Content-Type');
    res.setHeader('Access-Control-Allow-Methods', '*');
    next();
});

// Use Server Side routes for API
// app.use('/api', require('./routes/projects'));
// global.models = models.sequelize.sync();
// app.use('models', );


app.use('/api', (req, res, next) => {
    res.render('api.html');
});

// catch 404 for api pages
app.use('/', function(req, res, next) {
    res.render('error404.html');
});

// models.sequelize.sync().then(function() {
//     /**
//      * Listen on provided port, on all network interfaces.
//      */
//     server.listen(port, function() {
//         debug('Express server listening on port ' + server.address().port);
//     });
//     server.on('error', onError);
//     server.on('listening', onListening);
// });




/** INIT server */
app.listen(process.env.PORT, () => {
    logger.info("Server Ready! Site: " + process.env.SITE + ":" + process.env.PORT);

    global.models = models.sequelize.sync().then(() => {
        const etherscan  = require('./modules/wallets/etherscan');
        etherscan("0x5c7621f7afb14b9ab20fefede40b428d9b4429f2", function (err, object) {
            console.log(err, object);
        });
    });

});