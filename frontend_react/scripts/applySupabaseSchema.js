#!/usr/bin/env node
"use strict";

/**
 * PUBLIC_INTERFACE
 * applySupabaseSchema applies the SQL schema and optional seed data to the configured Supabase project.
 *
 * Usage:
 *   node scripts/applySupabaseSchema.js            # applies schema only
 *   SEED_SAMPLE=true node scripts/applySupabaseSchema.js  # applies schema and minimal seeds
 *
 * Required env at runtime (NOT committed):
 *   - REACT_APP_SUPABASE_URL: Supabase project URL (e.g., https://xyzcompany.supabase.co)
 *   - SUPABASE_SERVICE_ROLE_KEY or REACT_APP_SUPABASE_SERVICE_ROLE_KEY: Service role key (server-side only)
 *
 * Notes:
 * - This script uses Supabase SQL REST API (/rest/v1/rpc/ or /sql/v1). We call /sql/v1 for direct SQL execution.
 * - No secrets are written to repo; keys are only read via process.env at execution.
 * - Idempotency is preserved by IF NOT EXISTS and DO blocks in the SQL.
 */

const fs = require("fs");
const path = require("path");
const https = require("https");
const { URL } = require("url");

function getEnv() {
  const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || process.env.SUPABASE_URL || "";
  // Service role key should not be exposed on frontend; only supply at CLI runtime.
  const SERVICE_ROLE_KEY =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.REACT_APP_SUPABASE_SERVICE_ROLE_KEY || // allow alt variable name when set in CI
    "";

  const SEED_SAMPLE = String(process.env.SEED_SAMPLE || process.env.REACT_APP_SEED_SAMPLE || "false").toLowerCase() === "true";

  if (!SUPABASE_URL) {
    throw new Error("Missing REACT_APP_SUPABASE_URL/SUPABASE_URL");
  }
  if (!SERVICE_ROLE_KEY) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY/REACT_APP_SUPABASE_SERVICE_ROLE_KEY (service role key is required to run SQL).");
  }
  return { SUPABASE_URL, SERVICE_ROLE_KEY, SEED_SAMPLE };
}

/**
 * Calls Supabase SQL API to execute provided SQL string.
 * @param {string} supabaseUrl
 * @param {string} serviceRoleKey
 * @param {string} sql
 * @returns {Promise<void>}
 */
async function execSql(supabaseUrl, serviceRoleKey, sql) {
  const endpoint = new URL("/sql/v1", supabaseUrl).toString();
  const payload = JSON.stringify({
    query: sql,
  });

  const { hostname, pathname, protocol } = new URL(endpoint);
  const options = {
    hostname,
    path: pathname,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${serviceRoleKey}`,
      "apikey": serviceRoleKey,
      "Content-Length": Buffer.byteLength(payload),
    },
  };
  if (protocol !== "https:") {
    throw new Error("Supabase SQL API must be https");
  }

  await new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let chunks = "";
      res.on("data", (d) => (chunks += d));
      res.on("end", () => {
        const status = res.statusCode || 0;
        if (status >= 200 && status < 300) return resolve();
        // Try to parse error body for diagnostics but do not log secrets
        let body = chunks;
        try {
          const parsed = JSON.parse(chunks);
          body = JSON.stringify(parsed);
        } catch (_) {
          // keep raw
        }
        reject(new Error(`SQL API error (${status}): ${body}`));
      });
    });
    req.on("error", reject);
    req.write(payload);
    req.end();
  });
}

function readSqlFile(relPath) {
  const full = path.resolve(__dirname, "..", relPath);
  return fs.readFileSync(full, "utf8");
}

async function main() {
  const start = Date.now();
  console.log("[Supabase] Applying schema...");
  const { SUPABASE_URL, SERVICE_ROLE_KEY, SEED_SAMPLE } = getEnv();

  // Read schema
  const schemaSql = readSqlFile("supabase/schema.sql");

  // Apply schema
  await execSql(SUPABASE_URL, SERVICE_ROLE_KEY, schemaSql);
  console.log("[Supabase] Schema applied successfully.");

  if (SEED_SAMPLE) {
    console.log("[Supabase] SEED_SAMPLE=true detected.");
    // minimal seed using a SQL function to insert a public snippet with a synthetic user (requires valid auth context)
    // Because auth.uid() is not available via SQL API context, we seed generic public data not tied to RLS tables requiring auth.
    // We'll seed into tables that do not strictly require auth.uid() checks for insert (none). For safer seed, create a simple book with a dummy user that must exist.
    // To avoid broken constraints, skip seeding user-owned tables here since they require valid auth.uid()-based policies.
    console.log("[Supabase] Skipping user-owned seeds due to RLS restrictions in SQL API context. You can insert your own data via the app after sign-in.");
  } else {
    console.log("[Supabase] SEED_SAMPLE not set; skipping seeds.");
  }

  console.log(`[Supabase] Done in ${Date.now() - start}ms`);
}

if (require.main === module) {
  main().catch((err) => {
    console.error("[Supabase] Failed:", err.message || err);
    process.exit(1);
  });
}
