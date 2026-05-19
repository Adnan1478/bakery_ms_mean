const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const crypto = require("crypto");
const Razorpay = require("razorpay");

const connectDB = require('./src/config/db');

const compression = require('compression');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(compression()); // Compress all responses
app.use(express.json());
app.use('/uploads', express.static('uploads', { maxAge: '1d' })); // Cache images for 1 day

// Database Connection
connectDB();

// Routes
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/categories', require('./src/routes/categoryRoutes'));
app.use('/api/products', require('./src/routes/productRoutes'));
app.use('/api/orders', require('./src/routes/orderRoutes'));
app.use('/api/users', require('./src/routes/userRoutes'));
app.use('/api/feedback', require('./src/routes/feedbackRoutes'));
app.use('/api/dashboard', require('./src/routes/dashboardRoutes'));
app.use('/api/recipes', require('./src/routes/recipeRoutes'));
app.use('/api/reviews', require('./src/routes/reviewRoutes'));


app.get('/', (req, res) => {
    res.send('Bakery Management System API is running...');
});


const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Health check
app.get("/", (req, res) => {
    res.send("Razorpay backend is running");
});

// Create Order API
app.post("/api/payment/create-order", async (req, res) => {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_KEY_SECRET === 'YOUR_RAZORPAY_KEY_SECRET_HERE') {
        console.error("Razorpay credentials missing in .env");
        return res.status(500).json({
            success: false,
            message: "Razorpay credentials not configured on server"
        });
    }

    try {
        const { amount, currency = "INR", receipt } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: "Valid amount is required"
            });
        }

        // Razorpay amount is in paise/subunits
        const options = {
            amount: Math.round(amount * 100), // e.g. 500 => 50000 paise
            currency,
            receipt: receipt || `rcpt_${Date.now()}`
        };

        const order = await razorpay.orders.create(options);

        return res.status(200).json({
            success: true,
            order
        });
    } catch (error) {
        console.error("Create order error detal:", error);
        return res.status(500).json({
            success: false,
            message: "Order creation failed",
            error: error.message
        });
    }
});

// Verify Payment Signature API
app.post("/api/payment/verify", async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({
                success: false,
                message: "Missing payment verification fields"
            });
        }

        const body = `${razorpay_order_id}|${razorpay_payment_id}`;

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest("hex");

        const isAuthentic = expectedSignature === razorpay_signature;

        if (!isAuthentic) {
            return res.status(400).json({
                success: false,
                message: "Invalid signature. Payment verification failed"
            });
        }

        // Here you should save payment/order info in DB
        // Example:
        // await PaymentModel.create({...})

        return res.status(200).json({
            success: true,
            message: "Payment verified successfully"
        });
    } catch (error) {
        console.error("Verify payment error:", error);
        return res.status(500).json({
            success: false,
            message: "Verification failed",
            error: error.message
        });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
