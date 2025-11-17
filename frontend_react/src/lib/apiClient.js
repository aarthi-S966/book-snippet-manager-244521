"use strict";

import { getEnv } from "../config/env";
import { getSupabaseClient } from "./supabaseClient";

/**
 * PUBLIC_INTERFACE
 * apiFetch performs a fetch to the backend API with Authorization header from Supabase session.
 *
 * - Base URL is resolved from REACT_APP_API_BASE or REACT_APP_BACKEND_URL
 * - Automatically attaches Authorization: Bearer <access_token> if available
 * - Provides JSON parsing, error normalization, and optional abort support
 */
export async function apiFetch(path, { method = "GET", headers = {}, body, signal } = {}) {
  const env = getEnv();
  const supabase = getSupabaseClient();
  const baseUrl = (env.API_BASE || env.BACKEND_URL || "").replace(/\/+$/, "");
  if (!baseUrl) {
    throw new Error("API base URL not configured. Set REACT_APP_API_BASE or REACT_APP_BACKEND_URL.");
  }
  const url = `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;

  let token = null;
  try {
    if (supabase) {
      const { data } = await supabase.auth.getSession();
      token = data?.session?.access_token || null;
    }
  } catch (_) {
    // ignore, will call without auth header
  }

  const finalHeaders = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...headers,
  };

  const res = await fetch(url, {
    method,
    headers: finalHeaders,
    body: body ? JSON.stringify(body) : undefined,
    signal,
    credentials: "include",
    mode: "cors",
  });

  const contentType = res.headers.get("content-type") || "";

  let parsed = null;
  if (contentType.includes("application/json")) {
    try {
      parsed = await res.json();
    } catch (_) {
      parsed = null;
    }
  } else {
    try {
      parsed = await res.text();
    } catch {
      parsed = null;
    }
  }

  if (!res.ok) {
    // Normalize error message without leaking sensitive details
    const msg =
      (parsed && (parsed.message || parsed.error || parsed.detail)) ||
      `Request failed with status ${res.status}`;
    const error = new Error(typeof msg === "string" ? msg : "Request failed");
    error.status = res.status;
    error.data = parsed;
    throw error;
  }
  return parsed;
}

/**
 * PUBLIC_INTERFACE
 * Backend API helpers for specific resources
 */
export const Api = {
  // Health
  async health() {
    return apiFetch("/health", { method: "GET" });
  },

  // Profile
  async me() {
    return apiFetch("/profile/me", { method: "GET" });
  },

  // Books
  async listBooks() {
    return apiFetch("/books", { method: "GET" });
  },
  async createBook(payload) {
    return apiFetch("/books", { method: "POST", body: payload });
  },
  async getBook(id) {
    return apiFetch(`/books/${encodeURIComponent(id)}`, { method: "GET" });
  },
  async updateBook(id, patch) {
    return apiFetch(`/books/${encodeURIComponent(id)}`, { method: "PATCH", body: patch });
  },
  async deleteBook(id) {
    return apiFetch(`/books/${encodeURIComponent(id)}`, { method: "DELETE" });
  },

  // Snippets
  async listSnippets({ search = "", tag = "" } = {}) {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (tag) params.set("tag", tag);
    const qs = params.toString();
    return apiFetch(`/snippets${qs ? `?${qs}` : ""}`, { method: "GET" });
  },
  async createSnippet(payload) {
    return apiFetch("/snippets", { method: "POST", body: payload });
  },
  async updateSnippet(id, patch) {
    return apiFetch(`/snippets/${encodeURIComponent(id)}`, { method: "PATCH", body: patch });
  },
  async deleteSnippet(id) {
    return apiFetch(`/snippets/${encodeURIComponent(id)}`, { method: "DELETE" });
  },

  // Shares
  async createShare(snippetId) {
    return apiFetch(`/shares/${encodeURIComponent(snippetId)}`, { method: "POST" });
  },
  async getShareByToken(token) {
    return apiFetch(`/shares/${encodeURIComponent(token)}`, { method: "GET" });
  },
};
