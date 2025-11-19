"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { getColumns } from "@/components/admin/users/columns"; // 👈 өмнөх columns.tsx
import { Shield, Trash2, Search, Facebook } from "lucide-react";
import { AnimatedConfirmDialog } from "@/components/ui/AnimatedConfirmDialog";
import Loader from "@/components/Loader";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(1);

  // ✅ Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/admin/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) {
          setUsers(data.users || []);
        } else toast.error(data.message);
      } catch (err) {
        console.error("❌ Users fetch error:", err);
        toast.error("Сервертэй холбогдож чадсангүй.");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // ✅ Filtered users (search + role)
  const filtered = useMemo(() => {
    return users
      .filter(
        (u) =>
          (u.firstName?.toLowerCase().includes(query.toLowerCase()) ||
            u.email?.toLowerCase().includes(query.toLowerCase())) &&
          (roleFilter === "all" || u.role === roleFilter)
      )
      .slice((page - 1) * rowsPerPage, page * rowsPerPage);
  }, [users, query, roleFilter, page, rowsPerPage]);

  const totalPages = Math.ceil(
    users.filter(
      (u) =>
        (u.firstName?.toLowerCase().includes(query.toLowerCase()) ||
          u.email?.toLowerCase().includes(query.toLowerCase())) &&
        (roleFilter === "all" || u.role === roleFilter)
    ).length / rowsPerPage
  );

  // ✅ Delete user
  const handleDelete = async (id: string) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/admin/users/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (res.ok) {
      setUsers(users.filter((u) => u._id !== id));
      toast.success("Хэрэглэгч устгалаа!");
    } else toast.error(data.message);
  };

  // ✅ Toggle role
  const handleRoleToggle = async (id: string, currentRole: string) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/admin/users/${id}/role`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        role: currentRole === "admin" ? "user" : "admin",
      }),
    });
    const data = await res.json();
    if (res.ok) {
      setUsers(
        users.map((u) =>
          u._id === id ? { ...u, role: currentRole === "admin" ? "user" : "admin" } : u
        )
      );
      toast.success("Role амжилттай шинэчлэгдлээ");
    } else toast.error(data.message);
  };

  if (loading)
    return (
      <div className="flex justify-center items-center w-full m-auto h-full">
        <Loader />
      </div>
    );

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-5 flex items-center gap-2">
        👥 Хэрэглэгчийн жагсаалт
      </h2>

      {/* 🔍 Search + Filter row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        {/* Search */}
        <div className="relative w-full sm:max-w-xs">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <Input
            placeholder="Нэр эсвэл имэйлээр хайх..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            className="pl-9"
          />
        </div>

        {/* Role filter */}
        <div className="flex items-center gap-2">
          <Select
            value={roleFilter}
            onValueChange={(val) => {
              setRoleFilter(val);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Role filter" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="all">Бүх хэрэглэгч</SelectItem>
              <SelectItem value="admin">Админ</SelectItem>
              <SelectItem value="user">Хэрэглэгч</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 📋 Table */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Хэрэглэгч</TableHead>
              <TableHead>Утас</TableHead>
              <TableHead>Facebook</TableHead>
              <TableHead>Мэдээний тоо</TableHead>
              <TableHead>Эрх</TableHead>
              <TableHead>Бүртгэл</TableHead>
              <TableHead>Үйлдэл</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length > 0 ? (
              filtered.map((user) => (
                <TableRow key={user._id}>
                  <TableCell className="flex items-center gap-3">
                    <img
                      src={user.profileImage || "/default-avatar.png"}
                      className="w-10 h-10 rounded-full object-cover border"
                      alt="profile"
                    />
                    <div>
                      <p className="font-medium">
                        {user.fullName}
                      </p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>{user.contact?.phone || "—"}</TableCell>
                  <TableCell>
                    {user.contact?.facebook ? (
                      <a
                        href={user.contact.facebook}
                        target="_blank"
                        className="text-blue-600 hover:underline"
                      >
                        <Facebook />
                      </a>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell>{user.posts?.length ?? 0}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-md text-xs font-medium ${
                        user.role === "admin"
                          ? "bg-teal-100 text-teal-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {user.role}
                    </span>
                  </TableCell>
                  <TableCell>
                    {new Date(user.createdAt).toLocaleDateString("mn-MN")}
                  </TableCell>
                  <TableCell>
                    <AnimatedConfirmDialog
                      triggerButton={
                        <Button variant="outline" size="icon">
                          <Shield size={16} />
                        </Button>
                      }
                      title="Эрх өөрчлөх"
                      description={`Та ${user.fullName}-ийн эрхийг ${
                        user.role === "admin" ? "user" : "admin"
                      } болгох уу?`}
                      onConfirm={() => handleRoleToggle(user._id, user.role)}
                    />
                    <AnimatedConfirmDialog
                      triggerButton={
                        <Button variant="outline" size="icon" className="ml-2">
                          <Trash2 size={16} color="red"/>
                        </Button>
                      }
                      title="Хэрэглэгч устгах"
                      description={`Та ${user.fullName}-ийг устгахдаа итгэлтэй байна уу?`}
                      onConfirm={() => handleDelete(user._id)}
                      danger
                    />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-6 text-gray-500">
                  Хэрэглэгч олдсонгүй.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* 📄 Pagination */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mt-5 text-sm text-gray-500">
        <div className="flex items-center gap-2">
          <span>Rows per page:</span>
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
            <SelectContent className="bg-white">
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Pagination controls */}
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