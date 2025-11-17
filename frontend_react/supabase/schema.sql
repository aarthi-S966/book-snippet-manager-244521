-- Enable required extensions for UUID generation
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1) profiles table mirrors auth.users id
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 2) books table
CREATE TABLE IF NOT EXISTS public.books (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  author text,
  cover_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_books_user ON public.books(user_id);

-- 3) snippets table
CREATE TABLE IF NOT EXISTS public.snippets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  book_id uuid REFERENCES public.books(id) ON DELETE SET NULL,
  content text NOT NULL,
  page int,
  tags text[],
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_snippets_user ON public.snippets(user_id);
CREATE INDEX IF NOT EXISTS idx_snippets_book ON public.snippets(book_id);

-- 4) shares table (public access via token)
CREATE TABLE IF NOT EXISTS public.shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  snippet_id uuid NOT NULL REFERENCES public.snippets(id) ON DELETE CASCADE,
  is_public boolean NOT NULL DEFAULT false,
  share_token text UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_shares_snippet ON public.shares(snippet_id);
CREATE INDEX IF NOT EXISTS idx_shares_token ON public.shares(share_token);

-- Enable RLS on user-owned tables
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.snippets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shares ENABLE ROW LEVEL SECURITY;

-- Policies for profiles (owner-only)
DO $$
BEGIN
  CREATE POLICY profiles_select_own ON public.profiles
    FOR SELECT USING (auth.uid() = id);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE POLICY profiles_insert_self ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE POLICY profiles_update_own ON public.profiles
    FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Policies for books (owner-only)
DO $$
BEGIN
  CREATE POLICY books_select_own ON public.books
    FOR SELECT USING (auth.uid() = user_id);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE POLICY books_insert_own ON public.books
    FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE POLICY books_update_own ON public.books
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE POLICY books_delete_own ON public.books
    FOR DELETE USING (auth.uid() = user_id);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Policies for snippets (owner-only + public via share)
DO $$
BEGIN
  CREATE POLICY snippets_select_own ON public.snippets
    FOR SELECT USING (auth.uid() = user_id);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE POLICY snippets_insert_own ON public.snippets
    FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE POLICY snippets_update_own ON public.snippets
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE POLICY snippets_delete_own ON public.snippets
    FOR DELETE USING (auth.uid() = user_id);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Public read policy via view that exposes only public shares
CREATE OR REPLACE VIEW public.public_snippet_view AS
  SELECT s.id AS snippet_id, s.content, s.page, s.tags, s.created_at, sh.share_token
  FROM public.snippets s
  JOIN public.shares sh ON sh.snippet_id = s.id
  WHERE sh.is_public = true;

-- Allow anon to select from public view
GRANT SELECT ON public.public_snippet_view TO anon;

-- Policies for shares (owner-only management)
DO $$
BEGIN
  CREATE POLICY shares_select_owner ON public.shares
    FOR SELECT USING (
      EXISTS (
        SELECT 1 FROM public.snippets s WHERE s.id = snippet_id AND s.user_id = auth.uid()
      )
    );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE POLICY shares_insert_owner ON public.shares
    FOR INSERT WITH CHECK (
      EXISTS (
        SELECT 1 FROM public.snippets s WHERE s.id = snippet_id AND s.user_id = auth.uid()
      )
    );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE POLICY shares_update_owner ON public.shares
    FOR UPDATE USING (
      EXISTS (
        SELECT 1 FROM public.snippets s WHERE s.id = snippet_id AND s.user_id = auth.uid()
      )
    ) WITH CHECK (
      EXISTS (
        SELECT 1 FROM public.snippets s WHERE s.id = snippet_id AND s.user_id = auth.uid()
      )
    );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE POLICY shares_delete_owner ON public.shares
    FOR DELETE USING (
      EXISTS (
        SELECT 1 FROM public.snippets s WHERE s.id = snippet_id AND s.user_id = auth.uid()
      )
    );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Optional seeds (only if requested in CLI; kept here commented for reference)
-- INSERT INTO public.books (user_id, title, author) VALUES (auth.uid(), 'Sample Book', 'Author');
