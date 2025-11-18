const rawBaseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") || "";

export const apiBaseUrl = rawBaseUrl;

export function buildApiUrl(path: string): string {
  if (!path) return rawBaseUrl;
  if (/^https?:/i.test(path)) return path;
  if (!rawBaseUrl) return path;
  return `${rawBaseUrl}${path.startsWith('/') ? path : `/${path}`}`;
}
