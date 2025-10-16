-- Rollback: Remove Pueblo 2025-05-17 event and results from Supabase
-- Use this if you need to undo the insert script.

BEGIN;

-- Remove results for the event
DELETE FROM public.tournament_results_rows WHERE event_id = 'PUEBLO-20250517';

-- Remove the event (schedule row)
DELETE FROM public.tournament_events_rows WHERE event_id = 'PUEBLO-20250517';

COMMIT;

-- Verification (optional)
-- SELECT * FROM public.tournament_results_rows WHERE event_id = 'PUEBLO-20250517';
-- SELECT * FROM public.tournament_events_rows WHERE event_id = 'PUEBLO-20250517';
