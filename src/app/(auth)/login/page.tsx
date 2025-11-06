// src/app/(auth)/login/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const { error } = await authClient.signIn.email(
      { email, password },
      {
        onSuccess: () => {
          router.push("/dashboard");
        },
      },
    );

    if (error) {
      setErrorMsg(error.message ?? "Login failed");
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30">
      <div className="w-full max-w-md rounded-lg border bg-background p-6 shadow-sm">
        <h1 className="text-2xl font-semibold mb-4">Log in</h1>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium" htmlFor="email">
              Email
            </label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium" htmlFor="password">
              Password
            </label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {errorMsg ? (
            <p className="text-sm text-red-500">{errorMsg}</p>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-black text-white py-2 text-sm font-medium disabled:opacity-70"
          >
            {loading ? "Logging in..." : "Log in"}
          </button>
        </form>

        <p className="mt-4 text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <a href="/(auth)/signup" className="underline">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}