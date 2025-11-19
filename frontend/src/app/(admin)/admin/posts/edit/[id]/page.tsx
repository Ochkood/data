"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
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
import { Loader2, UploadCloud } from "lucide-react";
import SimpleEditor from "@/components/editor/SimpleEditor";
import Loader from "@/components/Loader";

export default function AdminEditPostPage() {
  const router = useRouter();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [isEditorPick, setIsEditorPick] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [categories, setCategories] = useState<any[]>([]);

  // ✅ Мэдээ ба ангилал татах
  useEffect(() => {
    const fetchPostAndCategories = async () => {
      try {
        const token = localStorage.getItem("token");
        const [postRes, catRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_BASE}/posts/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${process.env.NEXT_PUBLIC_API_BASE}/categories`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const [postData, catData] = await Promise.all([
          postRes.json(),
          catRes.json(),
        ]);

        if (postRes.ok) {
          setTitle(postData.title || "");
          setContent(postData.content || "");
          setCategory(postData.category?._id || "");
          setIsEditorPick(postData.isEditorPick || false);
          setIsApproved(postData.isApproved || false);
          setPreview(postData.image || null);
        } else {
          toast.error(postData.message || "Мэдээ татахад алдаа гарлаа.");
        }

        const cats =
          Array.isArray(catData) && catData.length
            ? catData
            : catData.categories || [];
        setCategories(cats);
      } catch (err) {
        console.error("❌ Fetch error:", err);
        toast.error("Сервертэй холбогдож чадсангүй.");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchPostAndCategories();
  }, [id]);

  // ✅ File select
  const handleFileChange = (file: File) => {
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  // ✅ Cloudinary upload
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

  // ✅ Хадгалах
  const handleSave = async () => {
    if (!title || !content) {
      toast.error("Гарчиг болон агуулга шаардлагатай!");
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      let imageUrl = preview;

      if (imageFile) {
        imageUrl = await uploadToCloudinary(imageFile);
      }

      const body = {
        title,
        content,
        category,
        isEditorPick,
        isApproved,
        image: imageUrl,
      };

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE}/admin/posts/${id}`,
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
        router.push("/admin/posts");
      } else {
        toast.error(data.message || "Шинэчлэхэд алдаа гарлаа.");
      }
    } catch (err) {
      console.error("❌ Save error:", err);
      toast.error("Серверийн холболтын алдаа.");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center w-full m-auto h-full">
        <Loader />
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-sm">
      <h2 className="text-2xl font-semibold mb-6">📝 Мэдээ засах</h2>

      <div className="space-y-6">
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

        <div className="grid grid-cols-3 gap-10">
          {/* Category */}
          <div>
            <Label>Ангилал</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-full bg-white mt-1">
                <SelectValue placeholder="Ангилал сонгох..." />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {categories.length > 0 ? (
                  categories.map((cat) => (
                    <SelectItem key={cat._id} value={cat._id}>
                      {cat.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem disabled value="">
                    ⚠ Ангилал олдсонгүй
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* ✅ Төлөв (Approved / Pending) */}
          <div>
            <Label>Мэдээний төлөв</Label>
            <Select
              value={isApproved ? "approved" : "pending"}
              onValueChange={(val) => setIsApproved(val === "approved")}
            >
              <SelectTrigger className="w-full bg-white mt-1">
                <SelectValue placeholder="Төлөв сонгох..." />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="approved">✅ Батлагдсан</SelectItem>
                <SelectItem value="pending">⏳ Хүлээгдэж буй</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Editor Pick */}
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
              className={`relative h-6 w-11 rounded-full transition-colors duration-300 ${isEditorPick ? "bg-green-500" : "bg-gray-300"
                }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform duration-300 ${isEditorPick ? "translate-x-5" : "translate-x-0"
                  }`}
              />
            </Switch>
          </div>
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
            className="border-2 border-dashed rounded-xl p-6 text-center transition-all duration-300 cursor-pointer hover:border-teal-400"
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
                    setPreview(null);
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



        {/* Save */}
        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-full mt-4 bg-teal-600 hover:bg-teal-700 text-white rounded-xl"
        >
          {saving ? (
            <>
              <Loader2 size={18} className="animate-spin" /> Хадгалж байна...
            </>
          ) : (
            "💾 Хадгалах"
          )}
        </Button>
      </div>
    </div>
  );
}