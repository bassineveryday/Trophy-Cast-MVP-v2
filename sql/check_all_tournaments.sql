-- ============================================
-- COMPREHENSIVE TOURNAMENT DATA AUDIT
-- ============================================

-- 1. List ALL tournaments with their basic stats
SELECT 
  tournament_code,
  tournament_name,
  event_date,
  COUNT(*) as result_count,
  COUNT(DISTINCT member_id) as unique_members,
  COUNT(DISTINCT member_name) as unique_names,
  SUM(weight_lbs) as total_weight
FROM tournament_results
GROUP BY tournament_code, tournament_name, event_date
ORDER BY event_date DESC, tournament_name;

-- 2. Identify potential multi-day tournaments by name similarity
WITH base_names AS (
  SELECT 
    tournament_code,
    tournament_name,
    event_date,
    -- Extract base name (before date pattern)
    REGEXP_REPLACE(tournament_name, '\s+\d{1,2}[-/]\d{1,2}[-/]\d{2,4}.*$', '', 'g') as base_name
  FROM tournament_results
  GROUP BY tournament_code, tournament_name, event_date
)
SELECT 
  base_name,
  COUNT(DISTINCT tournament_code) as day_count,
  COUNT(DISTINCT event_date) as date_count,
  STRING_AGG(DISTINCT tournament_code, ', ' ORDER BY tournament_code) as tournament_codes,
  STRING_AGG(DISTINCT tournament_name, ', ' ORDER BY tournament_name) as tournament_names,
  STRING_AGG(DISTINCT event_date::text, ', ' ORDER BY event_date) as dates
FROM base_names
GROUP BY base_name
ORDER BY day_count DESC, base_name;

-- 3. Check for missing member_ids (data quality issue)
SELECT 
  tournament_code,
  tournament_name,
  COUNT(*) as total_rows,
  COUNT(member_id) as rows_with_id,
  COUNT(*) - COUNT(member_id) as rows_without_id,
  ROUND(100.0 * COUNT(member_id) / COUNT(*), 1) as percent_with_id
FROM tournament_results
GROUP BY tournament_code, tournament_name
HAVING COUNT(*) - COUNT(member_id) > 0
ORDER BY rows_without_id DESC, tournament_name;

-- 4. Check for duplicate entries (same person, same tournament)
SELECT 
  tournament_code,
  member_name,
  member_id,
  COUNT(*) as duplicate_count,
  STRING_AGG(DISTINCT weight_lbs::text, ', ') as weights
FROM tournament_results
GROUP BY tournament_code, member_name, member_id
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC, tournament_code, member_name;

-- 5. Norton-specific verification (should show Day 1 and Day 2)
SELECT 
  tournament_code,
  tournament_name,
  event_date,
  COUNT(*) as entries,
  COUNT(DISTINCT member_id) as unique_members,
  SUM(weight_lbs) as total_weight,
  COUNT(CASE WHEN member_id IS NULL THEN 1 END) as missing_member_ids
FROM tournament_results
WHERE tournament_name ILIKE '%norton%'
GROUP BY tournament_code, tournament_name, event_date
ORDER BY event_date;
