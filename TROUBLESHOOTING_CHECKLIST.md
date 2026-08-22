# ✅ Troubleshooting Checklist

Use this to diagnose what's wrong with your app.

---

## 🔍 Step 1: Check Environment Setup

### ✅ .env file exists?
```bash
# Check if file exists
ls ascevo/.env
```

**Expected:** File exists  
**If not:** I created `ascevo/.env` for you - you need to edit it

### ✅ .env file has real values?
```bash
# Check contents
cat ascevo/.env
```

**Expected:** See your actual Supabase URL (not "YOUR_SUPABASE_URL_HERE")  
**If not:** Follow `START_HERE.md` Steps 1-3

### ✅ Dependencies installed?
```bash
# Check if node_modules exists
ls ascevo/node_modules
```

**Expected:** Folder exists with 1000+ packages  
**If not:** Run `npm install` in the `ascevo` folder

---

## 🔍 Step 2: Check Supabase Setup

### ✅ Project created?
1. Go to https://supabase.com/dashboard
2. Do you see your project?

**Expected:** Yes, project is listed  
**If not:** Create new project (takes 2-3 min)

### ✅ Database tables exist?
1. Go to Supabase Dashboard
2. Click **Database** → **Tables**
3. Look for these tables:
   - users
   - pillars
   - lessons
   - xp_transactions
   - user_mascot_progress

**Expected:** See 40+ tables  
**If not:** Run `schema.sql` in SQL Editor

### ✅ Seed data loaded?
Run this in SQL Editor:
```sql
SELECT COUNT(*) FROM pillars;
SELECT COUNT(*) FROM lessons;
SELECT COUNT(*) FROM mascot_stages;
```

**Expected:**
- pillars: 9 rows
- lessons: 100+ rows  
- mascot_stages: 4 rows

**If not:** Run `seed.sql` in SQL Editor

### ✅ Real-time enabled?
1. Click **Database** → **Replication**
2. Check if these are ON (green):
   - user_mascot_progress
   - xp_transactions
   - user_progress

**Expected:** All toggles are green  
**If not:** Click each toggle to turn ON

---

## 🔍 Step 3: Check App Startup

### ✅ Can start the app?
```bash
cd ascevo
npm start
```

**Expected:** Metro bundler starts, shows QR code  
**If not:** Check error message below

#### Common startup errors:

**"Module not found"**
```bash
# Fix: Reinstall dependencies
rm -rf node_modules
npm install
```

**"Port already in use"**
```bash
# Fix: Kill the process
npx kill-port 8081
npm start
```

**"Expo CLI not found"**
```bash
# Fix: Install globally
npm install -g expo-cli
```

### ✅ Can open in browser?
After `npm start`, press `w`

**Expected:** Browser opens to http://localhost:19006  
**If not:** Manually open that URL

---

## 🔍 Step 4: Check App Loading

### ✅ Splash screen appears?
**Expected:** See "Growthovo" text with loading spinner  
**If not:** Check browser console (F12) for errors

### ✅ Sign In screen appears?
**Expected:** See sign in form after splash  
**If not:** Check these errors:

#### "Missing Supabase env vars"
→ Update `.env` file with real values  
→ Restart app

#### "Network request failed"
→ Check internet connection  
→ Check Supabase project is not paused  
→ Verify URL in `.env` is correct

#### Blank white screen
→ Open browser console (F12)  
→ Look for red error messages  
→ Share error message for help

### ✅ Can create account?
1. Click "Sign Up"
2. Enter email + password
3. Click submit

**Expected:** Account created, shows onboarding  
**If not:** Check error message

#### "User already registered"
→ Email already used, try different email  
→ Or use "Sign In" instead

#### "Email rate limit exceeded"
→ Supabase limit reached  
→ Wait 1 hour or verify email

#### "Invalid email or password"
→ Password must be 6+ characters  
→ Email must be valid format

---

## 🔍 Step 5: Check Onboarding

### ✅ Onboarding screens appear?
**Expected:** See 4-5 onboarding screens  
**If not:** Check database has `users` table

### ✅ Can complete onboarding?
**Expected:** After last screen, go to home  
**If not:** Check browser console for errors

---

## 🔍 Step 6: Check Home Screen

### ✅ Home screen loads?
**Expected:** See:
- Header with name
- Mascot widget (egg icon)
- Daily challenges
- Lessons section

**If not:** Check these:

