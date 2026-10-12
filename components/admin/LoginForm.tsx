"use client";

import { useState } from "react";

export function LoginForm({ onComplete }: { onComplete?: () => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(body.error ?? "Login failed.");
        return;
      }
      // Persist the server-set cookies for the rest of this session.
      window.location.href = "/admin";
      if (onComplete) onComplete();
    } catch {
      setError("Could not reach the login server. Is the site running?");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <form onSubmit={onSubmit} className="rounded-2xl border border-sand bg-white p-8 shadow-sm" noValidate>
        <div className="mb-6">
          <h1 className="font-display text-2xl font-bold tracking-tight text-ink">Travel Lab · Admin</h1>
          <p className="mt-1 text-sm text-muted">Sign in to manage destinations, hotels, images and settings.</p>
        </div>

        {error && <p className="mb-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}

        <div className="mb-4">
          <label htmlFor="username" className="mb-1.5 block text-sm font-semibold text-ink/60">
            Username
          </label>
          <input
            id="username"
            className="w-full rounded-xl border border-sand bg-cream px-4 py-3 text-sm text-ink placeholder:text-muted focus:border-ember focus:outline-none focus:ring-2 focus:ring-ember/20"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="admin"
            autoComplete="username"
            required
            aria-invalid={ Boolean(error) }
          />
        </div>

        <div className="mb-6">
          <label htmlFor="password" className="mb-1.5 block text-sm font-semibold text-ink/60">
            Password
          </label>
          <input
            id="password"
            type="password"
            className="w-full rounded-xl border border-sand bg-cream px-4 py-3 text-sm text-ink placeholder:text-muted focus:border-ember focus:outline-none focus:ring-2 focus:ring-ember/20"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="********"
            autoComplete="current-password"
            required
            aria-invalid={ Boolean(error) }
            minLength={16}
          />
          <p className="mt-1 text-xs text-muted">Passwords must be at least 16 characters.</p>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-full bg-ink px-6 py-3 text-sm font-semibold text-cream transition-colors hover:bg-ink/90 disabled:opacity-60"
        >
          {submitting ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
