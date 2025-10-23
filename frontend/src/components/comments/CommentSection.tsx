"use client";

import { useEffect, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { SendHorizonal, MessageSquare, UserCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export const CommentSection = ({ postId }: { postId: string }) => {
  const { user, isAuthenticated } = useAuth();
  const [comments, setComments] = useState<any[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔹 Fetch comments
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE}/comments/${postId}`
        );
        const data = await res.json();
        if (res.ok) setComments(data);
      } catch (err) {
        console.error("❌ Failed to load comments:", err);
      }
    };
    fetchComments();
  }, [postId]);

  // 📨 Submit comment
  const handleSubmit = async () => {
    if (!isAuthenticated) {
      toast.error("Нэвтэрсний дараа сэтгэгдэл бичих боломжтой.");
      return;
    }
    if (!content.trim()) return;

    try {
      setLoading(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE}/comments/${postId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ content }),
        }
      );
      const data = await res.json();
      if (res.ok) {
        setComments((prev) => [data.comment, ...prev]);
        setContent("");
        toast.success("Сэтгэгдэл илгээгдлээ!");
      } else {
        toast.error(data.message || "Алдаа гарлаа");
      }
    } catch (err) {
      console.error("❌ Comment send error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* ✏️ Comment input */}
      <div className="flex items-start gap-3">
        {user?.profileImage ? (
          <img
            src={user.profileImage}
            alt="me"
            className="w-9 h-9 rounded-full object-cover border border-gray-300 dark:border-gray-700"
          />
        ) : (
          <UserCircle className="w-9 h-9 text-gray-400" />
        )}

        <div className="flex-1 space-y-2">
          <Textarea
            placeholder="Сэтгэгдэлээ бичнэ үү..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[80px] resize-none dark:bg-gray-900 dark:text-gray-100"
          />
          <div className="flex justify-end">
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-teal-600 hover:bg-teal-700 text-white flex items-center gap-2 transition-all shadow-sm hover:shadow-md hover:cursor-pointer"
            >
              <SendHorizonal size={16} />
              Илгээх
            </Button>
          </div>
        </div>
      </div>

      {/* 💬 Comment list */}
      <div className="mt-6 space-y-4">
        {comments.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">
            <MessageSquare className="inline-block mr-1" size={15} /> Одоогоор
            сэтгэгдэл байхгүй байна.
          </p>
        ) : (
          comments.map((c) => (
            <div
              key={c._id}
              className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:shadow-sm transition"
            >
              {c.author?.profileImage ? (
                <img
                  src={c.author.profileImage}
                  alt={c.author.fullName}
                  className="w-9 h-9 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                />
              ) : (
                <UserCircle className="w-9 h-9 text-gray-400" />
              )}
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                  {c.author?.fullName || "Хэрэглэгч"}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-snug">
                  {c.content}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(c.createdAt).toLocaleDateString("mn-MN", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};