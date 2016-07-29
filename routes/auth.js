var express = require('express');
var User = require('../lib/models/user');

module.exports = function (passport) {
    var router = express.Router();

    router.ensureAuthenticated = function (req, res, next) {
        if (req.isAuthenticated()) { return next(); }
        res.redirect('/?requiredLogin=1');
    };

    router.validateAdmin = function (req, res, next) {
        if (req.isAuthenticated()) { return next(); }
        res.redirect('/?requiredAdmin=1');
    };

    router.get('/logout', function (req, res) {
        req.logout();
        res.redirect('/');
    });

    router.get('/github', passport.authenticate('github'));

    router.get('/github/callback', passport.authenticate('github', {failureRedirect: '/?failure=1'}), function (req, res, next) {
        if (User.isValidUser(req.user.username)) {
            User.findOrCreate(req.user.username, function (err) {
                if (err) {
                    console.log(err);
                    next(err);
                } else {
                    res.redirect('/userpage');
                }
            });
        } else {
            req.logout();
            res.redirect('/?invaliduser=1');
        }
    });

    return router;
};
