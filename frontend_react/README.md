# Book Snippet Manager - Frontend (React)

Modern, lightweight UI following the Ocean Professional theme.

## Features

- Authentication (email/password and magic link via Supabase)
- Snippet library with search and tag filters
- Create, edit, delete snippets with validation
- Public sharing toggle (is_public) and copy share link (hash route `#/s/:token`)
- Responsive layout with top navbar and sidebar filters
- Uses backend API for data (attaches Supabase session JWT)

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
  - REACT_APP_API_BASE or REACT_APP_BACKEND_URL (backend API base, e.g. http://localhost:8000)

Important for Supabase auth:
- This app uses hash-based routing (/#/...). The magic-link redirect MUST end up at `#/auth/callback`.
- Recommended local dev redirect URL to add in Supabase Auth > URL Configuration > Redirect URLs:
  - http://localhost:3000/#/auth/callback
- If you deploy to a preview URL, ensure the preview origin is included and also ends with `#/auth/callback`, e.g.:
  - https://your-preview.example.com/#/auth/callback
- Supabase may also send PKCE code links to the callback with the `code` in the query string (e.g. `http://localhost:3000/#/auth/callback?code=...`). Our callback handler supports both query (`?code=`) and hash token formats (`#/auth/callback#access_token=...`).
- Ensure your Supabase project's Auth > URL Configuration includes ALL relevant redirect URL variants you use (local, preview, production), pointing specifically to `#/auth/callback`.

The app computes `emailRedirectTo` using `REACT_APP_FRONTEND_URL` (or current origin as a fallback) and appends `#/auth/callback`. Avoid trailing slashes or spaces.

3) Start
```bash
npm start
```

## Backend API Integration

- Base URL is read from `REACT_APP_API_BASE` or `REACT_APP_BACKEND_URL`.
- All authenticated requests include `Authorization: Bearer <supabase_session_access_token>`.
- Implemented endpoints used by the UI:
  - GET `/health`
  - GET `/profile/me`
  - Snippets: `GET /snippets`, `POST /snippets`, `PATCH /snippets/:id`, `DELETE /snippets/:id`
  - Shares: `POST /shares/:snippetId`, `GET /shares/:token` (for public snippet view)
  - Books: `GET /books`, `POST /books`, `GET /books/:id`, `PATCH /books/:id`, `DELETE /books/:id`

## Notes

- No secrets are hardcoded. All configuration via environment variables.
- Public route: `#/s/:token` for read-only shared snippets via backend share token endpoint.
- Routes use hash-based navigation to avoid extra dependencies.
- Error messages shown to users are friendly and do not expose sensitive details. Internally, additional info is logged in development only.
