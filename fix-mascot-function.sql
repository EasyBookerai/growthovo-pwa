-- ============================================================================
-- Fix Mascot Display - Create Missing RPC Function
-- ============================================================================
-- This function is called by the app to get mascot status
-- Run this in Supabase SQL Editor
-- ============================================================================

CREATE OR REPLACE FUNCTION get_user_mascot_status(p_user_id uuid)
RETURNS TABLE (
  stage_id integer,
  stage_name text,
  stage_description text,
  current_level integer,
  total_xp integer,
  xp_for_next_level integer,
  xp_for_next_stage integer,
  next_stage_level integer,
  last_evolution_at timestamp with time zone
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ms.id::integer AS stage_id,
    ms.name AS stage_name,
    ms.description AS stage_description,
    ump.current_level AS current_level,
    ump.total_xp AS total_xp,
    (ump.current_level * 100)::integer AS xp_for_next_level,
    CASE 
      WHEN ms.min_xp IS NOT NULL THEN (ms.min_xp - ump.total_xp)::integer
      ELSE 0
    END AS xp_for_next_stage,
    COALESCE(ms.min_level, 999)::integer AS next_stage_level,
    ump.last_evolution_at
  FROM user_mascot_progress ump
  JOIN mascot_stages ms ON ms.id = ump.current_stage
  WHERE ump.user_id = p_user_id
  LIMIT 1;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_user_mascot_status(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_mascot_status(uuid) TO anon;
