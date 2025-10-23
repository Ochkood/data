import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    // 👤 Нийтлэгч
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    // 📰 Үндсэн мэдээлэл
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    image: { type: String },

    // 🏷️ Холбогдох ангилал, шошго
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    tags: [{ type: String }],

    // 💬 Social interactions
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    views: { type: Number, default: 0 },
    viewedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    // 🌟 Extra
    isEditorPick: { type: Boolean, default: false },

    // 🧱 Moderation
    isApproved: { type: Boolean, default: false }, // ← 🆕 moderation flag
  },
  { timestamps: true }
);

export default mongoose.model("Post", postSchema);