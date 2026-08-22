# Lesson Content Deployment Instructions

## Overview
This document provides step-by-step instructions for deploying the enhanced lesson content to production.

**Scope**: 200 enhanced lessons across 5 pillars + 40 new Fitness pillar lessons = 240 total lessons

---

## Pre-Deployment Checklist

Before deploying to production, verify:

### 1. Content Validation
- [ ] All 240 lessons present in SQL files
- [ ] All lessons follow UUID scheme correctly
- [ ] All 5 cards present for each lesson
- [ ] No placeholder text or TODOs
- [ ] All single quotes properly escaped ('')
- [ ] Word counts within limits

### 2. SQL Validation
- [ ] SQL syntax is valid (test with linter or local DB)
- [ ] No trailing commas in INSERT statements
- [ ] All foreign key references correct
- [ ] UUID uniqueness verified
- [ ] File encoding is UTF-8

### 3. Backup Preparation
- [ ] Current production database backed up
- [ ] Backup tested and verified
- [ ] Rollback script prepared
- [ ] Backup retention confirmed (30+ days)

---

## Deployment Files

### Primary SQL File
**File**: `ascevo/supabase/lessons_all_pillars.sql`
- Contains 200 enhanced lessons (5 pillars: Mind, Communication, Money, Career, Relationships)
- All existing lessons with enhanced content
- Proper UUID scheme maintained

### Fitness Pillar SQL File
**File**: `.kiro/specs/lesson-content-enhancement/fitness_pillar.sql`
- Contains 40 new Fitness pillar lessons
- 5 units × 8 lessons each
- New UUIDs following scheme: `33333333-0200-00UU-0000-00000000000L`

### Consolidated File (Optional)
If you want all 240 lessons in one file, merge:
1. lessons_all_pillars.sql (200 lessons)
2. fitness_pillar.sql (40 lessons)

---

## Deployment Steps

### Phase 1: Staging Environment

#### Step 1: Backup Current Database
```bash
# Connect to your Supabase project
supabase db dump --db-url "postgresql://[connection-string]" > backup_pre_lesson_deployment_$(date +%Y%m%d).sql

# Verify backup file was created
ls -lh backup_pre_lesson_deployment_*.sql
```

#### Step 2: Deploy to Staging
```bash
# Option A: Using Supabase CLI
supabase db push --file ascevo/supabase/lessons_all_pillars.sql --environment staging

# Option B: Using psql directly
psql "postgresql://[staging-connection-string]" < ascevo/supabase/lessons_all_pillars.sql

# If adding Fitness pillar
psql "postgresql://[staging-connection-string]" < .kiro/specs/lesson-content-enhancement/fitness_pillar.sql
```

#### Step 3: Verify Staging Deployment
```sql
-- Check total lesson count
SELECT COUNT(*) FROM lessons;
-- Expected: 240 (or 200 if Fitness not deployed yet)

-- Check lessons per pillar
SELECT p.title, COUNT(l.id) as lesson_count
FROM pillars p
LEFT JOIN units u ON u.pillar_id = p.id
LEFT JOIN lessons l ON l.unit_id = u.id
GROUP BY p.title
ORDER BY p.title;

-- Expected output:
-- Mind: 40
-- Communication: 40  
-- Money: 40
-- Career: 40
-- Relationships: 40
-- Fitness: 40 (if deployed)

-- Verify UUID uniqueness
SELECT id, COUNT(*) 
FROM lessons 
GROUP BY id 
HAVING COUNT(*) > 1;
-- Expected: 0 rows (no duplicates)

-- Check for missing cards
SELECT id, title
FROM lessons
WHERE card_concept IS NULL 
   OR card_example IS NULL
   OR card_mistake IS NULL
   OR card_science IS NULL
   OR card_challenge IS NULL;
-- Expected: 0 rows

-- Verify foreign key relationships
SELECT l.id, l.title
FROM lessons l
LEFT JOIN units u ON l.unit_id = u.id
WHERE u.id IS NULL;
-- Expected: 0 rows
```

#### Step 4: Test in Staging App
- [ ] Open staging app
- [ ] Navigate to each pillar
- [ ] Open random lessons from each unit
- [ ] Verify all 5 cards display correctly
- [ ] Check for formatting issues
- [ ] Test lesson navigation (previous/next)
- [ ] Verify challenge cards are actionable

### Phase 2: Production Deployment

⚠️ **CRITICAL**: Only proceed if staging verification passed 100%

#### Step 1: Backup Production Database
```bash
# Full backup
supabase db dump --db-url "postgresql://[prod-connection-string]" > backup_prod_lessons_$(date +%Y%m%d_%H%M%S).sql

# Verify backup
ls -lh backup_prod_lessons_*.sql

# Store backup securely (S3, Google Drive, etc.)
# Example:
aws s3 cp backup_prod_lessons_*.sql s3://your-backup-bucket/database-backups/
```

