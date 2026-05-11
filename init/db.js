const mongoose = require('mongoose');
const Admin = require('../models/Admin');

async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Seed Super Admin if not exists
        const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;
        const superAdminPass = process.env.SUPER_ADMIN_PASSWORD;
        const superadmin = await Admin.findOne({ email: superAdminEmail });
        if (!superadmin) {
            await Admin.create({
                email: superAdminEmail,
                pass: superAdminPass,
                role: 'superadmin'
            });
            console.log('Seeded Super Admin');
        }
    } catch (err) {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    }
}

module.exports = connectDB;
