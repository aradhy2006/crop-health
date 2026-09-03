const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },

    filename: (req, file, cb) => {
        const extension = path.extname(file.originalname);

        const fileName =
            `${Date.now()}-${Math.round(Math.random() * 1E9)}${extension}`;

        cb(null, fileName);
    }
});

const fileFilter = (req, file, cb) => {
    console.log("Incoming file MIME type:", file.mimetype); // Debug line

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Only JPG, JPEG and PNG images are allowed"), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024
    }
});

module.exports = upload;
