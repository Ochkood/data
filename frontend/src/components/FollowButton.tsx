"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, UserPlus, UserCheck } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface FollowButtonProps {
  targetUserId: string;
  onFollowChange?: () => void;
  className?: string;
  label?: string;
}

export default function FollowButton({
  targetUserId,
  onFollowChange,
  className = "",
  label,
}: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE}/users/${targetUserId}/is-following`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();
        if (res.ok) setIsFollowing(data.isFollowing);
      } catch (err) {
        console.error("❌ Follow status fetch failed:", err);
      }
    };
    fetchStatus();
  }, [targetUserId]);

  const toggleFollow = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Та нэвтэрсний дараа дагах боломжтой.");
        return;
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE}/users/${targetUserId}/follow`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();
      if (res.ok) {
        setIsFollowing(!isFollowing);
        toast.success(data.message);
        onFollowChange?.();
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      console.error("❌ Follow toggle error:", err);
      toast.error("Алдаа гарлаа");
    } finally {
      setLoading(false);
    }
  };

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            disabled={loading}
            onClick={toggleFollow}
            variant={isFollowing ? "outline" : "default"}
            className={`flex items-center gap-2 text-xs font-medium rounded-full transition-all
              ${isFollowing
                ? "border-gray-400 text-gray-600 hover:bg-gray-100 hover:cursor-pointer dark:hover:bg-gray-800"
                : "bg-teal-600 hover:bg-red-600 hover:cursor-pointer text-white"} 
              ${className}`}
          >
            {loading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : isFollowing ? (
              <>
                <UserCheck size={14} />
                Following
              </>
            ) : (
              <>
                <UserPlus size={14} />
                {label || "Follow"}
              </>
            )}
          </Button>
        </TooltipTrigger>
        {/* <TooltipContent side="top" className="text-xs bg-white">
          {isFollowing ? "Дагахаа болих" : "Хэрэглэгчийг дагах"}
        </TooltipContent> */}
      </Tooltip>
    </TooltipProvider>
  );
}