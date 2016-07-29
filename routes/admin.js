var express = require('express');
var router = express.Router();
var User = require('../lib/models/user');

router.get('/', function (req, res, next) {
    var username = req.user ? req.user.username : null;
    res.render('admin', {
        title: '管理画面',
        displayTitle: '管理画面',
        username: username,
        isAdmin : User.isAdminUser(username)
    });
});

module.exports = router;
