"use client";

export default function MainRightLayout({
  main,
  right,
}: {
  main: React.ReactNode;
  right: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* MAIN */}
      <main className="flex-1 bg-gray-50 p-6 overflow-y-auto">{main}</main>

      {/* RIGHT PANEL */}
      <aside className="w-80 bg-white border-l p-4 shadow-sm">{right}</aside>
    </div>
  );
}