import React from "react";
import { Home } from "./pages/Home";
import { SnippetNew } from "./pages/SnippetNew";
import { SnippetDetail } from "./pages/SnippetDetail";
import { PublicSnippet } from "./pages/PublicSnippet";
import { NotFound } from "./pages/NotFound";
import { Healthcheck } from "./pages/Healthcheck";
import { getEnv } from "./config/env";

/** PUBLIC_INTERFACE
 * Simple router that uses hash-based navigation for CRA without extra deps.
 */
export function Router({ route, navigate, params, user, onSignInClick, onSignOut }) {
  const env = getEnv();
  const hcPath = (env.HEALTHCHECK_PATH || "/healthz").replace(/^\/+/, "/");
  if (route === "/") return <Home navigate={navigate} user={user} onSignInClick={onSignInClick} onSignOut={onSignOut} />;
  if (route === "/snippet/new") return <SnippetNew navigate={navigate} user={user} onSignInClick={onSignInClick} onSignOut={onSignOut} />;
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
 * parseHashRoute converts window.location.hash to route and params
 */
export function parseHashRoute() {
  const hash = window.location.hash.replace(/^#/, "") || "/";
  const segments = hash.split("/").filter(Boolean);
  if (segments.length === 0) return { route: "/" , params: {} };
  if (segments[0] === "snippet" && segments[1] === "new") return { route: "/snippet/new", params: {} };
  if (segments[0] === "snippet" && segments[1]) return { route: `/snippet/${segments[1]}`, params: { id: segments[1] } };
  if (segments[0] === "s" && segments[1]) return { route: `/s/${segments[1]}`, params: { id: segments[1] } };
  // allow arbitrary health paths, handled in Router with env
  return { route: `/${segments.join("/")}`, params: {} };
}
