"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare, Heart, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";

export default function ProfilePostCard({ post }: { post: any }) {
  const router = useRouter();
  const [shareOpen, setShareOpen] = useState(false);

  const goToDetail = () => {
    router.push(`/posts/${post._id}`);
  };

  return (
    <Card
      onClick={goToDetail}
      className="group cursor-pointer overflow-hidden rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 hover:shadow-lg transition-shadow duration-300"
    >
      {/* 🖼️ Зураг + Category */}
      {post.image && (
        <div className="relative overflow-hidden">
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-56 object-cover transform transition-transform duration-500 group-hover:scale-105"
          />
          {post.category?.name && (
            <span
              className="absolute top-3 left-3 text-xs font-medium text-white px-3 py-1 rounded-full shadow"
              style={{
                backgroundColor:
                  post.category?.color || "rgba(20,115,100,0.85)",
              }}
            >
              {post.category.name}
            </span>
          )}
        </div>
      )}

      <CardContent className="p-4 space-y-3">
        {/* 📰 Гарчиг */}
        <h2 className="text-x font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 group-hover:text-teal-600 transition-colors">
          {post.title}
        </h2>

        {/* ❤️ Like / 💬 Comment / 📤 Share */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400 text-sm">
            <div className="flex items-center gap-1">
              <Heart size={16} className="text-gray-500" />
              <span>{post.likes?.length || 0}</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageSquare size={15} />
              <span>{post.comments?.length || 0}</span>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              setShareOpen(true);
              toast.info("Share modal дараагийн шатанд ажиллана");
            }}
            className="text-gray-500 dark:text-gray-400 hover:text-teal-600 transition"
          >
            <Share2 size={16} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}