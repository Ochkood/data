"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast, Toaster } from "sonner";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!fullName || !username || !email || !password) {
      toast.error("Бүх талбарыг бөглөнө үү!");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, username, email, password }), // ✅ Том “N”
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("🎉 Бүртгэл амжилттай!", { duration: 2000 });
        setTimeout(() => {
          window.location.href = "/login";
        }, 1200);
      } else {
        toast.error(data.message || "Бүртгэхэд алдаа гарлаа");
      }
    } catch (err) {
      console.error("❌ Register Error:", err);
      toast.error("Сервертэй холбогдоход алдаа гарлаа");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleRegister();
  };

  return (
    <main
      className="
        min-h-screen flex items-center justify-center
        bg-gradient-to-br from-teal-50 to-white
        dark:from-gray-900 dark:to-gray-950
        transition-colors duration-500
      "
    >
      <Toaster richColors position="top-center" />

      <Card
        className="
          w-[400px] 
          shadow-xl 
          border border-gray-200 dark:border-gray-700 
          bg-white dark:bg-gray-800 
          text-gray-900 dark:text-gray-100
          transition-colors duration-300
        "
      >
        <CardHeader>
          <CardTitle className="text-center text-2xl font-semibold text-gray-800 dark:text-gray-100">
            📝 Бүртгүүлэх
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <Input
            type="text"
            placeholder="Овог нэр"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            onKeyDown={handleKeyPress}
            className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-400"
          />

          <Input
            type="text"
            placeholder="Хэрэглэгчийн нэр"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={handleKeyPress}
            className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
          />

          <Input
            type="email"
            placeholder="Имэйл хаяг"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={handleKeyPress}
            className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
          />

          <Input
            type="password"
            placeholder="Нууц үг"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKeyPress}
            className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
          />

          <Button
            onClick={handleRegister}
            disabled={loading}
            className="
              w-full bg-teal-600 hover:bg-teal-700 
              dark:bg-teal-500 dark:hover:bg-teal-600 
              text-white transition-colors duration-300
            "
          >
            {loading ? "Бүртгэж байна..." : "Бүртгүүлэх"}
          </Button>

          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            Бүртгэлтэй юу?{" "}
            <a
              href="/login"
              className="text-teal-700 dark:text-teal-400 hover:underline"
            >
              Нэвтрэх
            </a>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}