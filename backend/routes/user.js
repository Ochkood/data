// routes/user.js
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import User from "../models/user.js";
import upload from "../middleware/upload.js"; // ✅ multer эндээс авна
import cloudinary from "../config/cloudinary.js";
import Post from "../models/Post.js";
import streamifier from "streamifier";


const router = express.Router();

// 👤 Хэрэглэгчийн дэлгэрэнгүй мэдээлэл (protected)
router.get("/me", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate("following", "_id fullName profileImage")
      .populate("followers", "_id fullName profileImage")
      .select("-password");

    if (!user) return res.status(404).json({ message: "Хэрэглэгч олдсонгүй" });

    res.status(200).json({
      message: "Хэрэглэгчийн мэдээлэл амжилттай уншигдлаа",
      user,
    });
  } catch (error) {
    console.error("❌ /me route error:", error);
    res.status(500).json({ message: "Серверийн алдаа", error: error.message });
  }
});


// 🟢 PROFILE IMAGE UPLOAD (Cloudinary + memoryStorage)
router.post("/me/avatar", protect, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    console.log("📸 Upload file:", req.file.originalname);

    // Stream ашиглан Cloudinary руу upload хийнэ
    const uploadStream = () =>
      new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "profile_images" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });

    const result = await uploadStream();

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { profileImage: result.secure_url },
      { new: true }
    );

    res.json({ message: "Profile image updated", user });
  } catch (err) {
    console.error("❌ Image upload error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});


// 🟢 PROFILE UPDATE (өөрийн мэдээлэл шинэчлэх)
router.patch("/me", protect, async (req, res) => {
  try {
    const updates = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // 📋 Талбаруудыг шинэчилнэ
    user.fullName = updates.fullName || user.fullName;
    user.username = updates.username || user.username;
    user.email = updates.email || user.email;
    user.bio = updates.bio || user.bio;
    user.profession = updates.profession || user.profession;
    user.experience = updates.experience || user.experience;

    user.contact = {
      phone: updates.phone || user.contact.phone,
      website: updates.website || user.contact.website,
      address: updates.address || user.contact.address,
      facebook: updates.facebook || user.contact.facebook,
      twitter: updates.twitter || user.contact.twitter,
      linkedin: updates.linkedin || user.contact.linkedin,
    };

    await user.save();
    res.json({ message: "Profile updated successfully", user });
  } catch (err) {
    console.error("❌ Profile update error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// ⭐ Bookmark toggle
router.patch("/me/bookmark/:postId", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const postId = req.params.postId;

    const alreadyBookmarked = user.bookmarks.includes(postId);

    if (alreadyBookmarked) {
      user.bookmarks.pull(postId);
    } else {
      user.bookmarks.push(postId);
    }

    await user.save();

    res.json({
      message: alreadyBookmarked ? "Bookmark устгалаа" : "Bookmark нэмлээ",
      bookmarks: user.bookmarks,
    });
  } catch (err) {
    console.error("❌ Bookmark error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// 🧾 Хэрэглэгчийн хадгалсан мэдээнүүд
router.get("/me/bookmarks", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: "bookmarks",
      populate: { path: "category", select: "name color" },
    });
    res.json({ bookmarks: user.bookmarks || [] });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});


// 🟢 Хэрэглэгчийн нийтлэлүүд
router.get("/:id/posts", async (req, res) => {
  try {
    const posts = await Post.find({ author: req.params.id })
      .populate("category", "name")
      .sort({ createdAt: -1 });
    res.json({ posts });
  } catch (err) {
    console.error("❌ USER POSTS ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// 🟢 Хэрэглэгчийн дэлгэрэнгүй мэдээлэл + постууд
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate("followers", "_id")
      .populate("following", "_id");

    if (!user) return res.status(404).json({ message: "User not found" });

    const posts = await Post.find({ author: user._id })
      .populate("author", "fullName profileImage")
      .populate("category", "name slug")
      .sort({ createdAt: -1 });

    res.json({
      user: {
        _id: user._id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage,
        profession: user.profession,
        experience: user.experience,
        contact: user.contact,
        bio: user.bio,
        followersCount: user.followers.length,
        followingCount: user.following.length,
      },
      posts,
    });
  } catch (err) {
    console.error("❌ USER DETAIL ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// 🟢 FOLLOW toggle (follow / unfollow)
router.patch("/:id/follow", protect, async (req, res) => {
  try {
    const targetId = req.params.id;
    const userId = req.user._id.toString();

    if (targetId === userId)
      return res.status(400).json({ message: "Өөрийгөө дагаж болохгүй" });

    const user = await User.findById(userId);
    const target = await User.findById(targetId);

    if (!target) return res.status(404).json({ message: "User not found" });

    const isFollowing = user.following.includes(targetId);

    if (isFollowing) {
      user.following.pull(targetId);
      target.followers.pull(userId);
    } else {
      user.following.push(targetId);
      target.followers.push(userId);
    }

    await user.save();
    await target.save();

    res.json({
      message: isFollowing ? "Unfollowed successfully" : "Followed successfully",
      following: user.following,
    });
  } catch (err) {
    console.error("❌ FOLLOW ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// 🟢 FOLLOW STATUS шалгах
router.get("/:id/is-following", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const isFollowing = user.following.includes(req.params.id);
    res.json({ isFollowing });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});


// 🟢 FOLLOWERS жагсаалт
router.get("/:id/followers", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate(
      "followers",
      "_id fullName profileImage"
    );
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ followers: user.followers || [] });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});


// 🟢 FOLLOWING жагсаалт
router.get("/:id/following", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate(
      "following",
      "_id fullName profileImage"
    );
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ following: user.following || [] });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

export default router;