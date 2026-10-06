import { NextResponse } from "next/server";
import { PREVIEW_COOKIE } from "@/lib/edit-mode";

/** "Ver mi página": browse the site exactly as visitors see it. ?salir=1 goes back to editing. */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const leaving = url.searchParams.has("salir");
  const to = url.searchParams.get("a") ?? (leaving ? "/admin" : "/");
  const res = NextResponse.redirect(new URL(to.startsWith("/") ? to : "/", url.origin));
  if (leaving) res.cookies.delete(PREVIEW_COOKIE);
  else res.cookies.set(PREVIEW_COOKIE, "1", { path: "/", httpOnly: true, sameSite: "lax", maxAge: 60 * 60 * 6 });
  return res;
}
