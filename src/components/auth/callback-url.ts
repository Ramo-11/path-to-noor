export function getSafeCallbackUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  if (!value.startsWith("/") || value.startsWith("//")) return null;
  if (value.includes("://")) return null;
  try {
    if (decodeURIComponent(value).startsWith("//")) return null;
  } catch {
    return null;
  }
  return value;
}
