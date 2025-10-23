import express from "express";
import Banner from "../models/Banner.js";

const router = express.Router();

// 📰 Public banner API — зөвхөн active banner-ууд
router.get("/banners", async (req, res) => {
  try {
    const banners = await Banner.find({ isActive: true })
      .sort({ order: 1 })
      .select("title subtitle link image position isActive")
      .lean();

    res.json({ banners });
  } catch (err) {
    console.error("❌ Public banner fetch error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;