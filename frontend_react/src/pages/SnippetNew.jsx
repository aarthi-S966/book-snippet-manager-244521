import React, { useState } from "react";
import { Navbar } from "../components/Navbar";
import { Card } from "../components/ui/Card";
import { SnippetEditor } from "../components/SnippetEditor";
import { Toast } from "../components/ui/Toast";
import { createSnippet } from "../data/snippets";

/** PUBLIC_INTERFACE
 * Snippet creation page
 */
export function SnippetNew({ navigate, user, onSignInClick, onSignOut }) {
  const [errorMsg, setErrorMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (payload) => {
    setSubmitting(true);
    try {
      const created = await createSnippet(payload);
      navigate(`/snippet/${created.id}`);
    } catch (e) {
      setErrorMsg(e?.message || "Failed to create snippet");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <Navbar onSearch={() => {}} user={user} onSignInClick={onSignInClick} onSignOut={onSignOut} />
      <div className="container">
        <Card style={{ padding: 16 }}>
          <h2 style={{ marginTop: 0 }}>New Snippet</h2>
          <SnippetEditor onSubmit={onSubmit} submitting={submitting} />
        </Card>
      </div>
      {errorMsg && <Toast message={errorMsg} type="error" />}
    </div>
  );
}
