const logger   = require('../logger')();
const telegram = require('telegram-bot-api');

const api = new telegram({
    token: process.env.TELEGRAM_TOKEN
});

let getChatMembersCount_ = function (chat_id) {
    if (chat_id === "" || chat_id === null || chat_id === undefined)
        return -1;

    if (chat_id.search(/https:\/\/t.me\//) !== -1)
        chat_id = chat_id.split('https://t.me/')[1];

    if (chat_id.search(/@/) === -1)
        chat_id = "@" + chat_id;

    chat_id = chat_id.replace(/\//g, '');

    return api.getChatMembersCount({
            chat_id: chat_id
        }).then(data => {
            return data;
        }).catch(err => {
            logger.error("Telegram: error occur on getting chat members count: `" + chat_id + "`. " + err.message);
            return -2;
        })
};

module.exports = {
    countChatMembers: getChatMembersCount_
};