# Supabase Quick Start - 3 Steps

## 🚀 Run These 3 Files in Order

### 1️⃣ schema.sql
Creates all 16 tables + 2 functions
```
✅ Expected: "Success. No rows returned"
```

### 2️⃣ rls.sql  
Enables Row Level Security policies
```
✅ Expected: "Success. No rows returned"
```

### 3️⃣ seed.sql
Populates 6 pillars + 40 Discipline lessons
```
✅ Expected: "Success. No rows returned"
```

## ✅ Verify Setup

Run this query to confirm everything worked:

```sql
SELECT 
  (SELECT COUNT(*) FROM pillars) as pillars,
  (SELECT COUNT(*) FROM units) as units,
  (SELECT COUNT(*) FROM lessons) as lessons,
  (SELECT COUNT(*) FROM challenges) as challenges;
```

Expected result:
```
pillars: 6
units: 5
lessons: 40
challenges: 40
```

## 🔧 If Something Goes Wrong

See `SETUP_GUIDE.md` for detailed troubleshooting.

## 📝 What Changed

Fixed SQL syntax errors:
- ✅ UNIQUE constraint on challenge_completions (now uses CREATE INDEX with ::DATE cast)
- ✅ Dollar-quote delimiters in functions ($ → $$)
- ✅ Fixed RETURN statement in increment_streak function
- ✅ Added execution order warnings to all files
