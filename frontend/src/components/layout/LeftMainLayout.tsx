"use client";

export default function LeftMainLayout({
  sidebar,
  children,
}: {
  sidebar: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* LEFT SIDEBAR */}
      <aside className="w-64 bg-white border-r shadow-sm p-5">
        {sidebar}
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 bg-gray-50 p-6 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}