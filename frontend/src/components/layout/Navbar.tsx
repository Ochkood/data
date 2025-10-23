"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import {
  Bell,
  Bookmark,
  LogOut,
  Settings,
  User,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ThemeToggle from "@/components/ThemeToggle";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

export default function Navbar() {
  const { user, isAuthenticated, logout, loading } = useAuth();
  const router = useRouter();
  const unreadNotifications = 3; // mock data

  return (
    <nav className="w-full border-b bg-white/70 dark:bg-gray-900/70 backdrop-blur-md shadow-sm sticky top-0 z-[55]">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        {/* 🔹 Logo */}
        <Link href="/" className="text-xl font-bold text-teal-700">
          DataNews
        </Link>



        {/* 🔔 Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme toggle */}
          <ThemeToggle />

          {/* 🔍 Search button (all screen sizes) */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/search")}
            className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-teal-600 transition border border-teal-400 hover:border-teal-600 rounded-2xl hover:cursor-pointer"
          >
            <Search size={18} />
            <span className="hidden sm:inline">Хайлт</span>
          </Button>

          {/* Bookmark */}
          {isAuthenticated && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/bookmarks")}
              className="hover:text-teal-600"
              title="Saved posts"
            >
              <Bookmark size={18} />
            </Button>
          )}

          {/* Notifications */}
          {isAuthenticated && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative hover:cursor-pointer">
                  <Bell size={18} />
                  {unreadNotifications > 0 && (
                    <span
                      className="absolute -top-1 -right-1 inline-flex items-center justify-center
                        h-4 min-w-[16px] px-1 rounded-full text-[10px]
                        bg-red-500 text-white leading-none"
                    >
                      {unreadNotifications}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                sideOffset={8}
                className="w-72 bg-white dark:bg-gray-900 
                  border border-gray-200 dark:border-gray-700 
                  shadow-xl rounded-xl p-2 z-[60]"
              >
                <DropdownMenuLabel className="font-semibold text-gray-800 dark:text-gray-200">
                  Мэдэгдэл
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="text-sm text-gray-500 dark:text-gray-400 px-3 py-2">
                  Одоогоор шинэ мэдэгдэл алга.
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* 👤 Profile / Login */}
          {loading ? (
            // 🟢 Skeleton while auth loading
            <div className="flex items-center gap-2">
              <Skeleton className="w-8 h-8 rounded-full" />
              <Skeleton className="w-20 h-6 rounded-md" />
            </div>
          ) : !isAuthenticated ? (
            // 🧑‍💻 Нэвтрээгүй
            <Link href="/login">
              <Button className="bg-teal-600 hover:bg-teal-700 text-white">
                Нэвтрэх
              </Button>
            </Link>
          ) : (
            // 👤 Нэвтэрсэн хэрэглэгч
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="cursor-pointer ring-2 ring-transparent hover:ring-teal-500 transition">
                  <AvatarImage src={user?.profileImage} alt="User" />
                  <AvatarFallback>
                    {user?.fullName?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                sideOffset={8}
                className="min-w-[220px] bg-white dark:bg-gray-900 
                  border border-gray-200 dark:border-gray-700
                  shadow-xl rounded-xl p-2 z-[60]"
              >
                <DropdownMenuLabel className="font-semibold text-gray-800 dark:text-gray-200 truncate">
                  {user?.fullName}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="hover:cursor-pointer" onClick={() => router.push("/profile")}>
                  <User className="mr-2 h-4 w-4" /> Профайл
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:cursor-pointer" onClick={() => router.push("/settings")}>
                  <Settings className="mr-2 h-4 w-4" /> Тохиргоо
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="hover:cursor-pointer" onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" /> Гарах
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </nav>
  );
}