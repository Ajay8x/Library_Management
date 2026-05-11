const Request = require('../models/Request');
const Book = require('../models/Book');
const User = require('../models/User');
const Issue = require('../models/Issue');

exports.getRequests = async (req, res) => {
    try {
        const requests = await Request.find();
        res.json(requests);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.addRequest = async (req, res) => {
    const { userid, bookid } = req.body;
    try {
        const existingRequest = await Request.findOne({ userid, bookid });
        if (existingRequest) {
            return res.status(400).json({ success: false, message: 'You have already requested this book' });
        }

        const user = await User.findById(userid);
        const book = await Book.findById(bookid);
        
        if (!user || !book) return res.status(404).json({ success: false, message: 'User or Book not found' });

        const existingIssue = await Issue.findOne({ userid, $or: [{ bookid }, { issuebook: book.bookname }] });
        if (existingIssue) {
            return res.status(400).json({ success: false, message: 'You already have this book issued' });
        }

        const days = user.type === 'student' ? 7 : 21;

        await Request.create({
            userid, bookid, username: user.name, usertype: user.type, bookname: book.bookname, issuedays: days
        });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.approveRequest = async (req, res) => {
    const { requestId } = req.body;
    try {
        const request = await Request.findById(requestId);
        if (!request) return res.status(404).json({ success: false, message: 'Request not found' });

        const book = await Book.findById(request.bookid);
        if (book.bookava <= 0) return res.status(400).json({ success: false, message: 'Book not available' });

        const issuedate = new Date().toLocaleDateString('en-GB');
        const returnDate = new Date();
        returnDate.setDate(returnDate.getDate() + request.issuedays);
        const issuereturn = returnDate.toLocaleDateString('en-GB');

        await Issue.create({
            userid: request.userid,
            bookid: request.bookid,
            issuename: request.username,
            issuebook: request.bookname,
            issuetype: request.usertype,
            issuedays: request.issuedays,
            issuedate,
            issuereturn,
            fine: 0
        });

        book.bookava -= 1;
        book.bookrent += 1;
        await book.save();

        await Request.findByIdAndDelete(requestId);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getIssues = async (req, res) => {
    try {
        const issues = await Issue.find({ userid: req.params.userid });
        res.json(issues);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
