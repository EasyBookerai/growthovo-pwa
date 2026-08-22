# 🚀 Mascot Evolution System - Deployment Checklist

Use this checklist to deploy the mascot system to production.

---

## ✅ Pre-Deployment Checklist

### 1. Database Setup

- [ ] **Run Migration**
  ```sql
  -- In Supabase SQL Editor, run:
  -- ascevo/supabase/migrations/003_mascot_evolution_system.sql
  ```

- [ ] **Verify Tables Created**
  ```sql
  SELECT table_name
  FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name LIKE 'mascot%';
  -- Should return: mascot_stages, user_mascot_progress, mascot_evolution_history
  ```

- [ ] **Verify Triggers Active**
  ```sql
  SELECT trigger_name, event_object_table
  FROM information_schema.triggers
  WHERE trigger_name LIKE '%mascot%';
  -- Should return: trigger_initialize_mascot, trigger_mascot_xp_update
  ```

- [ ] **Test Evolution Logic**
  ```sql
  -- Create test user manually, then add XP
  INSERT INTO xp_transactions (user_id, amount, source)
  VALUES ('test-user-id', 500, 'test');
  
  -- Check mascot evolved
  SELECT * FROM user_mascot_progress WHERE user_id = 'test-user-id';
  -- Should show current_stage = 2 (Hatchling)
  ```

---

### 2. Real-time Configuration

- [ ] **Enable Replication in Supabase**
  - Navigate to: Database → Replication
  - Enable for: `user_mascot_progress`
  - Enable for: `mascot_evolution_history`

- [ ] **Test Real-time Connection**
  ```typescript
  const subscription = supabase
    .channel('test-mascot')
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'user_mascot_progress',
    }, (payload) => {
      console.log('Real-time works!', payload);
    })
    .subscribe();
  
  // Test by updating a record in Supabase dashboard
  ```

---

### 3. Asset Preparation

- [ ] **Add Mascot Image**
  - Save `image_16.png` to: `ascevo/assets/images/`
  - Verify dimensions (4:1 aspect ratio)
  - Ensure all 4 stages visible horizontally

- [ ] **Verify Image Loading**
  ```typescript
  // In a test component:
  import MascotChart from '../../assets/images/image_16.png';
  <Image source={MascotChart} style={{ width: 400, height: 100 }} />
  ```

---

### 4. Code Integration

- [ ] **Import Components in Main App**
  ```typescript
  import { MascotDisplay } from './src/components/MascotDisplay';
  import { MascotEvolutionModal } from './src/components/MascotEvolutionModal';
  import { useMascot } from './src/hooks/useMascot';
  ```

- [ ] **Add to Dashboard/Home Screen**
  - See `MASCOT_INTEGRATION_EXAMPLES.md` for examples
  - Minimum: Show mascot display in one prominent location

- [ ] **Add Evolution Modal to Root Component**
  - Place modal at app root level for universal access
  - Connect to real-time evolution events

---

### 5. Testing

#### Unit Tests

- [ ] **Run Test Suite**
  ```bash
  npm test src/__tests__/mascotSystem.test.ts
  ```

- [ ] **Verify All Tests Pass**
  - XP calculations
  - Level conversions
  - Stage determination
  - Evolution triggers

#### Integration Tests

- [ ] **Test Full Evolution Flow**
  1. Create new user account
  2. Verify starts at Egg (Stage 1)
  3. Complete lessons to gain XP
  4. Verify evolution to Hatchling at 500 XP
  5. Continue to test all stages

- [ ] **Test Real-time Updates**
  1. Open app on two devices/tabs
  2. Complete lesson on Device 1
  3. Verify mascot updates on Device 2
  4. Check evolution modal appears on both

#### UI/UX Tests

- [ ] **Test Mascot Display**
  - Renders correctly at different sizes
  - Shows correct stage for test users
  - Cropping isolates individual stage
  - Animations smooth on all devices

- [ ] **Test Evolution Modal**
  - Appears when reaching milestone
  - Shows correct before/after stages
  - Particle effects render smoothly
  - Haptic feedback works (mobile only)
  - Auto-dismisses after 4 seconds

- [ ] **Test Progress Tracking**
  - Level progress bar accurate
  - Stage progress bar accurate
  - XP totals correct
  - Evolution history displays correctly

