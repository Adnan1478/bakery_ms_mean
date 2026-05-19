const Review = require('../models/Review');
const Order = require('../models/Order');

// @desc    Add a product review
// @route   POST /api/reviews
// @access  Private (must have purchased the product)
const addReview = async (req, res) => {
    try {
        const { productId, orderId, rating, comment } = req.body;

        // Verify the user actually bought this product in this order
        const order = await Order.findOne({
            _id: orderId,
            user: req.user._id,
            'items.product': productId,
            status: 'completed'
        });

        if (!order) {
            return res.status(403).json({ message: 'You can only review products from completed orders.' });
        }

        // Check for duplicate review
        const alreadyReviewed = await Review.findOne({
            user: req.user._id,
            product: productId,
            orderId
        });

        if (alreadyReviewed) {
            return res.status(400).json({ message: 'You have already reviewed this product.' });
        }

        const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

        const review = await Review.create({
            user: req.user._id,
            product: productId,
            orderId,
            rating,
            comment,
            image: imagePath
        });

        await review.populate('user', 'name image');
        res.status(201).json(review);
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ message: 'You have already reviewed this product.' });
        }
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get reviews for a product
// @route   GET /api/reviews/:productId
// @access  Public
const getProductReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ product: req.params.productId })
            .populate('user', 'name image')
            .sort({ createdAt: -1 });

        const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
        const avgRating = reviews.length > 0 ? (totalRating / reviews.length).toFixed(1) : 0;

        res.json({ reviews, avgRating, totalReviews: reviews.length });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Check if user can review a product (bought & completed order)
// @route   GET /api/reviews/can-review/:productId
// @access  Private
const canReview = async (req, res) => {
    try {
        const order = await Order.findOne({
            user: req.user._id,
            'items.product': req.params.productId,
            status: 'completed'
        });

        if (!order) return res.json({ canReview: false, orderId: null });

        const alreadyReviewed = await Review.findOne({
            user: req.user._id,
            product: req.params.productId,
            orderId: order._id
        });

        res.json({
            canReview: !alreadyReviewed,
            orderId: order._id,
            alreadyReviewed: !!alreadyReviewed
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { addReview, getProductReviews, canReview };
