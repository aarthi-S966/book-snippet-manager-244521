import React, { useMemo, useState } from "react";
import { Navbar } from "../components/Navbar";
import { Sidebar } from "../components/Sidebar";
import { SnippetCard } from "../components/SnippetCard";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Toast } from "../components/ui/Toast";
import { useSnippetsQuery } from "../hooks/useSnippets";
import { getSupabaseClient } from "../lib/supabaseClient";

/** PUBLIC_INTERFACE
 * Home page: list + filters
 */
export function Home({ navigate, user, onSignInClick, onSignOut }) {
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState(null);
  const { data, loading, errorMsg } = useSnippetsQuery({ search, tag: activeTag });

  const tags = useMemo(() => {
    const s = new Set();
    data.forEach((d) => (Array.isArray(d.tags) ? d.tags.forEach((t) => s.add(t)) : null));
    return Array.from(s);
  }, [data]);

  return (
    <div>
      <Navbar onSearch={setSearch} user={user} onSignInClick={onSignInClick} onSignOut={onSignOut} />
      <div className="container">
        <div className="grid">
          <Sidebar tags={tags} activeTag={activeTag} onSelectTag={setActiveTag} />
          <main>
            <div style={{ marginBottom: 12, display: "flex", justifyContent: "flex-end" }}>
              <Button
                onClick={() => {
                  if (!user) {
                    // Prompt sign-in if not authenticated before navigating to create page
                    onSignInClick?.();
                    return;
                  }
                  navigate("/snippet/new");
                }}
              >
                New Snippet
              </Button>
            </div>
            {loading && <Card style={{ padding: 12 }}>Loading...</Card>}
            {!loading && errorMsg && <Card style={{ padding: 12, color: "#EF4444" }}>{errorMsg}</Card>}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
              {data.map((sn) => (
                <SnippetCard key={sn.id} snippet={sn} onClick={() => navigate(`/snippet/${sn.id}`)} />
              ))}
            </div>
          </main>
        </div>
      </div>
      {errorMsg && <Toast message={errorMsg} type="error" />}
    </div>
  );
}
