import { useEffect, useState } from "react";
import { getSnippets } from "../data/snippets";
import { getEnv } from "../config/env";

/** PUBLIC_INTERFACE
 * useSnippetsQuery manages list state with search/filter
 */
export function useSnippetsQuery({ search, tag }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const env = getEnv();

  useEffect(() => {
    let active = true;
    setLoading(true);
    setErrorMsg("");
    getSnippets({ search, tag })
      .then((list) => active && setData(list))
      .catch((e) => {
        if (env.isDev) env.log.error(e);
        active && setErrorMsg(typeof e === "string" ? e : e?.message || "Failed to load snippets");
      })
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [search, tag]);

  return { data, loading, errorMsg, setData };
}
