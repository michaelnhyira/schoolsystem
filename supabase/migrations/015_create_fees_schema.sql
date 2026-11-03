-- ============================================================
-- Migration 015: Create fee payments and settings tables with RLS policies
-- ============================================================

-- Create fee_payments table
CREATE TABLE IF NOT EXISTS fee_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  payment_type text NOT NULL,
  payment_method text NOT NULL,
  term text NOT NULL,
  status text NOT NULL DEFAULT 'confirmed',
  transaction_ref text,
  paid_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_fee_payments_school_id ON fee_payments(school_id);
CREATE INDEX IF NOT EXISTS idx_fee_payments_student_id ON fee_payments(student_id);
CREATE INDEX IF NOT EXISTS idx_fee_payments_status ON fee_payments(status);
CREATE INDEX IF NOT EXISTS idx_fee_payments_term ON fee_payments(term);

-- Enable RLS
ALTER TABLE fee_payments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS fee_payments_select_all ON fee_payments;
DROP POLICY IF EXISTS fee_payments_insert_owner ON fee_payments;
DROP POLICY IF EXISTS fee_payments_update_owner ON fee_payments;
DROP POLICY IF EXISTS fee_payments_delete_owner ON fee_payments;

-- SELECT: super_admin and school members can view
CREATE POLICY fee_payments_select_all ON fee_payments
  FOR SELECT
  USING (
    is_super_admin(auth.uid()) OR
    get_user_role(auth.uid(), school_id) IS NOT NULL
  );

-- INSERT: super_admin and school owner can record payments
CREATE POLICY fee_payments_insert_owner ON fee_payments
  FOR INSERT
  WITH CHECK (
    is_super_admin(auth.uid()) OR
    get_user_role(auth.uid(), school_id) = 'owner'
  );

-- UPDATE: super_admin and school owner can update
CREATE POLICY fee_payments_update_owner ON fee_payments
  FOR UPDATE
  USING (
    is_super_admin(auth.uid()) OR
    get_user_role(auth.uid(), school_id) = 'owner'
  );

-- DELETE: super_admin and school owner can remove
CREATE POLICY fee_payments_delete_owner ON fee_payments
  FOR DELETE
  USING (
    is_super_admin(auth.uid()) OR
    get_user_role(auth.uid(), school_id) = 'owner'
  );

-- ============================================================
-- Create fee_settings table
-- ============================================================

CREATE TABLE IF NOT EXISTS fee_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  term text NOT NULL,
  total_fees numeric NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(school_id, term)
);

-- Enable RLS
ALTER TABLE fee_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS fee_settings_select_all ON fee_settings;
DROP POLICY IF EXISTS fee_settings_insert_owner ON fee_settings;
DROP POLICY IF EXISTS fee_settings_update_owner ON fee_settings;
DROP POLICY IF EXISTS fee_settings_delete_owner ON fee_settings;

-- SELECT: super_admin and school members can view
CREATE POLICY fee_settings_select_all ON fee_settings
  FOR SELECT
  USING (
    is_super_admin(auth.uid()) OR
    get_user_role(auth.uid(), school_id) IS NOT NULL
  );

-- INSERT: super_admin and school owner can set fees
CREATE POLICY fee_settings_insert_owner ON fee_settings
  FOR INSERT
  WITH CHECK (
    is_super_admin(auth.uid()) OR
    get_user_role(auth.uid(), school_id) = 'owner'
  );

-- UPDATE: super_admin and school owner can update
CREATE POLICY fee_settings_update_owner ON fee_settings
  FOR UPDATE
  USING (
    is_super_admin(auth.uid()) OR
    get_user_role(auth.uid(), school_id) = 'owner'
  );

-- DELETE: super_admin and school owner can remove
CREATE POLICY fee_settings_delete_owner ON fee_settings
  FOR DELETE
  USING (
    is_super_admin(auth.uid()) OR
    get_user_role(auth.uid(), school_id) = 'owner'
  );
