"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Search, ArrowLeft, Eye, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import NewsCardCompact from "@/components/NewsCardCompact";
import { Skeleton } from "@/components/ui/skeleton"; // ✅ Shadcn skeleton

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const q = searchParams.get("q") || "";

  const [query, setQuery] = useState(q);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // 🔍 Хайлтын үр дүн татах
  useEffect(() => {
    if (!q) return;
    const fetchResults = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE}/posts/search?q=${encodeURIComponent(q)}`
        );
        const data = await res.json();
        if (res.ok) setPosts(data.posts || []);
      } catch (err) {
        console.error("❌ SEARCH ERROR:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [q]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  // 🩶 Skeleton component (Shimmer)
  const ShimmerCard = () => (
    <div className="flex gap-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden p-3">
      <Skeleton className="w-40 h-28 rounded-md" />
      <div className="flex flex-col justify-between flex-1">
        <div className="space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-5/6" />
          <Skeleton className="h-3 w-2/3" />
        </div>
        <div className="flex gap-3 mt-3">
          <Skeleton className="h-3 w-10" />
          <Skeleton className="h-3 w-10" />
          <Skeleton className="h-3 w-14" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* 🔙 Back + Search bar */}
      <div className="flex items-center gap-3 mb-8">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <ArrowLeft />
        </Button>

        <form
          onSubmit={handleSearch}
          className="flex items-center gap-2 w-full max-w-xl"
        >
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Мэдээ, гарчиг, сэдвээр хайх..."
            className="flex-1 h-10 text-sm"
          />
          <Button
            type="submit"
            className="bg-teal-600 hover:bg-teal-700 text-white"
            disabled={!query.trim()}
          >
            <Search size={16} />
          </Button>
        </form>
      </div>

      {/* 📊 Үр дүн */}
      {loading ? (
        <div className="flex flex-col gap-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <ShimmerCard key={i} />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-gray-500 dark:text-gray-400 py-20"
        >
          <p className="text-lg font-medium">Тохирох мэдээ олдсонгүй</p>
          <p className="text-sm">Хайлтын үгээ дахин шалгана уу</p>
        </motion.div>
      ) : (
        <div className="flex flex-col gap-5">
          {posts.map((post) => (
            <NewsCardCompact key={post._id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}