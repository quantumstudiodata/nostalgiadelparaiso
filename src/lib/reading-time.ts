/** Minutes to read an HTML post at ~200 words per minute (at least 1). */
export function readingMinutes(html: string) {
  const words = html.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export function shortDate(date: Date | null | undefined) {
  if (!date) return "";
  return date.toLocaleDateString("es-MX", { day: "numeric", month: "short" }).replace(".", "");
}
