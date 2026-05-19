const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true,
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
    },
    comment: {
        type: String,
        required: true,
    },
    image: {
        type: String, // optional photo proof
    }
}, { timestamps: true });

// One review per user per product per order
reviewSchema.index({ user: 1, product: 1, orderId: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
