-- Migration: Add tags and entries_tags join table
-- Run this locally against your development database or paste into Supabase SQL editor.

BEGIN;

-- Create tags table
CREATE TABLE IF NOT EXISTS tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Ensure a user can only have one tag with the same name
CREATE UNIQUE INDEX IF NOT EXISTS tags_user_name_idx ON tags (user_id, lower(name));

-- Join table between entries and tags
CREATE TABLE IF NOT EXISTS entries_tags (
  entry_id uuid NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
  tag_id uuid NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (entry_id, tag_id)
);

COMMIT;

-- Notes:
-- 1) This migration creates a normalized `tags` table and an associative `entries_tags` table.
-- 2) Add RLS policies similar to your `entries` policies if you use RLS (allow users to select/insert their own tags).

-- Ensure pgcrypto (for gen_random_uuid) exists. Supabase normally provides this,
-- but we'll create it if missing so migrations are idempotent.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Make sure we operate in the public schema explicitly
SET search_path TO public;

BEGIN;

-- Enable Row Level Security on tags and entries_tags
ALTER TABLE IF EXISTS public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.entries_tags ENABLE ROW LEVEL SECURITY;

-- Policies for tags: owners can select/insert/update/delete their tags
CREATE POLICY IF NOT EXISTS "Users can view their own tags"
  ON public.tags
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can insert their own tags"
  ON public.tags
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update their own tags"
  ON public.tags
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can delete their own tags"
  ON public.tags
  FOR DELETE
  USING (auth.uid() = user_id);

-- Policies for entries_tags: allow operations only when the entry belongs to the user
CREATE POLICY IF NOT EXISTS "Users can view mappings for their entries"
  ON public.entries_tags
  FOR SELECT
  USING (
    exists (
      select 1 from public.entries e where e.id = entries_tags.entry_id and e.user_id = auth.uid()
    )
  );

CREATE POLICY IF NOT EXISTS "Users can insert mappings for their entries"
  ON public.entries_tags
  FOR INSERT
  WITH CHECK (
    exists (
      select 1 from public.entries e where e.id = entries_tags.entry_id and e.user_id = auth.uid()
    )
  );

CREATE POLICY IF NOT EXISTS "Users can delete mappings for their entries"
  ON public.entries_tags
  FOR DELETE
  USING (
    exists (
      select 1 from public.entries e where e.id = entries_tags.entry_id and e.user_id = auth.uid()
    )
  );

-- Indexes for performance
CREATE INDEX IF NOT EXISTS tags_user_id_idx ON public.tags(user_id);
CREATE INDEX IF NOT EXISTS entries_tags_entry_id_idx ON public.entries_tags(entry_id);
CREATE INDEX IF NOT EXISTS entries_tags_tag_id_idx ON public.entries_tags(tag_id);

COMMIT;
