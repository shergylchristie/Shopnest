import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "shopnest",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
  },
});

const uploads = multer({
  storage,
  limits: { fileSize: 1024 * 1024 * 5 }, // 5MB
});

export default uploads;
