"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Pencil } from "lucide-react";

export function EditPostDialog({
  post,
  categories,
  onSave,
}: {
  post: any;
  categories: any[];
  onSave: (updated: any) => void;
}) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(post.title);
  const [content, setContent] = useState(post.content);
  const [category, setCategory] = useState(post.category?._id || "");
  const [isApproved, setIsApproved] = useState(post.isApproved);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(post.image || null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (file: File) => {
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleUpdate = async () => {
    const token = localStorage.getItem("token");
    if (!token) return toast.error("Token not found!");

    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    formData.append("category", category);
    formData.append("isApproved", isApproved ? "true" : "false");
    if (imageFile) formData.append("image", imageFile);

    try {
      setLoading(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE}/admin/posts/${post._id}`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );

      const data = await res.json();
      if (res.ok) {
        toast.success("Мэдээ шинэчлэгдлээ ✅");
        onSave(data.updatedPost || data.post);
        setOpen(false);
      } else {
        toast.error(data.message || "Шинэчлэхэд алдаа гарлаа");
      }
    } catch (err) {
      console.error("❌ UPDATE ERROR:", err);
      toast.error("Сервертэй холбогдож чадсангүй");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Pencil size={16} />
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-lg rounded-xl shadow-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
        <DialogHeader className="border-b border-gray-200 dark:border-gray-700 pb-3 mb-3">
          <DialogTitle className="text-lg font-semibold flex items-center gap-2">
            📝 Мэдээ засах
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* 🏷️ Title */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Гарчиг
            </label>
            <Input
              placeholder="Мэдээний гарчиг"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border-gray-300 dark:border-gray-700"
            />
          </div>

          {/* 📝 Content */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Агуулга
            </label>
            <Textarea
              placeholder="Мэдээний агуулга..."
              rows={6}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="border-gray-300 dark:border-gray-700"
            />
          </div>

          {/* 🧩 Category */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Ангилал
            </label>
            <Select value={category} onValueChange={(val) => setCategory(val)}>
              <SelectTrigger className="border-gray-300 dark:border-gray-700">
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
          </div>

          {/* 🟢 Status */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Төлөв
            </label>
            <Select
              value={isApproved ? "approved" : "pending"}
              onValueChange={(val) => setIsApproved(val === "approved")}
            >
              <SelectTrigger className="border-gray-300 dark:border-gray-700">
                <SelectValue placeholder="Төлөв" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800">
                <SelectItem value="approved">✅ Батлагдсан</SelectItem>
                <SelectItem value="pending">🕓 Хүлээгдэж буй</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 🖼️ Image */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Зураг
            </label>

            {preview && (
              <div className="relative w-full rounded-lg overflow-hidden border border-gray-300 dark:border-gray-700 shadow-sm">
                <img
                  src={preview}
                  alt="preview"
                  className="w-full h-48 object-cover"
                />
              </div>
            )}

            <label className="block mt-1 cursor-pointer">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) =>
                  e.target.files && handleFileChange(e.target.files[0])
                }
              />
              <div className="border border-dashed border-gray-400 hover:border-teal-500 text-center rounded-md py-3 text-sm text-gray-500 transition bg-gray-50 dark:bg-gray-800">
                {imageFile ? "🖼️ Шинэ зураг сонгогдсон" : "Зураг солих"}
              </div>
            </label>
          </div>

          {/* 💾 Save */}
          <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
            <Button
              onClick={handleUpdate}
              disabled={loading}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white rounded-lg py-2.5 text-base font-medium transition"
            >
              {loading ? "Шинэчилж байна..." : "💾 Хадгалах"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}