var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var User = require('./user');

var Teams = new Schema({
    name: { type: String, required: true },
    applicationName: { type: String, required: true },
    users: [{ type: ObjectId, ref: 'User', required: true }],
    created_at: { type: Date, default: Date.now, required: true }
});

if (!mongoose.models.Team) { module.exports = mongoose.model('Team', Teams); }
else { module.exports = mongoose.model('Team'); }
