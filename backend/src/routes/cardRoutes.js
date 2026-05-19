const express = require('express');
const router = express.Router();
const { addCard, getCards, deleteCard } = require('../controllers/cardController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, addCard)
    .get(protect, getCards);

router.route('/:id')
    .delete(protect, deleteCard);

module.exports = router;
