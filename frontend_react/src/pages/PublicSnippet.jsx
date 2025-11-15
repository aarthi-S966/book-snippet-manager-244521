import React from "react";
import { Card } from "../components/ui/Card";
import { useSnippetQuery } from "../hooks/useSnippet";

/** PUBLIC_INTERFACE
 * Public read-only snippet page at /s/:id
 */
export function PublicSnippet({ id }) {
  const { snippet, loading, errorMsg } = useSnippetQuery(id);

  if (loading) return <div className="container"><Card style={{ padding: 16 }}>Loading...</Card></div>;
  if (errorMsg) return <div className="container"><Card style={{ padding: 16, color: "#EF4444" }}>{errorMsg}</Card></div>;
  if (!snippet || !snippet.is_public) return <div className="container"><Card style={{ padding: 16 }}>This snippet is not public.</Card></div>;

  return (
    <div className="container">
      <Card style={{ padding: 16 }}>
        <h1 style={{ marginTop: 0 }}>{snippet.title}</h1>
        <div style={{ color: "#374151", marginBottom: 8 }}>{snippet.author} • <em>{snippet.bookTitle}</em></div>
        <pre style={{ whiteSpace: "pre-wrap", fontFamily: "inherit" }}>{snippet.content}</pre>
      </Card>
    </div>
  );
}