#### No mascot widget
→ Run mascot migration: `003_mascot_evolution_system.sql`  
→ Enable real-time for `user_mascot_progress`

#### No challenges
→ Run seed data: `seed.sql`  
→ Check `daily_challenges` table has data

#### No lessons
→ Run seed data: `seed.sql`  
→ Check `lessons` table has data

#### "Failed to load profile"
→ Check `users` table has your user  
→ Check browser console for error details

---

## 🔍 Step 7: Check Core Features

### ✅ Mascot evolution works?

**Test it:**
```sql
-- Run in Supabase SQL Editor
-- Replace YOUR_USER_ID with your actual user ID

-- Get your user ID:
SELECT id FROM auth.users LIMIT 1;

-- Give yourself XP:
INSERT INTO xp_transactions (user_id, amount, source, description)
VALUES ('YOUR_USER_ID', 500, 'test', 'Testing evolution');
```

**Expected:** Evolution modal appears in app  
**If not:**
- Check real-time is enabled
- Check browser console
- Refresh the app

### ✅ Can complete a lesson?
1. Click on a lesson
2. Read through it
3. Click "Complete"

**Expected:** XP gained, progress updated  
**If not:** Check `lessons` table has data

### ✅ Rex chat works?

**Expected:** Can open chat, send messages  
**If not (AI replies fail):**
- Add `OPENAI_API_KEY` to `.env`
- Or Rex uses fallback responses

---

## 🔍 Step 8: Check Browser Console

Open console: Press `F12` → Click "Console" tab

### ✅ No red errors?
**Expected:** See green/blue logs, no red errors  
**If you see errors:**

#### "Failed to fetch"
→ Check internet connection  
→ Check Supabase project is running  
→ Verify `.env` has correct URL

#### "Invalid JWT" or "Auth session missing"
→ Sign out and sign in again  
→ Clear cookies and try again

#### "CORS error"
→ Check Supabase URL is correct  
→ Make sure using `https://` not `http://`

#### "Quota exceeded"
→ Clear browser storage:
```javascript
localStorage.clear();
sessionStorage.clear();
```

---

## 🎯 Quick Diagnosis

### Symptom: Red error screen on startup
**Likely cause:** Missing `.env` file or wrong values  
**Fix:** Edit `ascevo/.env` with real Supabase credentials

### Symptom: Loads but can't sign up
**Likely cause:** Database not set up  
**Fix:** Run `schema.sql` in Supabase SQL Editor

### Symptom: Home screen broken/empty
**Likely cause:** No seed data  
**Fix:** Run `seed.sql` in Supabase SQL Editor

### Symptom: Mascot doesn't appear
**Likely cause:** Migration not run or real-time disabled  
**Fix:** Run `003_mascot_evolution_system.sql` + enable real-time

### Symptom: Can't complete lessons
**Likely cause:** No lesson data  
**Fix:** Run `seed.sql` which includes lessons

### Symptom: Rex doesn't reply
**Likely cause:** No OpenAI key (uses fallbacks)  
**Fix:** Add `OPENAI_API_KEY` to `.env` (optional)

---

## 📊 Health Check Commands

Run these in Supabase SQL Editor to verify setup:

```sql
-- Check all tables exist (should return 40+)
SELECT COUNT(*) FROM information_schema.tables 
WHERE table_schema = 'public';

-- Check seed data
SELECT COUNT(*) FROM pillars;        -- Should be 9
SELECT COUNT(*) FROM lessons;        -- Should be 100+
SELECT COUNT(*) FROM mascot_stages;  -- Should be 4

-- Check real-time is enabled
SELECT * FROM pg_publication_tables;

-- Check your user exists
SELECT id, email FROM auth.users;

-- Check user profile
SELECT * FROM users WHERE id = 'YOUR_USER_ID';
```

---

## ✅ All Checks Passed?

If you checked everything above and it all passes, your app should work!

If something is still broken:
1. Read the specific error message carefully
2. Search for that error in this checklist
3. Follow the fix instructions
4. Restart the app
5. Clear browser cache if needed

---

## 🆘 Still Stuck?

Share these details for help:
1. Which step in this checklist fails?
2. What's the exact error message?
3. Screenshot of browser console (F12)
4. Did you run all SQL files?
5. What does `.env` file look like? (hide the actual key values!)

---

**Most Common Issue:** `.env` file not updated with real Supabase credentials

**Quick Fix:** Follow `START_HERE.md` steps 1-3!
