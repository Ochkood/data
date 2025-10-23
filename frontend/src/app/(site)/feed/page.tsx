"use client";

import FeedTabs from "@/components/FeedTabs";

export default function FeedPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      <div className="max-w-3xl mx-auto py-10 px-4">
        <FeedTabs />
      </div>
    </div>
  );
}