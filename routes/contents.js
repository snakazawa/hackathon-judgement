var _ = require('lodash');
var express = require('express');
var router = express.Router();
var User = require('../lib/models/user');
var Vote = require('../lib/models/vote');

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

    Vote.getUserVotes(username, function (err, userVotes) {
        res.render('vote', {
            title: '投票',
            displayTitle: '投票',
            initError: err,
            result: req.query.result,
            username: username,
            votes: userVotes,
            isAdmin : User.isAdminUser(username)
        });
    });
});

router.post('/vote', function (req, res, next) {
    var username = req.user ? req.user.username : null;

    var votes = [];
    _.forEach(req.body.vote, function (items, teamId) {
        _.forEach(items, function (value, itemId) {
            votes.push({username: username, teamId: teamId, voteItemId: itemId, value: Number(value)});
        });
    });

    Vote.updateVotes(votes, function (err) {
        res.redirect('/vote?result=' + (err ? 'error' : 'success'));
    });
});

module.exports = router;
