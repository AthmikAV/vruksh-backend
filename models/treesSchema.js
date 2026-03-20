const mongoose = require('mongoose');

const treesSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique:true
    },
    description: {
        type: String,
        required: true,
        trim:true
    },
    image: {
        type: String,
        required: true
    },
    oxygenProduced: {
        type: Number,
        required:true  
    },
    price: {
        type: Number,
        required: true
    },
    isAvailable: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

const Tree = mongoose.model('Tree', treesSchema);

module.exports = {Tree};