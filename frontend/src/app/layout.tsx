// import type { Metadata } from "next";
// import { Roboto, Inter, Lora, Noto_Sans } from "next/font/google";
// import { AuthProvider } from "@/context/AuthContext";
// import Navbar from "@/components/Navbar";
// import "./globals.css";
// import { Toaster } from "sonner";
// import LeftSidebar from "@/components/layout/LeftSidebar";
// import RightSidebar from "@/components/layout/RightSidebar";

// // 🧩 Google font тохиргоо
// const roboto = Roboto({
//   subsets: ["latin"],
//   weight: ["400", "700"],
//   variable: "--font-roboto",
// });

// const inter = Inter({
//   subsets: ["latin"],
//   variable: "--font-inter",
// });

// const lora = Lora({
//   subsets: ["latin"],
//   weight: ["400", "600"],
//   variable: "--font-lora",
// });

// const notoSans = Noto_Sans({
//   subsets: ["latin", "cyrillic"],
//   weight: ["400", "700"],
//   variable: "--font-noto",
// });

// export const metadata: Metadata = {
//   title: "DataNews",
//   description: "Next.js + Node + Flutter ecosystem",
// };

// export default function RootLayout({
//   children,
// }: Readonly<{ children: React.ReactNode }>) {
//   return (
//     <html lang="mn">
//       <body
//         className={`${roboto.variable} ${inter.variable} ${lora.variable} ${notoSans.variable} antialiased bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100 transition-colors duration-00`}
//       >
//         <AuthProvider>
//             <Navbar />
//             <main className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-6 px-4 py-6">
              
//               {/* 🧭 LEFT SIDEBAR */}
//               <aside className="hidden lg:block w-1/5">
//                 <LeftSidebar />
//               </aside>

//               {/* 📄 MAIN CONTENT */}
//               <section className="flex-1 min-w-0">{children}</section>

//               {/* 📰 RIGHT SIDEBAR */}
//               <aside className="hidden lg:block w-1/4">
//                 <RightSidebar />
//               </aside>
//             </main>
//             <Toaster richColors position="top-center" />
//         </AuthProvider>
//       </body>
//     </html>
//   );
// }

// src/app/layout.tsx
import { Toaster } from "sonner";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

export const metadata = { title: "DataNews" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="mn">
      <body>
        <Toaster
        position="top-right"
        richColors
        closeButton
        duration={2500}
      />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}