"use client";

import { useRef, useState } from "react";
import { upload } from "@vercel/blob/client";

export function ImageUploadField({
  name,
  label,
  defaultValue,
  aspectClassName = "aspect-video",
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
      const blob = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/upload",
      });
      setUrl(blob.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo subir la imagen");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      <label className="block text-xs uppercase tracking-wide text-neutral-500 mb-1.5">
        {label}
      </label>
      <input type="hidden" name={name} value={url} />

      {url ? (
        <div className={`relative rounded-lg overflow-hidden ${aspectClassName} mb-2`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt="" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={() => setUrl("")}
            className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2.5 py-1 rounded"
          >
            Quitar
          </button>
        </div>
      ) : null}

      <label className="flex items-center justify-center gap-2 border border-dashed border-neutral-300 rounded-lg py-3 text-sm text-neutral-600 cursor-pointer hover:bg-neutral-50">
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
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}
