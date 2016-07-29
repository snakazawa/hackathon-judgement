var express = require('express');
var router = express.Router();
var User = require('../lib/models/user');
var Team = require('../lib/models/team');
var VoteItem = require('../lib/models/vote_item');

router.get('/userpage', function (req, res) {
    var username = req.user ? req.user.username : null;
    res.render('userpage', {
        title: 'ユーザページ',
        displayTitle: 'ユーザページ',
        username: username,
        isAdmin : User.isAdminUser(username)
    });
});

router.get('/vote', function (req, res, next) {
    var username = req.user ? req.user.username : null;

    Team.getWithoutMe(username, function (err, voteTeams) {
        if (err) { return next(err); }

        VoteItem.find({enabled: true}, function (err, voteItems) {
            if (err) { return next(err); }

            res.render('vote', {
                title: '審査',
                displayTitle: '審査',
                username: username,
                voteTeams: voteTeams,
                voteItems: voteItems,
                isAdmin : User.isAdminUser(username)
            });
        });
    });
});

module.exports = router;
