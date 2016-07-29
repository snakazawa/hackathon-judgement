var express = require('express');
var router = express.Router();
var _ = require('lodash');
var config = require('config');

var adminUsernames = config.get('adminUsernames');

router.get('/', function (req, res) {
    var username = req.user ? req.user.username : null;
    var isAdmin = isAdminUser(username);
    res.render('index', {
        title: 'BeerHackathon審査システム',
        displayTitle: 'BeerHackathon審査システム',
        failure: req.query.failure === '1',
        invalidUser: req.query.invaliduser === '1',
        username: username,
        isAdmin : isAdmin
    });
});

function isAdminUser(username) {
    return _.includes(adminUsernames, username)
}

module.exports = router;
