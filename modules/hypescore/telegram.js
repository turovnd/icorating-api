const logger = require('../logger')()
const telegram = require('telegram-bot-api')
const util = require('util');
const exec = util.promisify(require('child_process').exec);

const timeout = (ms) => new Promise((res) => setTimeout(res, ms))
const telegramTokens = process.env.TELEGRAM_TOKEN.split(' ')
const perBotRequestLimit = 180

let tokenIndex = 0
let apiInstance = false
let requestCount = 0
let retry = 0

function getApiInstance () {
  if (requestCount >= perBotRequestLimit) {
    requestCount = 0
    return apiInstance = newApiInstance()
  }
  if (!apiInstance) apiInstance = newApiInstance()
  return apiInstance
}

function newApiInstance () {
  const token = telegramTokens[tokenIndex]
  let instance = false

  logger.info(`New telegram api instance token: ${token}`)
  instance = new telegram({
    token,
    // http_proxy: {
    //     host: "u0k12.tgproxy.me",
    //     port: 1080,
    //     user: "telegram",
    //     password: "telegram",
    //     https: true
    // }
  })
  tokenIndex++
  if (telegramTokens[tokenIndex] == null) {
    tokenIndex = 0
  }
  return instance
}

const runShellPy =  function (channelName) {
  return new Promise(async resolve => {
    console.log('python3 '+__dirname+'/doc.py -api_id ' + process.env.TELEGRAM_CORE_API_ID + ' -api_name ' +
      process.env.TELEGRAM_CORE_APP_SHORT_NAME + ' -channel_name ' + channelName + ' -api_hash ' + process.env.TELEGRAM_CORE_API_HASH)

    try{
      const { stdout, stderr } = await exec('python3 '+__dirname+'/doc.py -api_id ' + process.env.TELEGRAM_CORE_API_ID + ' -api_name ' +
        process.env.TELEGRAM_CORE_APP_SHORT_NAME + ' -channel_name ' + channelName + ' -api_hash ' + process.env.TELEGRAM_CORE_API_HASH)
      console.log('stdout:', stdout);
      console.log('stderr:', stderr);
      resolve(stdout)
    }catch(e){
      resolve(e.message)
    }
  })
}


const getChatMembersCount_ = async function (chat_id) {
  requestCount++
  console.log(requestCount, chat_id)
  if (chat_id === '' || chat_id === null || chat_id === undefined || chat_id.search(/joinchat/) !== -1) { return -1 }
  if (chat_id.search(/https:\/\/t.me\//) !== -1) { chat_id = chat_id.split('https://t.me/')[1] }

  chat_id = chat_id.replace('https:www.t.me', '')

  if (chat_id.search(/@/) === -1) { chat_id = `@${chat_id}` }

  chat_id = chat_id.replace(/\//g, '')

  let resp = await runShellPy(chat_id)
  logger.info(resp)

  return getApiInstance().getChatMembersCount({
    chat_id,
  }).then((data) => {
    retry = 0
    return data
  }).catch((err) => {
    if (err.statusCode == 429) {
      // return -3;
      if (retry < 5) {
        logger.error('error 429 with ', chat_id, ' ', err.message)

        apiInstance = false
        getChatMembersCount_(chat_id)
      } else {
        retry = 0
        logger.error(`Telegram: error ${err}occur on getting chat members count: \`${chat_id}\`. ${err.message}`)
        return -3
      }
      retry++
    } else {
      logger.error(`Telegram: error ${err.statusCode}occur on getting chat members count: \`${chat_id}\`. ${err.message}`)
      return -2
    }
  })
}

const updatePinnedMessages_ = async function (chat_id) {
  requestCount++
  console.log(requestCount, chat_id)
  if (chat_id === '' || chat_id === null || chat_id === undefined || chat_id.search(/joinchat/) !== -1) { return -1 }
  if (chat_id.search(/https:\/\/t.me\//) !== -1) { chat_id = chat_id.split('https://t.me/')[1] }

  chat_id = chat_id.replace('https:www.t.me', '')

  if (chat_id.search(/@/) === -1) { chat_id = `@${chat_id}` }

  chat_id = chat_id.replace(/\//g, '')

  let resp = await runShellPy(chat_id)
  logger.info(resp)

  return getApiInstance().getChatMembersCount({
    chat_id,
  }).then((data) => {
    retry = 0
    return data
  }).catch((err) => {
    if (err.statusCode == 429) {
      // return -3;
      if (retry < 5) {
        logger.error('error 429 with ', chat_id, ' ', err.message)

        apiInstance = false
        getChatMembersCount_(chat_id)
      } else {
        retry = 0
        logger.error(`Telegram: error ${err}occur on getting chat members count: \`${chat_id}\`. ${err.message}`)
        return -3
      }
      retry++
    } else {
      logger.error(`Telegram: error ${err.statusCode}occur on getting chat members count: \`${chat_id}\`. ${err.message}`)
      return -2
    }
  })
}

module.exports = {
  countChatMembers: getChatMembersCount_,
  updatePinnedMessages: updatePinnedMessages_,
}
