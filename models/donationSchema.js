
const mongoose = require('mongoose');

const donationItemSchema = new mongoose.Schema({
    tree: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tree',                           
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: [1, "Minimum 1 tree"]
    },
    priceAtDonation: {
        type: Number,
        required: true                         
    }
});

// main donation schema
const donationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',                            
        required: true
    },
    items: [donationItemSchema],                // array of trees selected
    totalAmount: {
        type: Number,
        required: true                          // sum of all items
    },
    totalTrees: {
        type: Number,
        required: true                          // sum of all quantities
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'success', 'failed'],
        default: 'pending'                      // always starts as pending
    },
    orderId: {
        type: String,
        default: null                           // generated when order created
    },
    certificateUrl: {
        type: String,
        default: null                           // filled after payment success
    }
}, { timestamps: true });                       // adds createdAt, updatedAt

module.exports = mongoose.model('Donation', donationSchema);