"use client";

import { useState, FormEvent } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { Bricolage_Grotesque } from "next/font/google";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const bricolageGrotesque = Bricolage_Grotesque({
  subsets: ["latin"],
});

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="max-w-md w-full rounded-base border-2 border-border bg-secondary-background p-8 shadow-shadow">
          {/* Header */}
          <div className="mb-8 text-center">
            <Link
              href="/"
              className={`inline-block text-4xl font-heading hover:translate-x-1 hover:translate-y-1 transition-transform ${bricolageGrotesque.className}`}
            >
              KASINTA
            </Link>
            <p className="mt-2 font-base text-foreground">
              Welcome back! Sign in to continue.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="rounded-base border-2 border-border bg-chart-2 px-4 py-3 font-base text-main-foreground">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="font-base text-foreground">
              Don't have an account?{" "}
              <Link
                href="/register"
                className="font-heading underline hover:translate-x-0.5 hover:translate-y-0.5 inline-block transition-transform"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
