import { get } from "@vercel/blob";
import { findBlobToken } from "@/lib/blob-token";

/**
 * Serves images from the private Blob store. Only files under uploads/ are exposed;
 * names carry a random suffix and never change, so they can be cached for good.
 */
export async function GET(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const pathname = path.join("/");
  if (!pathname.startsWith("uploads/") || pathname.includes("..")) {
    return new Response("Not found", { status: 404 });
  }

  const ifNoneMatch = request.headers.get("if-none-match") ?? undefined;
  const result = await get(pathname, { access: "private", ifNoneMatch, token: findBlobToken()?.token }).catch((error) => {
    console.error("[/api/images] get failed:", error);
    return null;
  });
  if (!result) return new Response("Not found", { status: 404 });

  const headers = new Headers({
    "Cache-Control": "public, max-age=31536000, immutable",
    ETag: result.blob.etag,
  });
  if (result.statusCode === 304) return new Response(null, { status: 304, headers });

  headers.set("Content-Type", result.blob.contentType);
  headers.set("Content-Length", String(result.blob.size));
  return new Response(result.stream, { headers });
}
