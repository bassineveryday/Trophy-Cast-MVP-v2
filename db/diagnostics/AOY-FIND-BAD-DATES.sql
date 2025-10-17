-- List distinct raw dates that fail our year parsing logic
SELECT DISTINCT TRIM(COALESCE(e.event_date, r.event_date)) AS raw_date
FROM public.tournament_results r
LEFT JOIN public.tournament_events e ON e.event_id = r.event_id
WHERE TRIM(COALESCE(e.event_date, r.event_date)) !~ '([0-9]{4})'
  AND TRIM(COALESCE(e.event_date, r.event_date)) !~ '([0-9]{2})\s*$'
ORDER BY 1;