const logger   = require('../logger')();
const telegram = require('telegram-bot-api');

const api = new telegram({
    token: process.env.TELEGRAM_TOKEN
});

let getChatMembersCount_ = function (chat_id) {
    if (chat_id === "" || chat_id === null || chat_id === undefined) {
        return -1;
    }
    return api.getChatMembersCount({
        chat_id: chat_id
    }).then(data => {
        return data;
    }).catch(err => {
        logger.error("Telegram: error occur on getting chat members count: `" + chat_id + "`. " + err.message);
    })
};

module.exports = {
    countChatMembers: getChatMembersCount_
};