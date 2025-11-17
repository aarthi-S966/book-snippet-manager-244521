import { getSupabaseClient } from "../lib/supabaseClient";
import { getEnv } from "../config/env";

/** PUBLIC_INTERFACE
 * getSnippets fetches snippet list with client-side filters when needed.
 */
export async function getSnippets({ search = "", tag = "", limit = 20, offset = 0 } = {}) {
  const env = getEnv();
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error("Supabase not configured");
  }
  try {
    let query = supabase.from("snippets").select("*", { count: "exact" }).order("created_at", { ascending: false }).range(offset, offset + limit - 1);

    if (search) {
      // Simple ilike filters combining title and content; Supabase will AND filters, emulate OR in client if needed
      query = query.ilike("title", `%${search}%`);
    }
    if (tag) {
      query = query.contains("tags", [tag]);
    }

    const { data, error } = await query;
    if (error) throw error;

    // Client-side additional search across content if desired
    const list = Array.isArray(data) ? data : [];
    const filtered = search
      ? list.filter((s) => s.title?.toLowerCase().includes(search.toLowerCase()) || s.content?.toLowerCase().includes(search.toLowerCase()))
      : list;

    return filtered;
  } catch (err) {
    if (env.isDev) env.log.error("getSnippets error", err);
    throw new Error("Unable to fetch snippets at the moment.");
  }
}

/** PUBLIC_INTERFACE
 * getSnippetById fetches a snippet by id; RLS allows owner or public snippets.
 */
export async function getSnippetById(id) {
  const env = getEnv();
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error("Supabase not configured");
  try {
    const { data, error } = await supabase.from("snippets").select("*").eq("id", id).single();
    if (error) throw error;
    return data;
  } catch (err) {
    if (env.isDev) env.log.error("getSnippetById error", err);
    throw new Error("Snippet not found.");
  }
}

/** PUBLIC_INTERFACE */
export async function createSnippet(payload) {
  const env = getEnv();
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error("Supabase not configured");
  try {
    const { data: sessionData, error: sessionErr } = await supabase.auth.getSession();
    if (sessionErr) throw sessionErr;
    const userId = sessionData?.session?.user?.id;
    if (!userId) throw new Error("You must be signed in to create a snippet.");

    const now = new Date().toISOString();
    // Attach owner_id for RLS policies to permit access
    const insert = { ...payload, owner_id: userId, created_at: now, updated_at: now, is_public: !!payload.is_public };
    const { data, error } = await supabase.from("snippets").insert(insert).select("*").single();
    if (error) throw error;
    return data;
  } catch (err) {
    if (env.isDev) env.log.error("createSnippet error", err);
    // Avoid leaking raw supabase error details
    throw new Error(typeof err?.message === "string" ? err.message : "Unable to create snippet.");
  }
}

/** PUBLIC_INTERFACE */
export async function updateSnippet(id, patch) {
  const env = getEnv();
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error("Supabase not configured");
  try {
    // Ensure user is owner before updating (client-side guard; RLS must still enforce)
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id;
    if (!userId) throw new Error("You must be signed in to update a snippet.");

    const { data: existing, error: fetchErr } = await supabase.from("snippets").select("id, owner_id").eq("id", id).single();
    if (fetchErr) throw fetchErr;
    if (existing?.owner_id && existing.owner_id !== userId) {
      throw new Error("You do not have permission to modify this snippet.");
    }

    const { data, error } = await supabase
      .from("snippets")
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select("*")
      .single();
    if (error) throw error;
    return data;
  } catch (err) {
    if (env.isDev) env.log.error("updateSnippet error", err);
    throw new Error(typeof err?.message === "string" ? err.message : "Unable to update snippet.");
  }
}

/** PUBLIC_INTERFACE */
export async function deleteSnippet(id) {
  const env = getEnv();
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error("Supabase not configured");
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id;
    if (!userId) throw new Error("You must be signed in to delete a snippet.");

    const { data: existing, error: fetchErr } = await supabase.from("snippets").select("id, owner_id").eq("id", id).single();
    if (fetchErr) throw fetchErr;
    if (existing?.owner_id && existing.owner_id !== userId) {
      throw new Error("You do not have permission to delete this snippet.");
    }

    const { error } = await supabase.from("snippets").delete().eq("id", id);
    if (error) throw error;
    return true;
  } catch (err) {
    if (env.isDev) env.log.error("deleteSnippet error", err);
    throw new Error(typeof err?.message === "string" ? err.message : "Unable to delete snippet.");
  }
}

/** PUBLIC_INTERFACE */
export async function togglePublic(id, isPublic) {
  const env = getEnv();
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error("Supabase not configured");
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id;
    if (!userId) throw new Error("You must be signed in to change sharing settings.");

    const { data: existing, error: fetchErr } = await supabase.from("snippets").select("id, owner_id").eq("id", id).single();
    if (fetchErr) throw fetchErr;
    if (existing?.owner_id && existing.owner_id !== userId) {
      throw new Error("You do not have permission to change sharing for this snippet.");
    }

    const { data, error } = await supabase
      .from("snippets")
      .update({ is_public: !!isPublic, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select("*")
      .single();
    if (error) throw error;
    return data;
  } catch (err) {
    if (env.isDev) env.log.error("togglePublic error", err);
    throw new Error(typeof err?.message === "string" ? err.message : "Unable to update sharing settings.");
  }
}
