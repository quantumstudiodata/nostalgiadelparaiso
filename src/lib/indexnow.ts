import { siteUrl } from "@/lib/email";

// Public key for IndexNow; the same value is served at /<key>.txt (public folder) to prove the site is ours.
const INDEXNOW_KEY = "2993d99cd86da554a932e933f614fd48";

/**
 * Tells search engines that use IndexNow (Bing, Yahoo, DuckDuckGo, Yandex…) that these pages are new or changed,
 * so they visit them right away. Google reads the sitemap instead. Never throws.
 */
export async function announceUrls(paths: string[]) {
  const base = siteUrl();
  if (base.includes("localhost") || paths.length === 0) return;
  const host = new URL(base).host;
  try {
    await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "content-type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host,
        key: INDEXNOW_KEY,
        keyLocation: `${base}/${INDEXNOW_KEY}.txt`,
        urlList: paths.map((p) => `${base}${p}`),
      }),
    });
  } catch (error) {
    console.error("IndexNow:", error);
  }
}
