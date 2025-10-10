import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    // 📌 1. Үндсэн мэдээлэл
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    // 📌 2. Нэмэлт мэдээлэл
    profession: { type: String, default: "" },  // Мэргэжил
    experience: { type: String, default: "" },  // Туршлага
    contact: {
      phone: { type: String, default: "" },
      website: { type: String, default: "" },
      address: { type: String, default: "" },
    },

    // 📌 3. Зураг, медиа
    profileImage: {
      type: String,
      default: "https://res.cloudinary.com/default-avatar.png",
    },

    // 📌 4. Эрхийн түвшин, үүрэг
    role: { type: String, enum: ["user", "admin"], default: "user" },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);