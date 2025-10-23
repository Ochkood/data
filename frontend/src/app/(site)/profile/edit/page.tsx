"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, Camera, ArrowLeft, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function EditProfilePage() {
  const { user, token, refreshUser } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({
    fullName: "",
    username: "",
    email: "",
    bio: "",
    profession: "",
    experience: "",
    phone: "",
    website: "",
    address: "",
    facebook: "",
    twitter: "",
    linkedin: "",
  });

  const [preview, setPreview] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);

  // 🟢 Хэрэглэгчийн мэдээллийг урьдчилан бөглөх
  useEffect(() => {
    if (user) {
      setForm({
        fullName: user.fullName || "",
        username: user.username || "",
        email: user.email || "",
        bio: user.bio || "",
        profession: user.profession || "",
        experience: user.experience || "",
        phone: user.contact?.phone || "",
        website: user.contact?.website || "",
        address: user.contact?.address || "",
        facebook: user.contact?.facebook || "",
        twitter: user.contact?.twitter || "",
        linkedin: user.contact?.linkedin || "",
      });
      setPreview(user?.profileImage ?? "");
    }
  }, [user]);

  // 🖊 Input өөрчлөгдөх
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setForm({ ...form, [e.target.name]: e.target.value });

  // 💾 Профайл шинэчлэх
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/users/me`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Профайл мэдээлэл шинэчлэгдлээ!");
        await refreshUser();
        setTimeout(() => router.push("/profile"), 800);
      } else toast.error(data.message || "Шинэчлэлт амжилтгүй.");
    } catch (err) {
      console.error("❌ Update error:", err);
      toast.error("Сервертэй холбогдоход алдаа гарлаа.");
    } finally {
      setLoading(false);
    }
  };

  // 🖼 Зураг upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("image", file);
    setPreview(URL.createObjectURL(file));
    setUploading(true);
    setUploaded(false);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE}/users/me/avatar`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );

      const data = await res.json();
      if (res.ok) {
        setUploaded(true);
        toast.success("Профайл зураг шинэчлэгдлээ!");
        await refreshUser();
      } else toast.error(data.message);
    } catch (err) {
      console.error("❌ Image upload error:", err);
      toast.error("Зураг шинэчлэхэд алдаа гарлаа");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-10 px-6">
      {/* 🔙 Back button */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push("/profile")}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-teal-600"
        >
          <ArrowLeft size={18} /> Буцах
        </Button>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Профайл шинэчлэх
        </h2>
        <div />
      </div>

      {/* 🖼 Profile image section */}
      <div className="flex flex-col items-center mb-8 relative">
        <div className="relative w-32 h-32 group">
          <img
            src={
              preview ||
              "https://res.cloudinary.com/demo/image/upload/v1700000000/default-avatar.png"
            }
            alt="Profile"
            className={`w-32 h-32 rounded-full object-cover border-4 ${uploaded ? "border-green-500" : "border-teal-500"
              } shadow-lg transition-all duration-300`}
          />

          {/* hover overlay */}
          <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition cursor-pointer">
            <Camera size={22} className="text-white" />
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
          </label>

          {/* loader */}
          {uploading && (
            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center">
              <Loader2 className="animate-spin text-white" size={26} />
            </div>
          )}

          {/* success */}
          {uploaded && !uploading && (
            <div className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center animate-fade-in">
              <CheckCircle className="text-green-400" size={30} />
            </div>
          )}
        </div>

        <p className="text-sm text-gray-500 mt-3">
          Зураг дээр дарж шинэ зураг сонгоно уу
        </p>
      </div>

      {/* 🧾 Profile info form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 👤 Үндсэн мэдээлэл */}
        <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
          <div className="flex gap-4">
            <p>Овог нэр</p>
            <Input name="fullName" value={form.fullName} onChange={handleChange} placeholder="Овог нэр" />
          </div>

          <Input name="username" value={form.username} onChange={handleChange} placeholder="Хэрэглэгчийн нэр" />
          <Input name="email" value={form.email} onChange={handleChange} placeholder="Имэйл" />
        </div>

        <Textarea
          name="bio"
          value={form.bio}
          onChange={handleChange}
          placeholder="Товч танилцуулга"
          className="min-h-[80px]"
        />

        {/* 💼 Мэргэжил */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input name="profession" value={form.profession} onChange={handleChange} placeholder="Мэргэжил" />
          <Input name="experience" value={form.experience} onChange={handleChange} placeholder="Туршлага" />
        </div>

        {/* ☎️ Холбоо барих */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input name="phone" value={form.phone} onChange={handleChange} placeholder="Утас" />
          <Input name="website" value={form.website} onChange={handleChange} placeholder="Вебсайт" />
          <Input name="address" value={form.address} onChange={handleChange} placeholder="Хаяг" />
        </div>

        {/* 🌐 Social */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input name="facebook" value={form.facebook} onChange={handleChange} placeholder="Facebook линк" />
          <Input name="twitter" value={form.twitter} onChange={handleChange} placeholder="Twitter линк" />
          <Input name="linkedin" value={form.linkedin} onChange={handleChange} placeholder="LinkedIn линк" />
        </div>

        {/* 💾 Save */}
        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-teal-600 hover:bg-teal-700 text-white"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" /> Хадгалж байна...
            </>
          ) : (
            "Хадгалах"
          )}
        </Button>
      </form>
    </div>
  );
}