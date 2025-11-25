import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import type { ReactNode } from "react";
import { authorizedFetch } from "@/lib/api-client";
import { getStoredToken, persistToken } from "@/lib/auth-storage";
import { useToast } from "@/lib/use-toast";

type AuthUser = {
  id: string;
  username: string;
  role?: string;
  name?: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (input: { username: string; password: string }) => Promise<void>;
  register: (input: { username: string; password: string; name?: string }) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(() => getStoredToken());
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const bootstrap = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await authorizedFetch("/api/auth/me");
        const body = await res.json();
        setUser(body.user);
      } catch (error) {
        console.error("Failed to fetch current user", error);
        persistToken(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, [token]);

  const handleAuthResponse = async (response: Response) => {
    const { token: nextToken, user: nextUser } = await response.json();
    setUser(nextUser);
    setToken(nextToken);
    persistToken(nextToken);
  };

  const login = useCallback(async (input: { username: string; password: string }) => {
    setLoading(true);
    try {
      const response = await authorizedFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(input),
      });
      await handleAuthResponse(response);
      toast({ title: "Welcome back", description: "You are now signed in." });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const register = useCallback(async (input: { username: string; password: string; name?: string }) => {
    setLoading(true);
    try {
      const response = await authorizedFetch("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(input),
      });
      await handleAuthResponse(response);
      toast({ title: "Account created", description: "You are now signed in." });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    persistToken(null);
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    token,
    loading,
    login,
    register,
    logout,
  }), [loading, login, logout, register, token, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
