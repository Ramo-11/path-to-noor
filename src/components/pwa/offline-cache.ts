export const PAGES_CACHE_PREFIX = "bd-pages-";

export async function clearOfflinePages(): Promise<void> {
  if (typeof window === "undefined" || !("caches" in window)) return;
  try {
    const keys = await caches.keys();
    await Promise.all(
      keys.filter((key) => key.startsWith(PAGES_CACHE_PREFIX)).map((key) => caches.delete(key))
    );
  } catch {
    return;
  }
}
