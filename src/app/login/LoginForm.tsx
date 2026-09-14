"use client";

import { useState, useTransition } from "react";
import { signInWithEmail, verifyLoginCode } from "./actions";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState<string | null>(null);
  const [verifying, startVerifying] = useTransition();

  if (sent) {
    return (
      <div className="w-full max-w-sm text-center">
        <h1 className="text-xl font-semibold">Check your email</h1>
        <p className="mt-2 text-sm text-muted">
          We sent a sign-in link to <span className="text-foreground">{email}</span>.
        </p>

        <div className="mt-6 border-t border-border pt-6 text-left">
          <p className="text-sm text-muted">Or enter the code from that email:</p>
          <form
            className="mt-3 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              setCodeError(null);
              startVerifying(async () => {
                const result = await verifyLoginCode(email, code);
                if (result?.error) setCodeError(result.error);
              });
            }}
          >
            <input
              required
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="Enter code"
              className="w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-center text-sm tracking-widest outline-none focus:border-foreground"
            />
            <button
              type="submit"
              disabled={verifying || code.length === 0}
              className="shrink-0 rounded-lg bg-foreground px-4 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              {verifying ? "Verifying…" : "Verify"}
            </button>
          </form>
          {codeError && <p className="mt-2 text-xs text-red-600">{codeError}</p>}
        </div>
      </div>
    );
  }

  return (
    <form
      className="w-full max-w-sm"
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        startTransition(async () => {
          const result = await signInWithEmail(email);
          if (result.error) setError(result.error);
          else setSent(true);
        });
      }}
    >
      <h1 className="text-xl font-semibold">Log in to Synqo</h1>
      <p className="mt-1 text-sm text-muted">No password — we&rsquo;ll email you a link and a code.</p>
      <input
        type="email"
        required
        autoFocus
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        className="mt-5 w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm outline-none focus:border-foreground"
      />
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="mt-3 w-full rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "Sending…" : "Send magic link"}
      </button>
    </form>
  );
}
