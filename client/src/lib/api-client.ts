import { buildApiUrl } from "./environment";
import { getStoredToken } from "./auth-storage";

type ApiInput = string;

export async function authorizedFetch(input: ApiInput, init: RequestInit = {}): Promise<Response> {
  const url = buildApiUrl(input);
  const headers = new Headers(init.headers || {});

  if (!headers.has("Content-Type") && init.body) {
    headers.set("Content-Type", "application/json");
  }

  const token = getStoredToken();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(url, {
    ...init,
    headers,
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(body || `${response.status}: ${response.statusText}`);
  }

  return response;
}

export async function authorizedJson<T = unknown>(input: ApiInput, init?: RequestInit): Promise<T> {
  const response = await authorizedFetch(input, init);
  return response.json() as Promise<T>;
}
