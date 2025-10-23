"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, Trash2, Facebook } from "lucide-react";
import { AnimatedConfirmDialog } from "@/components/ui/AnimatedConfirmDialog";

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  contact?: { facebook?: string; phone?: string  };
  profileImage?: string;
  posts?: any[];
  role: string;
  createdAt: string;
}

interface ColumnProps {
  onDelete: (id: string) => void;
  onRoleToggle: (id: string, role: string) => void;
}

export const getColumns = ({ onDelete, onRoleToggle }: ColumnProps): ColumnDef<User>[] => [
  {
    accessorKey: "profileImage",
    header: "Зураг",
    cell: ({ row }) => (
      <img
        src={row.original.profileImage || "/default-avatar.png"}
        alt="avatar"
        className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-gray-700"
      />
    ),
  },
  {
    accessorKey: "firstName",
    header: "Хэрэглэгч",
    cell: ({ row }) => (
      <div>
        <div className="font-medium text-gray-900 dark:text-gray-100">
          {row.original.firstName} {row.original.lastName}
        </div>
        <div className="text-xs text-gray-500">{row.original.email}</div>
      </div>
    ),
  },
  {
    accessorKey: "phone",
    header: "Утас",
    cell: ({ row }) => (
      <span className="text-sm text-gray-600 dark:text-gray-400">
        {row.original.contact?.phone || "—"}
      </span>
    ),
  },
  {
    accessorKey: "facebook",
    header: "Facebook",
    cell: ({ row }) =>
      row.original.contact?.facebook ? (
        <a
          href={row.original.contact.facebook}
          target="_blank"
          rel="noreferrer"
          className="text-blue-600 hover:underline flex items-center gap-1"
        >
          <Facebook size={15} /> <span className="hidden sm:inline">View</span>
        </a>
      ) : (
        <span className="text-gray-400">—</span>
      ),
  },
  {
    accessorKey: "posts",
    header: "Мэдээний тоо",
    cell: ({ row }) => (
      <span className="text-sm font-medium">
        {row.original.posts?.length ?? 0}
      </span>
    ),
  },
  {
    accessorKey: "role",
    header: "Эрх",
    cell: ({ row }) => (
      <Badge
        variant={row.original.role === "admin" ? "default" : "secondary"}
        className="capitalize"
      >
        {row.original.role}
      </Badge>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Бүртгэл",
    cell: ({ row }) => (
      <span className="text-xs text-gray-500">
        {new Date(row.original.createdAt).toLocaleDateString("mn-MN")}
      </span>
    ),
  },
  {
    id: "actions",
    header: "Үйлдэл",
    cell: ({ row }) => (
      <div className="flex gap-2">
        {/* 🛡 Role change */}
        <AnimatedConfirmDialog
          triggerButton={
            <Button variant="outline" size="icon">
              <Shield size={16} />
            </Button>
          }
          title="Эрх өөрчлөх"
          description={`Та ${row.original.firstName}-ийн эрхийг ${
            row.original.role === "admin" ? "user" : "admin"
          } болгох уу?`}
          confirmText="Тийм"
          cancelText="Болих"
          onConfirm={() =>
            onRoleToggle(row.original._id, row.original.role)
          }
        />

        {/* 🗑 Delete */}
        <AnimatedConfirmDialog
          triggerButton={
            <Button variant="outline" size="icon">
              <Trash2 size={16} color="red"/>
            </Button>
          }
          title="Хэрэглэгч устгах"
          description={`Та ${row.original.firstName}-ийг бүр мөсөн устгахдаа итгэлтэй байна уу?`}
          confirmText="Устгах"
          cancelText="Болих"
          onConfirm={() => onDelete(row.original._id)}
          danger
        />
      </div>
    ),
  },
];