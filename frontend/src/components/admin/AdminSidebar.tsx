"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Newspaper,
  Tag,
  Image,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const menuItems = [
  { href: "/admin", label: "Хянах самбар", icon: LayoutDashboard },
  { href: "/admin/posts", label: "Мэдээнүүд", icon: Newspaper },
  { href: "/admin/categories", label: "Ангиллууд", icon: Tag },
  { href: "/admin/banners", label: "Баннерууд", icon: Image }, // 🆕 Banner tab
  { href: "/admin/users", label: "Хэрэглэгчид", icon: Users },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <motion.aside
      animate={{ width: collapsed ? 80 : 240 }}
      className={cn(
        "relative flex flex-col h-screen sticky top-0",
        "bg-white/80 dark:bg-gray-900/80 backdrop-blur-md",
        "border-r border-gray-200 dark:border-gray-800 shadow-sm transition-all duration-300"
      )}
    >
      {/* 🔰 Header */}
      <div className="flex items-center justify-between h-16 border-b border-gray-200 dark:border-gray-800 px-4">
        {!collapsed && (
          <h1 className="text-lg font-bold text-teal-600 tracking-tight">
            DataNews Admin
          </h1>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="text-gray-500 hover:text-teal-600 hover:cursor-pointer"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </Button>
      </div>

      {/* 📋 Menu */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all cursor-pointer",
                  isActive
                    ? "bg-gradient-to-r from-teal-500/10 to-teal-500/20 text-teal-700 dark:text-teal-300 border border-teal-400/30 shadow-sm"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                )}
              >
                <Icon size={18} className={isActive ? "text-teal-600" : ""} />
                {!collapsed && <span>{item.label}</span>}
                {isActive && !collapsed && (
                  <span className="ml-auto bg-teal-600 w-1.5 h-1.5 rounded-full" />
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* 👤 User info */}
      <div className="border-t border-gray-200 dark:border-gray-800 p-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src={"/default-avatar.png"}
            alt="avatar"
            className="w-8 h-8 rounded-full object-cover border border-gray-300 dark:border-gray-700"
          />
          {!collapsed && (
            <div className="leading-tight">
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                Админ
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Admin User
              </p>
            </div>
          )}
        </div>
        {!collapsed && (
          <Button
            variant="ghost"
            size="icon"
            title="Sign out"
            className="text-gray-500 hover:text-red-500"
          >
            <LogOut size={18} />
          </Button>
        )}
      </div>
    </motion.aside>
  );
}