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
