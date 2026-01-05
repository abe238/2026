-- Momentum 2026 Database Schema
-- Run this on the VPS PostgreSQL database

-- Create enums
DO $$ BEGIN
  CREATE TYPE goal_area_id AS ENUM (
    'physical_health',
    'mental_health',
    'family_ian',
    'family_wife',
    'work_strategic',
    'work_leadership',
    'content_newsletter'
  );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE capture_method AS ENUM ('voice', 'tap', 'manual', 'import');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE week_start_day AS ENUM ('0', '1', '6');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  display_name VARCHAR(100) NOT NULL,
  timezone VARCHAR(50) NOT NULL DEFAULT 'America/Los_Angeles',
  week_start_day week_start_day NOT NULL DEFAULT '1',
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create goal_areas table
CREATE TABLE IF NOT EXISTS goal_areas (
  id goal_area_id NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  display_name VARCHAR(100) NOT NULL,
  emoji VARCHAR(10) NOT NULL,
  color VARCHAR(20) NOT NULL,
  weekly_min_wins INTEGER NOT NULL DEFAULT 3,
  intention_text TEXT,
  flexibility_budget INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
  PRIMARY KEY (id, user_id)
);

-- Create wins table
CREATE TABLE IF NOT EXISTS wins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  goal_area_id goal_area_id NOT NULL,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  duration INTEGER,
  energy_boost INTEGER,
  occurred_at TIMESTAMP NOT NULL,
  captured_at TIMESTAMP DEFAULT NOW() NOT NULL,
  capture_method capture_method NOT NULL DEFAULT 'manual',
  voice_transcript TEXT,
  is_archived BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create intentions table
CREATE TABLE IF NOT EXISTS intentions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  goal_area_id goal_area_id NOT NULL,
  week_start TIMESTAMP NOT NULL,
  intention_text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create flexibility_events table
CREATE TABLE IF NOT EXISTS flexibility_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  from_goal_area_id goal_area_id NOT NULL,
  to_goal_area_id goal_area_id NOT NULL,
  week_start TIMESTAMP NOT NULL,
  reason TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create voice_captures table
CREATE TABLE IF NOT EXISTS voice_captures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  transcript TEXT NOT NULL,
  audio_url VARCHAR(500),
  extracted_wins TEXT,
  processing_status VARCHAR(20) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_wins_user_id ON wins(user_id);
CREATE INDEX IF NOT EXISTS idx_wins_goal_area_id ON wins(goal_area_id);
CREATE INDEX IF NOT EXISTS idx_wins_occurred_at ON wins(occurred_at);
CREATE INDEX IF NOT EXISTS idx_goal_areas_user_id ON goal_areas(user_id);
