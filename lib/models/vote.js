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

// callback(err, [{team, voteItems: [{item, value, isTop}, totalScore]}]) (sort by totalScore desc)
Votes.static('getTeamScores', function (callback) {
    var Vote = this;

    async.waterfall([
        function (next) {
            Team.find({enabled: true}).populate('users').exec(function (err, teams) { next(err, teams); });
        },
        function (teams, next) {
            VoteItem.find({enabled: true}).populate('users').exec(function (err, voteItems) { next(err, teams, voteItems); });
        },
        function (teams, voteItems, next) {
            async.map(teams, function (team, doneTeam) {
                Vote.find({team: team._id}, function (err, votes) {
                    doneTeam(err, votes);
                });
            }, function (err, results) {
                next(err, teams, voteItems, results);
            });
        },
        function (teams, voteItems, votes, next) {
            var res = _.sortBy(teams.map(function (team, teamIdx) {
                var voteItemResults = voteItems.map(function (item) {
                    return {
                        item: item,
                        value: votes[teamIdx]
                            .filter(function (vote) { return String(vote.voteItem) === String(item._id); })
                            .reduce(function (y, x) { return y + x.value }, 0)
                    };
                });
                var total = voteItemResults.reduce(function (y, x) { return y + x.value; }, 0);
                return {team: team, voteItems: voteItemResults, totalScore: total};
            }), function (x) { return -x.totalScore; });

            voteItems.forEach(function (voteItem) {
                var maxValue = res.reduce(function (y, voteTeam) {
                    var item = _.find(voteTeam.voteItems, function (x) { return String(x.item._id) === String(voteItem._id); });
                    return Math.max(y, item ? item.value : 0);
                }, 0);
                res.forEach(function (voteTeam) {
                    var item = _.find(voteTeam.voteItems, function (x) { return String(x.item._id) === String(voteItem._id); });
                    if (item.value === maxValue) {
                        item.isTop = true;
                    }
                });
            });

            var rank = 0;
            var beforeScore = 1e+32;
            res.forEach(function (team, idx) {
                if (team.totalScore === beforeScore) {
                    team.rank = rank;
                } else {
                    beforeScore = team.totalScore;
                    team.rank = rank = idx + 1;
                }
            });

            next(null, res);
        }
    ], callback);
});

// callback(err, [user, teams: [ {team, voteItems: [ {item, value} ]} ] ])
Votes.static('getUsersVotes', function (callback) {
    var Vote = this;

    async.waterfall([
        function (next) {
            User.find({}, function (err, users) { next(err, users); });
        },
        function (users, next) {
            async.map(users, function (user, nextUser) {
                Vote.getUserVotes(user.username, function (err, userVotes) {
                    if (err) { nextUser(err); }
                    else {
                        nextUser(null, userVotes.length ? {user: user, votes: userVotes} : null);
                    }
                });
            }, next);
        }
    ], callback);
});

// callback(err, [ {team, voteItems: [ {item, value} ]} ])
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
