import React, { useEffect, useState } from "react";
import { Modal } from "./ui/Modal";
import { Input } from "./ui/Input";
import { Button } from "./ui/Button";
import { getSupabaseClient } from "../lib/supabaseClient";
import { getEnv } from "../config/env";

/** PUBLIC_INTERFACE
 * AuthModal supports email/password and magic-link sign-in/up.
 */
export function AuthModal({ open, onClose, onSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState("signin"); // 'signin' | 'signup' | 'magic'
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const env = getEnv();

  const supabase = getSupabaseClient();

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setError("");
      setSubmitting(false);
    }
  }, [open]);

  const redirectTo = (() => {
    const base = env.FRONTEND_URL && env.FRONTEND_URL.trim().length > 0
      ? env.FRONTEND_URL.trim()
      : window.location.origin;
    // CRA uses hash routing; ensure redirect retains origin (Supabase will append tokens to URL)
    return base;
  })();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!supabase) {
      setError("Supabase is not configured. Please set environment variables.");
      return;
    }
    if (!email) {
      setError("Please enter your email.");
      return;
    }
    if (mode !== "magic" && !password) {
      setError("Please enter your password.");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      if (mode === "magic") {
        const { error: e } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: redirectTo,
          },
        });
        if (e) throw e;
      } else if (mode === "signup") {
        const { error: e } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: redirectTo },
        });
        if (e) throw e;
      } else {
        const { error: e } = await supabase.auth.signInWithPassword({ email, password });
        if (e) throw e;
      }
      onSuccess?.();
      onClose?.();
    } catch (err) {
      if (env.isDev) env.log.error("Auth error", err);
      // map common errors to user-friendly messages
      const msg =
        typeof err?.message === "string"
          ? err.message
          : "Authentication failed. Please check your input or try again.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Sign in or Sign up">
      <form onSubmit={handleSubmit}>
        <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
          <Button
            aria-label="Switch to sign in"
            type="button"
            variant={mode === "signin" ? "primary" : "secondary"}
            onClick={() => setMode("signin")}
          >
            Sign in
          </Button>
          <Button
            aria-label="Switch to sign up"
            type="button"
            variant={mode === "signup" ? "primary" : "secondary"}
            onClick={() => setMode("signup")}
          >
            Sign up
          </Button>
          <Button
            aria-label="Switch to magic link"
            type="button"
            variant={mode === "magic" ? "primary" : "secondary"}
            onClick={() => setMode("magic")}
          >
            Magic link
          </Button>
        </div>
        <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        {mode !== "magic" && (
          <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        )}
        {mode === "magic" && (
          <div style={{ fontSize: 12, color: "#374151", marginTop: 4 }}>
            We will send you a sign-in link. After clicking it, you will return to this app.
          </div>
        )}
        {error && (
          <div role="alert" style={{ color: "#EF4444", marginTop: 6 }}>
            {error}
          </div>
        )}
        <div style={{ marginTop: 12, display: "flex", justifyContent: "flex-end" }}>
          <Button type="submit" disabled={submitting}>
            {submitting
              ? "Please wait..."
              : mode === "signup"
              ? "Create account"
              : mode === "magic"
              ? "Send link"
              : "Sign in"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
