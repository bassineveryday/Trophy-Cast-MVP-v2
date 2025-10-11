-- ============================================
-- CONSOLIDATE NORTON DISPLAY NAME ONLY
-- Change both Norton days to show as "Norton 8-2 & 8-3" in the UI
-- Keeps both days' data intact, just unifies the display name
-- ============================================

BEGIN;

-- Update tournament_events to use unified name
-- Both events will keep their original tournament_codes and dates
-- but share the same tournament_name for unified display
UPDATE tournament_events
SET tournament_name = 'Norton 8-2 & 8-3'
WHERE tournament_code IN ('NORTON-20250802', 'NORTON-20250803');

-- Verify both events now have the same name
SELECT 
  event_id,
  tournament_code,
  tournament_name,
  event_date,
  lake
FROM tournament_events
WHERE tournament_code IN ('NORTON-20250802', 'NORTON-20250803')
ORDER BY event_date;

COMMIT;
