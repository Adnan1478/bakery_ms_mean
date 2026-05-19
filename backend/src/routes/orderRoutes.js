const express = require('express');
const router = express.Router();
const {
    addOrderItems,
    getOrderById,
    updateOrderStatus,
    getMyOrders,
    getOrders,
    cancelOrder,
} = require('../controllers/orderController');
const { protect, admin, staff } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, addOrderItems)
    .get(protect, staff, getOrders); // Staff can view all orders

router.route('/myorders').get(protect, getMyOrders);

router.route('/:id').get(protect, getOrderById);

router.route('/:id/cancel').put(protect, cancelOrder); // User can cancel their own order

router.route('/:id/status').put(protect, staff, updateOrderStatus); // Staff/Admin can update status

module.exports = router;
