var express = require('express');
var router = express.Router();
var User = require('../lib/models/user');

router.get('/', function (req, res) {
    var username = req.user ? req.user.username : null;
    res.render('index', {
        title: 'BeerHackathon審査システム',
        displayTitle: 'BeerHackathon審査システム',
        failure: req.query.failure === '1',
        invalidUser: req.query.invaliduser === '1',
        username: username,
        isAdmin: User.isAdminUser(username)
    });
});

module.exports = router;
