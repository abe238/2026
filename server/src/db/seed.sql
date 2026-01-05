-- Momentum 2026 Seed Data
-- Creates a default user and the 7 goal areas from PRD

-- Insert default user (we'll use a fixed ID for the MVP)
INSERT INTO users (id, email, display_name, timezone)
VALUES ('00000000-0000-0000-0000-000000000001', 'momentum@local', 'Momentum User', 'America/Los_Angeles')
ON CONFLICT (id) DO NOTHING;

-- Insert the 7 goal areas from PRD
INSERT INTO goal_areas (id, user_id, display_name, emoji, color, weekly_min_wins, sort_order, intention_text)
VALUES
  ('physical_health', '00000000-0000-0000-0000-000000000001', 'Physical Health', '💪', '#10B981', 3, 1, 'Taking care of my body'),
  ('mental_health', '00000000-0000-0000-0000-000000000001', 'Mental Health', '🧠', '#8B5CF6', 3, 2, 'Nurturing my mind'),
  ('family_ian', '00000000-0000-0000-0000-000000000001', 'Family: Ian', '👦', '#F59E0B', 3, 3, 'Quality time with Ian'),
  ('family_wife', '00000000-0000-0000-0000-000000000001', 'Family: Wife', '❤️', '#EC4899', 3, 4, 'Connection with my wife'),
  ('work_strategic', '00000000-0000-0000-0000-000000000001', 'Work: Strategic', '🎯', '#3B82F6', 3, 5, 'Strategic work impact'),
  ('work_leadership', '00000000-0000-0000-0000-000000000001', 'Work: Leadership', '👥', '#6366F1', 3, 6, 'Growing as a leader'),
  ('content_newsletter', '00000000-0000-0000-0000-000000000001', 'Content: Newsletter', '✍️', '#14B8A6', 3, 7, 'Creating valuable content')
ON CONFLICT DO NOTHING;

-- Verify seed
SELECT id, display_name, emoji, color FROM goal_areas;
