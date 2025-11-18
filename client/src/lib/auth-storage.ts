const TOKEN_KEY = "tradeflow.authToken";

export function getStoredToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    return window.localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function persistToken(token: string | null) {
  if (typeof window === "undefined") {
    return;
  }
  try {
    if (token) {
      window.localStorage.setItem(TOKEN_KEY, token);
    } else {
      window.localStorage.removeItem(TOKEN_KEY);
    }
  } catch {
    // ignore storage failures
  }
}
