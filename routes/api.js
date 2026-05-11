const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const bookController = require('../controllers/bookController');
const userController = require('../controllers/userController');
const requestController = require('../controllers/requestController');

// Multer for book photo uploads
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'library_books',
        allowed_formats: ['jpg', 'png', 'jpeg']
    }
});

const upload = multer({ storage: storage });

// Middleware
const isAdmin = (req, res, next) => {
    if (!req.session.user) {
        return res.status(401).json({ success: false, message: 'Session expired. Please login again.' });
    }
    if (req.session.user.role === 'admin' || req.session.user.role === 'superadmin') {
        return next();
    }
    res.status(403).json({ success: false, message: 'Access denied. Admin role required. Current role: ' + req.session.user.role });
};

const isSuperAdmin = (req, res, next) => {
    if (req.session.user && req.session.user.role === 'superadmin') {
        return next();
    }
    res.status(403).json({ success: false, message: 'Access denied. Super Admin role required.' });
};

const isAuthenticated = (req, res, next) => {
    if (req.session.user) return next();
    res.status(401).json({ success: false, message: 'Please login first' });
};

// Auth
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/me', authController.me);

// Books
router.get('/books', bookController.getBooks);
router.get('/books/:id', bookController.getBookById);
router.post('/books', isAdmin, upload.single('bookphoto'), bookController.addBook);
router.post('/books/update/:id', isAdmin, upload.single('bookphoto'), bookController.updateBook);
router.delete('/books/:id', isAdmin, bookController.deleteBook);

// Users & Admins
router.get('/users', isAdmin, userController.getUsers);
router.post('/users', isAdmin, userController.addUser);
router.delete('/users/:id', isAdmin, userController.deleteUser);
router.get('/admins', isSuperAdmin, userController.getAdmins);
router.post('/admins', isSuperAdmin, userController.addAdmin);
router.delete('/admins/:id', isSuperAdmin, userController.deleteAdmin);

// Requests & Issues
router.get('/requests', isAdmin, requestController.getRequests);
router.post('/requests', isAuthenticated, requestController.addRequest);
router.post('/approve-request', isAdmin, requestController.approveRequest);
router.get('/issues/:userid', isAuthenticated, requestController.getIssues);

module.exports = router;
