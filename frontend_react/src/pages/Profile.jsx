import React, { useEffect, useState } from "react";
import { Navbar } from "../components/Navbar";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { getSupabaseClient } from "../lib/supabaseClient";
import { Toast } from "../components/ui/Toast";

/** PUBLIC_INTERFACE
 * Profile page displays basic session info and a sign-out action.
 */
export function Profile({ navigate, user, onSignInClick, onSignOut }) {
  const supabase = getSupabaseClient();
  const [error, setError] = useState("");
  const [profileEmail, setProfileEmail] = useState(user?.email || "");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setProfileEmail(user?.email || "");
  }, [user]);

  const handleRefresh = async () => {
    if (!supabase) return;
    setLoading(true);
    try {
      await supabase.auth.refreshSession();
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
              <div><strong>Email:</strong> {profileEmail}</div>
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
