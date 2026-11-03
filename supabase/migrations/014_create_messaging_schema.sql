-- ============================================================
-- Migration 014: Create messages and SMS points tables with RLS policies
-- ============================================================

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  recipient_type text NOT NULL,
  subject text NOT NULL,
  body text NOT NULL,
  status text NOT NULL DEFAULT 'sent',
  sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_messages_school_id ON messages(school_id);
CREATE INDEX IF NOT EXISTS idx_messages_status ON messages(status);

-- Enable RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS messages_select_all ON messages;
DROP POLICY IF EXISTS messages_insert_owner ON messages;
DROP POLICY IF EXISTS messages_update_owner ON messages;
DROP POLICY IF EXISTS messages_delete_owner ON messages;

-- SELECT: super_admin and school members can view
CREATE POLICY messages_select_all ON messages
  FOR SELECT
  USING (
    is_super_admin(auth.uid()) OR
    get_user_role(auth.uid(), school_id) IS NOT NULL
  );

-- INSERT: super_admin and school owner can send
CREATE POLICY messages_insert_owner ON messages
  FOR INSERT
  WITH CHECK (
    is_super_admin(auth.uid()) OR
    get_user_role(auth.uid(), school_id) = 'owner'
  );

-- UPDATE: super_admin and school owner can update status
CREATE POLICY messages_update_owner ON messages
  FOR UPDATE
  USING (
    is_super_admin(auth.uid()) OR
    get_user_role(auth.uid(), school_id) = 'owner'
  );

-- DELETE: super_admin and school owner can remove
CREATE POLICY messages_delete_owner ON messages
  FOR DELETE
  USING (
    is_super_admin(auth.uid()) OR
    get_user_role(auth.uid(), school_id) = 'owner'
  );

-- ============================================================
-- Create SMS points table
-- ============================================================

CREATE TABLE IF NOT EXISTS sms_points (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  points_remaining integer NOT NULL DEFAULT 4,
  points_total integer NOT NULL DEFAULT 4,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(school_id)
);

-- Enable RLS
ALTER TABLE sms_points ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS sms_points_select_all ON sms_points;
DROP POLICY IF EXISTS sms_points_insert_owner ON sms_points;
DROP POLICY IF EXISTS sms_points_update_owner ON sms_points;
DROP POLICY IF EXISTS sms_points_delete_owner ON sms_points;

-- SELECT: super_admin and school members can view
CREATE POLICY sms_points_select_all ON sms_points
  FOR SELECT
  USING (
    is_super_admin(auth.uid()) OR
    get_user_role(auth.uid(), school_id) IS NOT NULL
  );

-- INSERT: super_admin and school owner can add points
CREATE POLICY sms_points_insert_owner ON sms_points
  FOR INSERT
  WITH CHECK (
    is_super_admin(auth.uid()) OR
    get_user_role(auth.uid(), school_id) = 'owner'
  );

-- UPDATE: super_admin and school owner can update points
CREATE POLICY sms_points_update_owner ON sms_points
  FOR UPDATE
  USING (
    is_super_admin(auth.uid()) OR
    get_user_role(auth.uid(), school_id) = 'owner'
  );

-- DELETE: super_admin and school owner can remove
CREATE POLICY sms_points_delete_owner ON sms_points
  FOR DELETE
  USING (
    is_super_admin(auth.uid()) OR
    get_user_role(auth.uid(), school_id) = 'owner'
  );

-- Seed initial SMS points for existing schools without records
INSERT INTO sms_points (school_id, points_remaining, points_total)
SELECT s.id, 4, 4
FROM schools s
WHERE NOT EXISTS (
  SELECT 1 FROM sms_points sp WHERE sp.school_id = s.id
);
