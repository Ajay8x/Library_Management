const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    serial: { type: String },
    bookpic: { type: String },
    bookname: { type: String, required: true },
    bookdetail: { type: String },
    bookaudor: { type: String },
    bookpub: { type: String },
    branch: { type: String },
    bookprice: { type: Number },
    bookquantity: { type: Number, default: 0 },
    bookava: { type: Number, default: 0 },
    bookrent: { type: Number, default: 0 }
});

bookSchema.virtual('id').get(function() { return this._id.toHexString(); });
bookSchema.set('toJSON', { virtuals: true });
bookSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Book', bookSchema);
