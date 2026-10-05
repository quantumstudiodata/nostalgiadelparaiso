/**
 * Vercel may add a custom prefix when a Blob store is connected (e.g. "NOSTALGIA_BLOB_READ_WRITE_TOKEN"),
 * so fall back to any variable ending in BLOB_READ_WRITE_TOKEN.
 */
export function findBlobToken(): { name: string; token: string } | null {
  const names = ["BLOB_READ_WRITE_TOKEN", ...Object.keys(process.env).filter((k) => k.endsWith("BLOB_READ_WRITE_TOKEN"))];
  for (const name of names) {
    const token = process.env[name]?.trim();
    if (token) return { name, token };
  }
  return null;
}

