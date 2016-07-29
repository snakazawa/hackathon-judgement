var express = require('express');
var router = express.Router();
var config = require('config');
var async = require('async');
var _ = require('lodash');
var User = require('../lib/models/user');
var Team = require('../lib/models/team');
var VoteItem = require('../lib/models/vote_item');

router.get('/', function (req, res, next) {
    var username = req.user ? req.user.username : null;
    res.render('admin', {
        title: '管理画面',
        displayTitle: '管理画面',
        username: username,
        isAdmin : User.isAdminUser(username)
    });
});

router.get('/users', function (req, res, next) {
    var username = req.user ? req.user.username : null;

    User.find({}, function (err, users) {
        if (err) {
            console.error(err);
            return next(err);
        }

        res.render('admin/users', {
            title: 'ユーザ|管理画面',
            displayTitle: '管理画面 > ユーザ',
            username: username,
            users: users,
            validUsernames: config.get('validUsernames'),
            adminUsernames: config.get('adminUsernames'),
            isAdmin : User.isAdminUser(username)
        });
    });
});

router.get('/teams', function (req, res, next) {
    var username = req.user ? req.user.username : null;

    Team.find({enabled: true}).populate('users').exec(function (err, teams) {
        if (err) {
            console.error(err);
            return next(err);
        }

        teams.forEach(function (team) {
            team.usernames = team.users.map(function (user) { return user.username; });
        });

        res.render('admin/teams', {
            title: 'チーム|管理画面',
            displayTitle: '管理画面 > チーム',
            username: username,
            teams: teams,
            result: req.query.result,
            isAdmin: User.isAdminUser(username)
        });
    });
});

router.post('/teams', function (req, res, next) {
    var newTeamParams = req.body.teams || [];
    newTeamParams.forEach(function (team) {
        if (_.isString(team.usernames)) {
            team.usernames = team.usernames.split(',');
        } else {
            team.usernames = [];
        }
    });

    Team.updateTeamsByParams(newTeamParams, function (err) {
        if (err) { console.error(err); }
        res.redirect('/admin/teams?result=' + (err ? 'error' : 'success'));
    });
});

router.get('/vote_items', function (req, res, next) {
    VoteItem.find({enabled: true}).exec(function (err, voteItems) {
        if (err) {
            console.error(err);
            return next(err);
        }

        var username = req.user ? req.user.username : null;
        res.render('admin/vote_items', {
            title: '投票項目|管理画面',
            displayTitle: '管理画面 > 投票項目',
            username: username,
            voteItems: voteItems,
            isAdmin : User.isAdminUser(username)
        });
    });
});

router.post('/vote_items', function (req, res, next) {
    var newVoteItems = req.body.voteItems || [];

    VoteItem.updateVoteItemsByParams(newVoteItems, function (err) {
        if (err) { console.error(err); }
        res.redirect('/admin/vote_items?result=' + (err ? 'error' : 'success'));
    });
});

module.exports = router;
