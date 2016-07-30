var express = require('express');
var router = express.Router();
var User = require('../lib/models/user');

router.get('/', function (req, res) {
    var username = req.user ? req.user.username : null;
    res.render('index', {
        title: 'BeerHackathon Judgement',
        displayTitle: 'BeerHackathon Judgement',
        failure: req.query.failure === '1',
        invalidUser: req.query.invaliduser === '1',
        username: username,
        isAdmin: User.isAdminUser(username)
    });
});

module.exports = router;
