"use strict";
import { createClient } from "@supabase/supabase-js";
import { getEnv } from "../config/env";

/**
 * PUBLIC_INTERFACE
 * getSupabaseClient returns a singleton Supabase client configured from env
 *
 * Notes:
 * - detectSessionInUrl is enabled to let Supabase process tokens that come in via
 *   either query params or hash fragment for our hash-based router.
 * - We explicitly set a unique storageKey and storage to localStorage for persistence.
 * - We provide a custom cookieOptions.sameSite to avoid cross-site issues on some browsers.
 */
let client;
/** Storage key namespace for this app to avoid conflicts if multiple apps use Supabase on same origin */
const STORAGE_KEY = "book-snippet-manager.supabase.auth";

export const getSupabaseClient = () => {
  if (client) return client;
  const env = getEnv();
  const { SUPABASE_URL, SUPABASE_KEY } = env;

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    env.log.warn("Supabase env not configured; UI will show setup notice.");
    return null;
  }

  try {
    client = createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: window?.localStorage,
        storageKey: STORAGE_KEY,
        flowType: "pkce",
        // Helps some browsers complete OAuth in same-site contexts
        cookieOptions: { sameSite: "lax" },
      },
      // Optionally provide global headers for debugging (non-sensitive)
      global: {
        headers: {
          "X-App-Name": "BookSnippetManager",
        },
      },
    });
  } catch (e) {
    env.log.error("Failed to create Supabase client", e);
    return null;
  }
  return client;
};
