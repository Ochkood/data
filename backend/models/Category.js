import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String },
    color: { type: String, default: "#009688" }, // ✅ Шинэ талбар
  },
  { timestamps: true }
);

export default mongoose.model("Category", categorySchema);