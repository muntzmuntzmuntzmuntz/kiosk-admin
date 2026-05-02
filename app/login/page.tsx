"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "admin";
const AUTH_KEY = "kiosk-admin-authenticated";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const auth = localStorage.getItem(AUTH_KEY) === "true";
    if (auth) {
      router.replace("/");
      return;
    }

    queueMicrotask(() => setCheckingAuth(false));
  }, [router]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      localStorage.setItem(AUTH_KEY, "true");
      router.replace("/");
      return;
    }

    setErrorMessage("Invalid username or password.");
    setIsSubmitting(false);
  }

  if (checkingAuth) {
    return null;
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950">
      <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-zinc-200 bg-white px-8 py-10 shadow-sm">
          <div className="mb-8 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-zinc-500">Kiosk Admin</p>
            <h1 className="mt-4 text-3xl font-semibold text-zinc-950">Sign in</h1>
            <p className="mt-2 text-sm text-zinc-500">Enter your credentials to access the admin dashboard.</p>
          </div>

          {errorMessage ? (
            <div className="mb-4 rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
              {errorMessage}
            </div>
          ) : null}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-zinc-700">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                required
                className="mt-2 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-zinc-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                className="mt-2 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center rounded-xl bg-zinc-950 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="mt-6 text-center text-xs uppercase tracking-[0.2em] text-zinc-400">
            Please contact your administrator if you need access.
          </p>
        </div>
      </main>
    </div>
  );
}
