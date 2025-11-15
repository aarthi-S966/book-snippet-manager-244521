"use strict";
import { createClient } from "@supabase/supabase-js";
import { getEnv } from "../config/env";

/**
 * PUBLIC_INTERFACE
 * getSupabaseClient returns a singleton Supabase client configured from env
 */
let client;
export const getSupabaseClient = () => {
  if (client) return client;
  const env = getEnv();
  const { SUPABASE_URL, SUPABASE_KEY } = env;

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    env.log.warn("Supabase env not configured; UI will show setup notice.");
    return null;
  }

  client = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
  return client;
};
