"use client";

export default function FullLayout({
  left,
  main,
  right,
}: {
  left: React.ReactNode;
  main: React.ReactNode;
  right: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* LEFT */}
      <aside className="w-64 bg-white border-r p-5">{left}</aside>

      {/* MAIN */}
      <main className="flex-1 bg-gray-50 p-6 overflow-y-auto">{main}</main>

      {/* RIGHT */}
      <aside className="w-80 bg-white border-l p-5">{right}</aside>
    </div>
  );
}