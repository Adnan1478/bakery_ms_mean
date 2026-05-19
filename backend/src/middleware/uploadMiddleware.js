const multer = require('multer');
const path = require('path');
const sharp = require('sharp');
const fs = require('fs');

// Use memory storage to process image before saving
const storage = multer.memoryStorage();

const checkFileType = (file, cb) => {
    const filetypes = /jpg|jpeg|png|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb('Images only!');
    }
};

const upload = multer({
    storage,
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    },
});

// Middleware to resize and format image
const resizeImage = async (req, res, next) => {
    if (!req.file) return next();

    const filename = `${req.file.fieldname}-${Date.now()}.webp`;
    const filepath = path.join('uploads', filename);

    try {
        await sharp(req.file.buffer)
            .resize(800, 800, { // Resize to max 800x800, maintaining aspect ratio
                fit: 'inside',
                withoutEnlargement: true
            })
            .toFormat('webp')
            .webp({ quality: 80 })
            .toFile(filepath);

        // Update req.file to match what diskStorage would have provided
        req.file.path = filepath.replace(/\\/g, '/');
        req.file.filename = filename;
        req.file.destination = 'uploads/';

        next();
    } catch (error) {
        console.error('Image processing error:', error);
        next(error);
    }
};

module.exports = { upload, resizeImage };
