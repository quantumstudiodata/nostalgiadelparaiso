"use client";

import { useRef, useState } from "react";
import { uploadImage } from "@/lib/upload-image";

export function ImageUploadField({
  name,
  label,
  defaultValue,
  aspectClassName = "aspect-[16/10]",
}: {
  name: string;
  label: string;
  defaultValue?: string;
  aspectClassName?: string;
}) {
  const [url, setUrl] = useState(defaultValue ?? "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    try {
      setUrl(await uploadImage(file));
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo subir la imagen");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      <label className="block text-[15px] font-bold mb-2.5">
        {label}
      </label>
      <input type="hidden" name={name} value={url} />

      {url ? (
        <div className={`relative rounded-lg overflow-hidden ${aspectClassName} mb-2.5`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt="" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={() => setUrl("")}
            className="absolute top-2 right-2 bg-black/70 text-white text-[13px] px-3 py-1.5 rounded-full"
          >
            Quitar
          </button>
        </div>
      ) : null}

      <label className="flex items-center justify-center gap-2 border border-ink rounded-full h-11 text-[15px] cursor-pointer hover:bg-ink hover:text-white">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 16V4M12 4l-4 4M12 4l4 4" />
          <path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
        </svg>
        {uploading ? "Subiendo..." : url ? "Cambiar imagen" : "Subir imagen"}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
          disabled={uploading}
        />
      </label>
      {error && <p className="text-[13px] text-red-600 mt-1">{error}</p>}
    </div>
  );
}
