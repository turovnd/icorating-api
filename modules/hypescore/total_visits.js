const logger  = require('../logger')();
const axios   = require('axios');
const cheerio = require('cheerio');
const timeout = ms => new Promise(res => setTimeout(res, ms))

// Сервис блокирует ip адрес на 20 секунд если не делать паузы, поэтому добавил дополнительный таймаут
async function delayCall (handler, time) {
    await timeout(time);
    return handler.apply()
}

module.exports = (website) => {

    if (website === "" || website === null || website === undefined) {
        return -1;
    }

    if (website.search('://') !== -1) website = website.split('://')[1];
    if (website.search('/') !== -1) website = website.split('/')[0];

    website = 'https://a.pr-cy.ru/' + website;

    return  axios.get(website)
        .then(response => {
            let $ = cheerio.load(response.data);
            return delayCall(function(){
                let visitors = $(".info-test:contains('Открытая статистика')").parent().next().find('tbody').find("td:contains('Посетители')").parent();
                if (visitors !== undefined) {
                    var result =  parseInt(visitors.find('td').eq(1).text().trim().replace(/[^0-9]/g, ''));
                    return isNaN(result) ? -1 : result;
                } else {
                    return -1;
                }
            }, 500);

        })
        .catch(error => {
            logger.error('Total visits error on load page: `' + website + '`. ' + error);
            return -2;
        });

};