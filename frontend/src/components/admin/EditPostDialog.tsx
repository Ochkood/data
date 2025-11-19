"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import Image from "next/image";
import { Edit, Loader2, UploadCloud } from "lucide-react";
import SimpleEditor from "@/components/editor/SimpleEditor";

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
  const [title, setTitle] = useState(post.title || "");
  const [content, setContent] = useState(post.content || "");
  const [category, setCategory] = useState(post.category?._id || "");
  const [isEditorPick, setIsEditorPick] = useState(post.isEditorPick || false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>(post.image || "");
  const [loading, setLoading] = useState(false);

  // ✅ Handle file select or drag-drop
  const handleFileChange = (file: File) => {
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  // ✅ Upload image to Cloudinary
  const uploadToCloudinary = async (file: File) => {
    const CLOUD_NAME = "dgwzf6ijf";
    const UPLOAD_PRESET = "content_image";
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      { method: "POST", body: formData }
    );
    const data = await res.json();
    return data.secure_url;
  };

  // ✅ Handle Save
  const handleSave = async () => {
    if (!title || !content) {
      toast.error("Гарчиг болон агуулга шаардлагатай!");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      let imageUrl = preview;

      // upload new image if selected
      if (imageFile) {
        imageUrl = await uploadToCloudinary(imageFile);
      }

      const body = {
        title,
        content,
        category,
        isEditorPick,
        image: imageUrl,
      };

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE}/admin/posts/${post._id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        }
      );

      const data = await res.json();

      if (res.ok) {
        toast.success("Мэдээ амжилттай шинэчлэгдлээ!");
        onSave(data.post);
        setOpen(false);
      } else {
        toast.error(data.message || "Шинэчлэхэд алдаа гарлаа.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Серверийн холболтын алдаа.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Edit size={16} />
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-4xl max-h-[90vh] bg-white overflow-y-auto">
        <DialogHeader>
          <DialogTitle>📝 Мэдээ засах</DialogTitle>
        </DialogHeader>

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
            <SelectTrigger className="w-full bg-white mt-1">
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

        {/* Content Editor */}
        <div>
          <Label>Агуулга</Label>
          <div className="mt-2 border rounded-lg overflow-hidden">
            <SimpleEditor value={content} onChange={setContent} />
          </div>
        </div>

        {/* Image Upload */}
        <div>
          <Label>Нүүр зураг</Label>
          <div
            className={`border-2 border-dashed rounded-xl p-4 mt-2 text-center transition-all duration-300 cursor-pointer hover:border-teal-500`}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (e.dataTransfer.files[0])
                handleFileChange(e.dataTransfer.files[0]);
            }}
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
                  size="sm"
                  className="absolute top-2 right-2 bg-white/80 hover:bg-white text-red-600"
                  onClick={() => {
                    setPreview("");
                    setImageFile(null);
                  }}
                >
                  ✕
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-gray-500">
                <UploadCloud size={32} className="mb-2 text-teal-500" />
                <p className="font-medium">Нүүр зураг оруулна уу</p>
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
        </div>

        {/* Editor Pick Switch */}
        <div className="flex items-center justify-between border-t pt-4 mt-2">
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
            className={`${
              isEditorPick
                ? "data-[state=checked]:bg-green-500"
                : "data-[state=unchecked]:bg-gray-300"
            }`}
          />
        </div>

        {/* Save Button */}
        <Button
          onClick={handleSave}
          disabled={loading}
          className="w-full mt-4 bg-teal-600 hover:bg-teal-700 text-white rounded-xl"
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" /> Хадгалж байна...
            </>
          ) : (
            "💾 Хадгалах"
          )}
        </Button>
      </DialogContent>
    </Dialog>
  );
}