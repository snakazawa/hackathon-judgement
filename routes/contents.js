var express = require('express');
var router = express.Router();
var _ = require('lodash');
var config = require('config');

var adminUsernames = config.get('adminUsernames');

router.get('/userpage', function (req, res) {
    console.log(req.passport);
    var username = req.user ? req.user.username : null;
    var isAdmin = isAdminUser(username);
    res.render('userpage', {
        title: 'ユーザページ',
        displayTitle: 'ユーザページ',
        username: username,
        isAdmin : isAdmin
    });
});

router.get('/admin', function (req, res, next) {
    var username = req.user ? req.user.username : null;
    var isAdmin = isAdminUser(username);
    if (!isAdmin) {
        next(new Error('invalid authorization'));
    } else {
        res.render('admin', {
            title: '管理画面',
            displayTitle: '管理画面',
            username: username,
            isAdmin : isAdmin
        });
    }
});

function isAdminUser(username) {
    return _.includes(adminUsernames, username)
}

module.exports = router;
