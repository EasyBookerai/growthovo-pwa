-- ============================================================================
-- FINAL MASCOT FIX - Complete Solution
-- ============================================================================
-- Run this entire file in Supabase SQL Editor
-- ============================================================================

-- Step 1: Drop and recreate the function to match exact table structure
DROP FUNCTION IF EXISTS get_user_mascot_status(uuid);

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
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ump.current_stage AS stage_id,
    ms.name AS stage_name,
    ms.description AS stage_description,
    ump.current_level AS current_level,
    ump.total_xp AS total_xp,
    (ump.current_level * 100)::integer AS xp_for_next_level,
    CASE 
      WHEN ump.current_stage < 4 THEN 
        COALESCE((SELECT min_xp FROM mascot_stages WHERE id = ump.current_stage + 1), 9999) - ump.total_xp
      ELSE 0
    END::integer AS xp_for_next_stage,
    CASE 
      WHEN ump.current_stage < 4 THEN 
        COALESCE((SELECT min_level FROM mascot_stages WHERE id = ump.current_stage + 1), 999)
      ELSE 999
    END::integer AS next_stage_level,
    ump.last_evolution_at
  FROM user_mascot_progress ump
  JOIN mascot_stages ms ON ms.id = ump.current_stage
  WHERE ump.user_id = p_user_id
  LIMIT 1;
END;
$$;

-- Step 2: Grant permissions
GRANT EXECUTE ON FUNCTION get_user_mascot_status(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_mascot_status(uuid) TO anon;

-- Step 3: Ensure RLS policies allow reading mascot data
ALTER TABLE user_mascot_progress ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view own mascot" ON user_mascot_progress;
DROP POLICY IF EXISTS "Users can update own mascot" ON user_mascot_progress;
DROP POLICY IF EXISTS "Users can insert own mascot" ON user_mascot_progress;

-- Create new policies
CREATE POLICY "Users can view own mascot" 
  ON user_mascot_progress FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own mascot" 
  ON user_mascot_progress FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own mascot" 
  ON user_mascot_progress FOR UPDATE 
  USING (auth.uid() = user_id);

-- Step 4: Ensure mascot_stages is readable by everyone
ALTER TABLE mascot_stages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Mascot stages are viewable by all" ON mascot_stages;

CREATE POLICY "Mascot stages are viewable by all" 
  ON mascot_stages FOR SELECT 
  USING (true);

-- Step 5: Create mascot for ALL existing users
INSERT INTO user_mascot_progress (user_id, current_stage, total_xp, current_level)
SELECT 
  id,
  1,  -- Egg stage
  0,  -- 0 XP  
  1   -- Level 1
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM user_mascot_progress)
ON CONFLICT (user_id) DO NOTHING;

-- Step 6: Test the function
DO $$
DECLARE
  test_result RECORD;
  test_user_id uuid;
BEGIN
  -- Get a user ID
  SELECT id INTO test_user_id FROM auth.users LIMIT 1;
  
  IF test_user_id IS NOT NULL THEN
    -- Test the function
    SELECT * INTO test_result FROM get_user_mascot_status(test_user_id);
    
    IF test_result IS NOT NULL THEN
      RAISE NOTICE 'SUCCESS: Function returns data for user %', test_user_id;
      RAISE NOTICE 'Stage: %, Level: %, XP: %', 
        test_result.stage_name, 
        test_result.current_level, 
        test_result.total_xp;
    ELSE
      RAISE NOTICE 'WARNING: Function returns NULL for user %', test_user_id;
    END IF;
  ELSE
    RAISE NOTICE 'WARNING: No users found in auth.users';
  END IF;
END $$;

-- ============================================================================
-- Done! Now refresh your app (F5) and the mascot should appear
-- ============================================================================
