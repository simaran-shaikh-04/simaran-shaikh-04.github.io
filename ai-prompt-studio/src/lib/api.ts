// src/lib/api.ts
// Central place for the user's own Gemini API key.
// The key is stored ONLY in this browser (localStorage) and attached to every
// /api/ request via a fetch interceptor — so no component needs editing.

const STORAGE_KEY = "gemini_api_key";

export const getApiKey = (): string => {
  try { return localStorage.getItem(STORAGE_KEY) || ""; } catch { return ""; }
};
export const setApiKey = (k: string): void => {
  try { localStorage.setItem(STORAGE_KEY, k.trim()); } catch { /* ignore */ }
};
export const clearApiKey = (): void => {
  try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
};
export const hasApiKey = (): boolean => getApiKey().length > 0;

// Install once (from main.tsx). Adds "x-api-key" to every /api/ request and
// fires an "api-key-required" event if the server reports a missing key (401).
let installed = false;
export function installApiKeyInterceptor(): void {
  if (installed || typeof window === "undefined") return;
  installed = true;

  const orig = window.fetch.bind(window);
  window.fetch = async (input: RequestInfo | URL, init: RequestInit = {}) => {
    let isApi = false;
    try {
      const url =
        typeof input === "string" ? input :
        input instanceof URL ? input.href :
        (input as Request).url;
      isApi = !!url && url.includes("/api/");
    } catch { /* ignore */ }

    if (isApi) {
      const headers = new Headers(
        init.headers || (input instanceof Request ? input.headers : undefined)
      );
      const key = getApiKey();
      if (key) headers.set("x-api-key", key);
      init = { ...init, headers };
    }

    const res = await orig(input as RequestInfo | URL, init);

    if (isApi && res.status === 401) {
      try { window.dispatchEvent(new CustomEvent("api-key-required")); } catch { /* ignore */ }
    }
    return res;
  };
}