---

### 6. Performance Verification

- [ ] **Database Query Performance**
  ```sql
  -- Should complete in < 50ms
  EXPLAIN ANALYZE SELECT * FROM get_user_mascot_status('test-user-id');
  ```

- [ ] **Check Index Usage**
  ```sql
  SELECT schemaname, tablename, indexname
  FROM pg_indexes
  WHERE tablename LIKE 'mascot%';
  ```

- [ ] **Monitor Real-time Connections**
  - Check Supabase Dashboard: Database → Replication
  - Verify connection count stays reasonable

---

### 7. Security Audit

- [ ] **Row Level Security (RLS)**
  ```sql
  -- Verify RLS enabled on new tables
  SELECT tablename, rowsecurity
  FROM pg_tables
  WHERE schemaname = 'public'
  AND tablename LIKE 'mascot%';
  
  -- Add RLS policies if needed
  ALTER TABLE user_mascot_progress ENABLE ROW LEVEL SECURITY;
  ALTER TABLE mascot_evolution_history ENABLE ROW LEVEL SECURITY;
  
  -- Create policies
  CREATE POLICY "Users can view own mascot progress"
    ON user_mascot_progress FOR SELECT
    USING (auth.uid() = user_id);
  
  CREATE POLICY "Users can view own evolution history"
    ON mascot_evolution_history FOR SELECT
    USING (auth.uid() = user_id);
  ```

- [ ] **Function Security**
  - Verify `SECURITY DEFINER` functions have proper checks
  - Test unauthorized access attempts

---

### 8. Monitoring Setup

- [ ] **Add Analytics Tracking**
  ```typescript
  // Track evolution events
  analytics.track('mascot_evolved', {
    userId: user.id,
    fromStage: evolution.fromStage,
    toStage: evolution.toStage,
    level: evolution.levelAtEvolution,
    xp: evolution.xpAtEvolution,
  });
  ```

- [ ] **Create Dashboard Queries**
  ```sql
  -- Users at each stage
  CREATE VIEW mascot_stage_distribution AS
  SELECT
    ms.name,
    COUNT(*) as user_count,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM users), 2) as percentage
  FROM user_mascot_progress ump
  JOIN mascot_stages ms ON ms.id = ump.current_stage
  GROUP BY ms.id, ms.name
  ORDER BY ms.id;
  
  -- Evolution rate tracking
  CREATE VIEW daily_evolution_stats AS
  SELECT
    DATE(evolved_at) as date,
    to_stage,
    COUNT(*) as evolutions
  FROM mascot_evolution_history
  GROUP BY DATE(evolved_at), to_stage
  ORDER BY date DESC;
  ```

---

### 9. Documentation

- [ ] **Update App Documentation**
  - Add mascot system to user guide
  - Document evolution requirements
  - Explain XP/Level mechanics

- [ ] **Team Training**
  - Share technical documentation with team
  - Review troubleshooting procedures
  - Document support responses for common questions

---

### 10. Gradual Rollout (Recommended)

- [ ] **Phase 1: Internal Testing** (1 week)
  - Deploy to staging environment
  - Team members test all features
  - Fix any bugs found

- [ ] **Phase 2: Beta Users** (1 week)
  - Enable for 10% of users
  - Monitor analytics and error logs
  - Gather feedback

- [ ] **Phase 3: Full Rollout** (1 day)
  - Enable for all users
  - Monitor server load
  - Be ready for hotfixes

---

## 🎯 Post-Deployment Checklist

### Day 1

- [ ] Monitor error logs for mascot-related issues
- [ ] Check real-time connection count
- [ ] Verify evolution events triggering correctly
- [ ] Review user feedback/support tickets

### Week 1

- [ ] Analyze evolution completion rates
- [ ] Check stage distribution (% of users at each stage)
- [ ] Review animation performance on different devices
- [ ] Identify any UX friction points

### Month 1

- [ ] Calculate average time to each stage
- [ ] Measure engagement impact (before/after mascot)
- [ ] Gather qualitative user feedback
- [ ] Plan enhancements based on data

---

## 📊 Success Metrics

