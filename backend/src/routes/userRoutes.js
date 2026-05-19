const express = require('express');
const router = express.Router();
const { getUsers, deleteUser, updateUser, updateUserProfile } = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');
const { upload, resizeImage } = require('../middleware/uploadMiddleware');

router.route('/profile')
    .put(protect, upload.single('image'), resizeImage, updateUserProfile);

router.route('/')
    .get(protect, admin, getUsers);

router.route('/:id')
    .delete(protect, admin, deleteUser)
    .put(protect, admin, updateUser);

module.exports = router;
