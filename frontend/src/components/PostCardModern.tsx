"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Heart, MessageSquare, Eye, Share2, Bookmark, BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import dayjs from "dayjs";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import ShareModal from "@/components/ShareModal";
import FollowButton from "./FollowButton";

export default function PostCardModern({ post }: { post: any }) {
    const router = useRouter();
    const { user, isAuthenticated, token } = useAuth();

    const [liked, setLiked] = useState(post.likes?.includes(user?._id) || false);
    const [likesCount, setLikesCount] = useState(post.likes?.length || 0);
    const [shareOpen, setShareOpen] = useState(false);
    const [isFollowing, setIsFollowing] = useState(
        user?.following?.includes(post.author?._id) || false
    );
    const [loadingFollow, setLoadingFollow] = useState(false);

    // ❤️ LIKE toggle
    const toggleLike = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!isAuthenticated) return toast.warning("Нэвтэрсний дараа like дарна уу!");
        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE}/posts/${post._id}/like`,
                {
                    method: "PATCH",
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            const data = await res.json();
            if (res.ok) {
                setLiked(!liked);
                setLikesCount(data.likesCount);
            } else toast.error(data.message || "Like амжилтгүй боллоо");
        } catch (err) {
            console.error(err);
            toast.error("Серверийн холболтын алдаа");
        }
    };

    // ➕ FOLLOW toggle (backend-д нийцүүлсэн)
    const toggleFollow = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!isAuthenticated) return toast.warning("Нэвтэрсний дараа дагах боломжтой!");
        setLoadingFollow(true);

        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE}/users/${post.author._id}/follow`,
                {
                    method: "PATCH",
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            const data = await res.json();

            if (res.ok && data.success) {
                setIsFollowing(data.isFollowing);
                toast.success(data.message);
            } else {
                toast.error(data.message || "Follow үйлдэл амжилтгүй боллоо");
            }
        } catch (err) {
            console.error("❌ FOLLOW ERROR:", err);
            toast.error("Серверийн алдаа");
        } finally {
            setLoadingFollow(false);
        }
    };

    return (
        <Card
            // onClick={() => router.push(`/posts/${post._id}`)}
            className="cursor-pointer overflow-hidden rounded-2xl border border-gray-200 bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300 mb-6"
        >
            {/* 🧑‍💼 Header */}
            <div className="flex items-center justify-between px-4 pt-4">
                <div
                    className="flex items-center gap-2 cursor-pointer"
                    onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/profile/${post.author?._id}`);
                    }}
                >
                    <img
                        src={post.author?.profileImage || "/default-avatar.png"}
                        alt={post.author?.fullName}
                        className="w-9 h-9 rounded-full border object-cover hover:scale-105 transition-transform"
                    />
                    <div>
                        <p className="text-sm font-semibold text-gray-800 hover:text-teal-600">
                            @ {post.author?.fullName}
                        </p>
                    </div>
                </div>

                {/* ✅ FollowButton-г энд ашиглаж байна */}
                <FollowButton targetUserId={post.author._id} />
            </div>

            <div onClick={() => router.push(`/posts/${post._id}`)}>

                {/* 🖼️ Image */}
                {post.image && (
                    <div className="mt-3">
                        <img
                            src={post.image}
                            alt={post.title}
                            className="w-full object-cover rounded-none"
                        />
                    </div>
                )}

                {/* 🏷️ Category + Title + Description */}
                <div className="px-5 py-4 space-y-2">
                    <div className="flex items-center justify-between text-sm text-gray-500">
                        <span className="font-medium text-gray-700">🏷 {post.category?.name}</span>
                        <span>{dayjs(post.createdAt).format("MMM D, YYYY")}</span>
                    </div>

                    <h2 className="text-lg font-semibold text-gray-900">{post.title}</h2>
                    {/* <p className="text-sm text-gray-600 line-clamp-3">
                        {post.excerpt || post.content}
                    </p> */}

                    {/* <a
                        href={`/posts/${post._id}`}
                        className="text-blue-600 hover:underline font-medium text-sm"
                    >
                        Explore the Data →
                    </a> */}
                </div>

            </div>



            {/* ❤️ Reactions */}
            <div className="flex items-center justify-between px-5 py-3 border-t text-gray-600 text-sm">
                <div className="flex items-center gap-4">
                    <button
                        onClick={toggleLike}
                        className="flex items-center gap-1 hover:text-red-500 transition hover:cursor-pointer"
                    >
                        <Heart
                            size={16}
                            className={liked ? "fill-red-500 text-red-500" : "text-gray-500"}
                        />
                        <span>{likesCount}</span>
                    </button>
                    <div className="flex items-center gap-1 hover:text-teal-600 cursor-pointer">
                        <MessageSquare size={15} /> {post.comments?.length || 0}
                    </div>
                    <div className="flex items-center gap-1 hover:text-teal-600 cursor-pointer">
                        <Eye size={15} /> {post.views || 0}
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <Bookmark size={16} className="hover:text-teal-600 cursor-pointer" />
                    <Share2
                        size={16}
                        className="hover:text-teal-600 cursor-pointer"
                        onClick={(e) => {
                            e.stopPropagation();
                            setShareOpen(true);
                        }}
                    />
                </div>
            </div>

            <ShareModal open={shareOpen} setOpen={setShareOpen} post={post} />
        </Card>
    );
}