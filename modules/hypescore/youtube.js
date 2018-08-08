const {google} = require('googleapis');
const http = require('http');
const url = require('url');
const querystring = require('querystring');
const opn = require('opn');
const destroyer = require('server-destroy');
const fs = require('fs');
const path = require('path');

// const keyPath = path.join(__dirname, 'client_secret.json');
// let keys = { redirect_uris: [''] };
// if (fs.existsSync(keyPath)) {
//     const keyFile = require(keyPath);
//     keys = keyFile.installed || keyFile.web;
//
// }


// class SampleClient {
//     constructor (options) {
//         this._options = options || { scopes: [] };
//
//         // create an oAuth client to authorize the API call
//         this.oAuth2Client = new google.auth.OAuth2(
//             process.env.YOUTUBE_CLIENT_ID,
//             process.env.YOUTUBE_CLIENT_SECRET,
//             process.env.YOUTUBE_CLIENT_REDIRECT_URI,
//         );
//     }
//
//     // Open an http server to accept the oauth callback. In this
//     // simple example, the only request to our webserver is to
//     // /oauth2callback?code=<code>
//     async authenticate (scopes) {
//         return new Promise((resolve, reject) => {
//             // grab the url that will be used for authorization
//             this.authorizeUrl = this.oAuth2Client.generateAuthUrl({
//                 access_type: 'offline',
//                 scope: scopes.join(' ')
//             });
//             const server = http.createServer(async (req, res) => {
//                 try {
//                     if (req.url.indexOf('/oauth2callback') > -1) {
//                         const qs = querystring.parse(url.parse(req.url).query);
//                         res.end('Authentication successful! Please return to the console.');
//                         server.destroy();
//                         const {tokens} = await this.oAuth2Client.getToken(qs.code);
//
//                         console.log("SDfsdfsd")
//
//                         console.log(tokens)
//                         this.oAuth2Client.credentials = tokens;
//                         resolve(this.oAuth2Client);
//                     }
//                 } catch (e) {
//                     reject(e);
//                 }
//             }).listen(8089, () => {
//                 // open the browser to the authorize url to start the workflow
//                 opn(this.authorizeUrl, {wait: false}).then(cp => cp.unref());
//             });
//             destroyer(server);
//         });
//     }
// }


// initialize the Youtube API library




function channelsListById (links,client) {
    return new Promise(async function(resolve, reject) {

        var idd = links.map(function (e) { return e.youtube }),
            wholeResponce = [];

        var auth = new google.auth.OAuth2(
            process.env.YOUTUBE_CLIENT_ID,
            process.env.YOUTUBE_CLIENT_SECRET,
            process.env.YOUTUBE_CLIENT_REDIRECT_URI,
        );


        auth.credentials = {
            access_token: process.env.YOUTUBE_TOKEN,
            token_type: 'Bearer',
            scope: 'https://www.googleapis.com/auth/youtube',
            expiry_date: process.env.YOUTUBE_TIMESTAMP
        }

        const youtube = google.youtube({
            version: 'v3',
            auth: auth
        });


        var x = 0;
        var loopArray = function(arr, call){
                getChannelsInfo(arr[x], call, function (call, success, views = 0, subscribers = 0) {

                        let icoResult = {id: arr[x], views: views, subscribers: subscribers}
                        wholeResponce.push(icoResult);

                        x++;
                        if (x < arr.length) {
                            loopArray(arr, call)
                        } else {

                            call(wholeResponce)

                            // console.log("whole");
                            // var fs = require('fs');
                            // var stream = fs.createWriteStream("res.json");
                            // stream.once('open', function(fd) {
                            //     stream.write(JSON.stringify(wholeResponce));
                            //     stream.end();
                            // });

                        }
                    })
        }

        var getChannelsInfo = function(ico, call, callback){
                youtube.channels.list({
                    'id': ico,
                    'part': 'snippet,contentDetails,statistics'
                }, function (err, response) {


                    if (err || response.data.items.length === 0) {
                        // if(err) console.log(err)
                        callback(call, false);
                        // reject(err)
                    } else {
                        let views = response.data.items[0].statistics.viewCount,
                            subscribers = response.data.items[0].statistics.subscriberCount
                        callback(call, true, views, subscribers);

                    }
                    // resolve (response.data);
                });
        };


        loopArray(idd, function(data){
            resolve(data)

        })


    })
}



let countFollowers_ = async function(filteredIcos){
    return new Promise(async function(resolve, reject) {
        try {
            // let client = await new SampleClient().authenticate(['https://www.googleapis.com/auth/youtube'])

            let scores = await channelsListById(filteredIcos.slice(0,10))

            let resultYoutubeArr = [];
            for (let i = 0; i < scores.length; i++) {
                for (let a = 0; a < filteredIcos.length; a++) {
                    if (scores[i].id === filteredIcos[a].youtube) {
                        resultYoutubeArr.push(
                            {
                                id: scores[i].id,
                                subscribers: scores[i].subscribers,
                                views: scores[i].views,
                                name: filteredIcos[a].name,
                                website: filteredIcos[a].website,
                                ico_id: filteredIcos[a].id,
                                start_date: filteredIcos[a].start_date_ico,
                                end_date: filteredIcos[a].end_date_ico,
                            })
                    }
                }
            }
            resolve(resultYoutubeArr)

        }catch(e){
            reject(e)
        }

    })
}

module.exports = {

    countFollowers: countFollowers_,

};