#### Step 2: Schedule Deployment Window
**Recommended**: Off-peak hours (e.g., 2-4 AM local time)

**Estimated Downtime**: 2-5 minutes for SQL execution

**User Communication**:
- Notify users 24 hours in advance if downtime expected
- Post status update during deployment
- Confirm completion after deployment

#### Step 3: Deploy to Production
```bash
# Option A: Using Supabase dashboard
# 1. Go to Supabase project > SQL Editor
# 2. Upload lessons_all_pillars.sql
# 3. Execute
# 4. Upload fitness_pillar.sql (if ready)
# 5. Execute

# Option B: Using psql
psql "postgresql://[prod-connection-string]" < ascevo/supabase/lessons_all_pillars.sql

# Wait for completion, then add Fitness
psql "postgresql://[prod-connection-string]" < .kiro/specs/lesson-content-enhancement/fitness_pillar.sql
```

#### Step 4: Verify Production Deployment
Run the same verification queries from Staging (Step 3 above)

```sql
-- Quick verification
SELECT COUNT(*) FROM lessons; -- Expected: 240
SELECT COUNT(DISTINCT pillar_id) FROM units; -- Expected: 6 (5 or 6 depending on Fitness)
```

#### Step 5: Test Production App
- [ ] Clear app cache
- [ ] Test on web, iOS, Android
- [ ] Open 3-5 random lessons per pillar
- [ ] Verify content displays correctly
- [ ] Check lesson navigation
- [ ] Test search/filter if applicable

---

## Rollback Procedure

If deployment fails or critical issues found:

### Immediate Rollback
```bash
# Restore from backup
psql "postgresql://[prod-connection-string]" < backup_prod_lessons_[timestamp].sql

# Verify restoration
psql "postgresql://[prod-connection-string]" -c "SELECT COUNT(*) FROM lessons;"
```

### Partial Rollback (Fitness Only)
If only Fitness pillar has issues:

```sql
-- Remove Fitness lessons
DELETE FROM lessons WHERE id LIKE '33333333-0200-%';

-- Remove Fitness units
DELETE FROM units WHERE id LIKE '22222222-0200-%';

-- Verify
SELECT COUNT(*) FROM lessons; -- Should be 200
```

---

## Post-Deployment Monitoring

### First 24 Hours

#### Monitor These Metrics:
- [ ] Lesson completion rate (should be ≥60%)
- [ ] App crash rate (should be <1%)
- [ ] Database query performance
- [ ] User feedback/support tickets
- [ ] Error logs (Sentry, LogRocket, etc.)

#### Check These Endpoints/Queries:
```sql
-- Most viewed lessons
SELECT l.title, COUNT(*) as views
FROM lessons l
JOIN lesson_completions lc ON l.id = lc.lesson_id
WHERE lc.created_at > NOW() - INTERVAL '24 hours'
GROUP BY l.title
ORDER BY views DESC
LIMIT 10;

-- Lessons with high dropout
SELECT l.title, 
       COUNT(CASE WHEN lc.completed = false THEN 1 END) as dropouts,
       COUNT(*) as total_views
FROM lessons l
JOIN lesson_completions lc ON l.id = lc.lesson_id
WHERE lc.created_at > NOW() - INTERVAL '24 hours'
GROUP BY l.title
HAVING COUNT(CASE WHEN lc.completed = false THEN 1 END) > 5
ORDER BY dropouts DESC;
```

### First Week

- [ ] Gather user feedback on new/enhanced content
- [ ] Monitor lesson completion rates per pillar
- [ ] Identify any content gaps or errors reported
- [ ] Check if any science citations are questioned
- [ ] Review challenge completion rates

---

## Common Issues & Solutions

### Issue 1: SQL Syntax Error
**Symptom**: Deployment fails with syntax error  
**Cause**: Usually unescaped quotes or malformed INSERT  
**Solution**:
1. Check error line number
2. Verify all single quotes are escaped ('')
3. Verify no trailing commas
4. Test locally first

### Issue 2: Foreign Key Violation
**Symptom**: "foreign key constraint" error  
**Cause**: Unit IDs don't match between lessons and units  
**Solution**:
1. Verify all unit IDs exist in units table first
2. Check UUID format matches scheme
3. Ensure units are inserted before lessons

### Issue 3: Duplicate UUID
**Symptom**: "duplicate key value violates unique constraint"  
**Cause**: UUID collision  
**Solution**:
1. Run uniqueness check query
2. Fix duplicate UUIDs in SQL file
3. Re-deploy

### Issue 4: Missing Content
**Symptom**: Lessons appear but cards are empty  
**Cause**: NULL values or encoding issues  
**Solution**:
1. Check file encoding (must be UTF-8)
2. Verify no NULL values in required fields
3. Check for special characters causing issues

