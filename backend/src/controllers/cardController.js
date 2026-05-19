const User = require('../models/User');
const { encrypt, decrypt } = require('../utils/cryptography');

// @desc    Add new card
// @route   POST /api/cards
// @access  Private
const addCard = async (req, res) => {
    const { cardHolderName, cardNumber, expiryMM, expiryYYYY } = req.body;

    if (!cardNumber || cardNumber.length < 12) {
        res.status(400);
        throw new Error('Invalid card number');
    }

    const user = await User.findById(req.user._id);

    if (user) {
        const lastFourDigits = cardNumber.slice(-4);
        const encryptedCardNumber = encrypt(cardNumber);
        const encryptedExpiryDate = encrypt(`${expiryMM}/${expiryYYYY}`);

        // Check if card already exists (by last 4 digits for simplicity, or full comparison if needed)
        // Note: Strict comparison of encrypted strings won't work due to IV.
        // We rely on last 4 digits check + maybe other checks, but for now simple check.
        const cardExists = user.savedCards.find(c => c.lastFourDigits === lastFourDigits);

        if (cardExists) {
            res.status(400);
            throw new Error('Card ending with these digits already exists');
        }

        const newCard = {
            cardHolderName,
            cardNumber: encryptedCardNumber,
            expiryDate: encryptedExpiryDate,
            lastFourDigits
        };

        user.savedCards.push(newCard);
        await user.save();

        res.status(201).json(user.savedCards);
    } else {
        res.status(404);
        throw new Error('User not found');
    }
};

// @desc    Get all saved cards (mask number except last 4)
// @route   GET /api/cards
// @access  Private
const getCards = async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        // We only send back necessary info for display
        const cards = user.savedCards.map(card => ({
            _id: card._id,
            cardHolderName: card.cardHolderName,
            lastFourDigits: card.lastFourDigits,
            // We do NOT send back full encrypted number or expiry unless needed for edit
            // For now just display info
        }));
        res.json(cards);
    } else {
        res.status(404);
        throw new Error('User not found');
    }
};

// @desc    Delete a saved card
// @route   DELETE /api/cards/:id
// @access  Private
const deleteCard = async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        user.savedCards = user.savedCards.filter(
            (card) => card._id.toString() !== req.params.id
        );
        await user.save();
        res.json(user.savedCards);
    } else {
        res.status(404);
        throw new Error('User not found');
    }
};

module.exports = {
    addCard,
    getCards,
    deleteCard
};
