var express = require('express');
var config = require('config');
var _ = require('lodash');

module.exports = function (passport) {
    var router = express.Router();
    var validUserIds = config.get('validUserIds');

    router.ensureAuthenticated = function (req, res, next) {
        if (req.isAuthenticated()) { return next(); }
        res.redirect('/');
    };

    router.get('/logout', function (req, res) {
        req.logout();
        res.redirect('/');
    });

    router.get('/github', passport.authenticate('github'));

    router.get('/github/callback', passport.authenticate('github', {failureRedirect: '/?failure=1'}), function (req, res, next) {
        if (_.includes(validUserIds, req.user.username)) {
            res.redirect('/userpage');
        } else {
            req.logout();
            res.redirect('/?invaliduser=1');
        }
    });

    return router;
};
