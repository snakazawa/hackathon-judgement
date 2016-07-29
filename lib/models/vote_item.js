var async = require('async');
var _ = require('lodash');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var VoteItems = new Schema({
    name: { type: String, required: true },
    description: { type: String, default: '', required: true },
    enabled: { type: Boolean, default: true, required: true },
    created_at: { type: Date, default: Date.now, required: true }
});

VoteItems.static('updateVoteItemsByParams', function (newVoteItemParamsList, callback) {
    var VoteItem = this;

    async.waterfall([
        // fetch all teams
        function (next) {
            VoteItem.find({enabled: true}, function (err, teams) {
                next(err, teams);
            });
        },

        // update or remove
        function (teams, next) {
            var addVoteItemParamsList = newVoteItemParamsList.slice();

            async.eachSeries(teams, function (team, nextVoteItem) {
                var newVoteItemParams = _.find(newVoteItemParamsList, function (params) { return params._id === String(team._id); });
                if (newVoteItemParams) {
                    // update
                    addVoteItemParamsList.splice(addVoteItemParamsList.indexOf(newVoteItemParams), 1);
                    team.updateByParams(newVoteItemParams, nextVoteItem);
                } else {
                    // remove
                    team.enabled = false;
                    team.save(nextVoteItem);
                }
            }, function (err) {
                next(err, addVoteItemParamsList);
            });
        },

        // add
        function(addVoteItemParamsList, next) {
            async.eachSeries(addVoteItemParamsList, function (addVoteItemParams, nextVoteItem) {
                VoteItem.addByParams(addVoteItemParams, nextVoteItem);
            }, next);
        }
    ], function (err) {
        callback(err);
    });
});

// update from name, description
VoteItems.method('updateByParams', function (params, callback) {
    var team = this;
    team.name = params.name;
    team.description = params.description;
    team.save(callback);
});

VoteItems.static('addByParams', function (params, callback) {
    var VoteItem = this;
    VoteItem.create({name: params.name, description: params.description}, callback);
});


if (!mongoose.models.VoteItem) { module.exports = mongoose.model('VoteItem', VoteItems); }
else { module.exports = mongoose.model('VoteItem'); }
