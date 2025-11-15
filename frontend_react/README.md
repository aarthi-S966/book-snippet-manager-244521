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
  
Important:
- In your Supabase project, add the FRONTEND URL to Auth > URL Configuration > Redirect URLs. For local dev, use http://localhost:3000/#/auth/callback
- This app uses hash-based routing (/#/...). Supabase will return to the provided origin and the app will finalize auth at the route `#/auth/callback`.

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
