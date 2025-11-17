import { getEnv } from "../config/env";
import { Api } from "../lib/apiClient";

/** PUBLIC_INTERFACE
 * getSnippets fetches snippet list from backend, supports optional search and tag filters.
 */
export async function getSnippets({ search = "", tag = "" } = {}) {
  const env = getEnv();
  try {
    const data = await Api.listSnippets({ search, tag });
    return Array.isArray(data) ? data : [];
  } catch (err) {
    if (env.isDev) env.log.error("getSnippets error", err);
    throw new Error(err?.message || "Unable to fetch snippets at the moment.");
  }
}

/** PUBLIC_INTERFACE
 * getSnippetById fetches a single snippet by listing and filtering locally (backend provides list).
 * If the backend exposes GET /snippets/:id in the future, switch to that for efficiency.
 */
export async function getSnippetById(id) {
  const env = getEnv();
  try {
    // Attempt to fetch by narrowing list; if backend later adds /snippets/:id, update here.
    const list = await Api.listSnippets({});
    const found = (Array.isArray(list) ? list : []).find((s) => s.id === id);
    if (!found) throw new Error("Snippet not found.");
    return found;
  } catch (err) {
    if (env.isDev) env.log.error("getSnippetById error", err);
    throw new Error(err?.message || "Snippet not found.");
  }
}

/** PUBLIC_INTERFACE */
export async function createSnippet(payload) {
  const env = getEnv();
  try {
    const created = await Api.createSnippet(payload);
    return created;
  } catch (err) {
    if (env.isDev) env.log.error("createSnippet error", err);
    throw new Error(err?.message || "Unable to create snippet.");
  }
}

/** PUBLIC_INTERFACE */
export async function updateSnippet(id, patch) {
  const env = getEnv();
  try {
    const updated = await Api.updateSnippet(id, patch);
    return updated;
  } catch (err) {
    if (env.isDev) env.log.error("updateSnippet error", err);
    throw new Error(err?.message || "Unable to update snippet.");
  }
}

/** PUBLIC_INTERFACE */
export async function deleteSnippet(id) {
  const env = getEnv();
  try {
    await Api.deleteSnippet(id);
    return true;
  } catch (err) {
    if (env.isDev) env.log.error("deleteSnippet error", err);
    throw new Error(err?.message || "Unable to delete snippet.");
  }
}

/** PUBLIC_INTERFACE
 * togglePublic delegates to backend share toggle endpoint.
 * If isPublic true, backend will mark as public (and may return share token).
 */
export async function togglePublic(id, isPublic) {
  const env = getEnv();
  try {
    if (isPublic) {
      // Create or enable share
      const res = await Api.createShare(id);
      // The backend may return updated snippet object or share data; prefer snippet if present
      return res?.snippet ?? res;
    } else {
      // If toggling to private, update snippet via PATCH, backend should enforce and return updated snippet
      const updated = await Api.updateSnippet(id, { is_public: false });
      return updated;
    }
  } catch (err) {
    if (env.isDev) env.log.error("togglePublic error", err);
    throw new Error(err?.message || "Unable to update sharing settings.");
  }
}
