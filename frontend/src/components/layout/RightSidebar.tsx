"use client";

import { useEffect, useState } from "react";
import { fetchTrendingPosts } from "@/lib/api";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

type Banner = {
  _id: string;
  title: string;
  subtitle?: string;
  link?: string;
  image: string;
  position: "top" | "bottom" | "left" | "right" | "center";
  isActive: boolean;
};

export default function RightSidebar() {
  const [trending, setTrending] = useState<any[]>([]);
  const [rightBanners, setRightBanners] = useState<Banner[]>([]);
  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      try {
        // 🟢 Fetch trending + banners (public API ашиглана)
        const [trendingRes, bannerRes] = await Promise.all([
          fetchTrendingPosts(),
          fetch(`${process.env.NEXT_PUBLIC_API_BASE}/public/banners`),
        ]);

        const bannerData = await bannerRes.json();

        setTrending(trendingRes || []);

        if (bannerRes.ok && bannerData.banners) {
          const filtered = bannerData.banners.filter(
            (b: Banner) => b.position === "right" && b.isActive
          );
          setRightBanners(filtered);
        }
      } catch (err) {
        console.error("❌ RightSidebar fetch error:", err);
      }
    };
    load();
  }, []);

  return (
    <div className="space-y-6 sticky top-20">
      {/* 🖼 RIGHT BANNERS */}
      {rightBanners.length > 0 && (
        <div className="space-y-4">
          {rightBanners.map((b) => (
            <motion.div
              key={b._id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="relative overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition"
            >
              <Link href={b.link || "#"} target="_blank">
                <Image
                  src={b.image || "/default-banner.jpg"}
                  alt={b.title}
                  width={400}
                  height={300}
                  className="w-full h-auto object-cover rounded-lg"
                />
                {(b.title || b.subtitle) && (
                  <div className="absolute inset-0 flex flex-col justify-center items-center bg-black/40 text-white text-center opacity-0 transition">
                    <h3 className="text-sm font-semibold px-2">{b.title}</h3>
                    {b.subtitle && (
                      <p className="text-xs text-gray-200 mt-1">{b.subtitle}</p>
                    )}
                  </div>
                )}
              </Link>
            </motion.div>
          ))}
        </div>
      )}

      {/* 🔥 Trending Posts */}
      <div>
        <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3 border-b border-gray-200 dark:border-gray-700 pb-1">
          🔥 Тренд мэдээ
        </h3>
        <ul className="space-y-3">
          {trending.map((p) => (
            <li
              key={p._id}
              onClick={() => router.push(`/posts/${p._id}`)}
              className="cursor-pointer hover:text-teal-600 transition text-sm leading-snug"
            >
              <div className="font-medium">{p.title}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {p.author?.firstName} · {p.category?.name || "Ангилалгүй"}
              </div>
            </li>
          ))}
          {trending.length === 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Тренд мэдээ одоогоор алга.
            </p>
          )}
        </ul>
      </div>
    </div>
  );
}