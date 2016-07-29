var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var VoteItems = new Schema({
    name: { type: String, required: true },
    description: { type: String, default: '', required: true },
    created_at: { type: Date, default: Date.now, required: true }
});


if (!mongoose.models.VoteItem) { module.exports = mongoose.model('VoteItem', VoteItems); }
else { module.exports = mongoose.model('VoteItem'); }