### Issue 5: Display Formatting Issues
**Symptom**: Line breaks or quotes display incorrectly  
**Cause**: Encoding or escape issues  
**Solution**:
1. Verify UTF-8 encoding throughout
2. Check quote escaping ('')
3. Test with different clients (web/mobile)

---

## Success Criteria

Deployment is considered successful when:

✅ **Data Integrity**:
- All 240 lessons present in database
- No NULL cards
- All UUIDs unique
- All foreign keys valid

✅ **Functional**:
- Lessons display correctly in app
- Navigation works (previous/next/pillar/unit)
- Search/filter works (if applicable)
- Challenge cards are actionable

✅ **Performance**:
- Lesson load time <2 seconds
- No database query timeouts
- App remains responsive

✅ **User Experience**:
- No spike in crashes
- No spike in support tickets
- Lesson completion rate maintained or improved
- Positive user feedback

---

## Deployment Schedule Options

### Option 1: Big Bang (All 240 at Once)
**Pros**: Users get everything immediately, single deployment  
**Cons**: Higher risk, larger rollback if issues

**Timeline**:
- Day 0: Deploy all 240 lessons
- Day 1-7: Monitor closely
- Week 2: Gather feedback and iterate

### Option 2: Phased (200 Now, Fitness Later)
**Pros**: Lower risk, can perfect Fitness separately  
**Cons**: Two deployments, users wait for Fitness

**Timeline**:
- Week 1: Deploy 200 enhanced lessons
- Week 2-3: Monitor and gather feedback
- Week 4: Deploy 40 Fitness lessons

### Option 3: Pillar by Pillar (Gradual)
**Pros**: Minimal risk, easy rollback  
**Cons**: Slow, complex coordination

**Timeline**:
- Week 1: Mind pillar
- Week 2: Communication pillar
- Week 3: Money, Career, Relationships
- Week 4: Fitness

**Recommended**: Option 1 (Big Bang) if staging tests pass. Option 2 (Phased) if you want to be extra cautious.

---

## Communication Templates

### Pre-Deployment Announcement
```
📣 App Update Coming!

We're rolling out 240 enhanced lessons across 6 pillars:
- Mind, Communication, Money, Career, Relationships (enhanced)
- Fitness (brand new!)

Expect a brief update [date/time]. The app will be offline for ~5 minutes.

Your progress is safe. Thanks for your patience!
```

### Deployment Complete
```
✅ Update Complete!

240 world-class lessons are now live:
- Enhanced content across all pillars
- NEW: 40 Fitness lessons (movement, strength, nutrition, recovery)

Dive in and let us know what you think!
```

### If Issues Found
```
⚠️ We've identified an issue with [specific area].

Our team is working on a fix. Your data is safe.

ETA for resolution: [timeframe]

Thanks for your patience!
```

---

## Contacts & Resources

### Deployment Team
- **Database Admin**: [Contact]
- **Backend Lead**: [Contact]
- **QA Lead**: [Contact]
- **Product Manager**: [Contact]

### Emergency Contacts
- **On-Call Engineer**: [Contact]
- **Database Emergency**: [Contact]
- **Supabase Support**: support@supabase.com

### Documentation
- Supabase Docs: https://supabase.com/docs
- SQL Schema: `ascevo/supabase/schema.sql`
- Lesson Structure: `.kiro/specs/lesson-content-enhancement/design.md`

---

## Post-Deployment Tasks

### Immediate (Day 0-1)
- [ ] Monitor error logs
- [ ] Check database performance metrics
- [ ] Respond to user feedback
- [ ] Verify backup completed

### Short-term (Week 1)
- [ ] Analyze lesson completion rates
- [ ] Gather user feedback
- [ ] Identify any content issues
- [ ] Plan fixes/improvements

### Medium-term (Month 1)
- [ ] A/B test lesson variations
- [ ] Analyze engagement metrics
- [ ] Plan next content iteration
- [ ] Document lessons learned

---

## Version Control

**Deployment Version**: 2.0  
**Content Version**: Enhanced + Fitness  
**Date Prepared**: January 2025  
**Last Updated**: [Date]

**Change Log**:
- v1.0: Initial 200 lessons
- v2.0: Enhanced 200 + New Fitness pillar (40 lessons)

---

## Final Checklist Before Deployment

- [ ] All pre-deployment checks passed
- [ ] Staging deployment successful
- [ ] Staging verification complete
- [ ] Production backup created and verified
- [ ] Deployment window scheduled
- [ ] Team notified
- [ ] Users notified (if downtime)
- [ ] Rollback procedure reviewed
- [ ] Monitoring dashboard ready
- [ ] Emergency contacts available

**Sign-off Required**:
- [ ] Database Admin
- [ ] Backend Lead
- [ ] Product Manager

---

Once all checklist items are complete, you're ready to deploy!

🚀 **Good luck with the deployment!**
