const Feedback = require('../models/Feedback');

// @desc    Create feedback
// @route   POST /api/feedback
// @access  Private
const createFeedback = async (req, res) => {
    try {
        const { message, rating } = req.body;

        const feedback = new Feedback({
            user: req.user._id,
            message,
            rating,
        });

        const createdFeedback = await feedback.save();
        res.status(201).json(createdFeedback);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get all feedback
// @route   GET /api/feedback
// @access  Public (or Private/Admin)
const getFeedback = async (req, res) => {
    try {
        const feedbacks = await Feedback.find({}).populate('user', 'name');
        res.json(feedbacks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createFeedback, getFeedback };
