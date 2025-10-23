"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare, Heart, Share2, UserCircle, Clock, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import ShareModal from "@/components/ShareModal";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/mn";
import "@/lib/dayjsLocaleMN";

dayjs.extend(relativeTime);
dayjs.locale("mn");

export default function PostCard({ post, imageHeight = "h-80" }: { post: any; imageHeight?: string }) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [liked, setLiked] = useState(post.likes?.includes(user?._id) || false);
  const [likesCount, setLikesCount] = useState(post.likes?.length || 0);
  const [shareOpen, setShareOpen] = useState(false);

  const toggleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.warning("Нэвтэрч орсны дараа like дарна уу!");
      return;
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE}/posts/${post._id}/like`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const data = await res.json();
      if (res.ok) {
        setLiked(!liked);
        setLikesCount(data.likesCount);
      } else {
        toast.error(data.message || "Like үйлдэл амжилтгүй боллоо");
      }
    } catch (err) {
      console.error("❌ Like Error:", err);
      toast.error("Серверийн холболт амжилтгүй");
    }
  };

  const goToDetail = () => {
    router.push(`/posts/${post._id}`);
  };

  const relativeDate = post.createdAt
    ? dayjs(post.createdAt).fromNow()
    : "Тодорхойгүй";

  return (
    <Card
      onClick={goToDetail}
      className="group mb-6 cursor-pointer overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
    >
      {console.log("📂 CATEGORY:", post.category)}
      {/* 🖼️ Зураг */}
      {post.image && (
        <div className="relative">
          <img
            src={post.image}
            alt={post.title}
            className={`w-full ${imageHeight} object-cover transition-transform duration-500 group-hover:scale-105`}
          />
          {post.category?.name && (
            <span
              className="absolute top-3 left-3 text-white text-xs px-3 py-1 rounded-full shadow"
              style={{ backgroundColor: post.category.color || "#009688" }} // ✅ өнгө dynamic
            >
              {post.category.name}
            </span>
          )}
        </div>
      )}

      <CardContent className="p-5 space-y-4">
        {/* 📰 Гарчиг */}
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 group-hover:text-teal-600 transition-colors">
          {post.title}
        </h2>


        {/* 🧾 Агуулга */}
        {/* <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 leading-relaxed">
          {post.content}
        </p> */}

        {/* 👤 Author + 🕒 Date */}
        <div className="flex items-center justify-between mt-3 text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-2">
            {post.author?.profileImage ? (
              <img
                src={post.author.profileImage}
                alt={post.author.fullName}
                title="View profile"
                className="w-8 h-8 rounded-full object-cover border border-gray-300 hover:scale-105 transition-transform"
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/profile/${post.author._id}`);
                }}
              />
            ) : (
              <UserCircle className="w-7 h-7 text-gray-400" />
            )}
            <span className="font-medium text-gray-700 dark:text-gray-300">
              {post.author?.fullName || "Тодорхойгүй"}
            </span>
          </div>

          <div className="flex items-center gap-1 text-xs text-gray-400">
            <Clock size={14} />
            <span>{relativeDate}</span>
          </div>
        </div>

        {/* ❤️ Like / 💬 Comment / 📤 Share */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-5">
            <div
              onClick={toggleLike}
              className="flex items-center gap-1 hover:text-red-500 transition cursor-pointer"
            >
              <Heart
                size={18}
                className={`transition-colors ${liked ? "fill-red-500 text-red-500" : "text-gray-500"
                  }`}
              />
              <span>{likesCount}</span>
            </div>

            <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-teal-600 cursor-pointer">
              <MessageSquare size={16} />
              <span>{post.comments?.length || 0}</span>
            </div>
            <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-teal-600 cursor-pointer">
              <Eye size={16} />
              <span>{post.views || 0}</span>
            </div>
          </div>

          <div
            onClick={(e) => {
              e.stopPropagation();
              setShareOpen(true);
            }}
            className="text-gray-500 dark:text-gray-400 hover:text-teal-600 cursor-pointer"
          >
            <Share2 size={18} />
          </div>

          <ShareModal open={shareOpen} setOpen={setShareOpen} post={post} />
        </div>
      </CardContent>
    </Card>
  );
}