"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { toast } from "sonner";
import { Search, Trash2, Star, CheckCircle, XCircle, Plus, Edit3 } from "lucide-react";
import { AnimatedConfirmDialog } from "@/components/ui/AnimatedConfirmDialog";
import Loader from "@/components/Loader";

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(1);
  const router = useRouter();

  // ✅ Fetch posts + categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          toast.error("Нэвтрэх шаардлагатай!");
          return;
        }

        const [postRes, catRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_BASE}/admin/posts`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${process.env.NEXT_PUBLIC_API_BASE}/admin/categories`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const [postData, catData] = await Promise.all([
          postRes.json(),
          catRes.json(),
        ]);

        if (postRes.ok) {
          // API нь массив хэлбэртэй хариу ирүүлдэг тул нөхцөлөөр шалгаж онооно
          const postsArray = Array.isArray(postData)
            ? postData
            : postData.posts || [];
          setPosts(postsArray);
          console.log(postData)
        } else {
          toast.error(postData.message || "Мэдээ татахад алдаа гарлаа");
        }

        if (catRes.ok) {
        const catsArray = Array.isArray(catData)
          ? catData
          : catData.categories || [];
        setCategories(catsArray);
      }
      } catch (err) {
        console.error(err);
        toast.error("Сервертэй холбогдож чадсангүй.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ✅ Filter + Pagination
  const filtered = useMemo(() => {
    return posts
      .filter((p) => {
        const titleMatch = p.title?.toLowerCase().includes(query.toLowerCase());
        const authorMatch = p.author?.fullName
          ?.toLowerCase()
          .includes(query.toLowerCase());
        const categoryMatch =
          selectedCategory === "all" ||
          p.category?._id === selectedCategory ||
          p.category?.name?.toLowerCase() === selectedCategory.toLowerCase();

        return (titleMatch || authorMatch) && categoryMatch;
      })
      .slice((page - 1) * rowsPerPage, page * rowsPerPage);
  }, [posts, query, selectedCategory, page, rowsPerPage]);

  const totalPages = Math.ceil(
    posts.filter((p) => {
      const titleMatch = p.title?.toLowerCase().includes(query.toLowerCase());
      const authorMatch = p.author?.fullName
        ?.toLowerCase()
        .includes(query.toLowerCase());
      const categoryMatch =
        selectedCategory === "all" ||
        p.category?._id === selectedCategory ||
        p.category?.name?.toLowerCase() === selectedCategory.toLowerCase();
      return (titleMatch || authorMatch) && categoryMatch;
    }).length / rowsPerPage
  );

  // ✅ Approve or Reject
  const handleApproval = async (id: string, approve: boolean) => {
    const token = localStorage.getItem("token");
    if (!token) return toast.error("Token not found!");

    try {
      const endpoint = approve ? "approve" : "reject";
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE}/admin/posts/${id}/${endpoint}`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();

      if (res.ok) {
        toast.success(data.message);
        setPosts((prev) =>
          prev.map((p) => (p._id === id ? { ...p, isApproved: approve } : p))
        );
      } else toast.error(data.message || "Алдаа гарлаа");
    } catch (err) {
      console.error("❌ Approval error:", err);
      toast.error("Серверийн холболтын алдаа");
    }
  };

  // ✅ Delete
  const handleDelete = async (id: string) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE}/admin/posts/${id}`,
        { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();

      if (res.ok) {
        toast.success("Мэдээ устлаа!");
        setPosts((prev) => prev.filter((p) => p._id !== id));
      } else toast.error(data.message || "Устгах үед алдаа гарлаа.");
    } catch (err) {
      console.error("❌ Delete error:", err);
      toast.error("Серверийн алдаа.");
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center w-full m-auto h-full">
        <Loader />
      </div>

    );

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-5">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          📰 Мэдээний жагсаалт
        </h2>
        <Button
          className="bg-teal-600 hover:bg-teal-700 text-white flex items-center gap-2"
          onClick={() => router.push("/admin/posts/new")}
        >
          <Plus size={16} /> Шинэ мэдээ оруулах
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        {/* Search */}
        <div className="relative w-full sm:max-w-xs">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <Input
            placeholder="Гарчиг эсвэл зохиогчоор хайх..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            className="pl-9"
          />
        </div>

        {/* Category filter */}
        <Select
          value={selectedCategory}
          onValueChange={(val) => {
            setSelectedCategory(val);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Бүх ангилал" />
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-gray-800">
            <SelectItem value="all">Бүх ангилал</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat._id} value={cat._id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Нүүр зураг</TableHead>
              <TableHead>Гарчиг</TableHead>
              <TableHead>Ангилал</TableHead>
              <TableHead>Зохиогч</TableHead>
              <TableHead>EditorPick</TableHead>
              <TableHead>Төлөв</TableHead>
              <TableHead>Огноо</TableHead>
              <TableHead>Үйлдэл</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filtered.length > 0 ? (
              filtered.map((post) => (
                <TableRow key={post._id}>
                  <TableCell>
                    <img
                      src={post.image || "/default-news.png"}
                      alt={post.title}
                      className="w-24 h-16 object-cover rounded-md border"
                    />
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <div className="font-medium line-clamp-2">{post.title}</div>
                  </TableCell>
                  <TableCell>{post.category?.name || "—"}</TableCell>
                  <TableCell>{post.author?.fullName || "—"}</TableCell>

                  <TableCell>
                    {post.isEditorPick ? (
                      <div className="flex items-center text-yellow-600">
                        <Star size={16} className="mr-1 fill-yellow-400" /> Тийм
                      </div>
                    ) : (
                      <span className="text-gray-400">Үгүй</span>
                    )}
                  </TableCell>

                  <TableCell>
                    {post.isApproved ? (
                      <span className="bg-green-100 text-green-700 px-2 py-0.5 text-xs rounded-full">
                        Батлагдсан
                      </span>
                    ) : (
                      <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 text-xs rounded-full">
                        Хүлээгдэж буй
                      </span>
                    )}
                  </TableCell>

                  <TableCell>
                    {new Date(post.createdAt).toLocaleDateString("mn-MN")}
                  </TableCell>

                  {/* ✅ Actions */}
                  <TableCell className="flex gap-2">
                    {/* ✏️ Засах */}
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => router.push(`/admin/posts/edit/${post._id}`)}
                    >
                      <Edit3 size={16} className="text-blue-600" />
                    </Button>

                    {/* ✅ Баталгаажуулах / Цуцлах */}
                    {!post.isApproved ? (
                      <>
                        <Button
                          size="icon"
                          variant="outline"
                          className="hover:bg-green-50"
                          onClick={() => handleApproval(post._id, true)}
                        >
                          <CheckCircle size={16} className="text-green-600" />
                        </Button>
                        <Button
                          size="icon"
                          variant="outline"
                          className="hover:bg-red-50"
                          onClick={() => handleApproval(post._id, false)}
                        >
                          <XCircle size={16} className="text-red-500" />
                        </Button>
                      </>
                    ) : (
                      <Button
                        size="icon"
                        variant="outline"
                        className="hover:bg-yellow-50"
                        onClick={() => handleApproval(post._id, false)}
                      >
                        <XCircle size={16} className="text-yellow-600" />
                      </Button>
                    )}

                    {/* 🗑️ Устгах */}
                    <AnimatedConfirmDialog
                      triggerButton={
                        <Button variant="outline" size="icon">
                          <Trash2 size={16} color="red" />
                        </Button>
                      }
                      title="Мэдээ устгах"
                      description={`"${post.title}" мэдээг устгах уу?`}
                      onConfirm={() => handleDelete(post._id)}
                      danger
                    />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-6 text-gray-500">
                  Мэдээ олдсонгүй.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* ✅ Pagination */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mt-6 text-sm text-gray-500">
        <div className="flex items-center gap-2">
          <span>Хуудаслалт:</span>
          <Select
            value={rowsPerPage.toString()}
            onValueChange={(val) => {
              setRowsPerPage(parseInt(val));
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[80px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-800">
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            ‹
          </Button>
          <span>
            {page} / {totalPages || 1}
          </span>
          <Button
            variant="ghost"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            ›
          </Button>
        </div>
      </div>
    </div>
  );
}
