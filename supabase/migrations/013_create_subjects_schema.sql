-- ============================================================
-- Migration 013: Create subjects table with RLS policies
-- ============================================================

-- Create subjects table
CREATE TABLE IF NOT EXISTS subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  name text NOT NULL,
  code text,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_subjects_school_id ON subjects(school_id);
CREATE INDEX IF NOT EXISTS idx_subjects_name ON subjects(name);

-- Enable RLS
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS subjects_select_all ON subjects;
DROP POLICY IF EXISTS subjects_insert_owner ON subjects;
DROP POLICY IF EXISTS subjects_update_owner ON subjects;
DROP POLICY IF EXISTS subjects_delete_owner ON subjects;

-- SELECT: super_admin and school members can view
CREATE POLICY subjects_select_all ON subjects
  FOR SELECT
  USING (
    is_super_admin(auth.uid()) OR
    get_user_role(auth.uid(), school_id) IS NOT NULL
  );

-- INSERT: super_admin and school owner can add
CREATE POLICY subjects_insert_owner ON subjects
  FOR INSERT
  WITH CHECK (
    is_super_admin(auth.uid()) OR
    get_user_role(auth.uid(), school_id) = 'owner'
  );

-- UPDATE: super_admin and school owner can edit
CREATE POLICY subjects_update_owner ON subjects
  FOR UPDATE
  USING (
    is_super_admin(auth.uid()) OR
    get_user_role(auth.uid(), school_id) = 'owner'
  );

-- DELETE: super_admin and school owner can remove
CREATE POLICY subjects_delete_owner ON subjects
  FOR DELETE
  USING (
    is_super_admin(auth.uid()) OR
    get_user_role(auth.uid(), school_id) = 'owner'
  );
