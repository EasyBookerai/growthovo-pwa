-- ============================================================
-- QUICK CREATE TEST USER - COPY AND PASTE EACH SECTION
-- ============================================================

-- SECTION 1: Create auth user
-- Copy and paste this entire block:

DO $$
DECLARE
  new_user_id uuid := gen_random_uuid();
BEGIN
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, confirmed_at, created_at, updated_at,
    raw_app_meta_data, raw_user_meta_data
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    new_user_id,
    'authenticated',
    'authenticated',
    'test@growthovo.com',
    crypt('Test123!', gen_salt('bf')),
    NOW(), NOW(), NOW(), NOW(),
    '{"provider":"email","providers":["email"]}',
    '{}'
  );
  
  RAISE NOTICE 'User ID: %', new_user_id;
END $$;

-- SECTION 2: Get the user ID
-- Copy the ID from the output above, then run:

SELECT id FROM auth.users WHERE email = 'test@growthovo.com';

-- SECTION 3: Create user profile
-- Replace 'PASTE_USER_ID_HERE' with the actual ID from Section 2:

INSERT INTO users (id, email, username, onboarding_complete, subscription_status)
VALUES ('PASTE_USER_ID_HERE', 'test@growthovo.com', 'testuser', true, 'free');

INSERT INTO streaks (user_id) VALUES ('PASTE_USER_ID_HERE');
INSERT INTO hearts (user_id) VALUES ('PASTE_USER_ID_HERE');

INSERT INTO user_mascot_progress (user_id, current_stage, total_xp, current_level)
VALUES ('PASTE_USER_ID_HERE', 1, 0, 1);

-- SECTION 4: Verify
SELECT * FROM users WHERE email = 'test@growthovo.com';
SELECT * FROM user_mascot_progress WHERE user_id = 'PASTE_USER_ID_HERE';

-- ============================================================
-- Login credentials:
-- Email: test@growthovo.com
-- Password: Test123!
-- ============================================================
