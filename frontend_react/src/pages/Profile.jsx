import React, { useEffect, useState } from "react";
import { Navbar } from "../components/Navbar";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { getSupabaseClient } from "../lib/supabaseClient";
import { Toast } from "../components/ui/Toast";
import { Api } from "../lib/apiClient";
import { getEnv } from "../config/env";

/** PUBLIC_INTERFACE
 * Profile page displays backend /profile/me and session info with sign-out action.
 */
export function Profile({ navigate, user, onSignInClick, onSignOut }) {
  const supabase = getSupabaseClient();
  const env = getEnv();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState(null);

  const loadProfile = async () => {
    if (!user) return;
    setLoading(true);
    setError("");
    try {
      const me = await Api.me();
      setProfile(me || null);
    } catch (e) {
      if (env.isDev) env.log.error("Profile load error", e);
      setError(e?.message || "Could not load profile.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setProfile(null);
    if (user) {
      loadProfile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const handleRefresh = async () => {
    if (!supabase) return;
    setLoading(true);
    try {
      await supabase.auth.refreshSession();
      await loadProfile();
    } catch (e) {
      setError(e?.message || "Could not refresh session.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar onSearch={() => {}} user={user} onSignInClick={onSignInClick} onSignOut={onSignOut} />
      <div className="container">
        <Card style={{ padding: 16 }}>
          <h2 style={{ marginTop: 0 }}>Profile</h2>
          {!user ? (
            <div>
              <p>You are not signed in.</p>
              <Button onClick={onSignInClick}>Sign in</Button>
            </div>
          ) : (
            <div style={{ display: "grid", gap: 12 }}>
              <div><strong>Email:</strong> {profile?.email || user.email}</div>
              {profile?.display_name && <div><strong>Display Name:</strong> {profile.display_name}</div>}
              <div><strong>User ID:</strong> {user.id}</div>
              <div style={{ display: "flex", gap: 8 }}>
                <Button variant="secondary" onClick={handleRefresh} disabled={loading}>
                  {loading ? "Refreshing..." : "Refresh Session"}
                </Button>
                <Button variant="secondary" onClick={onSignOut}>Sign out</Button>
              </div>
            </div>
          )}
        </Card>
      </div>
      {error && <Toast message={error} type="error" onClose={() => setError("")} />}
    </div>
  );
}
