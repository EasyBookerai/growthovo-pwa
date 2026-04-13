# Supabase Database Setup Guide

## Prerequisites
- Supabase project created at [supabase.com](https://supabase.com)
- Access to the SQL Editor in your Supabase dashboard

## ⚠️ CRITICAL: Execution Order

The SQL files MUST be run in this exact order:

1. **schema.sql** - Creates all tables, indexes, and functions
2. **rls.sql** - Sets up Row Level Security policies
3. **seed.sql** - Populates initial data (6 pillars, Discipline content)

Running them out of order will cause "relation does not exist" errors.

## Step-by-Step Instructions

### Step 1: Run schema.sql
1. Open your Supabase project dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the entire contents of `schema.sql`
5. Paste into the SQL Editor
6. Click **Run** (or press Ctrl/Cmd + Enter)
7. ✅ Verify: You should see "Success. No rows returned" message
8. Check the **Table Editor** - you should see 16 new tables

### Step 2: Run rls.sql
1. In SQL Editor, click **New Query**
2. Copy the entire contents of `rls.sql`
3. Paste into the SQL Editor
4. Click **Run**
5. ✅ Verify: You should see "Success. No rows returned" message
6. RLS policies are now active on all tables

### Step 3: Run seed.sql
1. In SQL Editor, click **New Query**
2. Copy the entire contents of `seed.sql`
3. Paste into the SQL Editor
4. Click **Run**
5. ✅ Verify: You should see "Success. No rows returned" message
6. Check the **Table Editor**:
   - `pillars` table should have 6 rows
   - `units` table should have 5 rows (Discipline units)
   - `lessons` table should have 40 rows
   - `challenges` table should have 40 rows

## Verification Queries

Run these queries in the SQL Editor to verify your setup:

```sql
-- Check pillars (should return 6)
SELECT COUNT(*) FROM pillars;

-- Check Discipline units (should return 5)
SELECT * FROM units WHERE pillar_id = '11111111-0000-0000-0000-000000000002';

-- Check lessons (should return 40)
SELECT COUNT(*) FROM lessons;

-- Check challenges (should return 40)
SELECT COUNT(*) FROM challenges;

-- Verify RLS is enabled (should return true for all tables)
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'user_progress', 'streaks', 'hearts');
```

## Common Issues & Solutions

### Issue: "relation does not exist"
**Cause:** Files run out of order
**Solution:** Drop all tables and start over with schema.sql first

```sql
-- Drop all tables (WARNING: This deletes all data!)
DROP TABLE IF EXISTS rex_messages CASCADE;
DROP TABLE IF EXISTS friends CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS challenge_completions CASCADE;
DROP TABLE IF EXISTS challenges CASCADE;
DROP TABLE IF EXISTS squad_members CASCADE;
DROP TABLE IF EXISTS squads CASCADE;
DROP TABLE IF EXISTS league_members CASCADE;
DROP TABLE IF EXISTS leagues CASCADE;
DROP TABLE IF EXISTS xp_transactions CASCADE;
DROP TABLE IF EXISTS hearts CASCADE;
DROP TABLE IF EXISTS streaks CASCADE;
DROP TABLE IF EXISTS user_progress CASCADE;
DROP TABLE IF EXISTS lessons CASCADE;
DROP TABLE IF EXISTS units CASCADE;
DROP TABLE IF EXISTS pillars CASCADE;
DROP TABLE IF EXISTS users CASCADE;
```

### Issue: "syntax error near UNIQUE"
**Cause:** Old version of schema.sql with incorrect UNIQUE constraint
**Solution:** Use the updated schema.sql file (fixed in latest version)

### Issue: RLS policies blocking queries
**Cause:** RLS is enabled but you're not authenticated
**Solution:** Either:
- Authenticate as a user in your app
- Temporarily disable RLS for testing (not recommended for production)
- Use service role key for admin operations

## Next Steps

After successful database setup:

1. **Configure Environment Variables**
   - Copy `.env.example` to `.env`
   - Add your Supabase URL and anon key
   - Add Stripe keys
   - Add OpenAI API key

2. **Deploy Edge Functions**
   ```bash
   cd supabase/functions
   supabase functions deploy rex-chat
   supabase functions deploy stripe-webhook
   supabase functions deploy create-checkout
   supabase functions deploy create-portal
   ```

3. **Test the App**
   ```bash
   cd growthovo
   npm install
   npm start
   ```

## Support

If you encounter issues:
1. Check the Supabase logs in your dashboard
2. Verify all environment variables are set correctly
3. Ensure you're using the latest version of all SQL files
4. Check that RLS policies match your authentication setup
