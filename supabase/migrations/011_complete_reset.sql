-- ============================================================
-- COMPLETE DATABASE RESET - Run this ONCE in Supabase SQL Editor
-- This replaces ALL previous migrations (001-010)
-- It will drop and recreate everything from scratch
-- ============================================================

-- -----------------------------------------------------------
-- 1. Drop all existing tables (safe, ignores missing tables)
-- -----------------------------------------------------------
DROP TABLE IF EXISTS classes CASCADE;
DROP TABLE IF EXISTS teachers CASCADE;
DROP TABLE IF EXISTS students CASCADE;
DROP TABLE IF EXISTS school_members CASCADE;
DROP TABLE IF EXISTS schools CASCADE;

-- Drop all helper functions
DROP FUNCTION IF EXISTS get_user_role(UUID, UUID) CASCADE;
DROP FUNCTION IF EXISTS is_super_admin(UUID) CASCADE;
DROP FUNCTION IF EXISTS add_school_member(UUID, TEXT, TEXT) CASCADE;
DROP FUNCTION IF EXISTS sync_school_member_email() CASCADE;

-- -----------------------------------------------------------
-- 2. Create the schools table
-- -----------------------------------------------------------
CREATE TABLE schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  logo_url TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- -----------------------------------------------------------
-- 3. Create the school_members table with email column
-- -----------------------------------------------------------
CREATE TABLE school_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'member')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (school_id, user_id)
);

-- -----------------------------------------------------------
-- 4. Create the students table
-- -----------------------------------------------------------
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,

  -- Personal Info
  full_name TEXT NOT NULL,
  date_of_birth DATE,
  gender TEXT,
  place_of_birth TEXT,
  religion TEXT,
  address TEXT,

  -- Academic Info
  previous_school TEXT,
  last_class_completed TEXT,
  special_needs TEXT,

  -- Parent/Guardian Info
  parent_name TEXT NOT NULL,
  parent_relationship TEXT,
  parent_occupation TEXT,
  parent_contact TEXT NOT NULL,
  parent_address TEXT,

  -- Documentation
  photo_url TEXT,

  -- School Use Only
  admission_number TEXT,
  assigned_class TEXT,
  house TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------
-- 5. Create the teachers table (combined 007 + 008)
-- -----------------------------------------------------------
CREATE TABLE teachers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,

  -- Personal Info
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  date_of_birth DATE,
  gender TEXT,
  marital_status TEXT,
  nationality TEXT DEFAULT 'Ghanaian',
  religion TEXT,
  address TEXT,

  -- Professional/Academic Info
  subjects TEXT NOT NULL,
  assigned_class TEXT,
  hire_date DATE NOT NULL,
  qualification TEXT,
  experience TEXT,
  appointment_date DATE,
  assigned_subjects TEXT[],

  -- Next of Kin Info
  next_of_kin_name TEXT,
  next_of_kin_relationship TEXT,
  next_of_kin_contact TEXT,
  next_of_kin_address TEXT,

  -- Photo
  photo_url TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------
-- 6. Create the classes table
-- -----------------------------------------------------------
CREATE TABLE classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,

  -- Class Info
  name TEXT NOT NULL,
  level TEXT NOT NULL, -- early-childhood, primary, junior-high
  grade TEXT NOT NULL, -- e.g. "Primary 1", "Nursery 2", "JHS 1"
  subdivision TEXT, -- optional, e.g. "A", "B"

  -- Teacher & Room
  class_teacher_id UUID REFERENCES teachers(id) ON DELETE SET NULL,
  max_students INTEGER DEFAULT 30,
  room TEXT,

  -- Subjects
  assigned_subjects TEXT[],

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------
-- 7. Enable Row Level Security on all tables
-- -----------------------------------------------------------
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------
-- 8. Create helper functions (SECURITY DEFINER to bypass RLS)
-- -----------------------------------------------------------

-- Get user role in a specific school
CREATE OR REPLACE FUNCTION get_user_role(p_user_id UUID, p_school_id UUID)
RETURNS TEXT AS $$
  SELECT role FROM school_members
  WHERE user_id = p_user_id AND school_id = p_school_id
  LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER;

-- Check if user is super admin
CREATE OR REPLACE FUNCTION is_super_admin(p_user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = p_user_id AND email = 'michaelnhyira77@gmail.com'
  );
$$ LANGUAGE SQL SECURITY DEFINER;

