const logger   = require('../logger')();
const telegram = require('telegram-bot-api');

const api = new telegram({
    token: '487424834:AAGZMI5yV2MwpnVCOw8_cOEd3eUf_dfXjmk'
});

let getChatMembersCount_ = function (chat_id) {
    if (chat_id === "" || chat_id === null || chat_id === undefined) {
        return 0;
    }
    return api.getChatMembersCount({
        chat_id: chat_id
    }).then(data => {
        return data;
    }).catch(err => {
        logger.error("Telegram: error occur on getting chat members count: " + err.message);
        return 0;
    })
};

module.exports = {
    countChatMembers: getChatMembersCount_
};