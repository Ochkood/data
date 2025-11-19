"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Placeholder from "@tiptap/extension-placeholder";
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
import FontSize from "@/extensions/FontSize";
import BulletList from "@tiptap/extension-bullet-list";
import ListItem from "@tiptap/extension-list-item";
import FontFamily from "@tiptap/extension-font-family";
import HorizontalRule from "@tiptap/extension-horizontal-rule";

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
  Youtube,
  Eraser,
  Loader2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  ChevronDown,
  MoreHorizontal,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

// 🧩 highlight.js setup
lowlight.registerLanguage("js", js);
lowlight.registerLanguage("html", xml);
lowlight.registerLanguage("css", css);

// ☁️ Cloudinary config
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
      CodeBlockLowlight.configure({ lowlight }),
      Link.configure({ openOnClick: false }),
      Image.configure({
        HTMLAttributes: { class: "rounded-lg my-3 p-2" },
      }),
      TextStyle,
      Color.configure({ types: ["textStyle"] }),
      Highlight,
      Underline,
      FontSize,
      TextAlign.configure({ types: ["paragraph"] }),
      Iframe.configure({
        allowFullscreen: true,
        HTMLAttributes: {
          class: "rounded-lg my-2 w-full aspect-video border border-gray-300",
        },
      }),
      CharacterCount.configure(),
      Placeholder.configure({
        placeholder: "✏️ Энд мэдээний агуулгаа бичнэ үү...",
      }),
      BulletList,
      ListItem,
      FontFamily.configure({ types: ["textStyle"] }),
      HorizontalRule,
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

  // 🖼 Image insert
  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    e.stopPropagation();
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

  // 🎥 Add Video
  const addVideo = () => {
    const input = prompt("🎬 YouTube эсвэл Vimeo линк оруулна уу:");
    if (!input) return;
    let url = input.trim();

    if (url.includes("youtube.com/watch?v=")) {
      const videoId = url.split("v=")[1].split("&")[0];
      url = `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes("youtu.be/")) {
      const videoId = url.split("youtu.be/")[1].split("?")[0];
      url = `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes("vimeo.com/")) {
      const videoId = url.split("vimeo.com/")[1].split("?")[0];
      url = `https://player.vimeo.com/video/${videoId}`;
    }

    editor.chain().focus().setIframe({ src: url }).run();
  };

  const removeFormatting = () =>
    editor.chain().focus().unsetAllMarks().clearNodes().run();

  const wordCount = editor.storage.characterCount?.words() || 0;
  const characterCount = editor.storage.characterCount?.characters() || 0;

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setUploading(true);
      const url = await uploadToCloudinary(file);
      setUploading(false);
      if (url) editor.chain().focus().setImage({ src: url }).run();
    }
  };

  return (
    <div
      className="border border-gray-300 rounded-xl bg-white shadow-sm overflow-hidden relative"
      onClick={(e) => {
        // 🧩 Toolbar дотор дарахад form submit болохоос сэргийлнэ
        const target = e.target as HTMLElement;
        if (target.tagName === "BUTTON") {
          e.preventDefault();
          e.stopPropagation();
        }
      }}
    >
      {/* 🧰 Toolbar */}
      <div className="sticky top-0 z-10 flex items-center gap-1 p-2 border-b border-gray-200 bg-gray-50 overflow-x-auto scrollbar-hide">
        {/* Undo / Redo */}
        <Button type="button" size="sm" variant="ghost" onClick={() => editor.chain().focus().undo().run()}>
          <RotateCcw size={16} />
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => editor.chain().focus().redo().run()}>
          <RotateCw size={16} />
        </Button>

        {/* Text formatting */}
        <Button type="button" size="sm" variant={editor.isActive("bold") ? "secondary" : "ghost"} onClick={() => editor.chain().focus().toggleBold().run()}>
          <Bold size={16} />
        </Button>
        <Button type="button" size="sm" variant={editor.isActive("italic") ? "secondary" : "ghost"} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <Italic size={16} />
        </Button>
        <Button type="button" size="sm" variant={editor.isActive("underline") ? "secondary" : "ghost"} onClick={() => editor.chain().focus().toggleUnderline().run()}>
          <UnderlineIcon size={16} />
        </Button>

        {/* Lists */}
        <Button type="button" size="sm" variant="ghost" onClick={() => editor.chain().focus().toggleBulletList().run()}>
          •
        </Button>

        {/* Divider */}
        <Button type="button" size="sm" variant="ghost" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
          ━
        </Button>

        {/* Media */}
        <Button type="button" size="sm" variant="ghost" onClick={() => setUploadVisible(true)}>
          {uploading ? <Loader2 size={16} className="animate-spin text-teal-600" /> : <ImageIcon size={16} />}
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={addVideo}>
          <Youtube size={16} />
        </Button>

        {/* Links, Quotes, Code */}
        <Button type="button" size="sm" variant="ghost" onClick={() => {
          const url = prompt("🔗 Холбоос хаяг оруулна уу:");
          if (url) editor.chain().focus().setLink({ href: url }).run();
        }}>
          <LinkIcon size={16} />
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => editor.chain().focus().toggleBlockquote().run()}>
          <Quote size={16} />
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => editor.chain().focus().toggleCodeBlock().run()}>
          <Code2 size={16} />
        </Button>

        {/* ⚙️ More menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type="button" size="sm" variant="outline" className="flex items-center gap-1">
              <MoreHorizontal size={16} /> More
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-white shadow-md rounded-md">
            <DropdownMenuItem asChild>
              <button type="button" onClick={() => editor.chain().focus().setTextAlign("left").run()}>
                <AlignLeft size={14} className="mr-2" /> Align Left
              </button>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <button type="button" onClick={() => editor.chain().focus().setTextAlign("center").run()}>
                <AlignCenter size={14} className="mr-2" /> Align Center
              </button>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <button type="button" onClick={() => editor.chain().focus().setTextAlign("right").run()}>
                <AlignRight size={14} className="mr-2" /> Align Right
              </button>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <button type="button" onClick={() => editor.chain().focus().setTextAlign("justify").run()}>
                <AlignJustify size={14} className="mr-2" /> Align Justify
              </button>
            </DropdownMenuItem>

            <DropdownMenuSeparator />
            {["12px", "14px", "16px", "18px", "24px", "32px"].map((size) => (
              <DropdownMenuItem key={size} asChild>
                <button type="button" onClick={() => editor.chain().focus().setMark("textStyle", { fontSize: size }).run()}>
                  Font Size {size}
                </button>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            {["Aptos", "Inter", "Times New Roman", "Arial"].map((font) => (
              <DropdownMenuItem key={font} asChild>
                <button type="button" onClick={() => editor.chain().focus().setMark("textStyle", { fontFamily: font }).run()}>
                  {font}
                </button>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <label className="flex items-center gap-2 cursor-pointer">
                🎨
                <input
                  type="color"
                  onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
                  className="w-5 h-5 border-none bg-transparent cursor-pointer"
                />
              </label>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <button type="button" onClick={() => editor.chain().focus().toggleHighlight({ color: "#FFF59D" }).run()}>
                <Highlighter size={14} className="mr-2" /> Highlight
              </button>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <button type="button" onClick={removeFormatting}>
                <Eraser size={14} className="mr-2" /> Clear Formatting
              </button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* ✏️ Editor */}
      <div
        className="p-4 min-h-[500px] max-w-none prose prose-p:my-2 prose-blockquote:border-l-4 prose-blockquote:pl-4 prose-pre:bg-gray-50 prose-pre:p-3 prose-pre:rounded-lg prose-pre:text-sm"
        onClick={() => editor.chain().focus().run()}
      >
        <FloatingImageMenu editor={editor} onReplace={uploadToCloudinary} />
        <EditorContent editor={editor} />
      </div>

      {/* 🖼 Upload modal */}
      {uploadVisible &&
        typeof window !== "undefined" &&
        createPortal(
          <div
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-[9999]"
            onClick={() => setUploadVisible(false)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="bg-white border-2 border-dashed border-teal-500 rounded-lg p-6 w-[380px] flex flex-col items-center justify-center text-center shadow-xl"
            >
              {uploading ? (
                <div className="flex flex-col items-center gap-2 text-gray-500">
                  <Loader2 size={24} className="animate-spin text-teal-500" />
                  <p className="text-sm font-medium">Uploading image...</p>
                </div>
              ) : (
                <>
                  <ImageIcon size={32} className="text-teal-500 mb-2" />
                  <p className="text-sm font-medium">
                    <span
                      className="text-teal-600 underline cursor-pointer"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        document.getElementById("uploadInput")?.click();
                      }}
                    >
                      Click to upload
                    </span>{" "}
                    or drag and drop
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
          </div>,
          document.body
        )}

      {/* Stats */}
      <div className="text-xs text-gray-500 px-4 pb-2 flex justify-between">
        <span>{wordCount} үг</span>
        <span>{characterCount} тэмдэгт</span>
      </div>
    </div>
  );
}