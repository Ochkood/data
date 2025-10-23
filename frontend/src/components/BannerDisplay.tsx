"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";

type Banner = {
  _id: string;
  title: string;
  subtitle?: string;
  link?: string;
  image: string;
  position: "top" | "bottom" | "left" | "right" | "center";
  isActive?: boolean;
};

export default function BannerDisplay() {
  const [topBanners, setTopBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopBanners = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/public/banners`);
        const data = await res.json();

        if (res.ok && data.banners) {
          const filtered = (data.banners as Banner[]).filter(
            (b) => b.position === "top" && b.isActive
          );
          setTopBanners(filtered);
        }
      } catch (err) {
        console.error("❌ Top banner fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTopBanners();
  }, []);

  if (loading)
    return (
      <div className="w-full h-48 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-xl mb-6" />
    );

  if (topBanners.length === 0) return null;

  return (
    <div className="w-full space-y-4">
      {topBanners.map((b) => (
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
              width={1200}
              height={400}
              className="w-full h-auto object-cover rounded-lg"
              priority
            />
            {(b.title || b.subtitle) && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 text-white text-center p-4 transition-opacity">
                {/* <h2 className="text-lg md:text-2xl font-semibold drop-shadow">
                  {b.title}
                </h2>
                {b.subtitle && (
                  <p className="text-sm opacity-90 mt-1">{b.subtitle}</p>
                )} */}
              </div>
            )}
          </Link>
        </motion.div>
      ))}
    </div>
  );
}