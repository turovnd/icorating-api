const models     = require("../../models");
const logger     = require('../logger')();

try {
    models.sequelize.sync().then(() => {
        logger.info("Wallets scraper initialize");
        require('./index').init();
    });
} catch (error) {
    logger.error("Error occur on initialize wallets scraper. " + error);
}
