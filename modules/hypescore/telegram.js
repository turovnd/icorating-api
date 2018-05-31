const logger   = require('../logger')();
const telegram = require('telegram-bot-api');
const timeout = ms => new Promise(res => setTimeout(res, ms))
const telegramTokens =  process.env.TELEGRAM_TOKEN.split(' ');
const perBotRequestLimit = 180;

var tokenIndex = 0;
var apiInstance = false;
var requestCount = 0;
var retry = 0;

function getApiInstance(){
    if(requestCount >= perBotRequestLimit ){
        requestCount = 0;
        return  apiInstance = newApiInstance();
    }
    if(!apiInstance) apiInstance = newApiInstance();
    return apiInstance;
}

function newApiInstance(){

    let token =  telegramTokens[tokenIndex];
    let instance = false;
    logger.info("New telegram api instance token: " + token);
    instance = new telegram({
        token: token
    });
    tokenIndex ++;
    if(telegramTokens[tokenIndex] == null){
        tokenIndex = 0;
    }
    return instance;
}

let getChatMembersCount_ = function (chat_id) {
    requestCount++;

    if (chat_id === "" || chat_id === null || chat_id === undefined)
        return -1;
    if (chat_id.search(/https:\/\/t.me\//) !== -1)
        chat_id = chat_id.split('https://t.me/')[1];

    if (chat_id.search(/@/) === -1)
        chat_id = "@" + chat_id;

    chat_id = chat_id.replace(/\//g, '');

    return getApiInstance().getChatMembersCount({
        chat_id: chat_id
    }).then(data => {
        retry = 0;
        return data;
    }).catch(err => {
        logger.error("error with ", chat_id, " ",err)
        if(err.statusCode == 429){
            return -2;
            // if(retry < 2){
            //     apiInstance = false;
            //     getChatMembersCount_(chat_id);
            // }else{
            //     retry = 0;
            //     logger.error("Telegram: error "+err+"occur on getting chat members count: `" + chat_id + "`. " +  err.message);
            //     return -2;
            // }
            // retry ++;
        }else{

            logger.error("Telegram: error "+err.statusCode+"occur on getting chat members count: `" + chat_id + "`. " +  err.message);
            logger.error(err);
            return -2;
        }

    })
}

module.exports = {
    countChatMembers: getChatMembersCount_
};