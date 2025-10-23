"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { toast } from "sonner";
import Image from "next/image";
import { Loader2, Upload, CheckCircle2 } from "lucide-react";

export default function AdminAddPostPage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [isEditorPick, setIsEditorPick] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);

  // ✅ Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/admin/categories`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) setCategories(data.categories || []);
        else toast.error("Ангилал татахад алдаа гарлаа");
      } catch (err) {
        toast.error("Сервертэй холбогдож чадсангүй.");
      }
    };
    fetchCategories();
  }, []);

  // ✅ Preview image
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // ✅ Submit new post
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return toast.error("Гарчиг ба агуулга шаардлагатай!");

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content);
      formData.append("category", category);
      formData.append("isEditorPick", String(isEditorPick));
      if (image) formData.append("image", image);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/admin/posts`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(
          <div className="flex items-center gap-2">
            <CheckCircle2 className="text-green-500" /> <span>Мэдээ амжилттай нэмэгдлээ!</span>
          </div>
        );
        // reset form
        setTitle("");
        setContent("");
        setCategory("");
        setIsEditorPick(false);
        setImage(null);
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
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-6">📰 Шинэ мэдээ нэмэх</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
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

        {/* Category */}
        <div>
          <Label>Ангилал</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-full bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 mt-1">
              <SelectValue placeholder="Ангилал сонгох..." />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-900">
              {categories.map((cat) => (
                <SelectItem key={cat._id} value={cat._id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Content */}
        <div>
          <Label>Агуулга</Label>
          <Textarea
            rows={6}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Мэдээний агуулга..."
            className="mt-1"
          />
        </div>

        {/* Image Upload */}
        <div>
          <Label>Нүүр зураг</Label>
          <div className="mt-2 flex items-center gap-3">
            <label className="cursor-pointer flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
              <Upload size={18} />
              <span>Зураг сонгох</span>
              <input type="file" accept="image/*" hidden onChange={handleImageChange} />
            </label>
            {preview && (
              <div className="relative w-24 h-16 border rounded-md overflow-hidden">
                <Image src={preview} alt="Preview" fill className="object-cover" />
              </div>
            )}
          </div>
        </div>

        {/* Editor Pick Switch */}
        <div className="flex items-center justify-between border-t pt-4">
          <Label className="flex items-center gap-2">
            <span>Редакторын сонголт</span>
            {isEditorPick ? (
              <span className="text-green-600 text-sm font-medium">(идэвхтэй)</span>
            ) : (
              <span className="text-gray-400 text-sm">(идэвхгүй)</span>
            )}
          </Label>
          <Switch
            checked={isEditorPick}
            onCheckedChange={setIsEditorPick}
            className={`${isEditorPick ? "data-[state=checked]:bg-green-500" : "data-[state=unchecked]:bg-gray-300"
              }`}
          />
        </div>

        {/* Submit */}
        <Button
          type="submit"
          disabled={loading}
          className={`relative overflow-hidden w-full mt-4 rounded-xl px-5 py-3 font-medium text-white ${loading ? "bg-gray-400" : "bg-teal-600 hover:bg-teal-700 hover:cursor-pointer"
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
    </div>
  );
}