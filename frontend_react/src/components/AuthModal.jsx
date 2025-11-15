import React, { useState } from "react";
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
  const [mode, setMode] = useState("signin");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const env = getEnv();

  const supabase = getSupabaseClient();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!supabase) return;
    setSubmitting(true);
    setError("");
    try {
      if (mode === "magic") {
        const { error: e } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: env.FRONTEND_URL || window.location.origin,
          },
        });
        if (e) throw e;
      } else if (mode === "signup") {
        const { error: e } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: env.FRONTEND_URL || window.location.origin } });
        if (e) throw e;
      } else {
        const { error: e } = await supabase.auth.signInWithPassword({ email, password });
        if (e) throw e;
      }
      onSuccess?.();
      onClose?.();
    } catch (err) {
      if (env.isDev) env.log.error("Auth error", err);
      setError("Authentication failed. Please check your credentials or try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Sign in">
      <form onSubmit={handleSubmit}>
        <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
          <Button type="button" variant={mode === "signin" ? "primary" : "secondary"} onClick={() => setMode("signin")}>Sign in</Button>
          <Button type="button" variant={mode === "signup" ? "primary" : "secondary"} onClick={() => setMode("signup")}>Sign up</Button>
          <Button type="button" variant={mode === "magic" ? "primary" : "secondary"} onClick={() => setMode("magic")}>Magic link</Button>
        </div>
        <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        {mode !== "magic" && (
          <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        )}
        {error && <div role="alert" style={{ color: "#EF4444", marginTop: 6 }}>{error}</div>}
        <div style={{ marginTop: 12, display: "flex", justifyContent: "flex-end" }}>
          <Button type="submit" disabled={submitting}>{submitting ? "Please wait..." : mode === "signup" ? "Create account" : mode === "magic" ? "Send link" : "Sign in"}</Button>
        </div>
      </form>
    </Modal>
  );
}
