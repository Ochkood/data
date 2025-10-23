"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { Bold, Italic, ImageIcon, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TipTapEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: true }),
      Image.configure({ inline: true }),
      Placeholder.configure({
        placeholder: "Мэдээний агуулгаа энд бичнэ үү...",
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    immediatelyRender: false, // ✅ SSR hydration зөрчилөөс сэргийлнэ
  });

  if (!editor) return null;

  // 🖼️ Зураг upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "YOUR_CLOUDINARY_PRESET");
    formData.append("folder", "posts");

    const res = await fetch(
      "https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/image/upload",
      { method: "POST", body: formData }
    );
    const data = await res.json();
    if (data.secure_url) {
      editor.chain().focus().setImage({ src: data.secure_url }).run();
    }
  };

  return (
    <div className="border border-gray-300 dark:border-gray-700 rounded-lg">
      {/* Toolbar */}
      <div className="flex items-center gap-2 p-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive("bold") ? "bg-gray-200 dark:bg-gray-700" : ""}
        >
          <Bold size={16} />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive("italic") ? "bg-gray-200 dark:bg-gray-700" : ""}
        >
          <Italic size={16} />
        </Button>
        <Button variant="ghost" size="sm" asChild>
          <label className="cursor-pointer flex items-center gap-1">
            <ImageIcon size={16} />
            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          </label>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            const url = prompt("Enter link:");
            if (url) editor.chain().focus().setLink({ href: url }).run();
          }}
        >
          <LinkIcon size={16} />
        </Button>
      </div>

      {/* Editor area */}
      <EditorContent
        editor={editor}
        className="min-h-[300px] p-4 focus:outline-none prose dark:prose-invert max-w-none"
      />
    </div>
  );
}