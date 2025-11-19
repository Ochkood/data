"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminSidebar from "@/components/admin/AdminSidebar";
import Loader from "@/components/Loader";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return; // хэрэглэгчийн мэдээлэл ачаалж байхад түр хүлээнэ

    if (!isAuthenticated) {
      // Нэвтрээгүй бол login руу
      router.replace("/login");
      return;
    }

    if (user?.role !== "admin") {
      // Хэрвээ хэрэглэгч admin биш бол профайл руу буцаана
      router.replace("/profile");
      return;
    }
  }, [isAuthenticated, user, loading, router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center w-full m-auto h-full">
        <Loader />
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "admin") {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <AdminSidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <AdminHeader />
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}