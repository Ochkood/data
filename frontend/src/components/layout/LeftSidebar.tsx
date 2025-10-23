"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchCategories } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import ThemeToggle from "@/components/ThemeToggle";
import { Folder, ChevronRight, Landmark } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Briefcase,
  Cpu,
  LineChart,
  Globe,
  DollarSign,
  Activity,
  Heart,
  Scale,
  Users,
  Map,
  Shield,
  Factory,
  Leaf,
  Building,
  TrendingUp,
} from "lucide-react";

type Banner = {
  _id: string;
  title: string;
  subtitle?: string;
  link?: string;
  image: string;
  position: "top" | "bottom" | "left" | "right" | "center";
  isActive: boolean;
};

export default function LeftSidebar() {
  const [categories, setCategories] = useState<any[]>([]);
  const [leftBanners, setLeftBanners] = useState<Banner[]>([]);
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  const categoryIcons: Record<string, any> = {
    "эдийн засаг": LineChart,
    "спорт": Activity,
    "технологи": Cpu,
    "эрүүл мэнд": Heart,
    "улс төр": Landmark,
    "нийгэм": Users,
    "бизнес": Briefcase,
    "байгаль орчин": Leaf,
    "эрчим хүч": Factory,
    "хууль": Scale,
    "банк санхүү": DollarSign,
    "газар зүй": Map,
    "хүн ам": Globe,
    "эрдэм шинжилгээ": Building,
    "зах зээл": TrendingUp,
  };

  // ✅ Fetch categories
  useEffect(() => {
    const load = async () => {
      try {
        const cats = await fetchCategories();
        setCategories(cats);
      } catch (err) {
        console.error("❌ Category fetch error:", err);
      }
    };
    load();
  }, []);

  // ✅ Fetch LEFT banners
  useEffect(() => {
    const fetchLeftBanners = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/public/banners`);
        const data = await res.json();
        if (res.ok) {
          const filtered = (data.banners || []).filter(
            (b: Banner) => b.position === "left" && b.isActive
          );
          setLeftBanners(filtered);
        }
      } catch (err) {
        console.error("❌ Banner fetch error:", err);
      }
    };
    fetchLeftBanners();
  }, []);

  return (
    <aside className="space-y-6 sticky top-20">
      {/* 🔖 Categories */}
      <ul className="flex flex-wrap gap-2">
        {categories.map((cat) => {
          const Icon = categoryIcons[cat.name?.toLowerCase()] || Briefcase;

          // CSS variable-аар category color дамжуулна
          const style = { ['--cat' as any]: cat.color || '#2563eb' } as React.CSSProperties;

          return (
            <li key={cat._id}>
              <button
                onClick={() => router.push(`/category/${cat.slug}`)}
                style={style}
                className="
            group inline-flex items-center gap-1.5 rounded-full border
            px-3 py-1.5 text-sm font-medium transition-colors
            border-[color:var(--cat)] text-[color:var(--cat)]
            hover:bg-[color:var(--cat)] hover:text-white
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[color:var(--cat)]
            dark:focus:ring-offset-gray-950 hover:cursor-pointer
          "
              >
                <Icon size={15} className="transition-colors group-hover:text-white" />
                <span className="transition-colors">{cat.name}</span>
              </button>
            </li>
          );
        })}
      </ul>

      {/* 🖼 LEFT BANNERS */}
      {leftBanners.length > 0 && (
        <div className="space-y-4">
          {leftBanners.map((b) => (
            <motion.div
              key={b._id}
              whileHover={{ scale: 1.02 }}
              className="relative rounded-xl overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700 transition-all"
            >
              <Link href={b.link || "#"} target="_blank">
                <Image
                  src={b.image || "/default-banner.jpg"}
                  alt={b.title}
                  width={400}
                  height={250}
                  className="w-full h-auto object-cover rounded-lg"
                />
                {(b.title || b.subtitle) && (
                  <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/60 to-transparent text-white p-3">
                    {/* <h4 className="text-sm font-semibold">{b.title}</h4>
                    {b.subtitle && (
                      <p className="text-xs opacity-80">{b.subtitle}</p>
                    )} */}
                  </div>
                )}
              </Link>
            </motion.div>
          ))}
        </div>
      )}

      {/* 👥 Following section */}
      {isAuthenticated && (
        <div className="bg-white/80 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-xl p-4 shadow-sm backdrop-blur-md">
          <h3 className="flex items-center gap-2 text-gray-700 dark:text-gray-200 font-semibold mb-2">
            👥 Миний дагасан
          </h3>
          {user?.following && user.following.length > 0 ? (
            <ul className="space-y-2 max-h-48 overflow-y-auto scrollbar-thin">
              {user.following.map((f: any, index: number) => (
                <li
                  key={f._id || `following-${index}`}
                  onClick={() => router.push(`/profile/${f._id}`)}
                  className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded-md cursor-pointer transition"
                >
                  <img
                    src={
                      f.profileImage && f.profileImage.trim() !== ""
                        ? f.profileImage
                        : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          f.firstName || "User"
                        )}&background=0D8ABC&color=fff&size=40`
                    }
                    alt={f.firstName}
                    className="w-7 h-7 rounded-full object-cover border border-gray-300"
                  />
                  <span>{f.firstName || "User"}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-sm">Дагагч олдсонгүй</p>
          )}
        </div>
      )}

      {/* 🌗 Theme toggle */}
      <div className="bg-white/80 dark:bg-gray-900/40 rounded-xl border border-gray-200 dark:border-gray-800 p-3 shadow-sm flex items-center justify-between">
        <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
          Theme
        </span>
        <ThemeToggle />
      </div>
    </aside>
  );
}