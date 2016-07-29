var express = require('express');
var router = express.Router();
var User = require('../lib/models/user');
var config = require('config');

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
        if (err) { console.error(err); return next(err); }

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
    res.render('admin/teams', {
        title: 'チーム|管理画面',
        displayTitle: '管理画面 > チーム',
        username: username,
        isAdmin : User.isAdminUser(username)
    });
});

router.get('/vote_items', function (req, res, next) {
    var username = req.user ? req.user.username : null;
    res.render('admin/vote_items', {
        title: '投票項目|管理画面',
        displayTitle: '管理画面 > 投票項目',
        username: username,
        isAdmin : User.isAdminUser(username)
    });
});

module.exports = router;
