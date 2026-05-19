const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['admin', 'staff', 'customer'],
        default: 'customer',
    },
    phone: {
        type: String,
        required: true,
    },
    image: {
        type: String,
    },
    address: {
        street: String, // Kept for backward compatibility if needed, but we prefer detailed fields
        city: String,
        zip: String,
        house: String,
        area: String,
        landmark: String,
        state: String,
        country: String
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    savedCards: [{
        cardHolderName: String,
        cardNumber: String, // Encrypted
        expiryDate: String, // Encrypted
        lastFourDigits: String, // Visible for UI
    }],
    crumbCoins: {
        type: Number,
        default: 0,
    }
}, { timestamps: true });

// Password hashing middleware
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

module.exports = mongoose.model('User', userSchema);
