// API helper that adds authentication token to requests

export async function apiRequest(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = localStorage.getItem("token");

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // If unauthorized, redirect to login
  if (response.status === 401) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  }

  return response;
}

// Convenience methods
export const api = {
  get: (url: string) => apiRequest(url, { method: "GET" }),

  post: (url: string, data: any) =>
    apiRequest(url, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  patch: (url: string, data: any) =>
    apiRequest(url, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  delete: (url: string) => apiRequest(url, { method: "DELETE" }),
};
