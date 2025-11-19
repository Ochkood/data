"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Trash2, Edit3, ImageIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AnimatedConfirmDialog } from "@/components/ui/AnimatedConfirmDialog";
import { cn } from "@/lib/utils";
import Loader from "@/components/Loader";

type Banner = {
  _id: string;
  title: string;
  subtitle?: string;
  link?: string;
  image: string;
  isActive: boolean;
  position: "top" | "bottom" | "left" | "right" | "center";
};

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState<
    null | { mode: "add" } | { mode: "edit"; banner: Banner }
  >(null);
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // ✅ Fetch banners
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE}/admin/banners`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await res.json();
        if (res.ok) setBanners(data.banners || []);
        else toast.error(data.message || "Баннер татахад алдаа");
      } catch (err) {
        toast.error("Сервертэй холбогдсонгүй");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBanners();
  }, [token]);

  // ✅ Delete banner
  const handleDelete = async (id: string) => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE}/admin/banners/${id}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    const data = await res.json();
    if (res.ok) {
      toast.success("🗑 Баннер устгалаа");
      setBanners((prev) => prev.filter((b) => b._id !== id));
    } else toast.error(data.message);
  };

  // ✅ Save banner
  const handleSave = async (formData: FormData, id?: string) => {
    const method = id ? "PATCH" : "POST";
    const url = id
      ? `${process.env.NEXT_PUBLIC_API_BASE}/admin/banners/${id}`
      : `${process.env.NEXT_PUBLIC_API_BASE}/admin/banners`;

    const res = await fetch(url, {
      method,
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    const data = await res.json();

    if (res.ok) {
      toast.success(id ? "✏️ Баннер шинэчлэгдлээ" : "🖼 Баннер нэмэгдлээ");
      if (id) {
        setBanners((prev) =>
          prev.map((b) => (b._id === id ? (data.banner as Banner) : b))
        );
      } else {
        setBanners((prev) => [data.banner as Banner, ...prev]);
      }
      setOpenForm(null);
    } else toast.error(data.message);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          🖼 Баннер удирдлага
        </h2>
        <Button
          onClick={() => setOpenForm({ mode: "add" })}
          className="bg-teal-600 hover:bg-teal-700 text-white"
        >
          <Plus size={16} className="mr-2" /> Шинэ баннер
        </Button>
      </div>

      <div className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Зураг</TableHead>
              <TableHead>Гарчиг</TableHead>
              <TableHead>Байрлал</TableHead>
              <TableHead>Төлөв</TableHead>
              <TableHead>Үйлдэл</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6">
                  <div className="flex justify-center items-center w-full m-auto h-full">
                    <Loader />
                  </div>
                </TableCell>
              </TableRow>
            ) : banners.length ? (
              banners.map((b) => (
                <TableRow
                  key={b._id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition"
                >
                  <TableCell>
                    <img
                      src={b.image || "/default-banner.jpg"}
                      alt={b.title}
                      className="w-28 h-20 object-cover rounded-md border"
                    />
                  </TableCell>
                  <TableCell>
                    <div className="font-semibold">{b.title}</div>
                    {b.subtitle && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {b.subtitle}
                      </div>
                    )}
                    {b.link && (
                      <a
                        href={b.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-teal-600 hover:underline"
                      >
                        {b.link.length > 25
                          ? b.link.slice(0, 25) + "..."
                          : b.link}
                      </a>
                    )}
                  </TableCell>
                  <TableCell className="capitalize">{b.position}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-0.5 text-xs rounded-full ${b.isActive
                          ? "bg-teal-100 text-teal-700 dark:bg-teal-700/30 dark:text-teal-300"
                          : "bg-gray-100 text-gray-500 dark:bg-gray-700/40 dark:text-gray-400"
                        }`}
                    >
                      {b.isActive ? "Идэвхтэй" : "Идэвхгүй"}
                    </span>
                  </TableCell>
                  <TableCell className="flex gap-2 justify-end">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setOpenForm({ mode: "edit", banner: b })}
                    >
                      <Edit3 size={16} className="text-teал-600" />
                    </Button>
                    <AnimatedConfirmDialog
                      triggerButton={
                        <Button variant="outline" size="icon">
                          <Trash2 size={16} className="text-red-500" />
                        </Button>
                      }
                      title="Баннер устгах"
                      description={`"${b.title}" устгах уу?`}
                      onConfirm={() => handleDelete(b._id)}
                      danger
                    />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-6 text-gray-500"
                >
                  Баннер олдсонгүй.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {openForm && (
        <BannerFormModal
          mode={openForm.mode}
          banner={openForm.mode === "edit" ? openForm.banner : undefined}
          onClose={() => setOpenForm(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

/* ───────────────────────────────
   🧩 BannerFormModal
──────────────────────────────── */
function BannerFormModal({
  mode,
  banner,
  onClose,
  onSave,
}: {
  mode: "add" | "edit";
  banner?: Banner;
  onClose: () => void;
  onSave: (data: FormData, id?: string) => void;
}) {
  const [title, setTitle] = useState(banner?.title || "");
  const [subtitle, setSubtitle] = useState(banner?.subtitle || "");
  const [link, setLink] = useState(banner?.link || "");
  const [position, setPosition] = useState<Banner["position"]>(
    banner?.position || "top"
  );
  const [isActive, setIsActive] = useState(banner?.isActive ?? true);
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState(banner?.image || "");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    const formData = new FormData();
    formData.append("title", title);
    formData.append("subtitle", subtitle);
    formData.append("link", link);
    formData.append("position", position);
    formData.append("isActive", String(isActive));
    if (image) formData.append("image", image);

    setSaving(true);
    await onSave(formData, banner?._id);
    setSaving(false);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            {mode === "add" ? "🖼 Шинэ баннер" : "✏️ Баннер засах"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <Input
            placeholder="Гарчиг"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Input
            placeholder="Дэд гарчиг"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
          />
          <Input
            placeholder="Линк"
            value={link}
            onChange={(e) => setLink(e.target.value)}
          />

          {/* 📍 Байрлал сонгох */}
          <div className="relative z-10">
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Байрлал
            </label>
            <Select value={position} onValueChange={setPosition}>
              <SelectTrigger className="w-full mt-1 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition">
                <SelectValue placeholder="Байрлал сонгох" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden">
                <SelectItem value="top" className="hover:bg-teal-50 dark:hover:bg-gray-800 px-3 py-2 transition">
                  ⬆️ Top
                </SelectItem>
                <SelectItem value="bottom" className="hover:bg-teal-50 dark:hover:bg-gray-800 px-3 py-2 transition">
                  ⬇️ Bottom
                </SelectItem>
                <SelectItem value="left" className="hover:bg-teal-50 dark:hover:bg-gray-800 px-3 py-2 transition">
                  ⬅️ Left
                </SelectItem>
                <SelectItem value="right" className="hover:bg-teal-50 dark:hover:bg-gray-800 px-3 py-2 transition">
                  ➡️ Right
                </SelectItem>
                <SelectItem value="center" className="hover:bg-teal-50 dark:hover:bg-gray-800 px-3 py-2 transition">
                  🎯 Center
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 🟢 Идэвхтэй Switch */}
          <div className="flex items-center justify-between mt-4">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Идэвхтэй төлөв
            </label>
            <div className="relative z-0">
              <Switch
                checked={isActive}
                onCheckedChange={setIsActive}
                className={cn(
                  "transition-all duration-200 data-[state=checked]:bg-teal-500 data-[state=unchecked]:bg-gray-300",
                  "focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
                )}
              />
            </div>
          </div>

          {/* 🖼 Зураг */}
          <div>
            <label className="text-sm text-gray-600">Зураг</label>
            <div className="flex items-center gap-3 mt-2">
              <label className="flex items-center gap-2 text-teal-600 cursor-pointer hover:text-teal-700">
                <ImageIcon size={18} />
                <span>Файл сонгох</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setImage(file);
                      setPreview(URL.createObjectURL(file));
                    }
                  }}
                />
              </label>
              {preview && (
                <img
                  src={preview}
                  alt="preview"
                  className="w-24 h-16 object-cover rounded-md border"
                />
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={onClose}>
            Болих
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={saving}
            className="bg-teal-600 hover:bg-teal-700 text-white"
          >
            {saving ? "Хадгалж байна..." : "💾 Хадгалах"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}