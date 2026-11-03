-- ============================================================
-- Migration 012: Seed default classes for every school
-- ============================================================
-- This migration creates a trigger function that automatically
-- inserts the standard Ghanaian educational classes whenever
-- a new school is created. It also seeds existing schools.

-- -----------------------------------------------------------
-- 1. Trigger function: auto-seed classes when a new school is created
-- -----------------------------------------------------------
CREATE OR REPLACE FUNCTION trigger_seed_default_classes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only seed if the school has no classes yet
  IF NOT EXISTS (SELECT 1 FROM classes WHERE school_id = NEW.id LIMIT 1) THEN
    INSERT INTO classes (school_id, name, level, grade, max_students, assigned_subjects)
    VALUES
      -- Early Childhood: Creche
      (NEW.id, 'Creche', 'early-childhood', 'Creche', 15, ARRAY['English', 'Mathematics', 'Science', 'Creative Arts', 'Physical Education', 'Social Studies']),
      -- Early Childhood: Nursery 1
      (NEW.id, 'Nursery 1', 'early-childhood', 'Nursery 1', 15, ARRAY['English', 'Mathematics', 'Science', 'Creative Arts', 'Physical Education', 'Social Studies']),
      -- Early Childhood: Nursery 2
      (NEW.id, 'Nursery 2', 'early-childhood', 'Nursery 2', 15, ARRAY['English', 'Mathematics', 'Science', 'Creative Arts', 'Physical Education', 'Social Studies']),
      -- Early Childhood: Kindergarten 1
      (NEW.id, 'Kindergarten 1', 'early-childhood', 'Kindergarten 1', 15, ARRAY['English', 'Mathematics', 'Science', 'Creative Arts', 'Physical Education', 'Social Studies']),
      -- Early Childhood: Kindergarten 2
      (NEW.id, 'Kindergarten 2', 'early-childhood', 'Kindergarten 2', 15, ARRAY['English', 'Mathematics', 'Science', 'Creative Arts', 'Physical Education', 'Social Studies']),
      -- Primary 1
      (NEW.id, 'Primary 1', 'primary', 'Primary 1', 25, NULL),
      -- Primary 2
      (NEW.id, 'Primary 2', 'primary', 'Primary 2', 25, NULL),
      -- Primary 3
      (NEW.id, 'Primary 3', 'primary', 'Primary 3', 25, NULL),
      -- Primary 4
      (NEW.id, 'Primary 4', 'primary', 'Primary 4', 25, NULL),
      -- Primary 5
      (NEW.id, 'Primary 5', 'primary', 'Primary 5', 25, NULL),
      -- Primary 6
      (NEW.id, 'Primary 6', 'primary', 'Primary 6', 25, ARRAY['English', 'Social Studies', 'Mathematics', 'Integrated Science', 'Creative Arts', 'Physical Education', 'Computing', 'French', 'Ghanaian Language']),
      -- JHS 1
      (NEW.id, 'JHS 1', 'junior-high', 'JHS 1', 30, NULL),
      -- JHS 2
      (NEW.id, 'JHS 2', 'junior-high', 'JHS 2', 30, NULL),
      -- JHS 3
      (NEW.id, 'JHS 3', 'junior-high', 'JHS 3', 30, NULL)
    ;
  END IF;
  RETURN NEW;
END;
$$;

-- -----------------------------------------------------------
-- 2. Trigger on schools table
-- -----------------------------------------------------------
DROP TRIGGER IF EXISTS trigger_seed_classes ON schools;
CREATE TRIGGER trigger_seed_classes
  AFTER INSERT ON schools
  FOR EACH ROW
  EXECUTE FUNCTION trigger_seed_default_classes();

-- -----------------------------------------------------------
-- 3. Seed existing schools that have no classes yet
-- -----------------------------------------------------------
DO $$
DECLARE
  school_record RECORD;
BEGIN
  FOR school_record IN SELECT id FROM schools
  LOOP
    -- Only seed if the school has no classes yet
    IF NOT EXISTS (SELECT 1 FROM classes WHERE school_id = school_record.id LIMIT 1) THEN
      INSERT INTO classes (school_id, name, level, grade, max_students, assigned_subjects)
      VALUES
        (school_record.id, 'Creche', 'early-childhood', 'Creche', 15, ARRAY['English', 'Mathematics', 'Science', 'Creative Arts', 'Physical Education', 'Social Studies']),
        (school_record.id, 'Nursery 1', 'early-childhood', 'Nursery 1', 15, ARRAY['English', 'Mathematics', 'Science', 'Creative Arts', 'Physical Education', 'Social Studies']),
        (school_record.id, 'Nursery 2', 'early-childhood', 'Nursery 2', 15, ARRAY['English', 'Mathematics', 'Science', 'Creative Arts', 'Physical Education', 'Social Studies']),
        (school_record.id, 'Kindergarten 1', 'early-childhood', 'Kindergarten 1', 15, ARRAY['English', 'Mathematics', 'Science', 'Creative Arts', 'Physical Education', 'Social Studies']),
        (school_record.id, 'Kindergarten 2', 'early-childhood', 'Kindergarten 2', 15, ARRAY['English', 'Mathematics', 'Science', 'Creative Arts', 'Physical Education', 'Social Studies']),
        (school_record.id, 'Primary 1', 'primary', 'Primary 1', 25, NULL),
        (school_record.id, 'Primary 2', 'primary', 'Primary 2', 25, NULL),
        (school_record.id, 'Primary 3', 'primary', 'Primary 3', 25, NULL),
        (school_record.id, 'Primary 4', 'primary', 'Primary 4', 25, NULL),
        (school_record.id, 'Primary 5', 'primary', 'Primary 5', 25, NULL),
        (school_record.id, 'Primary 6', 'primary', 'Primary 6', 25, ARRAY['English', 'Social Studies', 'Mathematics', 'Integrated Science', 'Creative Arts', 'Physical Education', 'Computing', 'French', 'Ghanaian Language']),
        (school_record.id, 'JHS 1', 'junior-high', 'JHS 1', 30, NULL),
        (school_record.id, 'JHS 2', 'junior-high', 'JHS 2', 30, NULL),
        (school_record.id, 'JHS 3', 'junior-high', 'JHS 3', 30, NULL)
      ;
    END IF;
  END LOOP;
END $$;
