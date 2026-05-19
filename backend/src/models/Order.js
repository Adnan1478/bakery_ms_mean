const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    items: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                required: true,
            },
            name: String, // Store name in case product is deleted
            weight: String, // Store weight snapshot
            quantity: {
                type: Number,
                required: true,
            },
            price: {
                type: Number,
                required: true,
            },
        }
    ],
    totalAmount: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'ready', 'completed', 'cancelled'],
        default: 'pending',
    },
    paymentMethod: {
        type: String,
        required: true,
    },
    cardDetails: {
        cardHolderName: String,
        cardNumber: String, // Encrypted
        expiryDate: String, // Encrypted
        cvv: String,        // Encrypted
    },
    shippingAddress: {
        street: String,
        city: String,
        zip: String,
    },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
