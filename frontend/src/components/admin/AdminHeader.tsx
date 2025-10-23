"use client";

import { Bell, LogOut, Search, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import ThemeToggle from "@/components/ThemeToggle";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";

export default function AdminHeader() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/admin/search?q=${encodeURIComponent(query.trim())}`);
    setQuery("");
  };

  return (
    <header className="flex items-center justify-between px-6 py-3 border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-md sticky top-0 z-40">
      {/* 🔹 Left: Logo / Title */}
      <div className="flex items-center gap-3">
        <h1
          className="text-xl font-bold text-teal-700 dark:text-teal-400 cursor-pointer"
          onClick={() => router.push("/admin")}
        >
          Admin Dashboard
        </h1>
      </div>

      {/* 🔍 Center: Search */}
      <form
        onSubmit={handleSearch}
        className="hidden md:flex items-center gap-2 max-w-md flex-1 mx-6"
      >
        <div className="relative w-full">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
          <Input
            type="text"
            placeholder="Админ хайлт..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
          />
        </div>
      </form>

      {/* 🔔 Right: Actions */}
      <div className="flex items-center gap-3">
        {/* Theme toggle */}
        <ThemeToggle />

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative hover:text-teal-600">
          <Bell size={18} />
          <span className="absolute -top-1 -right-1 inline-flex items-center justify-center
                         h-4 min-w-[16px] px-1 rounded-full text-[10px]
                         bg-red-500 text-white leading-none">
            2
          </span>
        </Button>

        {/* Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="cursor-pointer ring-2 ring-transparent hover:ring-teal-500 transition">
              <AvatarImage src={user?.profileImage} alt="Admin" />
              <AvatarFallback>{user?.firstName?.charAt(0) || "A"}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            sideOffset={8}
            className="min-w-[220px] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-xl rounded-xl p-2"
          >
            <DropdownMenuLabel className="font-semibold text-gray-800 dark:text-gray-200 truncate">
              {user?.firstName} {user?.lastName}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/profile")}>
              <User className="mr-2 h-4 w-4" /> Миний профайл
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" /> Гарах
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}