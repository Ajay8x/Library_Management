const Admin = require('../models/Admin');
const User = require('../models/User');

exports.login = async (req, res) => {
    const { email, password, role } = req.body;
    try {
        let user;
        if (role === 'admin' || role === 'superadmin') {
            user = await Admin.findOne({ email, pass: password, role });
            if (user) {
                req.session.user = { id: user.id, role: user.role, email: user.email };
                return res.json({ success: true, user: req.session.user });
            }
        } else {
            user = await User.findOne({ email, pass: password });
            if (user) {
                req.session.user = { id: user.id, role: user.type, name: user.name, email: user.email };
                return res.json({ success: true, user: req.session.user });
            }
        }
        res.status(401).json({ success: false, message: 'Invalid credentials' });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.logout = (req, res) => {
    req.session.destroy(err => {
        if (err) return res.status(500).json({ success: false, message: 'Could not log out' });
        res.clearCookie('connect.sid');
        res.json({ success: true });
    });
};

exports.me = (req, res) => {
    if (req.session && req.session.user) {
        res.json({ success: true, user: req.session.user });
    } else {
        res.status(401).json({ success: false });
    }
};
