export interface ApiResult {
  ok: boolean;
  error?: string;
  message?: string;
  data?: Record<string, unknown>;
}

export async function adminCall(url: string, method: string, body?: unknown): Promise<ApiResult> {
  try {
    const res = await fetch(url, {
      method,
      headers: body === undefined ? undefined : { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { ok: false, error: typeof json.error === "string" ? json.error : "Something went wrong. Please try again." };
    }
    return { ok: true, message: typeof json.message === "string" ? json.message : undefined, data: json };
  } catch {
    return { ok: false, error: "Could not reach the server. Check your connection and try again." };
  }
}
