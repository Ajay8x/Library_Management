const Book = require('../models/Book');

exports.getBooks = async (req, res) => {
    try {
        const books = await Book.find();
        res.json(books);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getBookById = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) return res.status(404).json({ error: 'Book not found' });
        res.json(book);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.addBook = async (req, res) => {
    try {
        const { serial, bookname, bookdetail, bookaudor, bookpub, branch, bookprice, bookquantity } = req.body;
        let { bookpic } = req.body;

        if (req.file && req.file.path) {
            bookpic = req.file.path;
        }

        const quantity = parseInt(bookquantity) || 0;
        const price = parseFloat(bookprice) || 0;

        const book = await Book.create({
            serial: serial || '',
            bookname: bookname || 'Untitled',
            bookdetail: bookdetail || '',
            bookaudor: bookaudor || '',
            bookpub: bookpub || '',
            branch: branch || '',
            bookprice: price,
            bookquantity: quantity,
            bookava: quantity,
            bookpic: bookpic || ''
        });
        res.json({ success: true, id: book.id });
    } catch (error) {
        console.error('Add Book Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.deleteBook = async (req, res) => {
    try {
        await Book.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.updateBook = async (req, res) => {
    try {
        const { serial, bookname, bookdetail, bookaudor, bookpub, branch, bookprice, bookquantity } = req.body;
        let { bookpic } = req.body;

        if (req.file && req.file.path) {
            bookpic = req.file.path;
        }

        const book = await Book.findById(req.params.id);
        if (!book) return res.status(404).json({ success: false, error: 'Book not found' });

        // Calculate new availability based on quantity change
        const oldQuantity = book.bookquantity || 0;
        let newQuantity = oldQuantity;
        if (bookquantity !== undefined && bookquantity !== '') {
            newQuantity = parseInt(bookquantity);
            if (isNaN(newQuantity)) newQuantity = oldQuantity;
        }
        
        const quantityDiff = newQuantity - oldQuantity;
        const newAva = (book.bookava || 0) + quantityDiff;

        const updatedData = {
            serial: serial || book.serial,
            bookname: bookname || book.bookname,
            bookdetail: bookdetail || book.bookdetail,
            bookaudor: bookaudor || book.bookaudor,
            bookpub: bookpub || book.bookpub,
            branch: branch || book.branch,
            bookprice: (bookprice !== undefined && bookprice !== '') ? parseFloat(bookprice) : book.bookprice,
            bookquantity: newQuantity,
            bookava: newAva,
            bookpic: (bookpic && bookpic !== '') ? bookpic : book.bookpic
        };

        await Book.findByIdAndUpdate(req.params.id, updatedData);
        res.json({ success: true });
    } catch (error) {
        console.error('Update Book Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};
