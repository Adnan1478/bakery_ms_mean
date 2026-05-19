const express = require('express');
const router = express.Router();
const {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
} = require('../controllers/productController');
const { protect, admin, staff } = require('../middleware/authMiddleware');
const { upload, resizeImage } = require('../middleware/uploadMiddleware');

router.route('/')
    .get(getProducts)
    .post(protect, staff, upload.single('image'), resizeImage, createProduct);

router.route('/:id')
    .get(getProductById)
    .put(protect, staff, upload.single('image'), resizeImage, updateProduct)
    .delete(protect, staff, deleteProduct);

module.exports = router;