Track these KPIs:

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Evolution Rate | >80% reach Stage 2 | `SELECT COUNT(*) / (SELECT COUNT(*) FROM users) FROM user_mascot_progress WHERE current_stage >= 2` |
| Modal Completion | >90% view full animation | Analytics: `mascot_evolution_modal_dismissed` / `mascot_evolution_modal_shown` |
| Engagement Lift | +15% lesson completions | Compare 7-day avg before/after launch |
| Error Rate | <0.1% of evolution events | Monitor error logs for mascot-related errors |
| Load Time | <100ms for status fetch | Monitor `getUserMascotStatus()` response time |

---

## 🐛 Common Issues & Fixes

### Issue: Users stuck at Stage 1

**Check:**
```sql
-- Find users with enough XP but wrong stage
SELECT user_id, total_xp, current_level, current_stage
FROM user_mascot_progress
WHERE total_xp >= 500 AND current_stage = 1;
```

**Fix:**
```sql
-- Manually trigger progression update
SELECT update_mascot_progression(user_id, 0)
FROM user_mascot_progress
WHERE total_xp >= 500 AND current_stage = 1;
```

### Issue: Evolution not triggering on XP gain

**Check:**
```sql
-- Verify trigger exists
SELECT * FROM pg_trigger WHERE tgname = 'trigger_mascot_xp_update';
```

**Fix:**
```sql
-- Re-create trigger
DROP TRIGGER IF EXISTS trigger_mascot_xp_update ON xp_transactions;
CREATE TRIGGER trigger_mascot_xp_update
  AFTER INSERT ON xp_transactions
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_mascot_on_xp();
```

### Issue: Image not displaying

**Check:**
- Verify file exists at `ascevo/assets/images/image_16.png`
- Check import path in `MascotDisplay.tsx`
- Ensure image has correct aspect ratio

**Fix:**
```typescript
// Update import path if needed
const MASCOT_CHART_IMAGE = require('../../assets/images/image_16.png');
```

### Issue: Real-time events not received

**Check:**
- Verify replication enabled in Supabase
- Check subscription status in code

**Fix:**
```typescript
const subscription = supabase.channel('test');
console.log('Status:', subscription.state); // Should be 'subscribed'

// If not subscribed, check Supabase real-time quotas
```

---

## 🔧 Rollback Plan

If critical issues arise:

### Step 1: Disable Frontend Display

```typescript
// Quick fix: Hide mascot temporarily
const MASCOT_ENABLED = false; // Feature flag

{MASCOT_ENABLED && status && (
  <MascotDisplay stage={status.stageId} />
)}
```

### Step 2: Disable Triggers (preserves data)

```sql
-- Disable auto-evolution temporarily
ALTER TABLE xp_transactions DISABLE TRIGGER trigger_mascot_xp_update;

-- Re-enable when fixed
ALTER TABLE xp_transactions ENABLE TRIGGER trigger_mascot_xp_update;
```

### Step 3: Full Rollback (if needed)

```sql
-- Drop mascot system (CAUTION: Deletes all mascot data)
DROP TABLE IF EXISTS mascot_evolution_history CASCADE;
DROP TABLE IF EXISTS user_mascot_progress CASCADE;
DROP TABLE IF EXISTS mascot_stages CASCADE;
DROP FUNCTION IF EXISTS update_mascot_progression CASCADE;
DROP FUNCTION IF EXISTS get_user_mascot_status CASCADE;
DROP FUNCTION IF EXISTS calculate_level_from_xp CASCADE;
DROP FUNCTION IF EXISTS determine_mascot_stage CASCADE;
```

---

## 📞 Support Resources

- **Technical Docs**: `MASCOT_EVOLUTION_SYSTEM.md`
- **Quick Start**: `MASCOT_QUICK_START.md`
- **Examples**: `MASCOT_INTEGRATION_EXAMPLES.md`
- **Summary**: `MASCOT_SYSTEM_SUMMARY.md`

---

## ✨ Final Pre-Launch Checklist

Before announcing to users:

- [ ] All tests passing
- [ ] Real-time working on multiple devices
- [ ] Evolution modal smooth on iOS, Android, Web
- [ ] Image displaying correctly for all stages
- [ ] Analytics tracking implemented
- [ ] Support team trained on new feature
- [ ] Marketing assets prepared (if applicable)
- [ ] User documentation updated
- [ ] Rollback plan documented and tested

---

**Ready to launch? Let's make growing visible! 🚀🦅**
