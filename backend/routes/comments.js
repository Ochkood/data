import express from "express";
import Comment from "../models/Comment.js";
import Post from "../models/Post.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * 🟢 1. POST /api/comments/:postId
 *  -> Сэтгэгдэл нэмэх (аль хэдийн ажиллаж байгаа)
 */
router.post("/:postId", protect, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content || content.trim() === "")
      return res.status(400).json({ message: "Сэтгэгдэл хоосон байж болохгүй!" });

    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const comment = await Comment.create({
      post: req.params.postId,
      author: req.user._id,
      content,
    });

    post.comments.push(comment._id);
    await post.save();

    const populatedComment = await comment.populate("author", "fullName profileImage");
    res.status(201).json({ message: "Сэтгэгдэл нэмэгдлээ", comment: populatedComment });
  } catch (err) {
    console.error("❌ Comment add error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/**
 * 🟢 2. GET /api/comments/:postId
 *  -> Тухайн постын бүх сэтгэгдлийг авах
 */
router.get("/:postId", async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.postId })
      .populate("author", "fullName profileImage")
      .sort({ createdAt: -1 });
    res.json(comments);
  } catch (err) {
    console.error("❌ Comment fetch error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/**
 * 🗑️ 3. DELETE /api/comments/:id
 *  -> Өөрийн эсвэл админы сэтгэгдлийг устгах
 */
router.delete("/:id", protect, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    // Зөвхөн сэтгэгдэл бичсэн хэрэглэгч эсвэл админ устгах эрхтэй
    if (comment.author.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Та энэ сэтгэгдлийг устгах эрхгүй" });
    }

    await Comment.findByIdAndDelete(req.params.id);
    await Post.updateOne({ _id: comment.post }, { $pull: { comments: comment._id } });

    res.json({ message: "Сэтгэгдэл устгагдлаа" });
  } catch (err) {
    console.error("❌ Comment delete error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/**
 * ❤️ 4. PATCH /api/comments/:id/like
 *  -> Like toggle (нэг дарвал like, дахин дарвал unlike)
 */
router.patch("/:id/like", protect, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    const userId = req.user._id;
    const alreadyLiked = comment.likes.includes(userId);

    if (alreadyLiked) {
      comment.likes.pull(userId);
    } else {
      comment.likes.push(userId);
    }

    await comment.save();
    res.json({
      message: alreadyLiked ? "Unlike хийлээ" : "Like дарлаа",
      likesCount: comment.likes.length,
    });
  } catch (err) {
    console.error("❌ Comment like error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

export default router;