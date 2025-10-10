import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.js";

const router = express.Router(); // 🟢 Энэ мөр хамгийн чухал!!!

// 📝 Register
router.post("/register", async (req, res) => {
  try {
    const { firstName, lastName, username, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email бүртгэлтэй байна" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      firstName,
      lastName,
      username,
      email,
      password: hashedPassword,
    });

    await user.save();
    res.status(201).json({ message: "Бүртгэл амжилттай", user });
  } catch (error) {
    res.status(500).json({ message: "Серверийн алдаа", error });
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


// 🔑 Login
// router.post("/login", async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     const user = await User.findOne({ email });
//     if (!user) return res.status(404).json({ message: "Ийм хэрэглэгч алга" });

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) return res.status(400).json({ message: "Нууц үг буруу" });

//     const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

//     res.status(200).json({
//       message: "Нэвтрэлт амжилттай",
//       token,
//       user: { id: user._id, username: user.username, email: user.email },
//     });
//   } catch (error) {
//     res.status(500).json({ message: "Серверийн алдаа", error });
//   }
// });

export default router; // 🟢 Энэ мөрийг хамгийн доор байлгаарай!