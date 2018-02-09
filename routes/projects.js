const express   = require('express');
const router    = express.Router();
const models    = require('../models');
const Projects  = require('./../modules/wallets');

/* GET all projects */
router.get('/projects', (req, res, next) => {

    models.projects.findAll({
        include: ["Prices"],
        order: [["created_at", 'DESC']]
    })
        .then(projects => {

            const results = projects.map(project => {

                let price = project.getDataValue('Prices')[project.getDataValue('Prices').length - 1] || {};

                return Object.assign(
                    {},
                    {
                        id:         project.getDataValue('id'),
                        name:       project.getDataValue('name'),
                        ticker:     project.getDataValue('ticker'),
                        wallets:    project.getDataValue('wallets'),
                        price_btc:  price.getDataValue('price_btc'),
                        price_eth:  price.getDataValue('price_eth'),
                        price_usd:  price.getDataValue('price_usd'),
                        updated_at: price.getDataValue('created_at'),
                        created_at: project.getDataValue('created_at')
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

    let insertedProject = {
        name        : req.body.name,
        ticker      : req.body.ticker,
        wallets     : req.body.wallets,
        created_at  : new Date()
    };

    models.projects.create(insertedProject)
        .then(async project =>  {

            insertedProject.id = project.getDataValue('id');

            await Projects.updateProjects("add", insertedProject);

            Projects.updateBalance(insertedProject, result => {
                res.json({
                    status: 1,
                    data: result,
                    message: "Project created successfully"
                })
            });

        });

});

/* UPDATE project */
router.put('/project/:id', (req, res, next) => {
    models.projects.findOne({
        where: {id: req.params.id}
    })
        .then(async project => {
            if (project === null) {
                res.json({
                    status: 0,
                    message: "Project with id=" + req.params.id + " not found"
                })
            } else {
                project.updateAttributes({
                    name: req.body.name,
                    ticker: req.body.ticker,
                    wallets: req.body.wallets
                });

                let newProject = {
                    id: project.getDataValue('id'),
                    name: project.getDataValue('name'),
                    ticker: project.getDataValue('ticker'),
                    wallets: project.getDataValue('wallets'),
                    created_at: project.getDataValue('created_at')
                };

                await Projects.updateProjects("update", newProject);

                Projects.updateBalance(newProject, result => {

                    res.json({
                        status: 1,
                        data: result,
                        message: "Project updated successfully"
                    })
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
            Projects.updateProjects("delete", {id: req.params.id});
            res.json({
                status: 1,
                message: "Project deleted successfully"
            })
        }
    });

});

module.exports = router;