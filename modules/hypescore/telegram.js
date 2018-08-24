const logger   = require('../logger')();
const telegram = require('telegram-bot-api');
const timeout = ms => new Promise(res => setTimeout(res, ms));
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
        token: token,
        // http_proxy: {
        //     host: "u0k12.tgproxy.me",
        //     port: 1080,
        //     user: "telegram",
        //     password: "telegram",
        //     https: true
        // }
    });
    tokenIndex ++;
    if(telegramTokens[tokenIndex] == null){
        tokenIndex = 0;
    }
    return instance;
}

let getChatMembersCount_ = function (chat_id) {
    requestCount++;
    console.log(chat_id)
    if (chat_id === "" || chat_id === null || chat_id === undefined || chat_id.search(/joinchat/) !== -1)
        return -1;
    if (chat_id.search(/https:\/\/t.me\//) !== -1)
        chat_id = chat_id.split('https://t.me/')[1];

    chat_id = chat_id.replace("https:www.t.me", "");

    if (chat_id.search(/@/) === -1)
        chat_id = "@" + chat_id;

    chat_id = chat_id.replace(/\//g, '');

    if(chat_id === "" || !chat_id) {
        console.log(chat_id)
        return -1
    }

    // getApiInstance().getChat({
    //     chat_id: chat_id
    // }).then(data => {
    //     console.log(data)
    // }).catch(err => {
    //     console.log(err.message)
    //
    //
    // })
    //
    // return -6

    return getApiInstance().getChatMembersCount({
        chat_id: chat_id
    }).then(data => {
        retry = 0;
        return data;
    }).catch(err => {
        if(err.statusCode == 429){
            // return -3;
            if(retry < 5){
                logger.error("error 429 with ", chat_id, " ",err.message)

                apiInstance = false;
                getChatMembersCount_(chat_id);
            }else{
                retry = 0;
                logger.error("Telegram: error "+err+"occur on getting chat members count: `" + chat_id + "`. " +  err.message);
                return -3;
            }
            retry ++;
        }else{

            logger.error("Telegram: error "+err.statusCode+"occur on getting chat members count: `" + chat_id + "`. " +  err.message);
            return -2;
        }

    })
}

module.exports = {
    countChatMembers: getChatMembersCount_
};