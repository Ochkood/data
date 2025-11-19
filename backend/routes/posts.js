// routes/posts.js
import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import mongoose from "mongoose";
import Post from "../models/Post.js";
import User from "../models/user.js";
import { protect, verifyAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// 🧠 Multer тохиргоо (memory storage)
const storage = multer.memoryStorage();
const upload = multer({ storage });

/* -------------------------------------------------------------------------- */
/* 🧩 1. Редакторын сонголт (Editor's Pick)                                   */
/* -------------------------------------------------------------------------- */
router.get("/editor", async (req, res) => {
  try {
    const posts = await Post.find({ isApproved: true, isEditorPick: true })
      .populate("author", "fullName profileImage")
      .populate("category", "name slug")
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    console.error("❌ EDITOR FEED ERROR:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/* -------------------------------------------------------------------------- */
/* 🧩 2. Дагасан хэрэглэгчдийн мэдээ (Following Feed)                        */
/* -------------------------------------------------------------------------- */
router.get("/following", protect, async (req, res) => {
  try {
    console.log("🟣 /posts/following user:", req.user?._id?.toString());

    const me = await User.findById(req.user._id).select("following");
    if (!me) return res.status(404).json({ message: "User not found" });

    const followingIds = (me.following || []).map((id) =>
      id instanceof mongoose.Types.ObjectId ? id : new mongoose.Types.ObjectId(id)
    );

    if (!followingIds.length) {
      console.log("ℹ️ No following users → []");
      return res.json([]); // Хоосон массив буцаана
    }

    const posts = await Post.find({ author: { $in: followingIds }, isApproved: true  })
      .populate("author", "fullName profileImage")
      .populate("category", "name slug")
      .sort({ createdAt: -1 });

    console.log(`✅ Found ${posts.length} following posts`);
    res.json(posts);
  } catch (err) {
    console.error("❌ FOLLOWING FEED ERROR:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/* -------------------------------------------------------------------------- */
// 🟠 TRENDING POSTS (top 5 liked)                                          */
/* -------------------------------------------------------------------------- */

router.get("/trending", async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("author", "fullName profileImage")
      .populate("category", "name slug color")
      .sort({ "likes.length": -1 }) // 👍 лайк ихтэй дарааллаар
      .limit(5);

    res.json(posts);
  } catch (err) {
    console.error("❌ TRENDING FEED ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* -------------------------------------------------------------------------- */
/* 🧩 3. Бүх постууд (All posts)                                             */
/* -------------------------------------------------------------------------- */
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find({ isApproved: true })
      .populate("author", "fullName profileImage")
      .populate("category", "name slug")
      .populate({
        path: "comments",
        populate: { path: "author", select: "fullName profileImage" },
      })
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    console.error("❌ POSTS LIST ERROR:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});



// 🟢 Advanced Search & Filter
router.get("/search", async (req, res) => {
  try {
    const { q, category, sort } = req.query;
    const query = {};

    // 🔍 Хайлт — title, content, author name
    if (q) {
      query.$or = [
        { title: { $regex: q, $options: "i" } },
        { content: { $regex: q, $options: "i" } },
      ];
    }

    // 🏷️ Category filter
    if (category) {
      query.category = category;
    }

    // ⏳ Sort
    let sortOption = { createdAt: -1 }; // newest
    if (sort === "likes") sortOption = { likesCount: -1 };
    if (sort === "views") sortOption = { views: -1 };

    const posts = await Post.find(query)
      .populate("author", "fullName profileImage")
      .populate("category", "name color")
      .sort(sortOption)
      .limit(50);

    res.json({ posts });
  } catch (err) {
    console.error("❌ Search error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// 👤 Хэрэглэгчийн оруулсан мэдээнүүд — энэ route-г түрүүлж бичих ёстой!
router.get("/my-posts", protect, async (req, res) => {
  try {
    const posts = await Post.find({ author: req.user._id })
      .populate("category", "name color")
      .sort({ createdAt: -1 });

    res.json({ posts });
  } catch (err) {
    console.error("❌ Fetch my posts error:", err);
    res.status(500).json({ message: "Серверийн алдаа", error: err.message });
  }
});



/* -------------------------------------------------------------------------- */
/* 🧩 4. Нэг пост дэлгэрэнгүй                                               */
/* -------------------------------------------------------------------------- */
// 🟢 Нэг пост дэлгэрэнгүй + view count нэмэх
router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("author", "fullName profileImage")
      .populate("category", "name color")
      .populate({
        path: "comments",
        populate: { path: "author", select: "fullName profileImage" },
      });

    if (!post) return res.status(404).json({ message: "Post not found" });

    // 🧩 Unique view нэмэх хэсэг
    let viewerId = null;

    // Хэрэв хэрэглэгч нэвтэрсэн бол JWT-оос ID авах
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      try {
        const decoded = JSON.parse(
          Buffer.from(token.split(".")[1], "base64").toString()
        );
        viewerId = decoded.id || decoded._id;
      } catch (err) {
        console.warn("⚠️ JWT decode алдаа:", err);
      }
    }

    // Хэрэв хэрэглэгч нэвтрээгүй бол IP ашиглая
    const viewerKey = viewerId || req.ip;

    // Хэрэв өмнө нь үзээгүй бол л +1 нэмнэ
    if (
      (viewerId && !post.viewedBy.some((id) => id.toString() === viewerId)) ||
      (!viewerId && !post.viewedBy.includes(viewerKey))
    ) {
      post.views = (post.views || 0) + 1;
      if (viewerId) post.viewedBy.push(viewerId);
      await post.save();
      console.log(`👁️‍🗨️ Unique view added: ${post.views}`);
    } else {
      console.log("ℹ️ Already viewed, no increment");
    }

    res.json(post);
  } catch (err) {
    console.error("❌ POST DETAIL ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* -------------------------------------------------------------------------- */
/* 🧩 5. POST үүсгэх — хэрэглэгч мэдээ илгээх                              */
/* -------------------------------------------------------------------------- */
// 📝 POST /api/posts
router.post("/", protect, upload.single("image"), async (req, res) => {
  try {
    const { title, content, category, tags } = req.body;

    // 🧩 1. Албан ёсны шалгалтууд
    if (!title || !content) {
      return res.status(400).json({ message: "Гарчиг болон агуулга шаардлагатай." });
    }

    // 🧩 2. Cloudinary upload (зурагтай бол)
    let imageUrl = "";
    if (req.file && req.file.buffer) {
      const uploaded = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "posts" },
          (err, result) => (err ? reject(err) : resolve(result))
        );
        stream.end(req.file.buffer);
      });
      imageUrl = uploaded.secure_url;
    }

    // 🧩 3. Post үүсгэх
    const post = await Post.create({
      author: req.user._id,
      title,
      content,
      image: imageUrl || "",
      category: category || null,
      tags: tags ? tags.split(",").map((t) => t.trim()) : [],
      isApproved: false, // 🟡 эхэндээ хүлээгдэж байгаа төлөв
    });

    res.status(201).json({
      message: "Таны мэдээ хүлээгдэж байна. Админ батлах хүртэл нийтлэгдэхгүй.",
      post,
    });
  } catch (err) {
    console.error("❌ CREATE POST ERROR:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/* -------------------------------------------------------------------------- */
/* 🧩 6. Пост Like / Unlike toggle                                           */
/* -------------------------------------------------------------------------- */
router.patch("/:id/like", protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const userId = req.user._id;
    const alreadyLiked = post.likes.includes(userId);

    if (alreadyLiked) {
      post.likes.pull(userId);
    } else {
      post.likes.push(userId);
    }

    await post.save();
    res.json({
      message: alreadyLiked ? "Unliked" : "Liked",
      likesCount: post.likes.length,
    });
  } catch (err) {
    console.error("❌ LIKE ERROR:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/* -------------------------------------------------------------------------- */
/* 🧩 7. Editor's Pick toggle (admin only)                                   */
/* -------------------------------------------------------------------------- */
router.patch("/:id/pick", protect, verifyAdmin, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    post.isEditorPick = !post.isEditorPick;
    await post.save();
    res.json({ message: "Editor's Pick status updated", post });
  } catch (err) {
    console.error("❌ PICK ERROR:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});


// ✏️ Хэрэглэгч өөрийн мэдээг засах
router.patch("/:id", protect, async (req, res) => {
  try {
    const { title, content, category, image } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) return res.status(404).json({ message: "Мэдээ олдсонгүй" });

    // ✅ зөвхөн тухайн хэрэглэгч л өөрийн мэдээг засах эрхтэй
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Танд энэ мэдээг засах эрх байхгүй." });
    }

    post.title = title || post.title;
    post.content = content || post.content;
    post.category = category || post.category;
    post.image = image || post.image;

    await post.save();

    res.json({ message: "Мэдээ амжилттай шинэчлэгдлээ!", updatedPost: post });
  } catch (err) {
    console.error("❌ Update post error:", err);
    res.status(500).json({ message: "Серверийн алдаа", error: err.message });
  }
});



export default router;