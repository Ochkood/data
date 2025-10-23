"use client";

import { useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Placeholder from "@tiptap/extension-placeholder";
import Heading from "@tiptap/extension-heading";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Iframe from "@/extensions/Iframe";
import CharacterCount from "@tiptap/extension-character-count";
import { lowlight } from "lowlight";
import js from "highlight.js/lib/languages/javascript";
import xml from "highlight.js/lib/languages/xml";
import css from "highlight.js/lib/languages/css";
import FloatingImageMenu from "./FloatingImageMenu";

import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Highlighter,
  Link as LinkIcon,
  ImageIcon,
  Quote,
  Code2,
  RotateCcw,
  RotateCw,
  Heading1,
  Heading2,
  Heading3,
  Youtube,
  Eraser,
  Loader2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  ChevronDown,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

lowlight.registerLanguage("js", js);
lowlight.registerLanguage("html", xml);
lowlight.registerLanguage("css", css);

// 🧭 Cloudinary config
const CLOUD_NAME = "dgwzf6ijf";
const UPLOAD_PRESET = "content_image";

export default function SimpleEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadVisible, setUploadVisible] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false, heading: false }),
      Heading.configure({ levels: [1, 2, 3] }),
      CodeBlockLowlight.configure({ lowlight }),
      Link.configure({ openOnClick: false }),
      Image.configure({
        HTMLAttributes: { class: "rounded-lg my-3 p-2" },
      }),
      TextStyle,
      Color.configure({ types: ["textStyle"] }),
      Highlight,
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Iframe.configure({
        allowFullscreen: true,
        HTMLAttributes: {
          class:
            "rounded-lg my-2 w-full aspect-video border border-gray-300 dark:border-gray-700",
        },
      }),
      CharacterCount.configure(),
      Placeholder.configure({
        placeholder: "✏️ Энд мэдээний агуулгаа бичнэ үү...",
      }),
    ],
    content: value,
    immediatelyRender: false,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  if (!editor) return null;

  // ☁️ Cloudinary upload
  const uploadToCloudinary = async (file: File): Promise<string | null> => {
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", UPLOAD_PRESET);
      formData.append("folder", "posts");

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        { method: "POST", body: formData }
      );
      const data = await res.json();
      setUploading(false);
      return data.secure_url || null;
    } catch (err) {
      setUploading(false);
      console.error("❌ Upload error:", err);
      return null;
    }
  };

  // 🖼 handle upload
  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const url = await uploadToCloudinary(file);
    setUploading(false);
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
      setUploadVisible(false);
    }
  };

  const addVideo = () => {
    const url = prompt("🎬 YouTube эсвэл Vimeo линк оруулна уу:");
    if (!url) return;
    const embed = url.includes("watch?v=")
      ? url.replace("watch?v=", "embed/")
      : url;
    editor.chain().focus().setIframe({ src: embed }).run();
  };

  const removeFormatting = () =>
    editor.chain().focus().unsetAllMarks().clearNodes().run();

  const wordCount = editor.storage.characterCount?.words() || 0;
  const characterCount = editor.storage.characterCount?.characters() || 0;

  // 🧱 Upload Modal drag/drop
  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setUploading(true);
      const url = await uploadToCloudinary(file);
      setUploading(false);
      if (url) {
        editor.chain().focus().setImage({ src: url }).run();
        setUploadVisible(false);
      }
    }
  };

  return (
    <div className="border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 shadow-sm overflow-hidden relative">
      {/* 🧰 Toolbar */}
      <div className="sticky top-0 z-10 flex flex-wrap items-center gap-1 p-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 backdrop-blur-sm">
        <Button size="sm" variant="ghost" onClick={() => editor.chain().focus().undo().run()}>
          <RotateCcw size={16} />
        </Button>
        <Button size="sm" variant="ghost" onClick={() => editor.chain().focus().redo().run()}>
          <RotateCw size={16} />
        </Button>

        {/* Headings */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="outline" className="flex items-center gap-0">
              H <ChevronDown size={14} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="bg-white">
            <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
              <Heading1 size={14} className="mr-2" /> Heading 1
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
              <Heading2 size={14} className="mr-2" /> Heading 2
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
              <Heading3 size={14} className="mr-2" /> Heading 3
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Formatting */}
        <Button size="sm" variant={editor.isActive("bold") ? "secondary" : "ghost"} onClick={() => editor.chain().focus().toggleBold().run()}>
          <Bold size={16} />
        </Button>
        <Button size="sm" variant={editor.isActive("italic") ? "secondary" : "ghost"} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <Italic size={16} />
        </Button>
        <Button size="sm" variant={editor.isActive("underline") ? "secondary" : "ghost"} onClick={() => editor.chain().focus().toggleUnderline().run()}>
          <UnderlineIcon size={16} />
        </Button>

        {/* Align */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="outline" className="flex items-center gap-0">
              Align <ChevronDown size={14} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="bg-white">
            <DropdownMenuItem onClick={() => editor.chain().focus().setTextAlign("left").run()}>
              <AlignLeft size={14} className="mr-2" /> Left
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => editor.chain().focus().setTextAlign("center").run()}>
              <AlignCenter size={14} className="mr-2" /> Center
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => editor.chain().focus().setTextAlign("right").run()}>
              <AlignRight size={14} className="mr-2" /> Right
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => editor.chain().focus().setTextAlign("justify").run()}>
              <AlignJustify size={14} className="mr-2" /> Justify
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Color / Highlight */}
        <Button size="sm" variant="ghost" asChild>
          <label className="cursor-pointer flex items-center gap-1">
            🎨
            <input
              type="color"
              onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
              className="w-6 h-6 border-none bg-transparent cursor-pointer"
            />
          </label>
        </Button>
        <Button size="sm" variant="ghost" onClick={() => editor.chain().focus().toggleHighlight({ color: "#FFF59D" }).run()}>
          <Highlighter size={16} />
        </Button>
        <Button size="sm" variant="ghost" onClick={removeFormatting}>
          <Eraser size={16} />
        </Button>

        {/* 🖼 Image (open modal) */}
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setUploadVisible(true)}
        >
          {uploading ? (
            <Loader2 size={16} className="animate-spin text-teal-600" />
          ) : (
            <ImageIcon size={16} />
          )}
        </Button>

        {/* Video / Link / Quote / Code */}
        <Button size="sm" variant="ghost" onClick={addVideo}>
          <Youtube size={16} />
        </Button>
        <Button size="sm" variant="ghost" onClick={() => {
          const url = prompt("🔗 Холбоос хаяг оруулна уу:");
          if (url) editor.chain().focus().setLink({ href: url }).run();
        }}>
          <LinkIcon size={16} />
        </Button>
        <Button size="sm" variant="ghost" onClick={() => editor.chain().focus().toggleBlockquote().run()}>
          <Quote size={16} />
        </Button>
        <Button size="sm" variant="ghost" onClick={() => editor.chain().focus().toggleCodeBlock().run()}>
          <Code2 size={16} />
        </Button>
      </div>

      {/* ✏️ Editor */}
      <div className="relative p-4 min-h-[500px]">
        <FloatingImageMenu editor={editor} onReplace={uploadToCloudinary} />
        <EditorContent editor={editor} />
      </div>

      {/* 📦 Upload modal */}
      {uploadVisible && (
        <div
          className="absolute inset-0 bg-black/30 flex items-center justify-center z-50"
          onClick={() => setUploadVisible(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="bg-white dark:bg-gray-900 border-2 border-dashed border-teal-500 rounded-lg p-6 w-[380px] flex flex-col items-center justify-center text-center shadow-xl"
          >
            {uploading ? (
              <div className="flex flex-col items-center gap-2 text-gray-500 dark:text-gray-300">
                <Loader2 size={24} className="animate-spin text-teal-500" />
                <p className="text-sm font-medium">Uploading image...</p>
              </div>
            ) : (
              <>
                <ImageIcon size={32} className="text-teal-500 mb-2" />
                <p className="text-sm font-medium">
                  <span className="text-teal-600 underline cursor-pointer" 
                  onClick={() => document.getElementById("uploadInput")?.click()} // ✅ энэ мөрийг нэм
                  >
                    Click to upload
                  </span>{" "}
                  or drag and drop
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Maximum 3 files, 5MB each.
                </p>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  id="uploadInput"
                  onChange={handleImageSelect}
                />
              </>
            )}
          </div>
        </div>
      )}

      {/* 📊 Stats */}
      <div className="text-xs text-gray-500 dark:text-gray-400 px-4 pb-2 flex justify-between">
        <span>{wordCount} үг</span>
        <span>{characterCount} тэмдэгт</span>
      </div>
    </div>
  );
}