import React, { useEffect, useState } from "react";
import { Card } from "../components/ui/Card";
import { Api } from "../lib/apiClient";
import { getEnv } from "../config/env";

/** PUBLIC_INTERFACE
 * Public read-only snippet page at /s/:token
 * Uses backend GET /shares/:token to retrieve public snippet.
 */
export function PublicSnippet({ id }) {
  const env = getEnv();
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [snippet, setSnippet] = useState(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setErrorMsg("");
    Api.getShareByToken(id)
      .then((res) => {
        if (!active) return;
        // Backend may return { snippet, ... } or the snippet directly
        const sn = res?.snippet ?? res;
        if (!sn) throw new Error("Not found");
        setSnippet(sn);
      })
      .catch((e) => {
        if (env.isDev) env.log.error("PublicSnippet error", e);
        setErrorMsg(e?.message || "Unable to load public snippet.");
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [id]);

  if (loading) return <div className="container"><Card style={{ padding: 16 }}>Loading...</Card></div>;
  if (errorMsg) return <div className="container"><Card style={{ padding: 16, color: "#EF4444" }}>{errorMsg}</Card></div>;
  if (!snippet) return <div className="container"><Card style={{ padding: 16 }}>This snippet is not public or does not exist.</Card></div>;

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
