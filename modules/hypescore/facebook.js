const logger   = require('../logger')();
const Facebook = require('facebook-node-sdk');
const perBotRequestLimit = 180;

const facebookKeys =  process.env.FACEBOOK_KEYS.split(' ');
var secretIndex = 0;
var apiInstance = false;
var requestCount = 0;
var retry = 0;
var counter = 0;
var instance = false;


let countFollowers_ = function (originalPageName) {
    requestCount++;

    if (originalPageName === "" || originalPageName === null || originalPageName === undefined)
        return -1;
    var pageName = originalPageName.replace(/\//g, '');
    pageName = pageName
        .replaceArray(
            ["https:facebook.com", "groups", "https:fb.me", "https:fb.com", "https:web.facebook.com",
                "https:business.facebook.com", "httpswww.facebook.com", "http:www.facebook.com",
                "https:m.facebook.com","http:fb.me"],"");


    return new Promise((resolve, reject) => {
        simpleWaitTransaction(2000);

        //case facebook name contains numeric identifier
        var numericPageName = /-(\d+)/g.exec(pageName);
        if (numericPageName && numericPageName.length > 0 ){
            pageName = numericPageName[1];
            // simpleWaitTransaction(2000)
            // logger.info(pageName + " numeric name");

            getApiInstance().api('/' + pageName + '/?fields=fan_count', (err, data) => {

                if(err) {
                    reject(err)
                }else{
                    resolve(data)
                }
            });
        }else{
            //case facebook name contains 'h' letter
            if (pageName.charAt(0) === "h"){
                pageName = pageName.substr(1);
                // simpleWaitTransaction(2000);

                // logger.info(pageName + " had 'h' in beginning");

                getApiInstance().api('/' + pageName + '/?fields=fan_count', (err, data) => {
                    if(err) {
                        reject(err)

                    }else{
                        resolve(data)
                    }
                })
            }else{
                //simple case
                getApiInstance().api('/' + pageName + '/?fields=fan_count&debug=all', (err, data) => {
                    if (err) {
                        reject(err)
                    }else{
                        resolve(data)
                    }
                })
            }
        }}).then(data => {
                retry = 0;
                if (data.fan_count){
                    // logger.info("got "+data.fan_count+" for ", originalPageName);

                    return data.fan_count
                }else{
                    return -3
                }

            })
            .catch(err => {
                if(retry < 2) {
                    console.warn(err.message, " for: ", pageName, " retry: ",retry);
                    // logger.info("got new retry for ", originalPageName, "...",pageName);
                    apiInstance = false;
                    countFollowers_(originalPageName)
                    retry ++;
                }else{
                    retry = 0;
                    logger.error("Facebook: error occur on getting fan count: `" + pageName + "`. " + err.message);
                    return -2;
                }
            });
};

String.prototype.replaceArray = function(find, replace) {
    var replaceString = this;
    var regex;
    for (var i = 0; i < find.length; i++) {
        regex = new RegExp(find[i], "g");
        replaceString = replaceString.replace(regex, replace[i]);
    }
    return replaceString;
};

function getApiInstance(){
    if(requestCount >= perBotRequestLimit ){
        requestCount = 0;
        return  apiInstance = newApiInstance();
    }
    if(!apiInstance) apiInstance = newApiInstance();
    return apiInstance;
}

function newApiInstance(){

    var secret =  facebookKeys[secretIndex];

   secret = secret.split(":")

    let instance = false;
    logger.info("New facebook api instance secret: " + secret[1]);

    instance = new Facebook({ appId: secret[0], secret: secret[1] });
    secretIndex ++;
    if(facebookKeys[secretIndex] == null){
        secretIndex = 0;
    }
    return instance;
}


var simpleWaitTransaction = function (ms){
    var start = new Date().getTime(),
        end = start;
    while(end < start + ms) {
        end = new Date().getTime();
    }
    // console.log("waited ", ms)
};

module.exports = {
    countFollowers: countFollowers_
};