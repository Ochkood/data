import express from "express";
import Banner from "../models/Banner.js";
import { protect, verifyAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// 🟢 Бүх баннер
router.get("/", async (req, res) => {
  try {
    const banners = await Banner.find().sort({ createdAt: -1 });
    res.json(banners);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// 🟢 Шинэ баннер үүсгэх (зөвхөн admin)
router.post("/", protect, verifyAdmin, async (req, res) => {
  try {
    const { image, link, position } = req.body;
    const banner = await Banner.create({ image, link, position });
    res.status(201).json(banner);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;