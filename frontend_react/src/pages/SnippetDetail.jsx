import React, { useState } from "react";
import { Navbar } from "../components/Navbar";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Toast } from "../components/ui/Toast";
import { SnippetEditor } from "../components/SnippetEditor";
import { useSnippetQuery } from "../hooks/useSnippet";
import { updateSnippet, deleteSnippet, togglePublic } from "../data/snippets";

/** PUBLIC_INTERFACE
 * Snippet detail view with editing, delete, and share toggle
 */
export function SnippetDetail({ id, navigate, user, onSignInClick, onSignOut }) {
  const { snippet, loading, errorMsg, setSnippet } = useSnippetQuery(id);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const onSave = async (payload) => {
    setSaving(true);
    try {
      const updated = await updateSnippet(id, payload);
      setSnippet(updated);
    } catch (e) {
      setError(e?.message || "Failed to save snippet");
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async () => {
    if (!window.confirm("Delete this snippet?")) return;
    try {
      await deleteSnippet(id);
      navigate("/");
    } catch (e) {
      setError(e?.message || "Failed to delete");
    }
  };

  const onToggleShare = async () => {
    try {
      const updated = await togglePublic(id, !snippet?.is_public);
      setSnippet(updated);
    } catch (e) {
      setError(e?.message || "Failed to update sharing");
    }
  };

  const copyLink = async () => {
    // Use hash-based route for CRA so shared links work correctly
    const url = `${window.location.origin}# /s/${id}`.replace("# /", "#/");
    await navigator.clipboard.writeText(url);
    alert("Link copied!");
  };

  return (
    <div>
      <Navbar onSearch={() => {}} user={user} onSignInClick={onSignInClick} onSignOut={onSignOut} />
      <div className="container">
        {loading && <Card style={{ padding: 16 }}>Loading...</Card>}
        {!loading && snippet && (
          <Card style={{ padding: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ margin: 0 }}>{snippet.title}</h2>
              <div style={{ display: "flex", gap: 8 }}>
                <Button variant="secondary" onClick={onToggleShare}>{snippet.is_public ? "Make Private" : "Make Public"}</Button>
                <Button variant="secondary" onClick={copyLink}>Copy Link</Button>
                <Button variant="secondary" onClick={onDelete}>Delete</Button>
              </div>
            </div>
            <div style={{ marginTop: 12 }}>
              <SnippetEditor initial={snippet} onSubmit={onSave} submitting={saving} />
            </div>
          </Card>
        )}
      </div>
      {(error || errorMsg) && <Toast message={error || errorMsg} type="error" />}
    </div>
  );
}
