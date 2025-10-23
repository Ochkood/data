"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { CommentSection } from "@/components/comments/CommentSection";
import { Loader2, Share2, Calendar, Eye, BookmarkPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import ShareModal from "@/components/ShareModal";
import FollowButton from "@/components/FollowButton";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/mn";

dayjs.extend(relativeTime);
dayjs.locale("mn");

export default function PostDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [shareOpen, setShareOpen] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE}/posts/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
            },
            cache: "no-store",
          }
        );

        const data = await res.json();
        if (res.ok) setPost(data);
        else toast.error(data.message || "Мэдээг татахад алдаа гарлаа");
      } catch (err) {
        console.error("❌ Failed to load post:", err);
        toast.error("Серверийн холболт амжилтгүй");
      } finally {
        setLoading(false);
      }
    };
    const checkBookmark = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/users/me/bookmarks`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok && Array.isArray(data.bookmarks)) {
          // Хэрвээ энэ пост хадгалагдсан байвал bookmarked = true
          const isSaved = data.bookmarks.some((b: any) => b._id === id);
          setBookmarked(isSaved);
        }
      } catch (err) {
        console.error("❌ Bookmark status check failed:", err);
      }
    };
    checkBookmark(), fetchPost();
  }, [id]);

  // 🟡 Bookmark toggle
  const handleBookmark = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE}/users/me/bookmark/${id}`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      const data = await res.json();
      if (res.ok) {
        setBookmarked(!bookmarked);
        toast.success(data.message);
      } else toast.error(data.message);
    } catch (err) {
      toast.error("Bookmark хадгалахад алдаа гарлаа");
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-teal-600" size={36} />
      </div>
    );

  if (!post)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Мэдээ олдсонгүй.</p>
      </div>
    );

  const author = post.author || {};
  const category = post.category?.name || "Мэдээ";

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      {/* 🏷️ Category & Title */}
      <div className="mb-8 text-center">


        <h1 className="text-x md:text-xl font-bold text-left pl-4 leading-snug text-gray-900 border-l-2 border-teal-700 dark:text-gray-100 mb-3">
          {post.title}
        </h1>

        <div className="flex justify-between items-center border-b pb-2 mb-4">
          {/* 🏷️ Category Badge */}
          <span
            className="inline-flex items-center justify-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full text-white bg-gradient-to-r from-teal-600 to-emerald-500 shadow-sm transition-transform duration-300 hover:scale-[1.05]"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-3 h-3 opacity-100"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              color="white"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h8m-8 6h16" />
            </svg>
            {post.category?.name || "Мэдээ"}
          </span>

          {/* 📅 Date + Views + Share + bookmark */}
          <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400 text-sm">
            <div className="flex items-center gap-1.5 hover:text-teal-600 transition-colors">
              <Calendar size={15} className="opacity-80" />
              <span>{dayjs(post.createdAt).format("YYYY.MM.DD")}</span>
            </div>

            <div className="flex items-center gap-1 hover:text-teal-600 transition-colors">
              <Eye size={15} className="opacity-80" />
              <span>{post.views || 0}</span>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShareOpen(true)}
              className="hover:text-teal-600 transition-transform hover:cursor-pointer hover:scale-110"
              aria-label="Share this post"
            >
              <Share2 size={16} />
            </Button>
            <div className="flex justify-end items-center gap-1 text-gray-500">
              {/* ⭐ BOOKMARK */}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBookmark}
                className={`transition hover:scale-110 hover:cursor-pointer ${bookmarked
                    ? "text-yellow-500 hover:text-yellow-500"
                    : "text-gray-500 hover:text-yellow-400"
                  }`}
              >
                <BookmarkPlus fill={bookmarked ? "currentColor" : "none"} size={18} />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 🖼️ Feature Image */}
      {post.image && (
        <div className="relative mb-6 rounded-xl overflow-hidden shadow-md">
          <img
            src={post.image}
            alt={post.title}
            className="w-full max-h-[480px] object-cover transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
        </div>
      )}

      {/* 📄 Content */}
      <Card className="border-none shadow-none bg-transparent">
        <CardContent className="p-2 prose dark:prose-invert max-w-none leading-relaxed text-[16px]">
          <div
            dangerouslySetInnerHTML={{
              __html:
                typeof post.content === "string"
                  ? post.content.replace(/\n/g, "<br />")
                  : "",
            }}
          />
        </CardContent>
      </Card>

      {/* 👤 Author Info Section */}
      <div className="mt-12 border-t pt-6 flex items-center justify-between dark:border-gray-700">
        <div
          onClick={() => router.push(`/profile/${author._id}`)}
          className="flex items-center gap-4 cursor-pointer hover:opacity-90 transition"
        >
          <img
            src={
              author.profileImage ||
              "https://cdn-icons-png.flaticon.com/512/149/149071.png"
            }
            alt="author"
            className="w-14 h-14 rounded-full object-cover border border-gray-300 dark:border-gray-600"
          />
          <div>
            <p className="text-base font-semibold text-gray-800 dark:text-gray-100">
              {author.fullName || "Нэргүй хэрэглэгч"}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Нийтэлсэн {dayjs(post.createdAt).fromNow()}
            </p>
          </div>
        </div>

        {author._id && (
          <FollowButton
            targetUserId={author._id}
            className="border border-red-500 text-red-500 text-xs px-3 py-1 rounded hover:bg-red-500 hover:text-white transition-all hover:cursor-pointer"
            label="+ ДАГАХ"
          />
        )}
      </div>

      {/* 💬 Comment Section */}
      <div className="mt-10">
        <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-100">
          💬 Сэтгэгдлүүд
        </h3>
        <CommentSection postId={id as string} />
      </div>

      {/* 📤 Share Modal */}
      <ShareModal open={shareOpen} setOpen={setShareOpen} post={post} />
    </div>
  );
}