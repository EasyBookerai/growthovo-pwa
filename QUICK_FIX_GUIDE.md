# 🔧 Quick Fix Guide - Get Growthovo Working

## ❌ Issues Found

1. **.env file missing** - App can't connect to database
2. **Supabase not configured** - No database connection
3. **Database migrations not run** - Tables don't exist

---

## ✅ Step-by-Step Fix (15 minutes)

### Step 1: Create Supabase Project (5 min)

1. Go to https://supabase.com/dashboard
2. Click **"New project"**
3. Fill in:
   - Name: `growthovo`
   - Database Password: (save this securely!)
   - Region: Choose closest to you
4. Click **"Create new project"** (takes 2-3 minutes)

### Step 2: Get Your API Keys (1 min)

1. In your Supabase project dashboard
2. Click **Settings** (left sidebar)
3. Click **API** (under settings)
4. Copy these two values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (long string starting with `eyJ...`)

### Step 3: Update .env File (1 min)

1. Open the file: `ascevo/.env` (I just created it)
2. Replace these lines:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL_HERE
   EXPO_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY_HERE
   ```
   With your actual values:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   ```

### Step 4: Run Database Setup (5 min)

1. In Supabase Dashboard, click **SQL Editor** (left sidebar)
2. Click **"New query"**
3. Open: `ascevo/supabase/schema.sql` on your computer
4. **Copy ALL content** from that file
5. **Paste** into Supabase SQL Editor
6. Click **RUN** (bottom right)

✅ You should see: "Success. No rows returned"

### Step 5: Run Database Migrations (2 min)

Run these migrations IN ORDER:

1. **Mascot System:**
   - Open: `ascevo/supabase/migrations/003_mascot_evolution_system.sql`
   - Copy all content
   - Paste in new SQL query
   - Click RUN

2. **AI Usage:**
   - Open: `ascevo/supabase/migrations/20240002_ai_usage.sql`
   - Copy all content
   - Paste in new SQL query
   - Click RUN

3. **Features:**
   - Open: `ascevo/supabase/migrations/20240020_ascevo_features_v3.sql`
   - Copy all content
   - Paste in new SQL query
   - Click RUN

4. **Daily OS:**
   - Open: `ascevo/supabase/migrations/20240030_daily_os_core.sql`
   - Copy all content
   - Paste in new SQL query
   - Click RUN

### Step 6: Seed Data (1 min)

1. Open: `ascevo/supabase/seed.sql`
2. Copy all content
3. Paste in new SQL query
4. Click RUN

✅ You should see: "Success. X rows affected"

### Step 7: Enable Real-time (1 min)

1. In Supabase Dashboard, click **Database** → **Replication**
2. Find these tables and toggle them **ON** (green):
   - `user_mascot_progress`
   - `mascot_evolution_history`
   - `xp_transactions`
   - `user_progress`

### Step 8: Start the App! (30 seconds)

```bash
cd ascevo
npm start
```

Then press:
- **`w`** for web browser
- **`a`** for Android (if you have emulator)
- **`i`** for iOS (if on Mac)

---

## ✅ Verify It's Working

### You should see:
1. ✅ App loads (no red error screen)
2. ✅ Sign up / Sign in screen appears
3. ✅ Can create account
4. ✅ After sign up → onboarding screens
5. ✅ After onboarding → home screen with mascot

### Test mascot evolution:
After you're logged in, run this SQL in Supabase:

```sql
-- Get your user ID
SELECT id, email FROM auth.users LIMIT 1;

-- Give yourself 500 XP (replace YOUR_USER_ID)
INSERT INTO xp_transactions (user_id, amount, source, description)
VALUES ('YOUR_USER_ID', 500, 'test', 'Testing mascot evolution');
```

🎉 Evolution modal should appear!

---

## ❌ Still Not Working?

### Common Errors & Fixes

#### Error: "Missing Supabase env vars"
- **Fix:** Make sure `.env` file exists in `ascevo/` folder
- **Fix:** Make sure you replaced `YOUR_SUPABASE_URL_HERE` with actual values
- **Fix:** Restart the app after editing `.env`

#### Error: "relation does not exist"
- **Fix:** Run the SQL migrations (Step 5)
- **Fix:** Make sure you ran them IN ORDER
- **Fix:** Check for any SQL errors in Supabase console

#### Error: "Invalid API key"
- **Fix:** Double-check you copied the **anon public** key (not service_role)
- **Fix:** Make sure there are no extra spaces in the `.env` file

#### App loads but looks broken
- **Fix:** Run seed data (Step 6)
- **Fix:** Clear browser cache and reload
- **Fix:** Check browser console (F12) for errors

#### Mascot doesn't appear
- **Fix:** Make sure mascot migration ran (Step 5 #1)
- **Fix:** Enable real-time for mascot tables (Step 7)
- **Fix:** Refresh the app

---

## 🚀 Optional: Add OpenAI for Rex Chat

If you want the AI chat feature to work:

1. Go to https://platform.openai.com/api-keys
2. Click **"Create new secret key"**
3. Copy the key (starts with `sk-proj-...`)
4. Update `.env`:
   ```env
   OPENAI_API_KEY=sk-proj-...
   ```
5. In Supabase, go to **Project Settings** → **Edge Functions**
6. Add secret:
   ```bash
   supabase secrets set OPENAI_API_KEY=sk-proj-...
   ```

---

## 📊 Check Database is Working

Run this query in Supabase SQL Editor:

```sql
-- Should return 9 pillars
SELECT * FROM pillars;

-- Should return mascot stages
SELECT * FROM mascot_stages;

-- Should return lessons (may be many rows)
SELECT COUNT(*) FROM lessons;
```

If all return data → ✅ Database is working!

---

## 🎯 Next Steps After It's Working

1. **Test all features** - Sign up, complete onboarding, check home screen
2. **Test mascot** - Give yourself XP and see evolution
3. **Test lessons** - Complete a lesson
4. **Check daily challenges** - Should appear on home screen
5. **Test Rex chat** - If you added OpenAI key

---

## 💡 Pro Tips

- Keep Supabase dashboard open to watch real-time data
- Use browser dev tools (F12) to see console logs
- Check **Database** → **Table Editor** to see your data
- Use **Authentication** → **Users** to see who's signed up

---

## ⏱️ Time Breakdown

- Supabase setup: 5 min
- Get API keys: 1 min
- Update .env: 1 min
- Run schema: 5 min
- Run migrations: 2 min
- Seed data: 1 min
- Enable real-time: 1 min
- Start app: 30 sec

**Total: ~15 minutes** ⚡

---

## 🎊 That's It!

After these steps, your app should be **fully functional**:
- ✅ Authentication working
- ✅ Database connected
- ✅ Mascot system active
- ✅ Lessons available
- ✅ Daily challenges working
- ✅ XP system tracking
- ✅ Real-time updates

**Happy building!** 🚀

---

**Need help?** Check these files:
- `ACTION_REQUIRED.md` - Original setup instructions
- `ascevo/.env.example` - Full environment config example
- `FINAL_DEPLOYMENT_SUMMARY.md` - Complete feature overview
