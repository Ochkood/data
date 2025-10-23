import express from "express";
import Category from "../models/Category.js";
import { protect, verifyAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// 🟢 Бүх ангилал
router.get("/", async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// 🟠 Шинэ ангилал үүсгэх
router.post("/", protect, verifyAdmin, async (req, res) => {
  try {
    const { name, slug, description, color } = req.body;

    // 🎨 Хэрвээ өнгө ирээгүй бол random soft өнгө үүсгэнэ
    const randomColors = [
      "#009688", // teal
      "#1E88E5", // blue
      "#43A047", // green
      "#E53935", // red
      "#8E24AA", // purple
      "#FB8C00", // orange
      "#6D4C41", // brown
    ];
    const assignedColor = color || randomColors[Math.floor(Math.random() * randomColors.length)];

    const category = await Category.create({
      name,
      slug,
      description,
      color: assignedColor, // ✅ нэмэгдсэн талбар
    });

    res.status(201).json(category);
  } catch (err) {
    console.error("❌ CATEGORY CREATE ERROR:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

export default router;