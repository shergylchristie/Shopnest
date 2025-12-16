const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;

if (
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
} else if (process.env.CLOUDINARY_URL) {
  cloudinary.config();
} else {
  console.warn(
    "Cloudinary credentials not found. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET or CLOUDINARY_URL in your environment. Image uploads will likely fail until configured."
  );
}

let uploads;

// If Cloudinary is configured, use CloudinaryStorage; otherwise use local disk storage for dev testing
if (
  (process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET) ||
  process.env.CLOUDINARY_URL
) {
  const storage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: "shopnest",
      allowedFormats: ["jpg", "jpeg", "png", "webp"],
    },
  });

  // add a 5MB per-file limit to match frontend message
  uploads = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });
} else {
  // DEV FALLBACK: store files locally under public/uploads
  const path = require("path");
  const fs = require("fs");
  const UPLOAD_DIR = path.join(__dirname, "..", "public", "uploads");
  if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

  const diskStorage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, UPLOAD_DIR);
    },
    filename: function (req, file, cb) {
      const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const sanitized = file.originalname.replace(/[^a-zA-Z0-9.\-\_]/g, "_");
      cb(null, `${unique}-${sanitized}`);
    },
  });

  uploads = multer({
    storage: diskStorage,
    limits: { fileSize: 5 * 1024 * 1024 },
  });
}

module.exports = uploads;
