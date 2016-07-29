var express = require('express');
var router = express.Router();
var User = require('../lib/models/user');

router.get('/userpage', function (req, res) {
    var username = req.user ? req.user.username : null;
    res.render('userpage', {
        title: 'ユーザページ',
        displayTitle: 'ユーザページ',
        username: username,
        isAdmin : User.isAdminUser(username)
    });
});

module.exports = router;
