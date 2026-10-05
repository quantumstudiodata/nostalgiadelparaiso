"use client";

const MAX_DIMENSION = 2000;
const QUALITY = 0.85;

/** Downscale large photos in the browser so they stay well under the server's body limit. */
async function compressImage(file: File): Promise<File> {
  if (file.type === "image/gif" || !file.type.startsWith("image/")) return file;

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
    if (scale === 1 && file.size < 1.5 * 1024 * 1024) {
      bitmap.close();
      return file;
    }

    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();

    const type = file.type === "image/png" ? "image/png" : "image/jpeg";
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, QUALITY));
    if (!blob || blob.size >= file.size) return file;

    const ext = type === "image/png" ? "png" : "jpg";
    return new File([blob], file.name.replace(/\.[^.]+$/, "") + "." + ext, { type });
  } catch {
    // Formats the browser can't decode (e.g. some HEIC) are sent as-is.
    return file;
  }
}

/** Uploads an image through /api/upload and returns its public URL. Throws with the server's real error message. */
export async function uploadImage(file: File): Promise<string> {
  const body = new FormData();
  body.append("file", await compressImage(file));

  const res = await fetch("/api/upload", { method: "POST", body });
  const data = (await res.json().catch(() => null)) as { url?: string; error?: string } | null;

  if (!res.ok || !data?.url) {
    throw new Error(data?.error ?? `No se pudo subir la imagen (error ${res.status}).`);
  }
  return data.url;
}
