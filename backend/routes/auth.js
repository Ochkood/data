import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.js";

const router = express.Router(); // 🟢 Энэ мөр хамгийн чухал!!!

// 📝 Register
router.post("/register", async (req, res) => {
  try {
    const { fullName, email, username, password } = req.body;

    // 🔍 Имэйл давхцаж байгаа эсэхийг шалгах
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Имэйл бүртгэлтэй байна" });
    }

    // 🔒 Нууц үг хаш хийх
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 🆕 Шинэ хэрэглэгч үүсгэх
    const newUser = new User({
      fullName: fullName,
      email,
      username,
      password: hashedPassword,
    });

    await newUser.save();

    res.status(201).json({
      message: "Шинэ хэрэглэгч амжилттай бүртгэгдлээ",
      user: {
        id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.error("❌ REGISTER ERROR:", error);
    res.status(500).json({ message: "Серверийн алдаа", error: error.message });
  }
});


// 🔑 Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("LOGIN REQUEST:", email, password); // 👈 нэм

    const user = await User.findOne({ email });
    if (!user) {
      console.log("USER NOT FOUND");
      return res.status(404).json({ message: "Ийм хэрэглэгч алга" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    console.log("PASSWORD CHECK:", isMatch); // 👈 нэм

    if (!isMatch) return res.status(400).json({ message: "Нууц үг буруу" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(200).json({
      message: "Нэвтрэлт амжилттай",
      token,
      user: { id: user._id, username: user.username, email: user.email },
    });
  } catch (error) {
    console.error("❌ LOGIN ERROR:", error); // 👈 нэм
    res.status(500).json({ message: "Серверийн алдаа", error });
  }
});

// 🧩 Тест route — API ажиллаж байгаа эсэхийг шалгах
router.get("/test", (req, res) => {
  res.json({
    message: "Auth API ажиллаж байна 🚀",
    time: new Date().toISOString(),
  });
});

export default router; // 🟢 Энэ мөрийг хамгийн доор байлгаарай!