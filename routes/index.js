var express = require('express');
var router = express.Router();

router.get('/', function (req, res) {
    var username = req.user ? req.user.username : null;
    res.render('index', {
        title: 'BeerHackathon審査システム',
        displayTitle: 'BeerHackathon審査システム',
        failure: req.query.failure === '1',
        invalidUser: req.query.invaliduser === '1',
        username: username
    });
});

router.get('/userpage', function (req, res) {
    var username = req.user ? req.user.username : null;
    res.render('userpage', {
        title: 'ユーザページ',
        displayTitle: 'ユーザページ',
        username: username
    });
});

module.exports = router;
