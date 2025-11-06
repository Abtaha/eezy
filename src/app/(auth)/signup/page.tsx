// src/app/(auth)/signup/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const { error } = await authClient.signUp.email(
      {
        name,
        email,
        password,
      },
      {
        onSuccess: () => {
          router.push("/"); // or "/(auth)/login" if you want
        },
      },
    );

    if (error) {
      setErrorMsg(error.message ?? "Sign up failed");
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30">
      <div className="w-full max-w-md rounded-lg border bg-background p-6 shadow-sm">
        <h1 className="text-2xl font-semibold mb-4">Sign up</h1>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium" htmlFor="name">
              Name
            </label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border rounded-md px-3 py-2 bg-background"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border rounded-md px-3 py-2 bg-background"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border rounded-md px-3 py-2 bg-background"
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
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="mt-4 text-sm text-muted-foreground">
          Already have an account?{" "}
          <a href="/(auth)/login" className="underline">
            Log in
          </a>
        </p>
      </div>
    </div>
  );
}