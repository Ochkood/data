import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    // 📌 1. Үндсэн мэдээлэл
    fullName: { type: String, required: true, trim: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    // 📌 2. Танилцуулга ба мэргэжлийн мэдээлэл
    bio: {
      type: String,
      default: "",
    }, // 🧠 товч танилцуулга
    profession: {
      type: String,
      default: "",
    }, // 💼 мэргэжил
    experience: {
      type: String,
      default: "",
    }, // 📘 туршлага

    // 📌 3. Холбоо барих мэдээлэл
    contact: {
      phone: { type: String, default: "" },
      website: { type: String, default: "" },
      address: { type: String, default: "" },
      facebook: { type: String, default: "" },
      twitter: { type: String, default: "" },
      linkedin: { type: String, default: "" },
    },

    // 📌 4. Зураг, медиа
    profileImage: {
      type: String,
      default:
        "https://res.cloudinary.com/demo/image/upload/v1700000000/default-avatar.png",
    },

    // 📌 5. Эрхийн түвшин, үүрэг
    role: { type: String, enum: ["user", "admin"], default: "user" },

    // 📌 6. Нийгмийн холбоос (follow систем)
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    // 📌 7. Bookmark
    bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
  },
  { timestamps: true }
);

// ✅ JSON болгож буцаах үед virtual орно
userSchema.set("toJSON", { virtuals: true });
userSchema.set("toObject", { virtuals: true });

export default mongoose.model("User", userSchema);