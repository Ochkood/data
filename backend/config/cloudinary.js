// backend/config/cloudinary.js
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 🔎 Түр лог (шаардлагатай бол):
console.log(
  "🔍 Cloudinary ENV:",
  process.env.CLOUDINARY_CLOUD_NAME || "(missing)",
  process.env.CLOUDINARY_API_KEY ? "API_KEY:OK" : "API_KEY:MISSING"
);

export default cloudinary;