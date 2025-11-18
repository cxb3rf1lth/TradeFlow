import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/auth-context";

export default function AuthPage() {
  const { user, login, register, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [form, setForm] = useState({ username: "", password: "", name: "" });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user && !loading) {
      setLocation("/");
    }
  }, [loading, setLocation, user]);

  if (user && !loading) {
    return null;
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    try {
      if (mode === "login") {
        await login({ username: form.username, password: form.password });
      } else {
        await register({ username: form.username, password: form.password, name: form.name });
      }
      setLocation("/");
    } catch (err: any) {
      setError(err.message || "Unable to authenticate");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <Card className="w-full max-w-md border-slate-800 bg-slate-900/50 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-2xl text-white">
            {mode === "login" ? "Sign in to TradeFlow" : "Create your TradeFlow account"}
          </CardTitle>
          <CardDescription className="text-slate-400">
            The ApexForge preview requires authentication for every request.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            {mode === "register" && (
              <div className="space-y-2">
                <Label htmlFor="name" className="text-slate-200">Full name</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                  className="bg-slate-900/60 border-slate-700 text-white"
                  required
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="username" className="text-slate-200">Username</Label>
              <Input
                id="username"
                value={form.username}
                onChange={(event) => setForm((prev) => ({ ...prev, username: event.target.value }))}
                className="bg-slate-900/60 border-slate-700 text-white"
                autoComplete="username"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-200">Password</Label>
              <Input
                id="password"
                type="password"
                value={form.password}
                onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
                className="bg-slate-900/60 border-slate-700 text-white"
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                required
              />
            </div>
            {error && <p className="text-sm text-red-400">{error}</p>}
            <Button type="submit" className="w-full bg-indigo-500 hover:bg-indigo-400" disabled={loading}>
              {loading ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
            </Button>
          </form>
          <p className="text-sm text-slate-400 text-center mt-6">
            {mode === "login" ? "Need an account?" : "Already registered?"}{" "}
            <button
              type="button"
              className="text-indigo-300 hover:text-indigo-200 underline"
              onClick={() => setMode((prev) => (prev === "login" ? "register" : "login"))}
            >
              {mode === "login" ? "Create one" : "Sign in"}
            </button>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
