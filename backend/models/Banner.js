import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    subtitle: { type: String },
    link: { type: String },
    image: { type: String },
    position: {
      type: String,
      enum: ["top", "bottom", "left", "right", "center"],
      default: "top",
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("Banner", bannerSchema);