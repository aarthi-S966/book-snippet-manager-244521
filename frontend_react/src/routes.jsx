import React, { useEffect, useState } from "react";
import { Home } from "./pages/Home";
import { SnippetNew } from "./pages/SnippetNew";
import { SnippetDetail } from "./pages/SnippetDetail";
import { PublicSnippet } from "./pages/PublicSnippet";
import { NotFound } from "./pages/NotFound";
import { Healthcheck } from "./pages/Healthcheck";
import { getEnv } from "./config/env";
import { getSupabaseClient } from "./lib/supabaseClient";

/** PUBLIC_INTERFACE
 * Simple router that uses hash-based navigation for CRA without extra deps.
 */
export function Router({ route, navigate, params, user, onSignInClick, onSignOut }) {
  const env = getEnv();
  const hcPath = (env.HEALTHCHECK_PATH || "/healthz").replace(/^\/+/, "/");

  // Handle Supabase auth callback route
  if (route === "/auth/callback") {
    return <AuthCallback navigate={navigate} />;
  }

  if (route === "/") {
    return <Home navigate={navigate} user={user} onSignInClick={onSignInClick} onSignOut={onSignOut} />;
  }
  if (route === "/snippet/new") {
    return <SnippetNew navigate={navigate} user={user} onSignInClick={onSignInClick} onSignOut={onSignOut} />;
  }
  if (route.startsWith("/snippet/")) {
    const id = params.id;
    return <SnippetDetail id={id} navigate={navigate} user={user} onSignInClick={onSignInClick} onSignOut={onSignOut} />;
  }
  if (route.startsWith("/s/")) {
    const id = params.id;
    return <PublicSnippet id={id} />;
  }
  if (route === hcPath) return <Healthcheck />;
  return <NotFound />;
}

/** PUBLIC_INTERFACE
 * AuthCallback component finalizes Supabase auth flow and redirects to home.
 * - For implicit/hash flows, supabase-js detectSessionInUrl handles it.
 * - For PKCE/code flow, attempt to exchange code for a session, then navigate home.
 */
function AuthCallback({ navigate }) {
  const [status, setStatus] = useState("Finishing sign-in...");
  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      setStatus("Supabase not configured.");
      return;
    }

    const finish = async () => {
      try {
        // Check for authorization code in URL (query or hash)
        const url = new URL(window.location.href);
        const queryCode = url.searchParams.get("code");
        // Hash may look like: #/auth/callback?code=... or other params
        const hashAfterAuth = window.location.hash.replace(/^#\/?auth\/callback\??/i, "");
        const hashParams = new URLSearchParams(hashAfterAuth);
        const hashCode = hashParams.get("code");
        const hasCode = !!(queryCode || hashCode);

        if (hasCode && typeof supabase.auth.exchangeCodeForSession === "function") {
          await supabase.auth.exchangeCodeForSession(window.location.href);
        }
      } catch (_) {
        // Ignore; onAuthStateChange or detectSessionInUrl may still complete session.
      } finally {
        // Always navigate to home to clear callback URL
        navigate("/");
      }
    };
    finish();
  }, [navigate]);

  return (
    <div className="container">
      <div className="card" style={{ padding: 16 }}>
        {status}
      </div>
    </div>
  );
}

/** PUBLIC_INTERFACE
 * parseHashRoute converts window.location.hash to route and params
 */
export function parseHashRoute() {
  const rawHash = window.location.hash || "";
  // Normalize any accidental space after '#'
  const normalizedHash = rawHash.replace("# /", "#/");

  const hash = normalizedHash.replace(/^#/, "") || "/";
  const segments = hash.split("/").filter(Boolean);

  if (segments.length === 0) return { route: "/", params: {} };
  if (segments[0] === "auth" && segments[1] === "callback") return { route: "/auth/callback", params: {} };
  if (segments[0] === "snippet" && segments[1] === "new") return { route: "/snippet/new", params: {} };
  if (segments[0] === "snippet" && segments[1]) return { route: `/snippet/${segments[1]}`, params: { id: segments[1] } };
  if (segments[0] === "s" && segments[1]) return { route: `/s/${segments[1]}`, params: { id: segments[1] } };
  // allow arbitrary health paths, handled in Router with env
  return { route: `/${segments.join("/")}`, params: {} };
}
