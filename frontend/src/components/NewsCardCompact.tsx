"use client";

import { Eye, MessageSquare } from "lucide-react";
import Link from "next/link";

interface NewsCardCompactProps {
  post: {
    _id: string;
    title: string;
    image?: string;
    content?: string;
    excerpt?: string;
    comments?: any[];
    views?: number;
    createdAt?: string;
  };
}

export default function NewsCardCompact({ post }: NewsCardCompactProps) {
  return (
    <Link
      href={`/posts/${post._id}`}
      className="flex flex-col sm:flex-row gap-4 border border-gray-100 dark:border-gray-800 
                 rounded-xl overflow-hidden hover:shadow-md transition-all duration-300 
                 hover:-translate-y-[2px] bg-white dark:bg-gray-900"
    >
      {/* 🖼 Thumbnail */}
      <div className="w-full sm:w-40 h-48 sm:h-28 bg-gray-100 dark:bg-gray-800 overflow-hidden flex-shrink-0">
        <img
          src={
            post.image || "https://placehold.co/300x200?text=No+Image"
          }
          alt={post.title}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
        />
      </div>

      {/* 📄 Content */}
      <div className="flex flex-col justify-between py-3 px-4 sm:pr-3 flex-1">
        <div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 hover:text-teal-600 line-clamp-2">
            {post.title}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
            {post.excerpt ||
              post.content?.replace(/<[^>]+>/g, "").slice(0, 100) ||
              ""}
          </p>
        </div>

        {/* 🧾 Meta info */}
        <div className="flex items-center gap-4 text-xs text-gray-400 mt-3">
          <div className="flex items-center gap-1">
            <MessageSquare size={13} /> {post.comments?.length || 0}
          </div>
          <div className="flex items-center gap-1">
            <Eye size={13} /> {post.views ?? 0}
          </div>
          <span>
            {new Date(post.createdAt || "").toLocaleDateString("mn-MN", {
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>
      </div>
    </Link>
  );
}