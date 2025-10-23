"use client";

import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Plus, Search, Trash2, Edit3, Loader2 } from "lucide-react";
import { AnimatedConfirmDialog } from "@/components/ui/AnimatedConfirmDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

type Cat = { _id: string; name: string; slug: string; color?: string };

const slugify = (txt: string) =>
  txt
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/(^-|-$)/g, "");

export default function AdminCategoriesPage() {
  const [cats, setCats] = useState<Cat[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [openForm, setOpenForm] = useState<null | { mode: "add" } | { mode: "edit"; cat: Cat }>(null);
  const [saving, setSaving] = useState(false);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // ✅ Fetch categories
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/admin/categories`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) setCats(data.categories || []);
        else toast.error(data.message || "Ангилал татахад алдаа гарлаа");
      } catch {
        toast.error("Сервертэй холбогдоогүй");
      } finally {
        setLoading(false);
      }
    };
    fetchCats();
  }, [token]);

  // ✅ Filter
  const filtered = useMemo(
    () =>
      cats.filter(
        (c) =>
          c.name.toLowerCase().includes(query.toLowerCase()) ||
          c.slug.toLowerCase().includes(query.toLowerCase())
      ),
    [cats, query]
  );

  // ✅ Save category
  const saveCategory = async (payload: Partial<Cat>, id?: string) => {
    setSaving(true);
    const method = id ? "PATCH" : "POST";
    const url = id
      ? `${process.env.NEXT_PUBLIC_API_BASE}/admin/categories/${id}`
      : `${process.env.NEXT_PUBLIC_API_BASE}/admin/categories`;

    const res = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    setSaving(false);

    if (!res.ok) {
      toast.error(data.message || "Алдаа гарлаа");
      return;
    }

    if (id) {
      setCats((prev) => prev.map((c) => (c._id === id ? data.category : c)));
      toast.success("Ангилал шинэчлэгдлээ ✅");
    } else {
      setCats((prev) => [data.category, ...prev]);
      toast.success("Ангилал нэмэгдлээ ✅");
    }

    setOpenForm(null);
  };

  // ✅ Delete category
  const deleteCat = async (id: string) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/admin/categories/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (res.ok) {
      setCats((prev) => prev.filter((c) => c._id !== id));
      toast.success("Амжилттай устгалаа ✅");
    } else toast.error(data.message || "Алдаа гарлаа");
  };

  return (
    <div className="p-6">
      <div className="mb-5 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <h2 className="text-xl font-semibold">🏷️ Ангиллын удирдлага</h2>
        <div className="flex gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Нэр / slug хайх..."
              className="pl-9 w-64"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <Button onClick={() => setOpenForm({ mode: "add" })}>
            <Plus className="mr-2 h-4 w-4" /> Шинэ ангилал
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Өнгө</TableHead>
              <TableHead>Нэр</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead className="text-right">Үйлдэл</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="py-10 text-center text-gray-500">
                  Уншиж байна...
                </TableCell>
              </TableRow>
            ) : filtered.length ? (
              filtered.map((c) => (
                <TableRow key={c._id}>
                  <TableCell className="w-10">
                    <span
                      className="inline-block h-5 w-5 rounded-full border"
                      style={{ backgroundColor: c.color || "#147364" }}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell className="text-gray-500">{c.slug}</TableCell>
                  <TableCell className="text-right flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setOpenForm({ mode: "edit", cat: c })}
                      title="Засах"
                    >
                      <Edit3 size={16} />
                    </Button>
                    <AnimatedConfirmDialog
                      triggerButton={
                        <Button variant="outline" size="icon" title="Устгах">
                          <Trash2 size={16} className="text-red-500" />
                        </Button>
                      }
                      title="Ангилал устгах"
                      description={`"${c.name}" ангиллыг устгах уу?`}
                      onConfirm={() => deleteCat(c._id)}
                      danger
                    />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="py-8 text-center text-gray-500">
                  Ангилал олдсонгүй.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* 🧩 Add/Edit Modal */}
      <Dialog open={!!openForm} onOpenChange={() => setOpenForm(null)}>
        <DialogContent
          className="
      m-auto max-w-md rounded-xl border
    bg-white dark:bg-gray-900
    p-6 shadow-xl
    data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95
    data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95
    "
        >
          <DialogHeader>
            <DialogTitle>
              {openForm?.mode === "add" ? "Шинэ ангилал" : "Ангилал засах"}
            </DialogTitle>
          </DialogHeader>

          <CategoryForm
            mode={openForm?.mode || "add"}
            initial={openForm?.mode === "edit" ? openForm.cat : undefined}
            onSubmit={saveCategory}
            saving={saving}
          />

          <DialogFooter className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpenForm(null)}>
              Болих
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* 🧩 CategoryForm */
function CategoryForm({
  mode,
  initial,
  onSubmit,
  saving,
}: {
  mode: "add" | "edit";
  initial?: Cat;
  saving: boolean;
  onSubmit: (data: Partial<Cat>, id?: string) => void;
}) {
  const [name, setName] = useState(initial?.name || "");
  const [slug, setSlug] = useState(initial?.slug || "");
  const [color, setColor] = useState(initial?.color || "#009688");

  useEffect(() => {
    if (!initial && !slug.trim()) setSlug(slugify(name));
  }, [name]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ name, slug, color }, initial?._id);
      }}
      className="space-y-4 mt-2"
    >
      <div>
        <Label>Нэр</Label>
        <Input
          placeholder="Жишээ: Улс төр"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div>
        <Label>Slug</Label>
        <Input
          placeholder="uls-tur"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
        />
        {name && !initial && (
          <p className="text-xs text-gray-500 mt-1">→ Автомат slug: {slugify(name)}</p>
        )}
      </div>

      <div className="flex items-center justify-between">
        <Label>Өнгө</Label>
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="h-9 w-12 rounded border p-0 cursor-pointer"
        />
      </div>

      <Button type="submit" disabled={saving} className="w-full">
        {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        {saving ? "Хадгалж байна..." : mode === "add" ? "Нэмэх" : "Шинэчлэх"}
      </Button>
    </form>
  );
}