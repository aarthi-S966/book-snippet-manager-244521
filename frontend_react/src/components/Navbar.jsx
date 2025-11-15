import React, { useState } from "react";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { getSupabaseClient } from "../lib/supabaseClient";

/** PUBLIC_INTERFACE
 * Top navbar with app title, search input and auth actions.
 */
export function Navbar({ onSearch, user, onSignInClick, onSignOut }) {
  const [q, setQ] = useState("");

  return (
    <nav className="ocean-header" style={{ padding: "10px 16px", boxShadow: "var(--shadow-sm)" }}>
      <div className="container" style={{ display: "flex", gap: 16, alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontWeight: 800, color: "#111827" }}>Book Snippet Manager</div>
        <div style={{ flex: 1, maxWidth: 520 }}>
          <Input
            aria-label="Search snippets"
            placeholder="Search snippets..."
            value={q}
            onChange={(e) => {
              const v = e.target.value;
              setQ(v);
              onSearch?.(v);
            }}
          />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {user ? (
            <>
              <div aria-label="user-email" style={{ fontSize: 14 }}>{user.email}</div>
              <Button variant="secondary" onClick={onSignOut}>Sign out</Button>
            </>
          ) : (
            <Button onClick={onSignInClick}>Sign in</Button>
          )}
        </div>
      </div>
    </nav>
  );
}

// Helper auth actions (not exported UI)
export async function signOut() {
  const supabase = getSupabaseClient();
  if (!supabase) return;
  await supabase.auth.signOut();
}
