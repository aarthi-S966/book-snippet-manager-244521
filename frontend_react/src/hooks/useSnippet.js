import { useEffect, useState } from "react";
import { getSnippetById } from "../data/snippets";
import { getEnv } from "../config/env";

/** PUBLIC_INTERFACE
 * useSnippetQuery loads single snippet
 */
export function useSnippetQuery(id) {
  const [snippet, setSnippet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const env = getEnv();

  useEffect(() => {
    if (!id) return;
    let active = true;
    setLoading(true);
    getSnippetById(id)
      .then((s) => active && setSnippet(s))
      .catch((e) => {
        if (env.isDev) env.log.error(e);
        active && setErrorMsg(e?.message || "Failed to load snippet");
      })
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [id]);

  return { snippet, loading, errorMsg, setSnippet };
}
