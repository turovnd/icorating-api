const express = require('express');
const router  = express.Router();
let models = require('../models');
let Projects  = require('./../modules/wallets');

/* GET all projects */
router.get('/projects', (req, res, next) => {

    models.projects.findAll({
        include: ["Prices"]
    })
        .then(projects => {

            const results = projects.map(project => {

                let price = project.getPrices()[project.getPrices().length - 1] || {};

                return Object.assign(
                    {},
                    {
                        id: project.id,
                        name: project.name,
                        ticker: project.ticker,
                        wallets: project.wallets,
                        price_btc: price.price_btc,
                        price_eth: price.price_eth,
                        price_usd: price.price_usd,
                        updated_at: price.created_at,
                        created_at: project.created_at
                    }
                );
            });

            res.json({
                status: 1,
                data: results,
                message: "Projects get successfully"
            })

        });

});

/* Add project */
router.post('/project/add', (req, res, next) => {

    if (req.body.name === undefined || req.body.wallets === undefined) {
        return res.json({
            status: 0,
            message: "Error occur: missed `name` or `wallets` data"
        })
    }

    models.projects.create({
        name        : req.body.name,
        ticker      : req.body.ticker,
        wallets     : req.body.wallets,
        dt_create   : new Date()
    })
        .then(project => {
            /// TODO add project to updating

            // Projects.updateProjects("add", project.toJSON());
            // Projects.updateBalances(project, function (project1) {
            res.json({
                status: 1,
                data: project,
                message: "Project created successfully"
            })

        });

});

/* UPDATE project */
router.put('/project/:id', (req, res, next) => {
    models.projects.findOne({
        where: {id: req.params.id}
    })
        .then(project => {
            if (project === null) {
                res.json({
                    status: 0,
                    message: "Project with id=" + req.params.id + " not found"
                })
            } else {
                project.updateAttributes({
                    name        : req.body.name,
                    ticker      : req.body.ticker,
                    wallets     : req.body.wallets
                });
                // TODO    Projects.updateBalances(project, function (project1) {
                //    TODO изменить объект и отправить
                res.json({
                    status: 1,
                    data: project,
                    message: "Project updated successfully"
                })
            }

    });
});

/* DELETE project */
router.delete('/project/:id', (req, res, next) => {

    models.projects.destroy({
        where: {id: req.params.id}
    }).then(result => {
        if (result === 0) {
            res.json({
                status: 0,
                message: "Project with id=" + req.params.id + " not found"
            })
        } else {
            // Projects.updateProjects("delete", {id: req.params.id});
            res.json({
                status: 1,
                message: "Project deleted successfully"
            })
        }
    });

});

module.exports = router;