-- Audit boater_status in tournament_members_rows

-- Missing statuses
SELECT member_id, member_name, boater_status
FROM public.tournament_members_rows
WHERE boater_status IS NULL OR trim(boater_status) = ''
ORDER BY member_id;

-- Invalid statuses (not NULL and not B/C)
SELECT member_id, member_name, boater_status
FROM public.tournament_members_rows
WHERE boater_status IS NOT NULL AND boater_status NOT IN ('B','C')
ORDER BY member_id;
