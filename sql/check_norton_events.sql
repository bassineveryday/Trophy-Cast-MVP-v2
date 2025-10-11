-- Check current Norton tournament events
SELECT 
  event_id,
  tournament_code,
  tournament_name,
  event_date,
  lake,
  location
FROM tournament_events
WHERE tournament_name ILIKE '%norton%'
ORDER BY event_date;

-- Check Norton results
SELECT 
  tournament_code,
  tournament_name,
  event_date,
  COUNT(*) as result_count,
  COUNT(DISTINCT member_id) as unique_members
FROM tournament_results
WHERE tournament_code LIKE 'NORTON%'
GROUP BY tournament_code, tournament_name, event_date
ORDER BY event_date;
