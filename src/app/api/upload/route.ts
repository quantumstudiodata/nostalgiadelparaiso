import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
// Vercel functions reject request bodies over ~4.5 MB; the client compresses photos below this.
const MAX_BYTES = 4 * 1024 * 1024;

/**
 * Vercel may add a custom prefix when a Blob store is connected (e.g. "NOSTALGIA_BLOB_READ_WRITE_TOKEN"),
 * so fall back to any variable ending in BLOB_READ_WRITE_TOKEN.
 */
function findBlobToken(): { name: string; token: string } | null {
  const names = ["BLOB_READ_WRITE_TOKEN", ...Object.keys(process.env).filter((k) => k.endsWith("BLOB_READ_WRITE_TOKEN"))];
  for (const name of names) {
    const token = process.env[name]?.trim();
    if (token) return { name, token };
  }
  return null;
}

function tokenStatus() {
  const found = findBlobToken();
  if (!found) {
    return {
      ok: false,
      problem:
        "No hay token de Vercel Blob en este deploy. En Vercel → Storage → tu Blob store → Connect Project, conéctalo a este proyecto (Production y Preview) y luego haz Redeploy.",
    };
  }
  const { name, token } = found;
  if (!/^vercel_blob_rw_[A-Za-z0-9]+_[A-Za-z0-9]+$/.test(token)) {
    return {
      ok: false,
      problem: `${name} tiene un formato inválido (empieza con "${token.slice(0, 15)}", ${token.length} caracteres). Debe empezar con "vercel_blob_rw_".`,
    };
  }
  return { ok: true, problem: null, variable: name, token };
}

/** Diagnostic for logged-in editors: open /api/upload in the browser to check the Blob setup. */
export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }
  const { ok, problem, variable } = tokenStatus();
  return NextResponse.json({ ok, problem, variable });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Tu sesión expiró. Vuelve a iniciar sesión." }, { status: 401 });
  }

  const status = tokenStatus();
  if (!status.ok) {
    console.error("[/api/upload]", status.problem);
    return NextResponse.json({ error: status.problem }, { status: 500 });
  }

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No se recibió ninguna imagen." }, { status: 400 });
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Formato no permitido. Usa JPG, PNG, WEBP o GIF." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "La imagen pesa más de 4 MB." }, { status: 400 });
  }

  try {
    const blob = await put(`uploads/${file.name}`, file, {
      access: "public",
      addRandomSuffix: true,
      contentType: file.type,
      token: status.token,
    });
    return NextResponse.json({ url: blob.url });
  } catch (error) {
    console.error("[/api/upload] put failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error al subir el archivo" },
      { status: 500 },
    );
  }
}
