import { cookies } from "next/headers";
import type { Session } from "next-auth";
import { isManager } from "@/lib/permissions";

export const PREVIEW_COOKIE = "ndp_preview";

/** True while a manager chose "Ver mi página" to see the site as visitors do. */
export async function isPreviewing() {
  return (await cookies()).get(PREVIEW_COOKIE)?.value === "1";
}

/** Pencils and edit bars show only to managers who are not previewing. */
export async function canEditSite(session: Session | null) {
  return isManager(session?.user?.role) && !(await isPreviewing());
}
