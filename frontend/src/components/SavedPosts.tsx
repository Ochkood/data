"use client";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import ProfilePostCard from "@/components/ProfilePostCard";

export default function SavedPosts() {
  const [saved, setSaved] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const loadSaved = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/users/me/bookmarks`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) setSaved(data.bookmarks || []);
        else toast.error(data.message);
      } catch (err) {
        toast.error("Hadgalsan medee tatahad aldaa garlaa");
      } finally {
        setLoading(false);
      }
    };
    loadSaved();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="animate-spin text-teal-600" size={24} />
      </div>
    );

  return saved.length > 0 ? (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
      {saved.map((p) => (
        <ProfilePostCard key={p._id} post={p} />
      ))}
    </div>
  ) : (
    <p className="text-center text-gray-500 py-10">
      Та одоогоор хадгалсан мэдээ байхгүй байна.
    </p>
  );
}