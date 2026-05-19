const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');

// @desc    Get dashboard statistics
// @route   GET /api/dashboard
// @access  Private/Admin/Staff
const getDashboardStats = async (req, res) => {
    try {
        // 1. Total Sales (Sum of totalPrice for all paid/completed orders)
        // Adjust status check based on what constitutes a "sale" in your logic
        const salesData = await Order.aggregate([
            {
                $match: {
                    // status: { $ne: 'cancelled' } // Exclude cancelled orders
                    // You might strictly want 'completed' or just everything that isn't cancelled
                }
            },
            {
                $group: {
                    _id: null,
                    totalSales: { $sum: "$totalAmount" }
                }
            }
        ]);

        const totalSales = salesData.length > 0 ? salesData[0].totalSales : 0;

        // 2. Total Orders
        const totalOrders = await Order.countDocuments();

        // 3. Total Products
        const totalProducts = await Product.countDocuments();

        // 4. Total Users (Count all users regardless of role)
        const totalUsers = await User.countDocuments({});

        // 5. Recent Orders (e.g., last 5)
        const recentOrders = await Order.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('user', 'name');

        // 6. Daily Sales (Last 7 days)
        const dailySales = await Order.aggregate([
            {
                $match: {
                    // status: { $ne: 'cancelled' } 
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    total: { $sum: "$totalAmount" }
                }
            },
            { $sort: { _id: -1 } },
            { $limit: 7 }
        ]);

        // 7. Top 5 best-selling products
        const topProducts = await Order.aggregate([
            { $unwind: '$items' },
            {
                $group: {
                    _id: '$items.product',
                    name: { $first: '$items.name' },
                    totalSold: { $sum: '$items.quantity' }
                }
            },
            { $sort: { totalSold: -1 } },
            { $limit: 5 }
        ]);

        res.json({
            totalSales,
            totalOrders,
            totalProducts,
            totalUsers,
            recentOrders,
            dailySales,
            topProducts
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error fetching dashboard stats' });
    }
};

module.exports = {
    getDashboardStats,
};
