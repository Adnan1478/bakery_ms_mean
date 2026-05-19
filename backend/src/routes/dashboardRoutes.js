const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/dashboardController');
const { protect, admin, staff } = require('../middleware/authMiddleware');

router.get('/', protect, staff, getDashboardStats);

module.exports = router;
