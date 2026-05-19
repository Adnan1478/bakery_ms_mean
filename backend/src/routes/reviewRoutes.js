const express = require('express');
const router = express.Router();
const { addReview, getProductReviews, canReview } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

const checkFileType = (file, cb) => {
    const filetypes = /jpg|jpeg|png|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('Images only!'));
    }
};

const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
        cb(null, `review_${Date.now()}${path.extname(file.originalname)}`);
    }
});
const upload = multer({ 
    storage, 
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
});

router.post('/', protect, upload.single('image'), addReview);
router.get('/can-review/:productId', protect, canReview);
router.get('/:productId', getProductReviews);

module.exports = router;
