-- ============================================
-- SYNC BOATER/CO-ANGLER STATUS TO MEMBERSHIP
-- Date: 2025-10-14
-- Purpose: Ensure boater_status resides on tournament_members_rows
-- Behavior:
--   - If legacy table aoy_standings_rows exists, copy boater_status into members when missing
--   - Normalize common values to 'B' (Boater) and 'C' (Co-Angler)
--   - No-op if aoy_standings_rows is not present
-- ============================================

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'aoy_standings_rows'
  ) THEN
    -- Update only when members have NULL or blank status
    UPDATE public.tournament_members_rows m
    SET boater_status = CASE
      WHEN m2.src_status IS NULL OR m2.src_status = '' THEN m.boater_status
      WHEN lower(m2.src_status) IN ('b','boater') THEN 'B'
      WHEN lower(m2.src_status) IN ('c','co','co-angler','co angler','non-boater','non boater','nonboater') THEN 'C'
      ELSE m2.src_status
    END
    FROM (
      SELECT member_id, MAX(booter_status) AS src_status
      FROM public.aoy_standings_rows
      GROUP BY member_id
    ) AS m2
    WHERE m.member_id = m2.member_id
      AND (m.boater_status IS NULL OR trim(m.boater_status) = '');
  END IF;
END $$;

-- Optional check
SELECT member_id, member_name, boater_status
FROM public.tournament_members_rows
ORDER BY member_id
LIMIT 50;
