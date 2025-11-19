"use client";

import { useRef, useState } from "react";
import { UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function FeaturedImageUploader({
  onChange,
}: {
  onChange: (file: File | null) => void;
}) {
  const [preview, setPreview] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (file: File) => {
    if (!file) return;
    onChange(file); // ✅ гадагшаа parent руу илгээнэ
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileChange(file);
  };

  return (
    <div
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
      className={`border-2 border-dashed rounded-xl p-6 text-center transition-all duration-300 cursor-pointer ${dragActive
        ? "border-teal-500 bg-teal-50"
        : "border-gray-300 hover:border-teal-400"
        }`}
    >
      {preview ? (
        <div className="relative">
          <img
            src={preview}
            alt="preview"
            className="w-full h-56 object-cover rounded-lg shadow-md border"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="absolute top-2 right-2 bg-white/80 hover:bg-white text-red-600"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setPreview(null);
              onChange(null); // ✅ parent-д null илгээнэ
            }}
          >
            ✕
          </Button>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-gray-500">
          <UploadCloud size={32} className="mb-2 text-teal-500" />
          <p className="font-medium">Мэдээний үндсэн зургаа оруулна уу!</p>
          <p className="text-xs text-gray-400">
            JPEG, PNG формат — 50MB хүртэл
          </p>

          {/* ✅ File picker 100% ажиллах хувилбар */}
          <label
            className="mt-3 inline-flex items-center justify-center px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg cursor-pointer transition"
            onClick={() => {
              const input = document.getElementById("realFileInput") as HTMLInputElement | null;
              if (input) input.click();
            }}
          >
            Зураг сонгох
          </label>

          <input
            id="realFileInput"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.[0]) handleFileChange(e.target.files[0]);
            }}
          />

        </div>
      )}
    </div>
  );
}