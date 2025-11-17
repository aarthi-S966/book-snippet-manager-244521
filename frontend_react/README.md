# Book Snippet Manager - Frontend (React)

Modern, lightweight UI following the Ocean Professional theme.

## Setup

1) Install dependencies
```bash
npm install
```

2) Configure environment variables
- Copy `.env.example` to `.env`
- Set:
  - REACT_APP_SUPABASE_URL
  - REACT_APP_SUPABASE_KEY
  - REACT_APP_FRONTEND_URL (recommended for magic link/signup redirects; defaults to current origin)
  
Important for Supabase auth:
- This app uses hash-based routing (/#/...). The magic-link redirect MUST end up at `#/auth/callback`.
- Recommended local dev redirect URL to add in Supabase Auth > URL Configuration > Redirect URLs:
  - http://localhost:3000/#/auth/callback
- If you deploy to a preview URL, ensure the preview origin is included and also ends with `#/auth/callback`, e.g.:
  - https://your-preview.example.com/#/auth/callback
- The app computes emailRedirectTo using REACT_APP_FRONTEND_URL (or current origin as a fallback) and appends `#/auth/callback`.

See `README_SUPABASE.md` for the expected Supabase schema and RLS policies.

3) Start
```bash
npm start
```

## Notes

- No secrets are hardcoded. All configuration via environment variables.
- Public route: `#/s/:id` for read-only shared snippets. When copying links, ensure the `#/` hash is present.
- Routes use hash-based navigation to avoid extra dependencies.
- Snippet mutations (create/update/delete/toggle public) require an authenticated user and are authorized by RLS using `owner_id`. The client also applies owner checks for better UX.
