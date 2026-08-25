# 🦅 Mascot Debugging Checklist

Use this checklist to verify each component of the mascot system.

---

## 🗄️ Database Layer

### ✅ Check Tables Exist
Run in Supabase SQL Editor:
```sql
-- Should return 4 rows (Egg, Hatchling, Juvenile, Master)
SELECT COUNT(*) FROM mascot_stages;

-- Should return at least 1 row (your mascot progress)
SELECT COUNT(*) FROM user_mascot_progress;
```

**Expected Result**: 4 mascot stages, 1+ user progress records

---

### ✅ Check RPC Function Exists
Run in Supabase SQL Editor:
```sql
-- Should return 1 row
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name = 'get_user_mascot_status';
```

**Expected Result**: Function name appears

---

### ✅ Test RPC Function Returns Data
Run in Supabase SQL Editor:
```sql
-- Replace with your actual user ID
SELECT * FROM get_user_mascot_status('your-user-id-here');
```

**Expected Result**: Returns 1 row with stage_name, current_level, total_xp, etc.

---

### ✅ Check RLS Policies Allow Access
Run in Supabase SQL Editor:
```sql
-- Should return 3 policies (SELECT, INSERT, UPDATE)
SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'user_mascot_progress';

-- Should return 1 policy (SELECT for all)
SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'mascot_stages';
```

**Expected Result**: Policies exist and allow authenticated users to access data

---

## 🌐 Frontend Layer

### ✅ Check Browser Console Logs
1. Open app at localhost:19006 or growthovo.com
2. Press **F12** to open Developer Tools
3. Go to **Console** tab
4. Look for logs starting with `🦅 Mascot Debug:`

**Expected Log**:
```javascript
🦅 Mascot Debug: {
  mascotStatus: {
    stageName: "Egg",
    stageDescription: "Your journey begins...",
    currentLevel: 1,
    totalXP: 0,
    xpForNextLevel: 100,
    xpForNextStage: 500,
    nextStageLevel: 10,
    stageId: 1,
    lastEvolutionAt: null
  },
  userId: "abc-123-def-456",
  hasMascotStatus: true  // ✅ MUST BE TRUE
}
```

---

### ✅ Check Network Requests
In browser console:
1. Click **Network** tab
2. Filter by: `fetch` or `XHR`
3. Refresh page (F5)
4. Look for request to Supabase RPC endpoint

**Expected**: Request to `/rest/v1/rpc/get_user_mascot_status` returns 200 OK with data

---

### ✅ Check Authentication
In browser console, run:
```javascript
// Check if user is logged in
console.log(localStorage.getItem('supabase.auth.token'));
```

**Expected**: Should show a JWT token (long string)

---

## 🎨 Component Layer

### ✅ Check Widget is Rendered
In browser console, run:
```javascript
// Find the mascot widget in DOM
document.querySelector('[style*="mascotWidget"]');
```

**Expected**: Returns an element (not null)

---

### ✅ Check Widget Visibility
In browser:
1. Right-click on the page
2. Click **"Inspect Element"**
3. Press **Ctrl+F** (search)
4. Search for: `Your Growthovo`

**Expected**: Element found with visible text

---

## 🐛 Common Issues & Solutions

### Issue: `hasMascotStatus: false`
**Cause**: RPC function not returning data
**Fix**: Run WORKING_MASCOT_FIX.sql in Supabase

---

### Issue: `mascotStatus: null`
**Cause**: User not authenticated or no mascot progress record
**Fix**: 
1. Verify user is logged in
2. Run: `INSERT INTO user_mascot_progress (user_id, current_stage, total_xp, current_level) VALUES (auth.uid(), 1, 0, 1);`

---

### Issue: Widget not visible but data exists
**Cause**: CSS issue or widget not rendered
**Fix**: 
1. Hard refresh (Ctrl+Shift+R)
2. Check browser console for errors
3. Inspect element to see if widget has `display: none` or `opacity: 0`

---

### Issue: "function get_user_mascot_status does not exist"
**Cause**: Function has syntax error or wasn't created
**Fix**: Run WORKING_MASCOT_FIX.sql which has correct `$$` syntax

---

### Issue: RPC returns "permission denied"
**Cause**: RLS policies blocking access
**Fix**: Run policies section of WORKING_MASCOT_FIX.sql

---

## 🎯 The Complete Fix Flow

```
┌─────────────────────────────────────────────────────────────┐
│  1. Run WORKING_MASCOT_FIX.sql in Supabase SQL Editor       │
│     ↓                                                        │
│  2. Verify function returns data (SELECT * FROM ...)        │
│     ↓                                                        │
│  3. Hard refresh browser (Ctrl+Shift+R)                     │
│     ↓                                                        │
│  4. Check console for "🦅 Mascot Debug" log                 │
│     ↓                                                        │
│  5. Verify hasMascotStatus: true                            │
│     ↓                                                        │
│  6. ✅ Mascot widget appears on home screen!                │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Quick Status Check

Run this single query in Supabase to check everything:

```sql
-- Complete system status check
SELECT 
  'Mascot Stages' AS check_type,
  COUNT(*)::text AS result
FROM mascot_stages

UNION ALL

SELECT 
  'User Progress Records',
  COUNT(*)::text
FROM user_mascot_progress

UNION ALL

SELECT 
  'RPC Function Exists',
  COUNT(*)::text
FROM information_schema.routines 
WHERE routine_name = 'get_user_mascot_status'

UNION ALL

SELECT 
  'RLS Policies',
  COUNT(*)::text
FROM pg_policies 
WHERE tablename IN ('user_mascot_progress', 'mascot_stages');
```

**Expected Results**:
- Mascot Stages: 4
- User Progress Records: 1+
- RPC Function Exists: 1
- RLS Policies: 4

---

## 🆘 Still Stuck?

Share these with me:

1. **Output from status check SQL** (above query)
2. **Browser console log** (the `🦅 Mascot Debug:` part)
3. **Network tab** screenshot showing the RPC request
4. **Any error messages** from console or SQL Editor

I'll help you debug! 🚀
