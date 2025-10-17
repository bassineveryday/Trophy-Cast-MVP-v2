-- Missing/dirty data flags
-- 1) Results rows missing member_id or event_date(YYYY)
SELECT
  COUNT(*) FILTER (WHERE member_id IS NULL)              AS results_missing_member_id,
  COUNT(*) FILTER (WHERE NOT (event_date ~ '^[0-9]{4}')) AS results_bad_event_date
FROM public.tournament_results;

-- 2) Members with results but not in tournament_members (AOY still works, but no boater_status enrichment)
SELECT DISTINCT r.member_id
FROM public.tournament_results r
LEFT JOIN public.tournament_members tm ON tm.member_id = r.member_id
WHERE tm.member_id IS NULL
LIMIT 20;

-- 3) Core object presence
SELECT 'events' what,   COUNT(*) FROM public.tournament_events
UNION ALL
SELECT 'results',       COUNT(*) FROM public.tournament_results
UNION ALL
SELECT 'aoy',           COUNT(*) FROM public.aoy_standings
UNION ALL
SELECT 'profiles',      COUNT(*) FROM public.profiles;
