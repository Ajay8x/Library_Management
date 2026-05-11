const User = require('../models/User');
const Admin = require('../models/Admin');

exports.getUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.addUser = async (req, res) => {
    const { name, email, pass, type } = req.body;
    try {
        const user = await User.create({ name, email, pass, type });
        res.json({ success: true, id: user.id });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getAdmins = async (req, res) => {
    try {
        const admins = await Admin.find({ role: 'admin' });
        res.json(admins);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.addAdmin = async (req, res) => {
    const { email, pass } = req.body;
    try {
        const admin = await Admin.create({ email, pass, role: 'admin' });
        res.json({ success: true, id: admin.id });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.deleteAdmin = async (req, res) => {
    try {
        await Admin.findOneAndDelete({ _id: req.params.id, role: 'admin' });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
