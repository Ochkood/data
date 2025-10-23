
// server.js
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/user.js";
import postRoutes from "./routes/posts.js";
import commentRoutes from "./routes/comments.js";
import categoryRoutes from "./routes/categories.js";
import bannerRoutes from "./routes/banners.js";
import adminRoutes from "./routes/admin.js";
import publicRoutes from "./routes/public.js";
dotenv.config(); // .env файл унших

const app = express();
app.use(express.json());
app.use(cors());


// ================== MongoDB холболт ==================
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB холбогдлоо"))
  .catch((err) => console.error("❌ MongoDB холболт алдаа:", err));

// ================== Жишээ API ==================
app.get("/", (req, res) => {
  res.send("Backend API ажиллаж байна 🚀");
});

// Жишээ хэрэглэгчийн маршрут (дараа нь өргөтгөж болно)
app.get("/api/users", (req, res) => {
  res.json();
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/categories", categoryRoutes);

app.use("/api/banners", bannerRoutes);

app.use("/api/public", publicRoutes);

// ================== Сервер ажиллуулах ==================
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`✅ Server running on port http://localhost:${PORT}`));