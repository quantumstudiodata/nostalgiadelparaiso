export const SOURCES = ["google", "instagram", "facebook", "anuncios", "otros"] as const;
export type Source = (typeof SOURCES)[number];

export const SOURCE_LABELS: Record<Source, string> = {
  google: "Google",
  instagram: "Instagram",
  facebook: "Facebook",
  anuncios: "Anuncios",
  otros: "Otros (directo, otros sitios)",
};

/** Classifies a visit from the referrer and the query string of the first page of the session. */
export function classifySource(referrer: string, search: string, ownHost?: string): Source {
  const params = new URLSearchParams(search);
  const medium = (params.get("utm_medium") ?? "").toLowerCase();
  // Paid campaigns: Google Ads click ids or a paid utm_medium.
  if (params.has("gclid") || /cpc|ppc|paid|ads?|display/.test(medium)) return "anuncios";

  const utm = (params.get("utm_source") ?? "").toLowerCase();
  let host = "";
  try {
    host = new URL(referrer).hostname.toLowerCase();
  } catch {}
  if (ownHost && host === ownHost) host = "";
  const from = `${utm} ${host}`;
  if (/google/.test(from)) return "google";
  if (/instagram|^ig\b/.test(from)) return "instagram";
  if (/facebook|\bfb\b|fb\.com|fb\.me/.test(from)) return "facebook";
  return "otros";
}
