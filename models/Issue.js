const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
    userid: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    bookid: { type: mongoose.Schema.Types.ObjectId, ref: 'Book' },
    issuename: { type: String },
    issuebook: { type: String },
    issuetype: { type: String },
    issuedays: { type: Number },
    issuedate: { type: String },
    issuereturn: { type: String },
    fine: { type: Number, default: 0 },
    status: { type: String, enum: ['issued', 'return-pending'], default: 'issued' }
});

issueSchema.virtual('id').get(function() { return this._id.toHexString(); });
issueSchema.set('toJSON', { virtuals: true });
issueSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Issue', issueSchema);
