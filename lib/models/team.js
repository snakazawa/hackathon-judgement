var async = require('async');
var _ = require('lodash');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var User = require('./user');

var Teams = new Schema({
    name: { type: String, required: true },
    applicationName: { type: String, required: true },
    users: [{ type: ObjectId, ref: 'User', required: true }],
    enabled: { type: Boolean, default: true, required: true },
    created_at: { type: Date, default: Date.now, required: true }
});

Teams.static('updateTeamsByParams', function (newTeamParamsList, callback) {
    var Team = this;

    async.waterfall([
        // fetch all teams
        function (next) {
            Team.find({enabled: true}, function (err, teams) {
                next(err, teams);
            });
        },

        // update or remove
        function (teams, next) {
            var addTeamParamsList = newTeamParamsList.slice();

            async.eachSeries(teams, function (team, nextTeam) {
                var newTeamParams = _.find(newTeamParamsList, function (params) { return params._id === String(team._id); });
                console.log('find', newTeamParams);
                if (newTeamParams) {
                    // update
                    addTeamParamsList.splice(addTeamParamsList.indexOf(newTeamParams), 1);
                    team.updateByParams(newTeamParams, nextTeam);
                } else {
                    // remove
                    team.enabled = false;
                    team.save(nextTeam);
                }
            }, function (err) {
                next(err, addTeamParamsList);
            });
        },

        // add
        function(addTeamParamsList, next) {
            console.log(addTeamParamsList);
            async.eachSeries(addTeamParamsList, function (addTeamParams, nextTeam) {
                Team.addByParams(addTeamParams, nextTeam);
            }, next);
        }
    ], function (err) {
        callback(err);
    });
});

// update from name, applicationName, usernames:array
Teams.method('updateByParams', function (params, callback) {
    var team = this;

    User.findByUsernames(params.usernames, function (err, users) {
        if (err) { return callback(err); }
        team.users = users;
        team.name = params.name;
        team.appliationName = params.applicationName;
        team.save(callback);
    });
});

Teams.static('addByParams', function (params, callback) {
    var Team = this;

    console.log('addusernames', params.usernames);
    User.findByUsernames(params.usernames, function (err, users) {
        if (err) { return callback(err); }
        var userIds = users.map(function (user) { return user._id; });
        Team.create({users: userIds, name: params.name, applicationName: params.applicationName}, callback);
    });
});

if (!mongoose.models.Team) { module.exports = mongoose.model('Team', Teams); }
else { module.exports = mongoose.model('Team'); }
