"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

function stored(storage: () => Storage, key: string, make: () => string) {
  try {
    const s = storage();
    let value = s.getItem(key);
    if (!value) {
      value = make();
      s.setItem(key, value);
    }
    return value;
  } catch {
    return make();
  }
}

export const VISITOR_KEY = "ndp_vid";
/** Set on the team's devices (see ExcludeDevice): their visits are not counted. */
export const NO_TRACK_KEY = "ndp_no_track";

const randomId = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

/** Counts page views for the panel's statistics. Skips the panel itself. */
export function PageTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin") || navigator.webdriver) return;
    try {
      if (localStorage.getItem(NO_TRACK_KEY)) return;
    } catch {}
    const visitorId = stored(() => localStorage, VISITOR_KEY, randomId);
    const sessionId = stored(() => sessionStorage, "ndp_sid", randomId);
    // Where the visit came from is decided by the first page of the session.
    const entry = stored(() => sessionStorage, "ndp_entry", () => JSON.stringify({ referrer: document.referrer, search: location.search }));
    const body = JSON.stringify({ path: pathname, visitorId, sessionId, entry });
    if (!navigator.sendBeacon?.("/api/track", new Blob([body], { type: "application/json" }))) {
      fetch("/api/track", { method: "POST", body, keepalive: true, headers: { "content-type": "application/json" } }).catch(() => {});
    }
  }, [pathname]);

  return null;
}
