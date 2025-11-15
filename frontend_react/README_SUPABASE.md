# Supabase Schema and RLS Notes

The React app expects a `snippets` table with the following columns (SQL shown for reference):

```sql
create table if not exists public.snippets (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  author text,
  "bookTitle" text,
  content text not null,
  tags text[] default '{}',
  is_public boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Row Level Security
alter table public.snippets enable row level security;

-- Policies
create policy "Allow read own or public" on public.snippets
for select
using (
  is_public = true
  or auth.uid() = owner_id
);

create policy "Allow insert for authenticated as owner" on public.snippets
for insert
to authenticated
with check (auth.uid() = owner_id);

create policy "Allow update for owner" on public.snippets
for update
to authenticated
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

create policy "Allow delete for owner" on public.snippets
for delete
to authenticated
using (auth.uid() = owner_id);
```

Notes:
- The client attaches `owner_id` from the current session when creating a snippet.
- Update/delete/toggle sharing operations are guarded client-side and must also pass RLS policies server-side.
- Public view (`#/s/:id`) loads if `is_public = true`.

Environment variables (frontend):
- REACT_APP_SUPABASE_URL
- REACT_APP_SUPABASE_KEY
- REACT_APP_FRONTEND_URL (for magic-link and signup redirect)
