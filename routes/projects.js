const express = require('express');
const router  = express.Router();
let Projects  = require('./../modules/wallets');

/* GET all projects */
router.get('/projects', (req, res, next) => {

    req.models.project.find((error, projects) => {
        if (error) {
            res.json({
                status: 0,
                message: "Error occurred on getting projects: " + error
            })
        } else {
            res.json({
                status: 1,
                data: projects,
                message: "Success getting projects"
            })
        }
    });

});

/* Add project */
router.post('/project/add', (req, res, next) => {

    req.models.project.create({
        name        : req.body.name,
        ticker      : req.body.ticker,
        wallets     : req.body.wallets,
        dt_create   : new Date()
    }, function (err, project) {
        if (err) {
            res.json({
                status: 0,
                message: "Error occurred: " + err
            })
        } else {
            Projects.updateProjects("add", project.toJSON());
            Projects.updateBalances(project, function (project1) {
                project1.save((error, project2) => {
                    if (error) {
                        res.json({
                            status: 0,
                            message: "Error occurred on creating project: " + error
                        })
                    } else {
                        res.json({
                            status: 1,
                            data: project2,
                            message: "Success creating project"
                        })
                    }
                })
            });
        }
    });

});

/* UPDATE project */
router.put('/project/:id', (req, res, next) => {
    req.models.project.get(req.params.id, (err, project) => {
        if (err || project === null) {
            res.json({
                status: 0,
                message: "Error occurred on updating project `id=" + req.params.id + "`: " + (project === null ? "not found" : err)
            })
        } else {
            project.name      = req.body.name;
            project.ticker    = req.body.ticker;
            project.wallets   = req.body.wallets;
            Projects.updateBalances(project, function (project1) {
                project1.save((error, project2) => {
                    if (error) {
                        res.json({
                            status: 0,
                            message: "Error occurred on updating project `id=" + req.params.id + "`: " + (project === null ? "not found" : err)
                        })
                    } else {
                        res.json({
                            status: 1,
                            data: project2,
                            message: "Update successfully"
                        })
                    }
                })
            });
        }
    });
});

/* DELETE project */
router.delete('/project/:id', (req, res, next) => {

    req.models.project.get(req.params.id, (err, project) => {
        if (err || project === null) {
            res.json({
                status: 0,
                message: "Error occurred on deleting project `id=" + req.params.id + "`: " + (project === null ? "not found" : err)
            })
        } else {
            Projects.updateProjects("delete", {id: req.params.id});
            project.remove((err) => {
                if (err) {
                    res.json({
                        status: 0,
                        message: "Error occurred on deleting project `id=" + req.params.id + "`: " + (project === null ? "not found" : err)
                    })
                } else {
                    res.json({
                        status: 1,
                        message: "Success deleting"
                    })
                }
            });
        }
    });

});

module.exports = router;