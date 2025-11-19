"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import PostCard from "./PostCard";
import { toast } from "sonner";
import { fetchAllPosts, fetchFollowingPosts, fetchEditorPosts } from "@/lib/api";
import { Newspaper, Users, Puzzle, ArrowUp, Database } from "lucide-react";
import PostCardModern from "./PostCardModern";

export default function FeedTabs() {
  const [all, setAll] = useState<any[]>([]);
  const [following, setFollowing] = useState<any[]>([]);
  const [editor, setEditor] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [scrollProgress, setScrollProgress] = useState(0);

  // 🧠 Бүх мэдээ ба редакторын мэдээ татах
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [a, e] = await Promise.all([fetchAllPosts(), fetchEditorPosts()]);
        setAll(a);
        setEditor(e);
      } catch (err) {
        console.error("❌ Feed fetch error:", err);
        toast.error("Мэдээ татахад алдаа гарлаа");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // 🧠 Дагагчдын мэдээ татах
  const handleFollowing = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Нэвтэрсний дараа энэ хэсгийг үзнэ үү.");
      return;
    }

    try {
      setLoading(true);
      const f = await fetchFollowingPosts(token);
      setFollowing(f);
    } catch (err) {
      console.error("❌ Following feed error:", err);
    } finally {
      setLoading(false);
    }
  };

  // 📜 Scroll progress
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollTop / docHeight) * 100;
      setScrollProgress(progress);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ✨ Skeleton Loader
  const ShimmerList = () => (
    <div className="space-y-5">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col gap-3"
        >
          <Skeleton className="w-full h-52 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-2/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );

  // 🧩 Post render
  const renderPosts = (posts: any[]) => {
    const sorted = [...posts].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    return sorted.length > 0 ? (
      sorted.map((p) => (
        <motion.div
          key={p._id}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <PostCardModern post={p} />
        </motion.div>
      ))
    ) : (
      <p className="text-center text-gray-500 py-8">Мэдээ олдсонгүй.</p>
    );
  };

  const tabs = [
    { id: "all", label: "", icon: <Database size={20} /> },
    { id: "following", label: "Дагагчид", icon: <Users size={16} /> },
    { id: "editor", label: "Онцлох", icon: <Puzzle size={16} /> },
  ];

  return (
    <div className="w-full max-w-3xl mx-auto relative">
      {/* 🧭 Tabs */}
      <div className="relative flex justify-center gap-3 mb-6 flex-wrap">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                if (tab.id === "following") handleFollowing();
              }}
              className={`relative flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium border transition-all duration-300 hover:cursor-pointer ${
                isActive
                  ? "bg-teal-600 text-white border-teal-600 shadow-md"
                  : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              {tab.icon}
              {tab.label}

              {isActive && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[60%] h-[3px] bg-teal-400 rounded-full shadow-[0_0_8px_2px_rgba(20,184,166,0.5)] animate-pulse" />
              )}
            </button>
          );
        })}
      </div>

      {/* 📰 Posts with fade transition */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab + (loading ? "-loading" : "-loaded")}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="transition-all duration-300"
        >
          {loading ? (
            <ShimmerList />
          ) : activeTab === "all" ? (
            renderPosts(all)
          ) : activeTab === "following" ? (
            renderPosts(following)
          ) : (
            renderPosts(editor)
          )}
        </motion.div>
      </AnimatePresence>

      {/* ⬆ Scroll-to-top + progress ring */}
      {scrollProgress > 5 && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 group p-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-full shadow-lg hover:cursor-pointer hover:shadow-xl transition-all duration-300"
        >
          <div className="relative w-8 h-8 flex items-center justify-center">
            <ArrowUp
              size={16}
              className="text-teal-600 group-hover:text-teal-700 transition-colors"
            />
            <svg
              className="absolute top-0 left-0 w-8 h-8 transform -rotate-90"
              viewBox="0 0 36 36"
            >
              <circle
                cx="18"
                cy="18"
                r="16"
                stroke="rgba(20,184,166,0.2)"
                strokeWidth="3"
                fill="none"
              />
              <circle
                cx="18"
                cy="18"
                r="16"
                stroke="rgb(20,184,166)"
                strokeWidth="3"
                fill="none"
                strokeDasharray="100"
                strokeDashoffset={100 - scrollProgress}
                strokeLinecap="round"
                className="transition-all duration-200"
              />
            </svg>
          </div>
        </button>
      )}
    </div>
  );
}