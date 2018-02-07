require('dotenv').config();
const express    = require('express');
const path       = require('path');
const ejs        = require('ejs');
const models     = require("./models");
const bodyParser = require('body-parser');
const logger     = require('./modules/logger')();

let app = express();

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

app.use('/api', (req, res, next) => {
    res.render('api.html');
});

// catch 404 for api pages
app.use('/', function(req, res, next) {
    res.render('error404.html');
});


/** INIT server */
app.listen(process.env.PORT, () => {
    logger.info("Server Ready! Site: " + process.env.SITE + ":" + process.env.PORT);

    models.sequelize.sync().then(() => {
        const etherscan  = require('./modules/wallets/etherscan');
        etherscan("0x5c7621f7afb14b9ab20fefede40b428d9b4429f2", function (err, object) {
            console.log(err, object);
        });
    });

});