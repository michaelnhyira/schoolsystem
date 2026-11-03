-- Migration 016: Update user roles
-- Replace 'member' role with 'teacher' and 'accountant'
-- Run this in Supabase SQL Editor

-- 1. Update existing 'member' roles to 'teacher' (default)
UPDATE school_members
SET role = 'teacher'
WHERE role = 'member';

-- 2. Update the add_school_member RPC function to accept new roles
DROP FUNCTION IF EXISTS add_school_member(UUID, TEXT, TEXT);
CREATE OR REPLACE FUNCTION add_school_member(
  p_school_id UUID,
  p_user_email TEXT,
  p_role TEXT DEFAULT 'teacher'
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Find the user by email
  SELECT id INTO v_user_id FROM auth.users WHERE email = p_user_email;
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not found: %', p_user_email;
  END IF;
  
  -- Validate role
  IF p_role NOT IN ('owner', 'teacher', 'accountant') THEN
    RAISE EXCEPTION 'Invalid role: %. Must be owner, teacher, or accountant', p_role;
  END IF;
  
  -- Insert the member
  INSERT INTO school_members (school_id, user_id, email, role)
  VALUES (p_school_id, v_user_id, p_user_email, p_role);
END;
$$;

-- 3. Update the get_user_role function to handle new roles
CREATE OR REPLACE FUNCTION get_user_role(p_user_id UUID, p_school_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_role TEXT;
BEGIN
  -- Check if super admin
  IF is_super_admin(p_user_id) THEN
    RETURN 'super_admin';
  END IF;
  
  -- Get the user's role for this school
  SELECT role INTO v_role FROM school_members
  WHERE user_id = p_user_id AND school_id = p_school_id
  LIMIT 1;
  
  RETURN COALESCE(v_role, 'none');
END;
$$;

-- 4. Drop and recreate RLS policies to support new roles

-- schools policies
DROP POLICY IF EXISTS schools_select_all ON schools;
DROP POLICY IF EXISTS schools_insert_super_admin ON schools;
DROP POLICY IF EXISTS schools_update_super_admin ON schools;
DROP POLICY IF EXISTS schools_delete_super_admin ON schools;

CREATE POLICY schools_select_all ON schools
  FOR SELECT
  USING (
    is_super_admin(auth.uid()) OR
    get_user_role(auth.uid(), id) IN ('owner', 'teacher', 'accountant')
  );

CREATE POLICY schools_insert_super_admin ON schools
  FOR INSERT
  WITH CHECK (is_super_admin(auth.uid()));

CREATE POLICY schools_update_super_admin ON schools
  FOR UPDATE
  USING (is_super_admin(auth.uid()));

CREATE POLICY schools_delete_super_admin ON schools
  FOR DELETE
  USING (is_super_admin(auth.uid()));

-- school_members policies
DROP POLICY IF EXISTS school_members_select_all ON school_members;
DROP POLICY IF EXISTS school_members_insert_all ON school_members;
DROP POLICY IF EXISTS school_members_delete_all ON school_members;
DROP POLICY IF EXISTS school_members_update_all ON school_members;

CREATE POLICY school_members_select_all ON school_members
  FOR SELECT
  USING (
    is_super_admin(auth.uid()) OR
    get_user_role(auth.uid(), school_id) IN ('owner', 'accountant')
  );

CREATE POLICY school_members_insert_all ON school_members
  FOR INSERT
  WITH CHECK (
    is_super_admin(auth.uid()) OR
    get_user_role(auth.uid(), school_id) = 'owner'
  );

CREATE POLICY school_members_delete_all ON school_members
  FOR DELETE
  USING (
    is_super_admin(auth.uid()) OR
    get_user_role(auth.uid(), school_id) = 'owner'
  );

CREATE POLICY school_members_update_all ON school_members
  FOR UPDATE
  USING (
    is_super_admin(auth.uid()) OR
    get_user_role(auth.uid(), school_id) = 'owner'
  );

-- students policies
DROP POLICY IF EXISTS students_select_all ON students;
DROP POLICY IF EXISTS students_insert_all ON students;
DROP POLICY IF EXISTS students_update_all ON students;
DROP POLICY IF EXISTS students_delete_all ON students;

CREATE POLICY students_select_all ON students
  FOR SELECT
  USING (
    is_super_admin(auth.uid()) OR
    get_user_role(auth.uid(), school_id) IN ('owner', 'teacher', 'accountant')
  );

CREATE POLICY students_insert_all ON students
  FOR INSERT
  WITH CHECK (
    is_super_admin(auth.uid()) OR
    get_user_role(auth.uid(), school_id) IN ('owner', 'accountant')
  );

CREATE POLICY students_update_all ON students
  FOR UPDATE
  USING (
    is_super_admin(auth.uid()) OR
    get_user_role(auth.uid(), school_id) IN ('owner', 'accountant')
  );

CREATE POLICY students_delete_all ON students
  FOR DELETE
  USING (
    is_super_admin(auth.uid()) OR
    get_user_role(auth.uid(), school_id) IN ('owner', 'accountant')
  );

-- teachers policies
DROP POLICY IF EXISTS teachers_select_all ON teachers;
DROP POLICY IF EXISTS teachers_insert_all ON teachers;
DROP POLICY IF EXISTS teachers_update_all ON teachers;
DROP POLICY IF EXISTS teachers_delete_all ON teachers;

CREATE POLICY teachers_select_all ON teachers
  FOR SELECT
  USING (
    is_super_admin(auth.uid()) OR
    get_user_role(auth.uid(), school_id) IN ('owner', 'teacher', 'accountant')
  );

CREATE POLICY teachers_insert_all ON teachers
  FOR INSERT
  WITH CHECK (
    is_super_admin(auth.uid()) OR
    get_user_role(auth.uid(), school_id) IN ('owner', 'accountant')
  );

CREATE POLICY teachers_update_all ON teachers
  FOR UPDATE
  USING (
    is_super_admin(auth.uid()) OR
    get_user_role(auth.uid(), school_id) IN ('owner', 'accountant')
  );

CREATE POLICY teachers_delete_all ON teachers
  FOR DELETE
  USING (
    is_super_admin(auth.uid()) OR
    get_user_role(auth.uid(), school_id) IN ('owner', 'accountant')
  );

-- classes policies
DROP POLICY IF EXISTS classes_select_all ON classes;
DROP POLICY IF EXISTS classes_insert_all ON classes;
DROP POLICY IF EXISTS classes_update_all ON classes;
DROP POLICY IF EXISTS classes_delete_all ON classes;

CREATE POLICY classes_select_all ON classes
  FOR SELECT
  USING (
    is_super_admin(auth.uid()) OR
    get_user_role(auth.uid(), school_id) IN ('owner', 'teacher', 'accountant')
  );

CREATE POLICY classes_insert_all ON classes
  FOR INSERT
  WITH CHECK (
    is_super_admin(auth.uid()) OR
    get_user_role(auth.uid(), school_id) IN ('owner', 'accountant')
  );

CREATE POLICY classes_update_all ON classes
  FOR UPDATE
  USING (
    is_super_admin(auth.uid()) OR
    get_user_role(auth.uid(), school_id) IN ('owner', 'accountant')
  );

CREATE POLICY classes_delete_all ON classes
  FOR DELETE
  USING (
    is_super_admin(auth.uid()) OR
    get_user_role(auth.uid(), school_id) IN ('owner', 'accountant')
  );

-- subjects policies
DROP POLICY IF EXISTS subjects_select_all ON subjects;
DROP POLICY IF EXISTS subjects_insert_all ON subjects;
DROP POLICY IF EXISTS subjects_update_all ON subjects;
DROP POLICY IF EXISTS subjects_delete_all ON subjects;

CREATE POLICY subjects_select_all ON subjects
  FOR SELECT
  USING (
    is_super_admin(auth.uid()) OR
    get_user_role(auth.uid(), school_id) IN ('owner', 'teacher', 'accountant')
  );

CREATE POLICY subjects_insert_all ON subjects
  FOR INSERT
  WITH CHECK (
    is_super_admin(auth.uid()) OR
    get_user_role(auth.uid(), school_id) IN ('owner', 'accountant')
  );

CREATE POLICY subjects_update_all ON subjects
  FOR UPDATE
  USING (
    is_super_admin(auth.uid()) OR
    get_user_role(auth.uid(), school_id) IN ('owner', 'accountant')
  );

CREATE POLICY subjects_delete_all ON subjects
  FOR DELETE
  USING (
    is_super_admin(auth.uid()) OR
    get_user_role(auth.uid(), school_id) IN ('owner', 'accountant')
  );

-- messages policies
DROP POLICY IF EXISTS messages_select_all ON messages;
DROP POLICY IF EXISTS messages_insert_all ON messages;
DROP POLICY IF EXISTS messages_update_all ON messages;
DROP POLICY IF EXISTS messages_delete_all ON messages;

CREATE POLICY messages_select_all ON messages
  FOR SELECT
  USING (
    is_super_admin(auth.uid()) OR
    get_user_role(auth.uid(), school_id) IN ('owner', 'accountant')
  );

CREATE POLICY messages_insert_all ON messages
  FOR INSERT
  WITH CHECK (
    is_super_admin(auth.uid()) OR
    get_user_role(auth.uid(), school_id) IN ('owner', 'accountant')
  );

CREATE POLICY messages_update_all ON messages
  FOR UPDATE
  USING (
    is_super_admin(auth.uid()) OR
    get_user_role(auth.uid(), school_id) IN ('owner', 'accountant')
  );

CREATE POLICY messages_delete_all ON messages
  FOR DELETE
  USING (
    is_super_admin(auth.uid()) OR
    get_user_role(auth.uid(), school_id) IN ('owner', 'accountant')
  );

-- sms_points policies
DROP POLICY IF EXISTS sms_points_select_all ON sms_points;
DROP POLICY IF EXISTS sms_points_insert_all ON sms_points;
DROP POLICY IF EXISTS sms_points_update_all ON sms_points;
DROP POLICY IF EXISTS sms_points_delete_all ON sms_points;

CREATE POLICY sms_points_select_all ON sms_points
  FOR SELECT
  USING (
    is_super_admin(auth.uid()) OR
    get_user_role(auth.uid(), school_id) IN ('owner', 'accountant')
  );

CREATE POLICY sms_points_insert_all ON sms_points
  FOR INSERT
  WITH CHECK (
    is_super_admin(auth.uid()) OR
    get_user_role(auth.uid(), school_id) = 'owner'
  );

CREATE POLICY sms_points_update_all ON sms_points
  FOR UPDATE
  USING (
    is_super_admin(auth.uid()) OR
    get_user_role(auth.uid(), school_id) IN ('owner', 'accountant')
  );

CREATE POLICY sms_points_delete_all ON sms_points
  FOR DELETE
  USING (
    is_super_admin(auth.uid()) OR
    get_user_role(auth.uid(), school_id) = 'owner'
  );

-- fee_payments policies
DROP POLICY IF EXISTS fee_payments_select_all ON fee_payments;
DROP POLICY IF EXISTS fee_payments_insert_all ON fee_payments;
DROP POLICY IF EXISTS fee_payments_update_all ON fee_payments;
DROP POLICY IF EXISTS fee_payments_delete_all ON fee_payments;

CREATE POLICY fee_payments_select_all ON fee_payments
  FOR SELECT
  USING (
    is_super_admin(auth.uid()) OR
    get_user_role(auth.uid(), school_id) IN ('owner', 'accountant')
  );

CREATE POLICY fee_payments_insert_all ON fee_payments
  FOR INSERT
  WITH CHECK (
    is_super_admin(auth.uid()) OR
    get_user_role(auth.uid(), school_id) IN ('owner', 'accountant')
  );

CREATE POLICY fee_payments_update_all ON fee_payments
  FOR UPDATE
  USING (
    is_super_admin(auth.uid()) OR
    get_user_role(auth.uid(), school_id) IN ('owner', 'accountant')
  );

CREATE POLICY fee_payments_delete_all ON fee_payments
  FOR DELETE
  USING (
    is_super_admin(auth.uid()) OR
    get_user_role(auth.uid(), school_id) IN ('owner', 'accountant')
  );

-- fee_settings policies
DROP POLICY IF EXISTS fee_settings_select_all ON fee_settings;
DROP POLICY IF EXISTS fee_settings_insert_all ON fee_settings;
DROP POLICY IF EXISTS fee_settings_update_all ON fee_settings;
DROP POLICY IF EXISTS fee_settings_delete_all ON fee_settings;

CREATE POLICY fee_settings_select_all ON fee_settings
  FOR SELECT
  USING (
    is_super_admin(auth.uid()) OR
    get_user_role(auth.uid(), school_id) IN ('owner', 'accountant')
  );

CREATE POLICY fee_settings_insert_all ON fee_settings
  FOR INSERT
  WITH CHECK (
    is_super_admin(auth.uid()) OR
    get_user_role(auth.uid(), school_id) IN ('owner', 'accountant')
  );

CREATE POLICY fee_settings_update_all ON fee_settings
  FOR UPDATE
  USING (
    is_super_admin(auth.uid()) OR
    get_user_role(auth.uid(), school_id) IN ('owner', 'accountant')
  );

CREATE POLICY fee_settings_delete_all ON fee_settings
  FOR DELETE
  USING (
    is_super_admin(auth.uid()) OR
    get_user_role(auth.uid(), school_id) IN ('owner', 'accountant')
  );
