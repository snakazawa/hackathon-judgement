var _ = require('lodash');
var async = require('async');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var config = require('config');

var validUsernames = config.get('validUsernames');
var adminUsernames = config.get('adminUsernames');

var Users = new Schema({
    username: { type: String, required: true },
    created_at: { type: Date, default: Date.now, required: true }
});

// Userを取得する
// 存在しない検索条件なら、作成して返す
Users.static('findOrCreate', function (username, callback) {
    var that = this;
    that.findOne({username: username}).exec(function (err, user) {
        if (err) { return callback(err); }
        if (user) { return callback(null, user); }

        // create new user unless exists
        that.create({username: username}, function (err, user) {
            callback(err, user);
        });
    });
});

Users.static('isValidUser', function (username) {
    return _.includes(validUsernames, username);
});

Users.static('isAdminUser', function (username) {
    return _.includes(adminUsernames, username);
});

Users.static('findByUsernames', function (usernames, callback) {
    var User = this;
    async.map(usernames, function (username, next) {
        User.findOrCreate(username, function (err, user) {
            next(err, user);
        });
    }, function (err, users) {
        callback(err, users);
    })
});

if (!mongoose.models.User) { module.exports = mongoose.model('User', Users); }
else { module.exports = mongoose.model('User'); }
