// routes/user.js
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import User from "../models/user.js";

const router = express.Router();

// 👤 Profile мэдээлэл буцаах (protected)
router.get("/me", protect, async (req, res) => {
  try {
    res.status(200).json({
      message: "Хэрэглэгчийн мэдээлэл амжилттай уншигдлаа",
      user: req.user,
    });
  } catch (error) {
    res.status(500).json({ message: "Серверийн алдаа", error });
  }
});


// 🛠 Хэрэглэгчийн мэдээлэл шинэчлэх
router.put("/me", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "Хэрэглэгч олдсонгүй" });
    }

    // Шинэчилж болох талбарууд
    const fields = [
      "firstName",
      "lastName",
      "username",
      "email",
      "profession",
      "experience",
      "contact",
      "profileImage",
    ];

    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    });

    const updatedUser = await user.save();

    res.status(200).json({
      message: "Хэрэглэгчийн мэдээлэл шинэчлэгдлээ",
      user: updatedUser,
    });
  } catch (error) {
    console.error("❌ UPDATE ERROR:", error);
    res.status(500).json({ message: "Серверийн алдаа", error });
  }
});

export default router;