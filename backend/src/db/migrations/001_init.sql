-- Lean Storytelling v0.3 — Initial schema

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  job_title VARCHAR(100),
  intent VARCHAR(200),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  onboarded_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);

-- Stories
CREATE TABLE IF NOT EXISTS stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_stories_user_id ON stories (user_id);

-- Story versions
CREATE TABLE IF NOT EXISTS story_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  context TEXT,
  target TEXT,
  empathy TEXT,
  problem TEXT,
  consequences TEXT,
  solution TEXT,
  benefits TEXT,
  why TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_story_version UNIQUE (story_id, version_number)
);

CREATE INDEX IF NOT EXISTS idx_story_versions_story_id ON story_versions (story_id);

-- Magic link tokens
CREATE TABLE IF NOT EXISTS magic_link_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL,
  token_hash VARCHAR(64) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_magic_link_token_hash ON magic_link_tokens (token_hash);
CREATE INDEX IF NOT EXISTS idx_magic_link_email_created ON magic_link_tokens (email, created_at);
