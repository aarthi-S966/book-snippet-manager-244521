"use strict";

/**
 * PUBLIC_INTERFACE
 * getEnv safely reads and validates required environment variables for the frontend.
 * Fails fast in development if critical values are missing.
 */
export const getEnv = () => {
  /** Minimal structured log respecting log level */
  const LOG_LEVEL = process.env.REACT_APP_LOG_LEVEL || "info";
  const NODE_ENV = process.env.REACT_APP_NODE_ENV || process.env.NODE_ENV || "development";
  const isDev = NODE_ENV !== "production";
  const enabledLevels = ["error", "warn", "info", "debug"];
  const levelIndex = enabledLevels.indexOf(LOG_LEVEL);
  const log = {
    error: (...args) => levelIndex >= 0 && console.error("[App]", ...args),
    warn: (...args) => levelIndex >= 1 && console.warn("[App]", ...args),
    info: (...args) => levelIndex >= 2 && console.info("[App]", ...args),
    debug: (...args) => levelIndex >= 3 && console.debug("[App]", ...args),
  };

  const env = {
    NODE_ENV,
    LOG_LEVEL,
    ENABLE_SOURCE_MAPS: process.env.REACT_APP_ENABLE_SOURCE_MAPS === "true",
    PORT: process.env.REACT_APP_PORT,
    TRUST_PROXY: process.env.REACT_APP_TRUST_PROXY,
    HEALTHCHECK_PATH: process.env.REACT_APP_HEALTHCHECK_PATH || "/healthz",
    FEATURE_FLAGS: process.env.REACT_APP_FEATURE_FLAGS || "",
    EXPERIMENTS_ENABLED: process.env.REACT_APP_EXPERIMENTS_ENABLED === "true",
    API_BASE: process.env.REACT_APP_API_BASE || "",
    BACKEND_URL: process.env.REACT_APP_BACKEND_URL || "",
    FRONTEND_URL: process.env.REACT_APP_FRONTEND_URL || "",
    WS_URL: process.env.REACT_APP_WS_URL || "",
    SUPABASE_URL: process.env.REACT_APP_SUPABASE_URL || "",
    SUPABASE_KEY: process.env.REACT_APP_SUPABASE_KEY || "",
  };

  // Validate critical env in development
  const missing = [];
  if (!env.SUPABASE_URL) missing.push("REACT_APP_SUPABASE_URL");
  if (!env.SUPABASE_KEY) missing.push("REACT_APP_SUPABASE_KEY");

  if (missing.length && isDev) {
    log.warn("Missing environment variables:", missing.join(", "));
  }

  return { ...env, isDev, log };
};
