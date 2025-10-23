"use client";

import { useEffect, useState, useMemo } from "react";
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
import { Search, Trash2, CheckCircle, XCircle } from "lucide-react";
import { AnimatedConfirmDialog } from "@/components/ui/AnimatedConfirmDialog";
import { EditPostDialog } from "@/components/admin/EditPostDialog";

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");

  // ✅ Fetch Posts + Categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          toast.error("Нэвтрэх шаардлагатай!");
          return;
        }

        const [postRes, catRes] = await Promise.all([
          fetch(
            `${process.env.NEXT_PUBLIC_API_BASE}/admin/posts?status=${statusFilter}`,
            { headers: { Authorization: `Bearer ${token}` } }
          ),
          fetch(`${process.env.NEXT_PUBLIC_API_BASE}/admin/categories`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (postRes.headers.get("content-type")?.includes("text/html")) {
          throw new Error("Invalid response (HTML received instead of JSON)");
        }

        const [postData, catData] = await Promise.all([
          postRes.json(),
          catRes.json(),
        ]);

        if (postRes.ok) setPosts(postData.posts || []);
        else toast.error(postData.message || "Мэдээ татахад алдаа гарлаа");

        if (catRes.ok) setCategories(catData.categories || []);
        else toast.error(catData.message || "Ангилал татахад алдаа гарлаа");
      } catch (err) {
        console.error("❌ Fetch error:", err);
        toast.error("Сервертэй холбогдож чадсангүй.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [statusFilter]);

  // ✅ Filter + Search
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

  // ✅ Delete post
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
      <div className="flex items-center justify-center min-h-[60vh] text-gray-500">
        Мэдээ татаж байна...
      </div>
    );

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-5 flex items-center gap-2">
        📰 Мэдээний жагсаалт
      </h2>

      {/* 🔍 Filter row */}
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

        {/* Category + Status filter */}
        <div className="flex items-center gap-2">
          <Select
            value={selectedCategory}
            onValueChange={(val) => {
              setSelectedCategory(val);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Ангилал" />
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

          <Select
            value={statusFilter}
            onValueChange={(val) => setStatusFilter(val)}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Төлөв" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-800">
              <SelectItem value="all">Бүх мэдээ</SelectItem>
              <SelectItem value="pending">Хүлээгдэж буй</SelectItem>
              <SelectItem value="approved">Батлагдсан</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 📋 Table */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Зураг</TableHead>
              <TableHead>Гарчиг</TableHead>
              <TableHead>Ангилал</TableHead>
              <TableHead>Зохиогч</TableHead>
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
                      className="w-28 h-20 object-cover rounded-md border"
                    />
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <div className="font-medium line-clamp-2">{post.title}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {post.likes?.length || 0} лайк ·{" "}
                      {post.comments?.length || 0} сэтгэгдэл
                    </div>
                  </TableCell>
                  <TableCell>{post.category?.name || "—"}</TableCell>
                  <TableCell>{post.author?.fullName || "—"}</TableCell>
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
                  <TableCell className="flex gap-2">
                    {!post.isApproved && (
                      <>
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => handleApproval(post._id, true)}
                        >
                          <CheckCircle
                            size={16}
                            className="text-green-600 hover:text-green-700"
                          />
                        </Button>
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => handleApproval(post._id, false)}
                        >
                          <XCircle
                            size={16}
                            className="text-red-500 hover:text-red-600"
                          />
                        </Button>
                      </>
                    )}

                    <EditPostDialog
                      post={post}
                      categories={categories}
                      onSave={(updated) =>
                        setPosts((p) =>
                          p.map((x) => (x._id === updated._id ? updated : x))
                        )
                      }
                    />

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
                <TableCell colSpan={7} className="text-center py-6 text-gray-500">
                  Мэдээ олдсонгүй.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* ✅ Pagination */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mt-5 text-sm text-gray-500">
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