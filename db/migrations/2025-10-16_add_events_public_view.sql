BEGIN;

-- Stable, read-only projection for UI lists
CREATE OR REPLACE VIEW public.events_public AS
SELECT
  event_id,
  tournament_code,
  tournament_name,
  event_date,  -- text for MVP; safe to change later while keeping view name/columns
  lake,
  participants
FROM public.tournament_events;

COMMENT ON VIEW public.events_public IS 'Stable read-only view for tournament events used by UI lists.';

COMMIT;
