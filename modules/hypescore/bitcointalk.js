const logger  = require('../logger')();
const cheerio = require('cheerio');
const axios   = require('axios');

let countFollowers_ = function (url) {
    return axios.get(url)
        .then(response => {
            let $ = cheerio.load(response.data),
                topics = $('.message_number');
            if (topics.length === 0) {
                return -1;
            } else {
                return parseInt($(topics[topics.length-1]).text().replace(/[^0-9.]/g, ''));
            }
        })
        .catch(error => {
            logger.error("Bitcontalk: error occur on getting followers count: `" + url + "`. " + error);
            return -2;
        });
};

let getPage_ = function (topic) {
    if (topic === "" || topic === null || topic === undefined)
        return -1;

    if (topic.search(/https:\/\/bitcointalk.org\/index.php\?topic=/) === -1)
        return -1;

    topic = topic.split('topic=')[1];

    if (topic.search(/./) !== -1)
        topic = topic.split('.')[0];

    topic = topic.replace(/[^0-9]/g, '');

    let url = 'https://bitcointalk.org/index.php?topic=' + topic + '.0';

    return axios.get(url)
        .then(response => {
            let $ = cheerio.load(response.data),
                table = $('#bodyarea').find('> table');

            if (table.length === 0) {
                return -1;
            } else if ($(table[0]).find('.prevnext').prev().attr('href') === undefined) {
                return countFollowers_(url);
            } else {
                return countFollowers_($(table[0]).find('.prevnext').prev().attr('href'));
            }
        })
        .catch(error => {
            logger.error("Bitcontalk: error occur on getting page: `" + url + "`. " + error);
            return -2;
        });
};

module.exports = {
    countFollowers: getPage_
};