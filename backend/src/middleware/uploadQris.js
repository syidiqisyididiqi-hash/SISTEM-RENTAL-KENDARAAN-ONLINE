const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDirectory = path.join(
    process.cwd(),
    "uploads",
    "qris"
);

if (!fs.existsSync(uploadDirectory)) {
    fs.mkdirSync(uploadDirectory, {
        recursive: true,
    });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDirectory);
    },

    filename: (req, file, cb) => {
        const extension = path.extname(file.originalname);

        cb(
            null,
            `qris-${Date.now()}${extension}`
        );
    },
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
    ];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(
            new Error(
                "Format gambar harus JPG, PNG, atau WEBP."
            )
        );
    }
};

const uploadQris = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
});

module.exports = uploadQris;