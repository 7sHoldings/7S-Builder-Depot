"use client";

import { useActionState } from "react";
import { login, type LoginState } from "@/app/admin/auth-actions";

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {});
  return (
    <form action={action} className="flex flex-col gap-4 border border-line bg-surface p-6">
      <input type="hidden" name="next" value={next} />
      <label className="flex flex-col gap-1.5 text-sm font-semibold">
        Password
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          autoFocus
          className="h-12 border border-line-strong bg-surface px-3 text-base font-normal focus:border-ink focus:outline-none"
        />
      </label>
      {state.error && (
        <p role="alert" className="font-semibold text-brand-dark">
          {state.error}
        </p>
      )}
      <button disabled={pending} className="h-12 bg-brand font-semibold text-white hover:bg-brand-dark disabled:opacity-60">
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
