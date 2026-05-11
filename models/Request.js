const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
    userid: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    bookid: { type: mongoose.Schema.Types.ObjectId, ref: 'Book' },
    username: { type: String },
    usertype: { type: String },
    bookname: { type: String },
    issuedays: { type: Number }
});

requestSchema.virtual('id').get(function() { return this._id.toHexString(); });
requestSchema.set('toJSON', { virtuals: true });
requestSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Request', requestSchema);
