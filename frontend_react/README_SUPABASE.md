# Supabase Schema and RLS Notes

This project includes a CLI to create Supabase schema (profiles, books, snippets, shares), add FKs/indexes, enable RLS, and define secure policies. It uses the Supabase SQL API with a service role key provided at runtime (never committed).

## Apply Schema

1) Ensure you have the following environment variables available when running the CLI (do not commit secrets):
- REACT_APP_SUPABASE_URL (or SUPABASE_URL)
- SUPABASE_SERVICE_ROLE_KEY (or REACT_APP_SUPABASE_SERVICE_ROLE_KEY)

2) Run:
```bash
# from frontend_react/
npm run supabase:apply

# optional seeds (skips user-owned inserts due to RLS context)
SEED_SAMPLE=true npm run supabase:apply
```

The script reads SQL from `supabase/schema.sql` and applies it idempotently.

## Schema Overview (created by schema.sql)

- public.profiles (id uuid PK references auth.users(id), display_name, avatar_url, created_at)
- public.books (id uuid PK, user_id uuid FK -> auth.users, title, author, cover_url, created_at)
- public.snippets (id uuid PK, user_id uuid FK -> auth.users, book_id uuid FK -> books, content, page, tags[], created_at)
- public.shares (id uuid PK, snippet_id FK -> snippets, is_public bool, share_token unique, created_at)
- Indexes on user_id/book_id/snippet_id/share_token
- RLS enabled on profiles, books, snippets, shares
- Policies restricting access to owners via auth.uid()
- Public read-only view `public.public_snippet_view` (anon granted SELECT) exposing only publicly shared snippets via shares

## Frontend Expectations

The current UI primarily interacts with a simple `snippets` model. If you already had an earlier simple schema, you can migrate content or adapt minimal code as needed. The provided schema supports:
- Per-user ownership via `user_id`
- Optional association to a `book_id`
- Public sharing handled via `shares` table and `public_snippet_view` for anonymous/permalink access

Environment variables (frontend):
- REACT_APP_SUPABASE_URL
- REACT_APP_SUPABASE_KEY
- REACT_APP_FRONTEND_URL (for magic-link and signup redirect; should be added to Supabase Auth Redirect URLs)

Security notes:
- Never commit the service role key. Provide it at runtime only for running the schema CLI or in CI.
- Policies and RLS ensure users only see/manage their own records; public reading is limited to the dedicated view.
