const logger  = require('../logger')();
const axios   = require('axios');
const cheerio = require('cheerio');

module.exports = (website) => {

    if (website === "" || website === null || website === undefined) {
        return -1;
    }

    if (website.search('://') !== -1) website = website.split('://')[1];
    if (website.search('/') !== -1) website = website.split('/')[0];

    website = 'https://a.pr-cy.ru/' + website;

    return axios.get(website)
        .then(response => {

            let $ = cheerio.load(response.data);

            let visitors  = $(".info-test:contains('Открытая статистика')").parent().next().find('tbody').find("td:contains('Посетители')").parent();

            if (visitors !== undefined) {
                return parseInt(visitors.find('td:last-child').text().trim().replace(/[^0-9]/g, ''));
            } else {
                return 0;
            }
        })
        .catch(error => {
            logger.error('Total visits error on load page: `' + website + '`. ' + error);
            return -2;
        });

};