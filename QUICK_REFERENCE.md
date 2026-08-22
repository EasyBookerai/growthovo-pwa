# ⚡ QUICK REFERENCE CARD

## 🆘 App Not Working? → Do This

### 1️⃣ Create Supabase Project (5 min)
```
1. Go to: https://supabase.com/dashboard
2. Click: "New project"
3. Name: growthovo
4. Set password (save it!)
5. Wait 2-3 minutes
```

### 2️⃣ Get Your Keys (1 min)
```
1. Click: Settings → API
2. Copy: Project URL
3. Copy: anon public key
```

### 3️⃣ Edit .env File (1 min)
```bash
# Open: ascevo/.env
# Replace these TWO lines with your actual values:

EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4️⃣ Setup Database (5 min)
```
In Supabase Dashboard:
1. Click: SQL Editor → New query
2. Open file: ascevo/supabase/schema.sql
3. Copy ALL content → Paste → Click RUN
4. Open file: ascevo/supabase/migrations/003_mascot_evolution_system.sql
5. Copy ALL → Paste → RUN
6. Open file: ascevo/supabase/seed.sql
7. Copy ALL → Paste → RUN
```

### 5️⃣ Enable Real-time (1 min)
```
1. Click: Database → Replication
2. Find: user_mascot_progress → Toggle ON
3. Find: xp_transactions → Toggle ON
```

### 6️⃣ Start App! (30 sec)
```bash
cd ascevo
npm start
# Press: w
```

---

## ✅ How To Know It's Working

| Step | Expected Result |
|------|-----------------|
| Open browser | See "Growthovo" splash screen |
| After splash | See sign-in form |
| Create account | Go to onboarding (4-5 screens) |
| After onboarding | See home screen with mascot egg |
| Click lesson | Can read and complete it |
| Check browser console | No red errors |

---

## ❌ Common Errors

| Error | Quick Fix |
|-------|-----------|
| "Missing Supabase env vars" | Edit `.env` with real values → Restart |
| "relation does not exist" | Run `schema.sql` in Supabase |
| "Invalid API key" | Use **anon public** key, not service_role |
| Blank white screen | F12 → Check Console → Share error |
| No mascot | Run `003_mascot...sql` + Enable real-time |

---

## 📁 Files You Need To Know

| File | What It Does |
|------|-------------|
| `ascevo/.env` | **Edit this!** Add Supabase keys |
| `START_HERE.md` | Read first (5 min) |
| `QUICK_FIX_GUIDE.md` | Full instructions (15 min) |
| `TROUBLESHOOTING_CHECKLIST.md` | Debug guide |
| `FIX_SUMMARY.md` | Overview of what's fixed |

---

## 🔑 The 3 Keys To Success

1. **Real Supabase URL in .env** (not "YOUR_SUPABASE_URL_HERE")
2. **Database tables created** (run schema.sql)
3. **Seed data loaded** (run seed.sql)

---

## ⏱️ Total Time: 15 Minutes

```
Create Supabase: ████████ 5 min
Get keys:        ██ 1 min  
Edit .env:       ██ 1 min
Setup database:  ████████ 5 min
Enable realtime: ██ 1 min
Start app:       █ 30 sec
```

---

## 🆘 Still Stuck?

**Read in order:**
1. `START_HERE.md` ← Start here
2. `QUICK_FIX_GUIDE.md` ← Detailed steps  
3. `TROUBLESHOOTING_CHECKLIST.md` ← If still broken

---

## 🎯 One-Line Summary

**Create Supabase project → Copy 2 keys to `.env` → Run 3 SQL files → `npm start` → Works!** ✅
