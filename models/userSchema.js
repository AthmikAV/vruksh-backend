
const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        select:false
    },
    phone: {
        type: String,
        required: true
    },
    profilePhoto: {
        type: String,
        default: null
    },
    role: {
        type: String,
        enum: ['user', 'admin'],  
        default: 'user'          
    }
}, { timestamps: true })

const User = mongoose.model('User', userSchema);

module.exports = User;