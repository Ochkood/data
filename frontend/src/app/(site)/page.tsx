"use client";

import BannerDisplay from "@/components/BannerDisplay";
import FeedPage from "./feed/page";

// import FeedPage from "./(site)/feed/page";

export default function HomePage() {

  return (
    <main className="min-h-screen p-6">
      <BannerDisplay />

      <div>
        <FeedPage />
      </div>
    </main>
    
  );
}