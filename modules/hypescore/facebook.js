const logger   = require('../logger')();
const Facebook = require('facebook-node-sdk');

const facebook = new Facebook({ appId: process.env.FACEBOOK_APP_ID, secret: process.env.FACEBOOK_SECRET });
var simpleWaitTransaction = function (ms){
    var start = new Date().getTime();
    var end = start;
    while(end < start + ms) {
        end = new Date().getTime();
    }
}
let countFollowers_ = function (pageName) {
    if (pageName === "" || pageName === null || pageName === undefined)
        return -1;


    pageName = pageName.replace(/\//g, '');

    pageName = pageName
        .replace("https:facebook.com","")
        .replace("groups","")
        .replace("https:fb.me", "")
        .replace("https:fb.com", "")
        .replace("https:web.facebook.com","")
        .replace("https:business.facebook.com","")
        .replace("httpswww.facebook.com","")
        .replace("http:www.facebook.com","")
        .replace("https:m.facebook.com","")
        .replace("http:fb.me","");

    return new Promise((resolve, reject) => {
            facebook.api('/' + pageName + '/?fields=fan_count', (err, data) => {
                if (err) {
                    if (pageName.charAt(0) === "h"){
                        pageName = pageName.substr(1);
                    }
                    simpleWaitTransaction(2000)
                    facebook.api('/' + pageName + '/?fields=fan_count', (err, data) => {
                        if(err) {
                            var pageNameArr = /-(\d+)/g.exec(pageName);
                            if (pageNameArr && pageNameArr.length > 0 ){
                                pageName = pageNameArr[1];
                                simpleWaitTransaction(2000)

                                facebook.api('/' + pageName + '/?fields=fan_count', (err, data) => {
                                    if(err) {
                                        reject(err)
                                    }else{
                                        resolve(data)
                                    }
                                });
                            }else{
                                reject(err)
                            }
                        }else{
                            resolve(data)
                        }
                    });
                }else{
                    resolve(data)
                }
            });
        })
        .then(data => {
            if (data.fan_count){
                return data.fan_count
            }else{
                return -3
            }

        })
        .catch(err => {
            logger.error("Facebook: error occur on getting fan count: `" + pageName + "`. " + err.message);
            return -2;
        });
};

module.exports = {
    countFollowers: countFollowers_
};