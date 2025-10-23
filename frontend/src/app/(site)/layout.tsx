// src/app/(site)/layout.tsx
"use client";

import Navbar from "@/components/layout/Navbar";
import LeftSidebar from "@/components/layout/LeftSidebar";
import RightSidebar from "@/components/layout/RightSidebar";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-0 py-0 sm:px-4 sm:py-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* LEFT */}
        <aside className="hidden lg:block">
          <LeftSidebar />
        </aside>

        {/* CONTENT */}
        <section className="lg:col-span-2 min-w-0">{children}</section>

        {/* RIGHT */}
        <aside className="hidden lg:block">
          <RightSidebar />
        </aside>
      </main>
    </>
  );
}