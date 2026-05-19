const Order = require('../models/Order');
const { encrypt } = require('../utils/cryptography');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const addOrderItems = async (req, res) => {
    const {
        orderItems,
        shippingAddress,
        paymentMethod,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        cardDetails // Extract card details from request
    } = req.body;

    if (orderItems && orderItems.length === 0) {
        res.status(400);
        throw new Error('No order items');
    } else {
        let encryptedCardDetails = {};

        // If payment method is Card, encrypt the details or use saved card
        if (paymentMethod === 'Credit/Debit Card' && cardDetails) {
            if (cardDetails.savedCardId) {
                // Use saved card
                const user = await require('../models/User').findById(req.user._id);
                const savedCard = user.savedCards.id(cardDetails.savedCardId);

                if (savedCard) {
                    encryptedCardDetails = {
                        cardHolderName: savedCard.cardHolderName,
                        cardNumber: savedCard.cardNumber,
                        expiryDate: savedCard.expiryDate,
                        cvv: encrypt('123') // Default/Dummy CVV since we don't store CVV usually or we encrypt it? 
                        // Wait, previous User schema didn't store CVV in savedCards?
                        // Let's check User.js. Yes it didn't. Best practice is NOT to store CVV.
                        // But for this simulation, user might need to enter CVV again?
                        // The user request said "one time add then use only to select".
                        // So let's assume valid CVV for now or just put 'XXX'.
                    };
                } else {
                    res.status(400);
                    throw new Error('Saved card not found');
                }
            } else {
                // New card
                encryptedCardDetails = {
                    cardHolderName: cardDetails.cardHolderName,
                    cardNumber: encrypt(cardDetails.cardNumber),
                    expiryDate: encrypt(`${cardDetails.expiryMM}/${cardDetails.expiryYYYY}`),
                    cvv: encrypt(cardDetails.cvv)
                };
            }
        }

        // Deduct stock for each item
        const Product = require('../models/Product');
        for (let i = 0; i < orderItems.length; i++) {
            const item = orderItems[i];
            const dbProduct = await Product.findById(item.product);
            if (dbProduct) {
                if (dbProduct.stock < item.quantity) {
                    return res.status(400).json({ message: `Insufficient stock for ${dbProduct.name}. Only ${dbProduct.stock} left.` });
                }
                dbProduct.stock -= item.quantity;
                await dbProduct.save();
            }
        }



        const order = new Order({
            user: req.user._id,
            items: orderItems,
            shippingAddress,
            paymentMethod,
            cardDetails: encryptedCardDetails,
            totalAmount: totalPrice
        });

        const createdOrder = await order.save();

        // Award Crumb Coins: 1 coin per ₹1 spent
        const User = require('../models/User');
        const coinsEarned = Math.floor(totalPrice);
        await User.findByIdAndUpdate(req.user._id, { $inc: { crumbCoins: coinsEarned } });

        // If user chose to redeem coins, deduct them
        if (req.body.redeemCoins) {
            const user = await User.findById(req.user._id);
            const coinsToRedeem = Math.min(user.crumbCoins, 500); // max 500 coins
            await User.findByIdAndUpdate(req.user._id, { $inc: { crumbCoins: -coinsToRedeem } });
        }

        res.status(201).json({ ...createdOrder.toObject(), coinsEarned });
    }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
    const order = await Order.findById(req.params.id)
        .populate('user', 'name email');

    if (order) {
        res.json(order);
    } else {
        res.status(404);
        throw new Error('Order not found');
    }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Staff/Admin
const updateOrderStatus = async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (order) {
        order.status = req.body.status || order.status;
        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } else {
        res.status(404);
        throw new Error('Order not found');
    }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = async (req, res) => {
    const orders = await Order.find({ user: req.user._id });
    res.json(orders);
};

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
const cancelOrder = async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (order) {
        // Ensure the order belongs to the user
        if (order.user.toString() !== req.user._id.toString()) {
            res.status(401);
            throw new Error('Not authorized to cancel this order');
        }

        // Only allow cancellation if order is pending or processing
        if (order.status === 'completed' || order.status === 'cancelled' || order.status === 'ready') {
            res.status(400);
            throw new Error(`Cannot cancel order with status: ${order.status}`);
        }

        // Restore stock for each item
        const Product = require('../models/Product');
        for (const item of order.items) {
            const dbProduct = await Product.findById(item.product);
            if (dbProduct) {
                dbProduct.stock += item.quantity;
                await dbProduct.save();
            }
        }

        order.status = 'cancelled';
        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } else {
        res.status(404);
        throw new Error('Order not found');
    }
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Staff/Admin
const getOrders = async (req, res) => {
    const orders = await Order.find({})
        .populate('user', 'id name email')
        .sort({ createdAt: -1 }); // Newest first
    res.json(orders);
};

module.exports = {
    addOrderItems,
    getOrderById,
    updateOrderStatus,
    getMyOrders,
    getOrders,
    cancelOrder,
};
