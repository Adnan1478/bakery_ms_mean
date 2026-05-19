const express = require('express');
const router = express.Router();
const { getCategories, createCategory, deleteCategory, updateCategory } = require('../controllers/categoryController');
const { protect, admin, staff } = require('../middleware/authMiddleware');
const { upload, resizeImage } = require('../middleware/uploadMiddleware');

router.route('/').get(getCategories).post(protect, staff, upload.single('image'), resizeImage, createCategory);
router.route('/:id')
    .put(protect, staff, upload.single('image'), resizeImage, updateCategory)
    .delete(protect, staff, deleteCategory);

module.exports = router;
