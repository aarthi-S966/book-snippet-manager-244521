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
  const hcPath = (env.HEALTHCHECK_PATH || "/healthz").replace(/^\/*/, "/");

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
 * - Handles tokens/params in both query and hash for hash-based routing.
 * - Attempts PKCE exchange when a code is present.
 * - Shows a friendly message if token is invalid/expired, then navigates home.
 */
function AuthCallback({ navigate }) {
  const [status, setStatus] = useState("Finishing sign-in...");
  useEffect(() => {
    const env = getEnv();
    const supabase = getSupabaseClient();
    if (!supabase) {
      setStatus("Supabase not configured.");
      return;
    }

    const finish = async () => {
      try {
        const fullUrl = window.location.href;

        // Parse query params (for code flow)
        const url = new URL(fullUrl);
        const queryCode = url.searchParams.get("code");
        const queryError = url.searchParams.get("error_description") || url.searchParams.get("error");

        // Parse hash section after /auth/callback for both ? and # formats
        // Accept patterns:
        // - #/auth/callback?code=...
        // - #/auth/callback#access_token=...
        const hash = window.location.hash || "";
        const afterCallback = hash.replace(/^#\/?auth\/callback[?#]?/i, "");
        const hashParams = new URLSearchParams(afterCallback);
        const hashCode = hashParams.get("code");
        const hashError = hashParams.get("error_description") || hashParams.get("error");

        const hasError = !!(queryError || hashError);
        if (hasError) {
          setStatus("The sign-in link is invalid or has expired. Please request a new link.");
          if (env.isDev) env.log.warn("Auth callback error:", queryError || hashError);
          // Clean URL then redirect home
          window.history.replaceState({}, document.title, `${window.location.origin}#/`);
          setTimeout(() => navigate("/"), 1200);
          return;
        }

        const hasCode = !!(queryCode || hashCode);
        // If PKCE code flow: exchange code for session
        if (hasCode && typeof supabase.auth.exchangeCodeForSession === "function") {
          if (env.isDev) env.log.info("Exchanging PKCE code for session...");
          const { error } = await supabase.auth.exchangeCodeForSession(fullUrl);
          if (error) {
            if (env.isDev) env.log.error("exchangeCodeForSession error", error);
            setStatus("Could not complete sign-in. Please try again.");
          }
        } else {
          // For implicit flow with tokens in hash, detectSessionInUrl:true should handle it automatically.
          if (env.isDev) env.log.debug("No PKCE code found; relying on detectSessionInUrl processing.");
        }

        // Verify session is present before redirect
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData?.session?.user) {
          setStatus("Signed in. Redirecting...");
        } else {
          setStatus("Processed sign-in link. Redirecting...");
        }
      } catch (e) {
        if (env.isDev) env.log.error("Auth callback processing failed", e);
        setStatus("Finished processing sign-in. Redirecting...");
      } finally {
        // Clean the URL to remove tokens and callback path to avoid re-processing
        window.history.replaceState({}, document.title, `${window.location.origin}#/`);
        // Always navigate to home to clear callback URL and trigger auth-aware UI
        setTimeout(() => navigate("/"), 300);
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
 * Handles potential URL formats such as:
 * - #/auth/callback?code=...
 * - #/auth/callback#access_token=...
 * - #/snippet/ID
 * - #/s/ID
 */
export function parseHashRoute() {
  const rawHash = window.location.hash || "";
  // Normalize any accidental space after '#'
  const normalizedHash = rawHash.replace("# /", "#/");

  // Strip leading '#'
  let hash = normalizedHash.replace(/^#/, "");
  if (!hash || hash === "") return { route: "/", params: {} };

  // Extract path portion before any query or additional hash params
  const pathPart = hash.split(/[?#]/)[0] || "/";
  const segments = pathPart.split("/").filter(Boolean);

  if (segments.length === 0) return { route: "/", params: {} };
  if (segments[0] === "auth" && segments[1] === "callback") return { route: "/auth/callback", params: {} };
  if (segments[0] === "snippet" && segments[1] === "new") return { route: "/snippet/new", params: {} };
  if (segments[0] === "snippet" && segments[1]) return { route: `/snippet/${segments[1]}`, params: { id: segments[1] } };
  if (segments[0] === "s" && segments[1]) return { route: `/s/${segments[1]}`, params: { id: segments[1] } };
  // allow arbitrary health paths, handled in Router with env
  return { route: `/${segments.join("/")}`, params: {} };
}
