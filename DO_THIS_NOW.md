# 🎯 DO THIS NOW - 2 Steps

## ✅ Everything is ready. Just do this:

---

## 1️⃣ Run SQL (5 min)

**Supabase Dashboard → SQL Editor**

Copy this file:
```
ascevo/supabase/migrations/003_mascot_evolution_system.sql
```

Paste it. Click **RUN**.

✅ Done? Check:
```sql
SELECT * FROM mascot_stages;
```
Should show 4 rows (Egg, Hatchling, Juvenile, Master)

---

## 2️⃣ Enable Real-time (1 min)

**Supabase → Database → Replication**

Enable these 2 tables:
- ✅ `user_mascot_progress`
- ✅ `mascot_evolution_history`

---

## 🚀 Start App

```bash
cd ascevo
npm start
```

Press `w` (web) or `a` (android) or `i` (ios)

---

## ✨ DONE!

Home screen now shows mascot widget.

Tap it → See details.

Gain XP → Watch evolution! 🎉

---

**That's it. 6 minutes total. LIVE mascot system.** 🦅
