import express from "express";
import { protect, verifyAdmin } from "../middleware/authMiddleware.js";
import User from "../models/user.js";
import Post from "../models/Post.js";
import Comment from "../models/Comment.js";
import Category from "../models/Category.js";
import upload from "../middleware/upload.js";
import cloudinary from "../config/cloudinary.js";
import Banner from "../models/Banner.js";

const router = express.Router();

/* =======================
   📊 ADMIN DASHBOARD STATS
========================= */
router.get("/stats", protect, verifyAdmin, async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const postCount = await Post.countDocuments();
    const commentCount = await Comment.countDocuments();
    res.json({ users: userCount, posts: postCount, comments: commentCount });
  } catch (err) {
    console.error("❌ Dashboard stats error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* =======================
   👥 USERS
========================= */
router.get("/users", protect, verifyAdmin, async (_req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json({ users });
  } catch (err) {
    console.error("❌ Users fetch error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// 🧩 GET — бүх banner жагсаалт
router.get("/banners", protect, verifyAdmin, async (_req, res) => {
  try {
    const banners = await Banner.find().sort({ order: 1, createdAt: -1 });
    res.json({ banners });
  } catch (err) {
    res.status(500).json({ message: "Banner fetch алдаа" });
  }
});

// ➕ POST — шинэ banner
router.post("/banners", protect, verifyAdmin, upload.single("image"), async (req, res) => {
  try {
    const { title, subtitle, link, isActive, position } = req.body;
    let imageUrl = "";

    // 🖼 Cloudinary руу upload хийх хэсэг
    if (req.file && req.file.buffer) {
      const uploaded = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "banners" },
          (err, result) => (err ? reject(err) : resolve(result))
        );
        stream.end(req.file.buffer);
      });
      imageUrl = uploaded.secure_url; // ✅ зөв утга
    }

    // 🆕 Banner үүсгэх
    const banner = await Banner.create({
      title,
      subtitle,
      link,
      position: position || "top",
      isActive: isActive === "true" || isActive === true,
      image: imageUrl, // ✅ зөв Cloudinary URL
    });

    res.status(201).json({ message: "✅ Banner нэмэгдлээ", banner });
  } catch (err) {
    console.error("❌ Banner create error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ✏️ PATCH — banner засах
router.patch(
  "/banners/:id",
  protect,
  verifyAdmin,
  upload.single("image"),
  async (req, res) => {
    try {
      const { title, subtitle, link, position, isActive } = req.body;

      // зөвхөн ирсэн талбаруудыг update-д хийх
      const update = {};
      if (typeof title !== "undefined") update.title = String(title).trim();
      if (typeof subtitle !== "undefined") update.subtitle = String(subtitle).trim();
      if (typeof link !== "undefined") update.link = String(link).trim();
      if (typeof position !== "undefined") update.position = position; // ✅ position нэмэв
      if (typeof isActive !== "undefined") {
        update.isActive =
          isActive === true ||
          isActive === "true" ||
          isActive === "1" ||
          isActive === 1 ||
          isActive === "on";
      }

      // 🖼 зураг шинэчлэх (Cloudinary upload)
      if (req.file && req.file.buffer) {
        const uploaded = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "banners" },
            (err, result) => (err ? reject(err) : resolve(result))
          );
          stream.end(req.file.buffer);
        });
        update.image = uploaded.secure_url; // ✅ Cloudinary URL
      }

      // 🔄 Update
      const banner = await Banner.findByIdAndUpdate(req.params.id, update, {
        new: true,
        runValidators: true,
      });

      if (!banner) {
        return res.status(404).json({ message: "Banner олдсонгүй" });
      }

      res.json({ message: "✅ Banner шинэчлэгдлээ", banner });
    } catch (err) {
      console.error("❌ Banner update error:", err);
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }
);

// 🗑 DELETE — banner устгах
router.delete("/banners/:id", protect, verifyAdmin, async (req, res) => {
  try {
    await Banner.findByIdAndDelete(req.params.id);
    res.json({ message: "Banner устгагдлаа" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});


router.patch("/users/:id/role", protect, verifyAdmin, async (req, res) => {
  try {
    const { role } = req.body;
    const updated = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
    res.json({ user: updated });
  } catch (err) {
    console.error("❌ Role update error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/users/:id", protect, verifyAdmin, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("❌ Delete user error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* =======================
   📰 POSTS
========================= */


/* -------------------------------------------------------------------------- */
/* 🧩 6. Админ — нийтлэлүүд жагсаах                                         */
/* -------------------------------------------------------------------------- */

// ✅ Admin: бүх постуудыг татах
router.get("/posts", protect, verifyAdmin, async (req, res) => {
  try {
    const { status } = req.query;

    // 🎯 Filter condition
    const filter = {};
    if (status === "pending") filter.isApproved = false;
    if (status === "approved") filter.isApproved = true;

    // 🧠 Fetch posts + populate author/category
    const posts = await Post.find(filter)
      .populate("author", "fullName email username profileImage")
      .populate("category", "name color slug")
      .sort({ createdAt: -1 })
      .lean(); // performance boost 🚀

    // 🧩 Хоосон бол мэдээлэл илгээнэ
    if (!posts.length) {
      return res.status(200).json({ posts: [], message: "Мэдээ олдсонгүй." });
    }

    res.status(200).json({ posts });
  } catch (err) {
    console.error("❌ FETCH ADMIN POSTS ERROR:", err);
    res
      .status(500)
      .json({ message: "Серверийн алдаа гарлаа.", error: err.message });
  }
});


// 🆕 POST — шинэ мэдээ (зураг upload-тай)
router.post("/posts", protect, verifyAdmin, upload.single("image"), async (req, res) => {
  try {
    const { title, content, category, isEditorPick } = req.body;
    if (!title || !content) {
      return res.status(400).json({ message: "Гарчиг ба агуулга шаардлагатай" });
    }

    let imageUrl = "";
    if (req.file && req.file.buffer) {
      const uploaded = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "posts" },
          (error, result) => (error ? reject(error) : resolve(result))
        );
        stream.end(req.file.buffer);
      });
      imageUrl = uploaded.secure_url;
    }

    const post = await Post.create({
      author: req.user._id,
      title,
      content,
      image: imageUrl || undefined,
      category: category || undefined,
      isEditorPick: isEditorPick === "true" || isEditorPick === true,
    });

    const populated = await Post.findById(post._id)
      .populate("author", "fullName")
      .populate("category", "name");

    res.status(201).json({ message: "Пост үүсгэлээ", post: populated });
  } catch (err) {
    console.error("❌ Admin create post error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});


/* -------------------------------------------------------------------------- */
/* 🧩 7. Админ — нийтлэл батлах                                              */
/* -------------------------------------------------------------------------- */
/* -------------------------------------------------------------------------- */
/* ✅ POST APPROVAL SYSTEM                                                   */
/* -------------------------------------------------------------------------- */

/** ✔ Батлах */
router.patch("/posts/:id/approve", protect, verifyAdmin, async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { isApproved: true },
      { new: true }
    ).populate("author", "fullName username")
     .populate("category", "name color");

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.status(200).json({
      message: "Мэдээ амжилттай батлагдлаа ✅",
      post,
    });
  } catch (err) {
    console.error("❌ APPROVE ERROR:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/** ❌ Татгалзах */
router.patch("/posts/:id/reject", protect, verifyAdmin, async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { isApproved: false },
      { new: true }
    ).populate("author", "fullName username")
     .populate("category", "name color");

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.status(200).json({
      message: "Мэдээ татгалзсан ❌",
      post,
    });
  } catch (err) {
    console.error("❌ REJECT ERROR:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});



// ✏️ PATCH — мэдээ засах (зураг, ангилал, төлөв, EditorPick бүгдийг өөрчлөх)
router.patch(
  "/posts/:id",
  protect,
  verifyAdmin,
  upload.single("image"),
  async (req, res) => {
    try {
      const { title, content, category, isEditorPick, isApproved } = req.body;

      // ✅ Update хийх боломжит талбарууд
      const update = {
        ...(title && { title }),
        ...(content && { content }),
        ...(category && { category }),
        ...(typeof isEditorPick !== "undefined" && {
          isEditorPick: isEditorPick === "true" || isEditorPick === true,
        }),
        ...(typeof isApproved !== "undefined" && {
          isApproved: isApproved === "true" || isApproved === true,
        }),
      };

      // 🖼 Зураг шинэчлэлт (Cloudinary upload)
      if (req.file && req.file.buffer) {
        const uploaded = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "posts" },
            (error, result) => (error ? reject(error) : resolve(result))
          );
          stream.end(req.file.buffer);
        });
        update.image = uploaded.secure_url;
      }

      // 🧩 Мэдээ шинэчлэх
      const post = await Post.findByIdAndUpdate(req.params.id, update, {
        new: true,
      })
        .populate("author", "fullName username email")
        .populate("category", "name color");

      if (!post)
        return res.status(404).json({ message: "Мэдээ олдсонгүй" });

      res.json({ message: "Мэдээ шинэчлэгдлээ ✅", updatedPost: post });
    } catch (err) {
      console.error("❌ Admin update post error:", err);
      res
        .status(500)
        .json({ message: "Server error", error: err.message });
    }
  }
);

// 🗑️ DELETE — мэдээ устгах
router.delete("/posts/:id", protect, verifyAdmin, async (req, res) => {
  try {
    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: "Post deleted successfully" });
  } catch (err) {
    console.error("❌ Delete post error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* =======================
   🏷️ CATEGORIES
========================= */
router.get("/categories", protect, verifyAdmin, async (_req, res) => {
  try {
    const cats = await Category.find().sort({ createdAt: -1 });
    res.json({ categories: cats });
  } catch (err) {
    console.error("❌ CATEGORY FETCH ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/categories", protect, verifyAdmin, async (req, res) => {
  try {
    const { name, slug, color } = req.body;
    if (!name) return res.status(400).json({ message: "Нэр шаардлагатай" });

    const exists = await Category.findOne({ name });
    if (exists) return res.status(409).json({ message: "Ижил ангилал байна" });

    const newCat = await Category.create({ name, slug, color });
    res.status(201).json({ message: "Ангилал нэмэгдлээ", category: newCat });
  } catch (err) {
    console.error("❌ CATEGORY CREATE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.patch("/categories/:id", protect, verifyAdmin, async (req, res) => {
  try {
    const updated = await Category.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
    if (!updated) return res.status(404).json({ message: "Ангилал олдсонгүй" });
    res.json({ message: "Амжилттай шинэчлэгдлээ", category: updated });
  } catch (err) {
    console.error("❌ CATEGORY UPDATE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/categories/:id", protect, verifyAdmin, async (req, res) => {
  try {
    const deleted = await Category.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Ангилал олдсонгүй" });
    res.json({ message: "Амжилттай устгалаа" });
  } catch (err) {
    console.error("❌ CATEGORY DELETE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;