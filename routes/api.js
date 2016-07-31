var async = require('async');
var express = require('express');
var router = express.Router();
var Team = require('../lib/models/team');
var Vote = require('../lib/models/vote');
var VoteItem = require('../lib/models/vote_item');

router.get('/teams/votes', function (req, res) {
    async.parallel([
        function (done) {
            Vote.getUsersVotes(function (err, userVotes) { done(err, userVotes); });
        },
        function (done) {
            VoteItem.find({enabled: true}, function (err, voteItems) { done(err, voteItems); });
        },
        function (done) {
            Team.find({enabled: true}, function (err, teams) { done(err, teams); });
        }
    ], function (err, results) {
        if (err) {
            console.error(err);
            res.status(500).json({ message: 'Error', err: err });
        } else {
            res.status(200).json({ message: 'OK', usersVotes: results[0], voteItems: results[1], teams: results[2] });
        }
    });
});

module.exports = router;
