var _ = require('lodash');
var async = require('async');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var User = require('./user');
var Team = require('./team');
var VoteItem = require('./vote_item');

var Votes = new Schema({
    user: { type: ObjectId, ref: 'User', required: true },
    team: { type: ObjectId, ref: 'Team', required: true },
    voteItem: { type: ObjectId, ref: 'VoteItem', required: true },
    value: { type: Number, required: true },
    created_at: { type: Date, default: Date.now, required: true }
});

Votes.static('getUserVotes', function (username, callback) {
    var Vote = this;

    async.waterfall([
        function (next) {
            User.findOne({username: username}, function (err, user) {
                next(err, user);
            });
        },
        function (user, next) {
            Team.getWithoutMe(username, function (err, teams) {
                next(err, user, teams);
            });
        },
        function (user, teams, next) {
            VoteItem.find({enabled: true}, function (err, voteItems) {
                next(err, user, teams, voteItems);
            })
        },
        function (user, teams, voteItems, next) {
            Vote.find({user: user}, function (err, votes) {
                next(err, user, teams, voteItems, votes);
            });
        },
        function (user, teams, voteItems, votes, next) {
            var userVotes = [];
            teams.forEach(function (_team) {
                var team = {team: _team, voteItems: []};
                var teamVotes = votes.filter(function (x) { return String(x.team) === String(_team._id); });
                voteItems.forEach(function (_item) {
                    var vote = _.find(teamVotes, function (x) { return String(x.voteItem) === String(_item._id); });
                    team.voteItems.push({item: _item, value: vote ? vote.value : 0});
                });
                userVotes.push(team);
            });
            next(null, userVotes);
        }
    ], function (err, userVotes) {
        callback(err, userVotes);
    })
});

// params: [{username, teamId, voteItemId, value}]
Votes.static('updateVotes', function (params, callback) {
    var Vote = this;

    async.each(params, function (x, next) {
        Vote.updateVote(x, next);
    }, callback);
});

// params: {username, teamId, voteItemId, value}
Votes.static('updateVote', function (params, callback) {
    var Vote = this;

    async.waterfall([
        function (next) {
            User.findOne({username: params.username}, function (err, user) {
                next(err, user);
            });
        },
        function (user, next) {
            Vote.findOne({user: user, team: params.teamId, voteItem: params.voteItemId}, function (err, vote) {
                if (err) { next(err); }
                else if (vote) {
                    vote.value = Number(params.value);
                    vote.save(next);
                } else {
                    Vote.create({user: user, team: params.teamId, voteItem: params.voteItemId, value: Number(params.value)}, next);
                }
            });
        }
    ], callback);
});

if (!mongoose.models.Vote) { module.exports = mongoose.model('Vote', Votes); }
else { module.exports = mongoose.model('Vote'); }
