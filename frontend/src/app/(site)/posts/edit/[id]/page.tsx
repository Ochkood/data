"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, UploadCloud } from "lucide-react";
import SimpleEditor from "@/components/editor/SimpleEditor";

export default function UserEditPostPage() {
  const router = useRouter();
  const { id } = useParams();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // ✅ Мэдээ ба ангилал татах
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const token = localStorage.getItem("token");
        const [postRes, catRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_BASE}/posts/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${process.env.NEXT_PUBLIC_API_BASE}/categories`),
        ]);

        const [postData, catData] = await Promise.all([
          postRes.json(),
          catRes.json(),
        ]);

        if (postRes.ok) {
          setTitle(postData.title || "");
          setContent(postData.content || "");
          setCategory(postData.category?._id || "");
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
        toast.error("Сервертэй холбогдож чадсангүй.");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchPost();
  }, [id]);

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

  // ✅ File select
  const handleFileChange = (file: File) => {
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
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
        image: imageUrl,
      };

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE}/posts/${id}`,
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
        router.push("/my-posts");
      } else {
        toast.error(data.message || "Шинэчлэхэд алдаа гарлаа.");
      }
    } catch (err) {
      toast.error("Серверийн холболтын алдаа.");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-gray-500">
        Мэдээ татаж байна...
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-sm">
      <h2 className="text-2xl font-semibold mb-6">📝 Мэдээгээ засах</h2>

      <div className="space-y-6">
        <div>
          <Label>Гарчиг</Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Мэдээний гарчиг..."
          />
        </div>

        <div>
          <Label>Ангилал</Label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full mt-1 border rounded-lg p-2"
          >
            <option value="">Сонгох...</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label>Агуулга</Label>
          <div className="mt-2 border rounded-lg overflow-hidden">
            <SimpleEditor value={content} onChange={setContent} />
          </div>
        </div>

        <div>
          <Label>Нүүр зураг</Label>
          {preview ? (
            <div className="relative">
              <img
                src={preview}
                alt="preview"
                className="w-full h-56 object-cover rounded-lg border"
              />
              <Button
                variant="outline"
                size="sm"
                className="absolute top-2 right-2 bg-white text-red-500"
                onClick={() => {
                  setPreview(null);
                  setImageFile(null);
                }}
              >
                ✕
              </Button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg cursor-pointer hover:border-teal-500">
              <UploadCloud className="mb-2 text-teal-500" size={32} />
              <span className="text-sm text-gray-500">Зураг сонгох</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) =>
                  e.target.files && handleFileChange(e.target.files[0])
                }
              />
            </label>
          )}
        </div>

        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-teal-600 hover:bg-teal-700 text-white"
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