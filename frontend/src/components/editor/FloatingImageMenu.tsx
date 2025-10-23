"use client";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  Maximize2,
  Minimize2,
  Trash2,
  Link,
  Image as ImageIcon,
  RotateCcw,
  RotateCw,
  Type,
} from "lucide-react";

interface Props {
  editor: any;
  onReplace?: (file: File) => Promise<string | null>;
}

export default function FloatingImageMenu({ editor, onReplace }: Props) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!editor) return;

    const updateMenu = () => {
      const { state } = editor;
      const selection = state.selection;
      const node = selection.node;
      if (node?.type.name === "image") {
        const dom = editor.view.domAtPos(selection.from)?.node as HTMLElement;
        const rect = dom.getBoundingClientRect();
        setCoords({
          top: rect.top + window.scrollY - 50,
          left: rect.left + rect.width / 2,
        });
        setShow(true);
      } else {
        setShow(false);
      }
    };

    editor.on("transaction", updateMenu);
    editor.on("blur", ({ event }: { event: FocusEvent }) => {
      if (menuRef.current?.contains(event?.relatedTarget as Node)) return;
      setTimeout(() => setShow(false), 100);
    });
    return () => {
      editor.off("selectionUpdate", updateMenu);
    };
  }, [editor]);

  if (!show) return null;

  // 🧩 Helper functions
  const updateImage = (attrs: any) =>
    editor.chain().focus().updateAttributes("image", attrs).run();

  const deleteImage = () =>
    editor.chain().focus().deleteSelection().run();

  const replaceImage = async (file: File) => {
    if (!onReplace) return;
    const url = await onReplace(file);
    if (url) updateImage({ src: url });
  };

  const setLinkToImage = () => {
    const url = prompt("🔗 Зураг дээр линк холбох хаяг:");
    if (!url) return;
    updateImage({ href: url });
  };

  const setAltText = () => {
    const alt = prompt("✏️ Alt текст оруулна уу:");
    if (!alt) return;
    updateImage({ alt });
  };

  const rotate = (direction: "left" | "right") => {
    const node = editor.state.selection.node;
    const currentRotation = node?.attrs?.rotation || 0;
    const delta = direction === "left" ? -90 : 90;
    updateImage({ rotation: (currentRotation + delta) % 360 });
  };

  return (
    <div
      ref={menuRef}
      tabIndex={-1}
      onMouseDown={(e) => e.preventDefault()} // ⚠️ Focus алдалт зогсооно
      className="fixed z-50 bg-white dark:bg-gray-800 shadow-md border border-gray-300 dark:border-gray-700 rounded-lg flex items-center gap-1 p-1"
      style={{ top: coords.top, left: coords.left, transform: "translateX(-50%)" }}
    >
      {/* Align */}
      <Button
        size="icon"
        variant="ghost"
        title="Align Left"
        onClick={() => updateImage({ float: "left" })}
      >
        <AlignLeft size={16} />
      </Button>
      <Button
        size="icon"
        variant="ghost"
        title="Align Center"
        onClick={() => updateImage({ float: "center" })}
      >
        <AlignCenter size={16} />
      </Button>
      <Button
        size="icon"
        variant="ghost"
        title="Align Right"
        onClick={() => updateImage({ float: "right" })}
      >
        <AlignRight size={16} />
      </Button>

      <div className="h-4 border-l border-gray-300" />

      {/* Resize */}
      <Button size="icon" variant="ghost" title="50%" onClick={() => updateImage({ width: "50%" })}>
        <Minimize2 size={16} />
      </Button>
      <Button size="icon" variant="ghost" title="100%" onClick={() => updateImage({ width: "100%" })}>
        <Maximize2 size={16} />
      </Button>

      <div className="h-4 border-l border-gray-300" />

      {/* Rotate */}
      <Button size="icon" variant="ghost" title="Rotate Left" onClick={() => rotate("left")}>
        <RotateCcw size={16} />
      </Button>
      <Button size="icon" variant="ghost" title="Rotate Right" onClick={() => rotate("right")}>
        <RotateCw size={16} />
      </Button>

      <div className="h-4 border-l border-gray-300" />

      {/* Alt + Link */}
      <Button size="icon" variant="ghost" title="Add Alt Text" onClick={setAltText}>
        <Type size={16} />
      </Button>
      <Button size="icon" variant="ghost" title="Add Link" onClick={setLinkToImage}>
        <Link size={16} />
      </Button>

      <div className="h-4 border-l border-gray-300" />

      {/* Replace */}
      <label className="cursor-pointer flex items-center gap-1">
        <ImageIcon size={16} />
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) replaceImage(file);
          }}
        />
      </label>

      {/* Delete */}
      <Button size="icon" variant="destructive" title="Delete" onClick={deleteImage}>
        <Trash2 size={16} />
      </Button>
    </div>
  );
}