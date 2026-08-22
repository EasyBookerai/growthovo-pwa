# 🚀 Setup Mascot - 2 Steps Only!

## ✅ Done Already
- ✅ Images copied (4 PNG files)
- ✅ Code written & integrated
- ✅ Home screen updated

## 🎯 Do This Now (6 min total)

### 1. Run SQL (5 min)

Open Supabase → SQL Editor → Copy this file:
```
ascevo/supabase/migrations/003_mascot_evolution_system.sql
```
→ Paste → Run

**Check it worked:**
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_name LIKE 'mascot%';
```

### 2. Enable Real-time (1 min)

Supabase → Database → Replication → Enable:
- ✅ `user_mascot_progress`
- ✅ `mascot_evolution_history`

## ✨ Start App

```bash
cd ascevo
npm start
```

Press `w` for web or `a` for Android or `i` for iOS

## 🎉 Done!

Home screen now shows:
- 🦅 Mascot widget
- 📊 Progress bar
- 🎮 Tap to view details

Evolution modal appears automatically when you gain XP!

## 🧪 Test Evolution (optional)

```sql
-- Get your user ID
SELECT id FROM auth.users LIMIT 1;

-- Add 500 XP (triggers evolution)
INSERT INTO xp_transactions (user_id, amount, source)
VALUES ('your-user-id', 500, 'test');
```

Watch the evolution modal! 🎊

---

**That's it! 2 steps = LIVE mascot system!** 🚀🦅
