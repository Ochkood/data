"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { toast } from "sonner";
import Image from "next/image";
import { Loader2, Upload, CheckCircle2 } from "lucide-react";
import SimpleEditor from "@/components/editor/SimpleEditor";
import FeaturedImageUploader from "@/components/uploader/FeaturedImageUploader";
import SuccessModal from "@/components/common/SuccessModal";

export default function AdminAddPostPage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [isEditorPick, setIsEditorPick] = useState(false);
  const [featuredImage, setFeaturedImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // ✅ Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE}/admin/categories`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await res.json();
        if (res.ok) setCategories(data.categories || []);
        else toast.error("Ангилал татахад алдаа гарлаа");
      } catch {
        toast.error("Сервертэй холбогдож чадсангүй.");
      }
    };
    fetchCategories();
  }, []);

  // ✅ Preview for featured image
  const handleFeaturedImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const file = e.target.files?.[0];
    if (file) {
      setFeaturedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // ⬇️ нэмэлт функцууд:
  const handleFileChange = (file: File) => {
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileChange(file);
  };

  // ✅ Submit new post
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!title || !content) {
      toast.error("Гарчиг ба агуулга шаардлагатай!");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content);
      formData.append("category", category);
      formData.append("isEditorPick", String(isEditorPick));
      if (featuredImage) formData.append("image", featuredImage);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/admin/posts`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(
          <div className="flex items-center gap-2">
            <CheckCircle2 className="text-green-500" />{" "}
            <span>Мэдээ амжилттай нэмэгдлээ!</span>
          </div>
        );

        // reset form
        setShowSuccess(true);
        setTitle("");
        setContent("");
        setCategory("");
        setIsEditorPick(false);
        setFeaturedImage(null);
        setPreview(null);
      } else {
        toast.error(data.message || "Мэдээ нэмэхэд алдаа гарлаа");
      }
    } catch (err) {
      console.error(err);
      toast.error("Сервертэй холбогдож чадсангүй.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-sm">
      <h2 className="text-2xl font-semibold mb-6">📰 Шинэ мэдээ нэмэх</h2>

      <form onSubmit={handleSubmit}
        onClick={(e) => {
          const target = e.target as HTMLElement;
          if (
            target.tagName === "INPUT" &&
            (target as HTMLInputElement).type === "file"
          ) {
            // зөвхөн file input дээр блоклоно
            e.stopPropagation();
            e.preventDefault();
          }
        }}
        onKeyDown={(e) => {
          const target = e.target as HTMLElement;
          // зөвхөн file input дээр enter дарахад form trigger болохоос сэргийлнэ
          if (
            target.tagName === "INPUT" &&
            (target as HTMLInputElement).type === "file"
          ) {
            e.stopPropagation();
            e.preventDefault();
          }
        }}
        className="space-y-6">
        {/* Title */}
        <div>
          <Label>Гарчиг</Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Мэдээний гарчиг..."
            className="mt-1"
          />
        </div>

        <div className="grid grid-cols-2 gap-10">
          {/* Category */}
          <div>
            <Label>Ангилал</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-full bg-white border-gray-300 mt-1">
                <SelectValue placeholder="Ангилал сонгох..." />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {categories.map((cat) => (
                  <SelectItem key={cat._id} value={cat._id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Editor Pick Switch */}
          <div className="flex items-center justify-between mt-6">
            <Label className="flex items-center gap-2">
              <span>Редакторын сонголт</span>
              {isEditorPick ? (
                <span className="text-green-600 text-sm font-medium">
                  (идэвхтэй)
                </span>
              ) : (
                <span className="text-gray-400 text-sm">(идэвхгүй)</span>
              )}
            </Label>
            <Switch
              checked={isEditorPick}
              onCheckedChange={setIsEditorPick}
              className={`${isEditorPick
                ? "data-[state=checked]:bg-green-500"
                : "data-[state=unchecked]:bg-gray-300"
                }`}
            />
          </div>
        </div>



        {/* Content Editor */}
        <div>
          <Label>Агуулга</Label>
          <div className="mt-2 border rounded-lg overflow-hidden">
            <SimpleEditor value={content} onChange={setContent} />
          </div>
        </div>

        {/* 🖼️ Image upload / Drag-drop zone */}
        {/* 🖼️ Нүүр зураг */}
        <div>
          <Label>Нүүр зураг</Label>
          <div className="mt-2">
            <FeaturedImageUploader onChange={(file) => setFeaturedImage(file)} />
          </div>
        </div>



        {/* Submit Button */}
        <Button
          type="submit"
          disabled={loading}
          className={`relative overflow-hidden w-full mt-4 rounded-xl px-5 py-3 font-medium text-white ${loading
            ? "bg-gray-400"
            : "bg-teal-600 hover:bg-teal-700 hover:cursor-pointer"
            }`}
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Хадгалж байна...
              </>
            ) : (
              <>
                <Upload size={18} />
                Хадгалах
              </>
            )}
          </span>
          {!loading && (
            <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-emerald-400 opacity-0 hover:opacity-100 transition-opacity duration-500" />
          )}
        </Button>
      </form>
      <SuccessModal open={showSuccess} onClose={() => setShowSuccess(false)} />
    </div>

  );
}