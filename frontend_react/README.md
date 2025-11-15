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
  - REACT_APP_FRONTEND_URL (optional; defaults to current origin)
  
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
