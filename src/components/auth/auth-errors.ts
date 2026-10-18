const KNOWN = new Set([
  "weak_password",
  "invalid_email",
  "invalid_name",
  "invalid_input",
  "invalid_token",
  "expired_token",
  "rate_limited",
  "server_error",
]);

export function authErrorKey(code: unknown, status?: number): string {
  if (typeof code === "string" && KNOWN.has(code)) return code;
  if (status === 429) return "rate_limited";
  if (status && status >= 500) return "server_error";
  return "generic";
}
