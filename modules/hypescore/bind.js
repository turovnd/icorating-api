const logger  = require('../logger')();
const axios   = require('axios');

module.exports = (string) => {

    if (string === "" || string === null || string === undefined) {
        return -1;
    }

    let url = "https://api.cognitive.microsoft.com/bing/v7.0/search?q=" + string + "+ico(-site:mybit.io)";

    return axios.get(url, {
            headers: {
                'Ocp-Apim-Subscription-Key': process.env.API_BING
            }
        })
        .then(response => {
            if (response.data.webPages && response.data.webPages.totalEstimatedMatches) {
                return parseInt(response.data.webPages.totalEstimatedMatches);
            } else {
                return 0;
            }
        })
        .catch(error => {
            logger.error('Bing request count error on load page: `' + url + '`. ' + error);
            return -2;
        });

};