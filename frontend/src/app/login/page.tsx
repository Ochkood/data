"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast, Toaster } from "sonner";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth(); // 🧩 Context-оос login function авна

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error("Имэйл болон нууц үгээ бөглөнө үү!");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok && data.token) {
        // 🟢 AuthContext руу хадгалах
        login(data.token);

        toast.success("Амжилттай нэвтэрлээ!");
        setTimeout(() => {
          window.location.href = "/profile";
        }, 1000);

        if (res.ok && data.token) {
          // 🧠 Token-г Context болон cookie-д хадгалах
          login(data.token);
          document.cookie = `token=${data.token}; path=/; max-age=604800`; // 7 хоног хадгална

          toast.success("Амжилттай нэвтэрлээ!");
          setTimeout(() => {
            window.location.href = "/profile";
          }, 1000);
        }
      } else {
        toast.error(data.message || "Нэвтрэхэд алдаа гарлаа");
      }
    } catch (err) {
      toast.error("Серверийн холболт амжилтгүй");
      console.error("❌ Login Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <Toaster richColors position="top-center" />
      <Card className="w-[380px] shadow-lg border border-gray-100 dark:">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-semibold text-gray-800">
            Нэвтрэх
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Input
              type="email"
              placeholder="Имэйл хаяг"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <Input
              type="password"
              placeholder="Нууц үг"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white hover:cursor-pointer"
          >
            {loading ? "Нэвтэрч байна..." : "Нэвтрэх"}
          </Button>
          <p className="text-center text-sm text-gray-600">
            Бүртгэлгүй юу?{" "}
            <a href="/register" className="text-teal-700 hover:underline">
              Бүртгүүлэх
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}