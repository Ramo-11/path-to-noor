export function getSafeCallbackUrl(value: string | null | undefined): string | null {
  if (!value || !value.startsWith("/")) return null;
  if (/[\\\u0000-\u001f\u007f]/.test(value)) return null;
  try {
    const decoded = decodeURIComponent(value);
    if (/[\\\u0000-\u001f\u007f]/.test(decoded) || decoded.startsWith("//")) return null;
    const base = "http://x";
    const url = new URL(value, base);
    if (url.origin !== base) return null;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return null;
  }
}