-- Add a school member by email
CREATE OR REPLACE FUNCTION add_school_member(
  p_school_id UUID,
  p_email TEXT,
  p_role TEXT DEFAULT 'member'
)
RETURNS VOID AS $$
  DECLARE
    v_user_id UUID;
  BEGIN
    SELECT id INTO v_user_id FROM auth.users WHERE email = p_email;

    IF v_user_id IS NULL THEN
      RAISE EXCEPTION 'User with email % not found', p_email;
    END IF;

    INSERT INTO school_members (school_id, user_id, email, role)
    VALUES (p_school_id, v_user_id, p_email, p_role);
  END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Sync email from auth.users on insert/update
CREATE OR REPLACE FUNCTION sync_school_member_email()
RETURNS TRIGGER AS $$
BEGIN
  NEW.email := (SELECT email FROM auth.users WHERE id = NEW.user_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to keep email in sync
DROP TRIGGER IF EXISTS sync_member_email_trigger ON school_members;
CREATE TRIGGER sync_member_email_trigger
  BEFORE INSERT OR UPDATE OF user_id ON school_members
  FOR EACH ROW
  EXECUTE FUNCTION sync_school_member_email();

-- -----------------------------------------------------------
-- 9. RLS Policies for schools table
-- -----------------------------------------------------------

-- Super admin can select all schools
CREATE POLICY schools_select_all
  ON schools FOR SELECT
  USING (is_super_admin(auth.uid()));

-- Users can select schools they are members of
CREATE POLICY schools_select_member
  ON schools FOR SELECT
  USING (get_user_role(auth.uid(), id) IS NOT NULL);

-- Super admin can insert schools
CREATE POLICY schools_insert_super_admin
  ON schools FOR INSERT
  WITH CHECK (is_super_admin(auth.uid()));

-- Super admin can update schools
CREATE POLICY schools_update_super_admin
  ON schools FOR UPDATE
  USING (is_super_admin(auth.uid()));

-- Super admin can delete schools
CREATE POLICY schools_delete_super_admin
  ON schools FOR DELETE
  USING (is_super_admin(auth.uid()));

-- -----------------------------------------------------------
-- 10. RLS Policies for school_members table
-- -----------------------------------------------------------

-- Super admin can select all school_members
CREATE POLICY school_members_select_all
  ON school_members FOR SELECT
  USING (is_super_admin(auth.uid()));

-- School owners can select members of their school
CREATE POLICY school_members_select_owner
  ON school_members FOR SELECT
  USING (get_user_role(auth.uid(), school_id) = 'owner');

-- School members can see their own membership record
CREATE POLICY school_members_select_self
  ON school_members FOR SELECT
  USING (user_id = auth.uid());

-- Super admin can insert school_members
CREATE POLICY school_members_insert_super_admin
  ON school_members FOR INSERT
  WITH CHECK (is_super_admin(auth.uid()));

-- School owners can insert members to their school
CREATE POLICY school_members_insert_owner
  ON school_members FOR INSERT
  WITH CHECK (get_user_role(auth.uid(), school_id) = 'owner');

-- Super admin can delete school_members
CREATE POLICY school_members_delete_super_admin
  ON school_members FOR DELETE
  USING (is_super_admin(auth.uid()));

-- School owners can delete members from their school
CREATE POLICY school_members_delete_owner
  ON school_members FOR DELETE
  USING (get_user_role(auth.uid(), school_id) = 'owner');

-- Super admin can update school_members
CREATE POLICY school_members_update_super_admin
  ON school_members FOR UPDATE
  USING (is_super_admin(auth.uid()));

-- School owners can update members of their school
CREATE POLICY school_members_update_owner
  ON school_members FOR UPDATE
  USING (get_user_role(auth.uid(), school_id) = 'owner');

-- -----------------------------------------------------------
-- 11. RLS Policies for students table
-- -----------------------------------------------------------

-- Super admin can select all students
CREATE POLICY students_select_all
  ON students FOR SELECT
  USING (is_super_admin(auth.uid()));

-- School members can select students of their school
CREATE POLICY students_select_member
  ON students FOR SELECT
  USING (get_user_role(auth.uid(), school_id) IS NOT NULL);

-- Super admin can insert students
CREATE POLICY students_insert_super_admin
  ON students FOR INSERT
  WITH CHECK (is_super_admin(auth.uid()));

-- School owners can insert students to their school
CREATE POLICY students_insert_owner
  ON students FOR INSERT
  WITH CHECK (get_user_role(auth.uid(), school_id) = 'owner');

-- Super admin can update students
CREATE POLICY students_update_super_admin
  ON students FOR UPDATE
  USING (is_super_admin(auth.uid()));

-- School owners can update students of their school
CREATE POLICY students_update_owner
  ON students FOR UPDATE
  USING (get_user_role(auth.uid(), school_id) = 'owner');

-- Super admin can delete students
CREATE POLICY students_delete_super_admin
  ON students FOR DELETE
  USING (is_super_admin(auth.uid()));

-- School owners can delete students of their school
CREATE POLICY students_delete_owner
  ON students FOR DELETE
  USING (get_user_role(auth.uid(), school_id) = 'owner');

-- -----------------------------------------------------------
-- 12. RLS Policies for teachers table
-- -----------------------------------------------------------

-- Super admin can select all teachers
CREATE POLICY teachers_select_all
  ON teachers FOR SELECT
  USING (is_super_admin(auth.uid()));

-- School members can select teachers of their school
CREATE POLICY teachers_select_member
  ON teachers FOR SELECT
  USING (get_user_role(auth.uid(), school_id) IS NOT NULL);

-- Super admin can insert teachers
CREATE POLICY teachers_insert_super_admin
  ON teachers FOR INSERT
  WITH CHECK (is_super_admin(auth.uid()));

-- School owners can insert teachers to their school
CREATE POLICY teachers_insert_owner
  ON teachers FOR INSERT
  WITH CHECK (get_user_role(auth.uid(), school_id) = 'owner');

-- Super admin can update teachers
CREATE POLICY teachers_update_super_admin
  ON teachers FOR UPDATE
  USING (is_super_admin(auth.uid()));

-- School owners can update teachers of their school
CREATE POLICY teachers_update_owner
  ON teachers FOR UPDATE
  USING (get_user_role(auth.uid(), school_id) = 'owner');

-- Super admin can delete teachers
CREATE POLICY teachers_delete_super_admin
  ON teachers FOR DELETE
  USING (is_super_admin(auth.uid()));

-- School owners can delete teachers of their school
CREATE POLICY teachers_delete_owner
  ON teachers FOR DELETE
  USING (get_user_role(auth.uid(), school_id) = 'owner');

-- -----------------------------------------------------------
-- 13. RLS Policies for classes table
-- -----------------------------------------------------------

-- Super admin can select all classes
CREATE POLICY classes_select_all
  ON classes FOR SELECT
  USING (is_super_admin(auth.uid()));

-- School members can select classes of their school
CREATE POLICY classes_select_member
  ON classes FOR SELECT
  USING (get_user_role(auth.uid(), school_id) IS NOT NULL);

-- Super admin can insert classes
CREATE POLICY classes_insert_super_admin
  ON classes FOR INSERT
  WITH CHECK (is_super_admin(auth.uid()));

-- School owners can insert classes to their school
CREATE POLICY classes_insert_owner
  ON classes FOR INSERT
  WITH CHECK (get_user_role(auth.uid(), school_id) = 'owner');

-- Super admin can update classes
CREATE POLICY classes_update_super_admin
  ON classes FOR UPDATE
  USING (is_super_admin(auth.uid()));

-- School owners can update classes of their school
CREATE POLICY classes_update_owner
  ON classes FOR UPDATE
  USING (get_user_role(auth.uid(), school_id) = 'owner');

-- Super admin can delete classes
CREATE POLICY classes_delete_super_admin
  ON classes FOR DELETE
  USING (is_super_admin(auth.uid()));

-- School owners can delete classes of their school
CREATE POLICY classes_delete_owner
  ON classes FOR DELETE
  USING (get_user_role(auth.uid(), school_id) = 'owner');

-- -----------------------------------------------------------
-- 14. Create indexes for performance
-- -----------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_school_members_user_id ON school_members(user_id);
CREATE INDEX IF NOT EXISTS idx_school_members_school_id ON school_members(school_id);
CREATE INDEX IF NOT EXISTS idx_schools_created_by ON schools(created_by);

CREATE INDEX IF NOT EXISTS idx_students_school_id ON students(school_id);
CREATE INDEX IF NOT EXISTS idx_students_full_name ON students(full_name);
CREATE INDEX IF NOT EXISTS idx_students_assigned_class ON students(assigned_class);

CREATE INDEX IF NOT EXISTS idx_teachers_school_id ON teachers(school_id);
CREATE INDEX IF NOT EXISTS idx_teachers_full_name ON teachers(full_name);
CREATE INDEX IF NOT EXISTS idx_teachers_assigned_class ON teachers(assigned_class);

CREATE INDEX IF NOT EXISTS idx_classes_school_id ON classes(school_id);
CREATE INDEX IF NOT EXISTS idx_classes_level ON classes(level);
CREATE INDEX IF NOT EXISTS idx_classes_grade ON classes(grade);
CREATE INDEX IF NOT EXISTS idx_classes_teacher_id ON classes(class_teacher_id);

-- ============================================================
-- DONE! Your database is now set up with:
-- - schools table
-- - school_members table (with email sync)
-- - students table
-- - teachers table (with all expanded fields)
-- - classes table
-- - All RLS policies using helper functions (no recursion)
-- - All indexes for performance
-- ============================================================
