const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;

cloudinary.config();

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "shopnest",
    allowedFormats: ["jpg", "jpeg", "png", "webp"],
  },
});

const uploads = multer({ storage });

module.exports = uploads;
