import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  // Only token generation comes from the browser; the upload-completed callback
  // comes from Vercel Blob (no session cookie) and is verified by its signature.
  if (body.type === "blob.generate-client-token") {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }
  }

  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token?.startsWith("vercel_blob_rw_")) {
    console.error(
      "[/api/upload] BLOB_READ_WRITE_TOKEN is",
      token ? `malformed (starts with "${token.slice(0, 15)}", length ${token.length})` : "missing at runtime",
    );
  }

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
        addRandomSuffix: true,
        maximumSizeInBytes: 8 * 1024 * 1024,
      }),
      onUploadCompleted: async () => {
        // No post-processing needed; the client receives the blob URL directly.
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error("[/api/upload] handleUpload failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error al subir el archivo" },
      { status: 400 },
    );
  }
}
