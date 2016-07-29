var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var User = require('./user');
var Team = require('./team');
var VoteItem = require('./vote_item');

var Votes = new Schema({
    user: { type: ObjectId, ref: 'User', required: true },
    team: { type: ObjectId, ref: 'Team', required: true },
    item: [{ type: ObjectId, ref: 'VoteItem', required: true }],
    created_at: { type: Date, default: Date.now, required: true }
});


if (!mongoose.models.Vote) { module.exports = mongoose.model('Vote', Votes); }
else { module.exports = mongoose.model('Vote'); }
