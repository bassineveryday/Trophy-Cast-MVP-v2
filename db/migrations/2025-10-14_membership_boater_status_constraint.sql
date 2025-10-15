-- ============================================
-- MEMBERSHIP: BOATER STATUS NORMALIZATION + CONSTRAINT
-- Date: 2025-10-14
-- Goal: Ensure tournament_members_rows.boater_status is B/C (nullable)
-- Notes:
--  - We normalize common variants into B/C first
--  - Add CHECK constraint as NOT VALID to avoid immediate failure
--  - Validate later after fixing any stragglers
-- ============================================

-- Normalize existing values
UPDATE public.tournament_members_rows m
SET boater_status = CASE
  WHEN boater_status IS NULL OR trim(boater_status) = '' THEN NULL
  WHEN lower(boater_status) IN ('b','boater') THEN 'B'
  WHEN lower(boater_status) IN ('c','co','co-angler','co angler','non-boater','non boater','nonboater') THEN 'C'
  ELSE boater_status
END
WHERE true;

-- Add NOT VALID constraint so the migration does not fail on existing data
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'chk_members_boater_status'
  ) THEN
    ALTER TABLE public.tournament_members_rows
      ADD CONSTRAINT chk_members_boater_status
      CHECK (boater_status IS NULL OR boater_status IN ('B','C')) NOT VALID;
  END IF;
END $$;

-- Optional: After auditing/fixing data, you can validate the constraint
-- ALTER TABLE public.tournament_members_rows VALIDATE CONSTRAINT chk_members_boater_status;
