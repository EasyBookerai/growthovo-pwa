-- ============================================================
-- CREATE TEST USER FOR GROWTHOVO
-- ============================================================
-- Run this in Supabase SQL Editor to create a test account
-- Then sign in with: test@growthovo.com / Test123!
-- ============================================================

-- Step 1: Check if user already exists
SELECT id, email FROM auth.users WHERE email = 'test@growthovo.com';

-- If user exists above, skip to Step 3 with that ID
-- If not, continue to Step 2

-- Step 2: Create auth user (only if doesn't exist)
DO $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Check if user exists
  SELECT id INTO new_user_id 
  FROM auth.users 
  WHERE email = 'test@growthovo.com';
  
  IF new_user_id IS NULL THEN
    -- Create new user
    new_user_id := gen_random_uuid();
    
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      confirmed_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      is_super_admin,
      phone,
      phone_confirmed_at,
      phone_change,
      phone_change_token,
      phone_change_sent_at,
      email_change_token_current,
      email_change_confirm_status,
      banned_until,
      reauthentication_token,
      reauthentication_sent_at
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      new_user_id,
      'authenticated',
      'authenticated',
      'test@growthovo.com',
      crypt('Test123!', gen_salt('bf')),
      NOW(),
      NOW(),
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{"username":"testuser"}',
      NOW(),
      NOW(),
      false,
      null,
      null,
      '',
      '',
      null,
      '',
      0,
      null,
      '',
      null
    );
    
    RAISE NOTICE 'Created auth user: %', new_user_id;
  ELSE
    RAISE NOTICE 'User already exists: %', new_user_id;
  END IF;
  
  -- Show the user ID
  RAISE NOTICE 'User ID: %', new_user_id;
END $$;

-- Step 3: Get the user ID and create profile
-- First, get the ID:
SELECT id FROM auth.users WHERE email = 'test@growthovo.com';

-- Copy the ID from above and replace USER_ID_HERE in the commands below:

-- Create user profile (replace USER_ID_HERE)
INSERT INTO users (
  id,
  email,
  username,
  name,
  onboarding_complete,
  subscription_status,
  primary_pillar,
  created_at
) VALUES (
  'USER_ID_HERE',  -- REPLACE THIS
  'test@growthovo.com',
  'testuser',
  'Test User',
  true,
  'free',
  'mental-health',
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  onboarding_complete = true,
  username = 'testuser',
  name = 'Test User';

-- Initialize streak and hearts (replace USER_ID_HERE)
INSERT INTO streaks (user_id, current_streak, longest_streak, last_checkin_date)
VALUES ('USER_ID_HERE', 0, 0, NULL)
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO hearts (user_id, current_hearts, last_refill)
VALUES ('USER_ID_HERE', 5, NOW())
ON CONFLICT (user_id) DO NOTHING;

-- Initialize mascot (replace USER_ID_HERE)
INSERT INTO user_mascot_progress (
  user_id,
  current_stage,
  total_xp,
  current_level,
  last_evolution_at
) VALUES (
  'USER_ID_HERE',  -- REPLACE THIS
  1,  -- Stage 1 (Egg)
  0,  -- 0 XP
  1,  -- Level 1
  NOW()
)
ON CONFLICT (user_id) DO NOTHING;

-- Step 4: Verify everything was created
SELECT 
  u.id,
  u.email,
  u.username,
  u.onboarding_complete,
  ump.current_stage,
  ump.total_xp,
  ump.current_level
FROM auth.users au
JOIN users u ON au.id = u.id
LEFT JOIN user_mascot_progress ump ON u.id = ump.user_id
WHERE au.email = 'test@growthovo.com';

-- ============================================================
-- DONE! Now you can sign in with:
-- Email: test@growthovo.com
-- Password: Test123!
-- ============================================================
