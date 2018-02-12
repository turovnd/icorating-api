'use strict';
const fs        = require('fs');
const needle    = require('needle');
const tress     = require('tress');
const cheerio   = require('cheerio');
const logger    = require('../logger')();
const models    = require('../../models');
const icoBench  = require('../api/icoBench');

let scraper = null;

/**
 * Update person information in DB
 * @param personObj - Object for update table `people`
 * @param score - Object for update table `people_score`
 * @private
 */
let updatePerson_ = function (personObj, score) {

    models.people.findOrCreate({
        where: {id: personObj.id},
        defaults: personObj
    })
        .spread((person, created) => {
            if (created === false) {
                let icos = person.get('icos').split(','),
                    social = person.get('social').split(','),
                    available_for = person.get('available_for').split(',');

                let attributes = {
                    name: person.get('name') !== "" ? person.get('name') : person.name,
                    title: person.get('title') !== "" ? person.get('title') : person.title,
                    photo: person.get('photo') !== "no-image.jpg" ? person.get('photo') : person.photo,
                    icos: icos.length >= person.icos.length ? person.get('icos') : person.icos,
                    country: person.get('country') !== "" ? person.get('country') : person.country,
                    about: person.get('about') !== "" ? person.get('about') : person.about,
                    social: social.length >= person.social.length ? person.get('social') : person.social,
                    available_for: available_for.length >= person.available_for.length ? person.get('available_for') : person.available_for,
                    distribution_rates: person.get('distribution_rates') !== -1 ? person.get('distribution_rates') : person.distribution_rates,
                    distribution_average_rate: person.get('distribution_average_rate') !== "" ? person.get('distribution_average_rate') : person.distribution_average_rate,
                    distribution_weight: person.get('distribution_weight') !== "" ? person.get('distribution_weight') : person.distribution_weight,
                    profile_score: person.get('profile_score') !== "" ? person.get('profile_score') : person.profile_score,
                    ratings_score: person.get('ratings_score') !== "" ? person.get('ratings_score') : person.ratings_score,
                    time_score: person.get('time_score') !== "" ? person.get('time_score') : person.time_score,
                    iss: person.get('iss') !== "" ? person.get('iss') : person.iss,
                    acceptance_score: person.get('acceptance_score') !== "" ? person.get('acceptance_score') : person.acceptance_score,
                    contribution_score: person.get('contribution_score') !== "" ? person.get('contribution_score') : person.contribution_score,
                    updated_at: new Date()
                };

                person.updateAttributes(attributes);

            }
        });

    models.people_score.create(score);
};

/**
 * Save person photo to Folder
 * @param url - url of photo
 * @private
 */
let savePersonPhoto_ = function(url) {
    let name = url.split('images/')[1].split('/')[1];
    if (name !== "team") {
        let folder = fs.createWriteStream('assets/people/' + name);
        needle.get(url).pipe(folder);
    }

};

/**
 * Get all people from icoBench
 * @private
 */
let getAllPeople_ = function () {
    let ico = new icoBench();

    let getPage_ = function (page) {
        ico.get("people/all", data => {
            logger.info('Getting from API: `https://icobench.com/people/all/' + page + '` from ' + data.pages);
            for (let i = 0; i < data.results.length; i++) {
                savePersonPhoto_(data.results[i].photo);
                scraper.push(data.results[i]);
            }
            if (data.currentPage !== data.pages) {
                getPage_(data.currentPage+1);
            } else {
                logger.info('Receive all people from source `https://icobench.com/people/all');
            }
        }, {page: page});
    };

    getPage_(0);
};

/**
 * Initialize scraping function
 * @private
 */
let initScraper_ = function () {
    scraper = tress((object, callback) => {
        needle('get', object.url)
            .then(response => {
                let $ = cheerio.load(response.body);

                let distribution = $("h3:contains('Rating distribution')").next(),
                    social = "",
                    available_for = "",
                    distribution_rates = $("small:contains('rates')", distribution).parent().text().replace(/[^0-9.]/g, ''),
                    distribution_average_rate = $("small:contains('average rate')", distribution).parent().text().replace(/[^0-9.]/g, ''),
                    distribution_weight = $("h3:contains('Weight distribution')").next().find('b').text().trim(),
                    profile_score = $("label:contains('Profile score')").parent().find('.value').text().split('/')[0],
                    ratings_score = $("label:contains('Ratings score')").parent().find('.value').text().split('/')[0],
                    time_score = $("label:contains('Time score')").parent().find('.value').text().split('/')[0],
                    iss = $("label:contains('ISS')").parent().find('.value').text().split('/')[0],
                    acceptance_score = $("label:contains('Acceptance score')").parent().find('.value').text().split('/')[0],
                    contribution_score = $("label:contains('Contribution score')").parent().find('.value').text().split('/')[0]

                $('.links a').each((i, el) => {
                   social += $(el).attr('href') + ((i < $('.links a').length - 1) ? "," : "");
                });

                $("h4:contains('Available for')").next().find('.tag').each((i, el) => {
                    available_for += $(el).text().trim() + ((i < $('.links a').length - 1) ? "," : "");
                });

                updatePerson_({
                    id: object.id === 0 ? object._id : object.id,
                    name: object.name,
                    title: object.title,
                    photo: object.photo.split('images/')[1].split('/')[1] === "team" ? "no-image.jpg" : object.photo.split('images/')[1].split('/')[1],
                    icos: object.icos.map(el => { return el.name.trim() }).join(','),
                    country: $('.location').text().trim(),
                    about: $("h3:contains('About')").next().text().trim(),
                    social: social,
                    available_for: available_for,
                    distribution_rates: distribution_rates !== "" ? distribution_rates : -1,
                    distribution_average_rate: distribution_average_rate !== "" ? distribution_average_rate : -1,
                    distribution_weight: distribution_weight !== "" ? distribution_weight : -1,
                    profile_score: profile_score !== "" ? profile_score : -1,
                    ratings_score: ratings_score !== "" ? ratings_score : -1,
                    time_score: time_score !== "" ? time_score : -1,
                    iss: iss !== "" ? iss : -1,
                    acceptance_score: acceptance_score !== "" ? acceptance_score : -1,
                    contribution_score: contribution_score !== "" ? contribution_score : -1
                }, {
                    people_id: object.id === 0 ? object._id : object.id,
                    score: object.iss
                });
                callback();
            })
            .catch(error => {
                logger.error("Could not load source `" + object.url + "`. Error: " + error);
                scraper.push(object);
                callback();
            })
    }, 12)
};


/**
 * Scraping people every 24 hours
 * @private
 */
let initPeople_ = function () {
    initScraper_();

    setInterval(getAllPeople_, 1000*60*60*24);
    getAllPeople_();
};


module.exports = {
    init: initPeople_,
};