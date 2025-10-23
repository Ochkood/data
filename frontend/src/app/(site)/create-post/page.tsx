"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast, Toaster } from "sonner";
import { UploadCloud } from "lucide-react";

// 🧩 TipTap editor-г зөв dynamic import-оор дуудаж SSR алдаанаас сэргийлнэ
const SimpleEditor = dynamic(() => import("@/components/editor/SimpleEditor"), {
  ssr: false,
  loading: () => (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 text-gray-400 text-center">
      ✏️ Editor ачаалж байна...
    </div>
  ),
});

export default function CreatePostPage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState(""); // HTML хэлбэртэй утга хадгална
  const [category, setCategory] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  // ✅ Fetch categories
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/categories`);
        const data = await res.json();
        if (res.ok) {
          setCategories(Array.isArray(data) ? data : data.categories || []);
        } else {
          toast.error("Ангилал татахад алдаа гарлаа");
        }
      } catch (err) {
        console.error("❌ Category fetch error:", err);
        toast.error("Сервертэй холбогдож чадсангүй.");
      }
    };
    fetchCats();
  }, []);

  // ✅ Drag-drop file events
  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (["dragenter", "dragover"].includes(e.type)) setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileChange(file);
  };

  const handleFileChange = (file: File) => {
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  // ✅ Submit post (multipart/form-data)
  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error("Гарчиг болон агуулга шаардлагатай!");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Нэвтрэх шаардлагатай!");
      return;
    }

    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("content", content); // 🧠 HTML агуулга
    if (category) formData.append("category", category);
    if (imageFile) formData.append("image", imageFile);

    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/posts`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("✅ Таны мэдээ илгээгдлээ. Админ батлахыг хүлээнэ үү!");
        setTitle("");
        setContent("");
        setCategory("");
        setImageFile(null);
        setPreview(null);
      } else {
        toast.error(data.message || "Мэдээ илгээхэд алдаа гарлаа!");
      }
    } catch (err) {
      console.error("❌ Submit error:", err);
      toast.error("Сервертэй холбогдож чадсангүй!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-3xl mx-auto py-10 px-4">
      <Toaster richColors position="top-center" />
      <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100 flex items-center gap-2">
        📰 Шинэ мэдээ оруулах
      </h1>

      <div className="space-y-6">
        {/* 🏷️ Title */}
        <Input
          placeholder="Мэдээний гарчиг"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700"
        />

        {/* 📝 Rich text editor */}
        <SimpleEditor value={content} onChange={setContent} />

        {/* 🧩 Category */}
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger>
            <SelectValue placeholder="Ангилал сонгох" />
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-gray-800">
            {categories.map((cat) => (
              <SelectItem key={cat._id} value={cat._id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* 🖼️ Image upload / Drag-drop zone */}
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-6 text-center transition-all duration-300 cursor-pointer ${
            dragActive
              ? "border-teal-500 bg-teal-50 dark:bg-gray-800/50"
              : "border-gray-300 hover:border-teal-400"
          }`}
        >
          {preview ? (
            <div className="relative">
              <img
                src={preview}
                alt="preview"
                className="w-full h-56 object-cover rounded-lg shadow-md border"
              />
              <Button
                variant="outline"
                className="absolute top-2 right-2 bg-white/80 hover:bg-white text-red-600"
                size="sm"
                onClick={() => {
                  setPreview(null);
                  setImageFile(null);
                }}
              >
                ✕
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
              <UploadCloud size={32} className="mb-2 text-teal-500" />
              <p className="font-medium">Мэдээний үндсэн зургаа оруулна уу!</p>
              <p className="text-xs text-gray-400">
                JPEG, PNG формат — 50MB хүртэл
              </p>

              <label className="mt-3 inline-block px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 cursor-pointer transition">
                Зураг сонгох
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) =>
                    e.target.files && handleFileChange(e.target.files[0])
                  }
                />
              </label>
            </div>
          )}
        </div>

        {/* 📨 Submit */}
        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-teal-600 hover:bg-teal-700 text-white transition"
        >
          {loading ? "Илгээж байна..." : "Мэдээ илгээх"}
        </Button>
      </div>
    </main>
  );
}