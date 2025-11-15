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

3) Start
```bash
npm start
```

## Notes

- No secrets are hardcoded. All configuration via environment variables.
- Public route: `#/s/:id` for read-only shared snippets.
- Routes use hash-based navigation to avoid extra dependencies.
