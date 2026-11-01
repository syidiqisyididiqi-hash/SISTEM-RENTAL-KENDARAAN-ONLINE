const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDirectory = path.join(
    __dirname,
    "../../uploads/locations"
);

fs.mkdirSync(uploadDirectory, { recursive: true });

const storage = multer.diskStorage({
    destination: uploadDirectory,

    filename: (req, file, callback) => {
        const extension = path.extname(file.originalname).toLowerCase();

        const filename = `location-${Date.now()}-${Math.round(
            Math.random() * 1e9
        )}${extension}`;

        callback(null, filename);
    }
});

const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/webp'
];

const fileFilter = (req, file, callback) => {
    if (allowedTypes.includes(file.mimetype)) {
        callback(null, true);
        return;
    }

    callback(new Error('Format gambar harus JPG, PNG, atau WEBP'));
};

module.exports = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024
    }
});