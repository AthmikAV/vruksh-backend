// scripts/createAdmin.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/userSchema');
require('dotenv').config();

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        // check if admin already exists
        const existingAdmin = await User.findOne({ email: "athmikadpangaya@gmail.com" });
        if (existingAdmin) {
            console.log("Admin already exists ❌");
            process.exit();
        }

        const hashedPassword = await bcrypt.hash('Athmik@123', 12);

        const admin = new User({
            name: "Athmik A V",
            email: "athmikadpangaya@gmail.com",
            password: hashedPassword,  // ✅ hashed
            phone: "8431203865",
            role: "admin"
        });

        await admin.save();
        console.log("✅ Admin created successfully");

    } catch (error) {
        console.error("❌ Error:", error.message);
    } finally {
        process.exit();
    }
};
