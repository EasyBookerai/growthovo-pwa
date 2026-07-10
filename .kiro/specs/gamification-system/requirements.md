# Gamification System - Requirements Document

## 1. Overview

A comprehensive gamification system that transforms Growthovo into an engaging, habit-forming experience by leveraging game mechanics, visual feedback, and progression systems inspired by Duolingo, Habitica, and productivity apps.

## 2. Core Objectives

1. **Increase Daily Engagement**: Drive daily active usage through streaks, challenges, and rewards
2. **Boost Retention**: Create long-term commitment through progression systems and achievements
3. **Enhance Motivation**: Provide instant gratification and visible progress
4. **Foster Competition**: Enable healthy competition through leaderboards and social features
5. **Drive Premium Conversion**: Gate premium gamification features behind paywall

## 3. User Stories

### 3.1 Progression & Leveling
- **US-001**: As a user, I want to gain XP from every action so I feel rewarded for my effort
- **US-002**: As a user, I want to level up and see my progress so I feel accomplished
- **US-003**: As a user, I want to unlock new features as I level up so I have goals to work toward
- **US-004**: As a user, I want to see my XP progress bar so I know how close I am to the next level

### 3.2 Streaks & Consistency
- **US-005**: As a user, I want to maintain a daily streak so I'm motivated to show up every day
- **US-006**: As a user, I want streak milestones (7, 14, 30, 100 days) so I have long-term goals
- **US-007**: As a user, I want streak freeze protection so I don't lose progress on rest days
- **US-008**: As a user, I want streak recovery options so one missed day doesn't ruin my motivation

### 3.3 Achievements & Badges
- **US-009**: As a user, I want to earn badges for accomplishments so I can showcase my progress
- **US-010**: As a user, I want rare/epic badges for major milestones so I feel special
- **US-011**: As a user, I want to see locked achievements so I know what to work toward
- **US-012**: As a user, I want badge categories (lessons, streaks, social, pillars) so I can focus on different areas

### 3.4 Leaderboards & Competition
- **US-013**: As a user, I want weekly leaderboards so I can compete with others
- **US-014**: As a user, I want league tiers (Bronze, Silver, Gold, etc.) so I have competitive goals
- **US-015**: As a user, I want to see my rank change in real-time so I stay motivated
- **US-016**: As a user, I want private squads with separate leaderboards so I can compete with friends

### 3.5 Daily Quests & Challenges
- **US-017**: As a user, I want daily quests so I have clear daily goals
- **US-018**: As a user, I want weekly challenges so I have medium-term goals
- **US-019**: As a user, I want quest rewards (XP, badges, items) so I'm motivated to complete them
- **US-020**: As a user, I want quest difficulty tiers so challenges match my level

### 3.6 Virtual Currency & Shop
- **US-021**: As a user, I want to earn gems/coins from activities so I can unlock rewards
- **US-022**: As a user, I want to spend currency on streak freezes, power-ups, cosmetics
- **US-023**: As a user, I want daily login bonuses so I'm rewarded for consistency
- **US-024**: As a user, I want premium currency for special items (premium feature)

### 3.7 Visual Feedback & Animations
- **US-025**: As a user, I want confetti/celebrations when I level up so I feel accomplished
- **US-026**: As a user, I want XP gain animations (+25 XP ✨) so I see instant rewards
- **US-027**: As a user, I want progress bars with smooth animations so progress feels satisfying
- **US-028**: As a user, I want achievement unlock animations so milestones feel special

### 3.8 Social Gamification
- **US-029**: As a user, I want to see squad members' XP and levels so we can motivate each other
- **US-030**: As a user, I want to send/receive reactions on achievements so we celebrate together
- **US-031**: As a user, I want squad challenges so we can work toward common goals
- **US-032**: As a user, I want to compare my progress with friends so I stay motivated

## 4. Gamification Mechanics

### 4.1 XP System

#### 4.1.1 XP Sources
| Action | XP Reward | Notes |
|--------|-----------|-------|
| Complete lesson | 25 XP | Base reward |
| Complete lesson (perfect score) | 35 XP | Bonus for mastery |
| Daily check-in | 10 XP | Consistency reward |
| Speaking session | 30 XP | Higher difficulty |
| Rex conversation | 5 XP | Light engagement |
| Time capsule creation | 20 XP | Thoughtful activity |
| Mood check-in | 5 XP | Daily ritual |
| Achieve milestone | 50-200 XP | Varies by milestone |
| Complete quest | 15-100 XP | Varies by difficulty |
| Invite friend (accepted) | 100 XP | One-time bonus |

#### 4.1.2 Leveling Curve
- **Formula**: XP needed = 100 * level^1.5
- **Level 1→2**: 100 XP
- **Level 2→3**: 283 XP
- **Level 5→6**: 1,118 XP
- **Level 10→11**: 3,162 XP
- **Level 20→21**: 8,944 XP

#### 4.1.3 Level Perks
- **Level 5**: Unlock streak freeze (1 per week)
- **Level 10**: Unlock weekly wrapped
- **Level 15**: Unlock squad feature
- **Level 20**: Unlock time capsules
- **Level 25**: Unlock custom themes (premium)
- **Level 30**: Unlock advanced analytics (premium)

### 4.2 Streak System

#### 4.2.1 Streak Mechanics
- **Daily Reset**: 11:59 PM local time
- **Check-in Required**: Any XP-earning action counts
- **Visualization**: 🔥 flame icon + number
- **Streak Freeze**: Protects from one missed day

#### 4.2.2 Streak Milestones
| Days | Badge | Reward |
|------|-------|--------|
| 3 | 🔥 On Fire | Title: "Consistent" |
| 7 | ⚡ Week Warrior | +100 XP, 1 Streak Freeze |
| 14 | 💎 Diamond Week | +250 XP, Title: "Dedicated" |
| 30 | 👑 Month Master | +500 XP, Rare badge |
| 60 | 🏆 Unstoppable | +1000 XP, Epic badge |
| 100 | 🌟 Centurion | +2000 XP, Legendary badge |
| 365 | 🎯 Year Legend | +5000 XP, Mythic badge |

#### 4.2.3 Streak Freeze Economy
- **Free Users**: 1 freeze per 7-day streak
- **Premium Users**: 2 freezes stored at once
- **Shop Purchase**: 50 gems = 1 freeze
- **Auto-consume**: Automatic on missed day

### 4.3 Achievement System

#### 4.3.1 Achievement Categories

**Lessons & Learning**
- First Lesson: Complete your first lesson (10 XP)
- Lesson Streak 10: Complete 10 lessons in a row (50 XP)
- Perfect Score: Get 100% on any lesson (25 XP)
- All Pillars: Complete at least 1 lesson in each pillar (100 XP)
- Lesson Master: Complete 100 total lessons (250 XP, Rare badge)

**Streaks & Consistency**
- 3-Day Streak: Maintain a 3-day streak (25 XP)
- Week Warrior: Maintain a 7-day streak (100 XP)
- Month Master: Maintain a 30-day streak (500 XP, Rare badge)
- Year Legend: Maintain a 365-day streak (5000 XP, Legendary badge)

**Speaking & Communication**
- First Speech: Complete your first speaking session (20 XP)
- Confident Speaker: Complete 10 speaking sessions (100 XP)
- Public Speaker: Complete 50 speaking sessions (500 XP, Rare badge)
- TED Talker: Get 95%+ score on expert level (1000 XP, Epic badge)

**Social & Community**
- Squad Member: Join your first squad (20 XP)
- Social Butterfly: React to 50 squad activities (100 XP)
- Squad Leader: Achieve #1 in squad leaderboard (150 XP)
- Motivator: Help 5 friends join Growthovo (500 XP, Rare badge)

**Quests & Challenges**
- Quest Starter: Complete your first daily quest (10 XP)
- Quest Master: Complete 30 daily quests (200 XP)
- Challenge Champion: Complete 10 weekly challenges (500 XP, Rare badge)

**Special & Secret**
- Early Bird: Complete check-in before 8 AM 5 times (50 XP)
- Night Owl: Complete check-in after 10 PM 5 times (50 XP)
- Consistency King: Check in at same time 14 days straight (200 XP)
- Hidden achievements: Discovered through special actions

#### 4.3.2 Badge Rarity System
- **Common** (Gray): Basic achievements, 70% of badges
- **Rare** (Blue): Significant effort, 20% of badges
- **Epic** (Purple): Exceptional achievements, 8% of badges
- **Legendary** (Gold): Extreme dedication, 2% of badges
- **Mythic** (Rainbow): Secret/seasonal, <1% of badges

### 4.4 Leaderboard System

#### 4.4.1 League Structure
- **Bronze**: Level 1-5, Bottom 50%
- **Silver**: Level 6-10, 30-50%
- **Gold**: Level 11-15, 15-30%
- **Platinum**: Level 16-20, 5-15%
- **Diamond**: Level 21-25, 2-5%
- **Master**: Level 26-30, Top 1-2%
- **Grandmaster**: Level 31+, Top 0.5%

#### 4.4.2 Leaderboard Types
1. **Global Weekly**: All users, resets Sunday 8 PM
2. **Squad**: Private group leaderboard
3. **Friends**: People you've connected with
4. **Pillar-Specific**: Compete in specific pillars

#### 4.4.3 Rewards
- **Top 3**: 200/150/100 XP + special badge
- **Top 10**: 50 XP
- **Top 50**: 25 XP
- **Promotion**: Move up a league (500 XP bonus)
- **Demotion**: Bottom 10% move down (no penalty)

### 4.5 Quest & Challenge System

#### 4.5.1 Daily Quests (3 per day)
- **Easy**: Complete 1 lesson (10 XP, 5 gems)
- **Medium**: Complete 2 activities from different pillars (20 XP, 10 gems)
- **Hard**: Complete lesson + speaking session (30 XP, 20 gems)
- **Refresh**: Free refresh once per day, 10 gems for additional

#### 4.5.2 Weekly Challenges
- Complete 5 lessons this week (100 XP, 50 gems)
- Maintain 7-day streak (150 XP, 100 gems)
- Complete 3 speaking sessions (200 XP, 150 gems)
- Earn 500 XP this week (250 XP, 200 gems)
- **Premium Only**: Epic challenges with rare rewards

#### 4.5.3 Special Events
- **Weekend Warrior**: 2x XP on weekends (monthly)
- **Pillar Focus**: 3x XP for specific pillar (rotating weekly)
- **Squad Wars**: Team-based competitions (seasonal)
- **Holiday Events**: Special badges and rewards

### 4.6 Virtual Currency System

#### 4.6.1 Gems (Primary Currency)
**Earning Methods:**
- Daily quest completion: 5-20 gems
- Level up: 50 gems
- Weekly leaderboard: 25-200 gems
- Achievement unlock: 10-500 gems
- Daily login bonus: 5 gems
- Streak milestones: 50-500 gems

**Spending Options:**
- Streak freeze: 50 gems
- Quest refresh: 10 gems
- Cosmetic avatars: 100-500 gems
- Power-ups: 25-100 gems
- Profile themes: 200 gems

#### 4.6.2 Crowns (Premium Currency)
**Earning Methods:**
- Premium subscription: 100 crowns/month
- Special events: 10-50 crowns
- Rare achievements: 25 crowns

**Spending Options:**
- Exclusive cosmetics: 50-200 crowns
- Premium themes: 100 crowns
- Instant level-up: 500 crowns (one-time)
- Exclusive badges: 250 crowns

### 4.7 Power-Ups & Boosters

#### 4.7.1 Power-Up Types
- **XP Boost**: 2x XP for 1 hour (25 gems)
- **Streak Shield**: Automatic freeze protection for 7 days (100 gems)
- **Quest Mulligan**: Re-roll failed quest (15 gems)
- **Focus Mode**: Distraction-free session tracking (Premium)
- **Insight Report**: Detailed analytics (Premium)

## 5. Technical Requirements

### 5.1 Database Schema Additions

#### 5.1.1 New Tables

**user_gamification**
```sql
CREATE TABLE user_gamification (
  user_id UUID PRIMARY KEY REFERENCES users(id),
  level INTEGER DEFAULT 1,
  total_xp INTEGER DEFAULT 0,
  current_xp INTEGER DEFAULT 0, -- XP toward next level
  gems INTEGER DEFAULT 0,
  crowns INTEGER DEFAULT 0,
  league VARCHAR(20) DEFAULT 'bronze',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**achievements**
```sql
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  category VARCHAR(50),
  rarity VARCHAR(20), -- common, rare, epic, legendary, mythic
  icon VARCHAR(50),
  xp_reward INTEGER DEFAULT 0,
  gem_reward INTEGER DEFAULT 0,
  hidden BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**user_achievements**
```sql
CREATE TABLE user_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  achievement_id UUID REFERENCES achievements(id),
  unlocked_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);
```

**quests**
```sql
CREATE TABLE quests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type VARCHAR(20), -- daily, weekly, special
  title VARCHAR(200) NOT NULL,
  description TEXT,
  difficulty VARCHAR(20), -- easy, medium, hard
  requirement JSON, -- {"action": "complete_lesson", "count": 2}
  xp_reward INTEGER,
  gem_reward INTEGER,
  active_from DATE,
  active_until DATE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**user_quests**
```sql
CREATE TABLE user_quests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  quest_id UUID REFERENCES quests(id),
  progress INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, quest_id)
);
```

**leaderboards**
```sql
CREATE TABLE leaderboards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type VARCHAR(20), -- global, squad, pillar
  period VARCHAR(20), -- weekly, monthly
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**leaderboard_entries**
```sql
CREATE TABLE leaderboard_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  leaderboard_id UUID REFERENCES leaderboards(id),
  user_id UUID REFERENCES users(id),
  rank INTEGER,
  xp_earned INTEGER,
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(leaderboard_id, user_id)
);
```

**power_ups**
```sql
CREATE TABLE user_power_ups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  type VARCHAR(50), -- xp_boost, streak_shield, etc.
  quantity INTEGER DEFAULT 1,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 5.2 API Endpoints

#### 5.2.1 Gamification Core
- `GET /api/gamification/profile` - Get user gamification stats
- `POST /api/gamification/xp` - Award XP
- `POST /api/gamification/level-up` - Handle level up
- `GET /api/gamification/progress` - Get progress to next level

#### 5.2.2 Achievements
- `GET /api/achievements` - Get all achievements
- `GET /api/achievements/user` - Get user's unlocked achievements
- `POST /api/achievements/unlock` - Unlock achievement
- `GET /api/achievements/progress` - Get progress toward locked achievements

#### 5.2.3 Quests
- `GET /api/quests/daily` - Get today's daily quests
- `GET /api/quests/weekly` - Get current weekly challenges
- `POST /api/quests/progress` - Update quest progress
- `POST /api/quests/complete` - Complete quest
- `POST /api/quests/refresh` - Refresh daily quests

#### 5.2.4 Leaderboards
- `GET /api/leaderboards/global` - Get global leaderboard
- `GET /api/leaderboards/squad/:squadId` - Get squad leaderboard
- `GET /api/leaderboards/friends` - Get friends leaderboard
- `GET /api/leaderboards/rank/:userId` - Get user's rank

#### 5.2.5 Currency & Shop
- `GET /api/currency/balance` - Get gem/crown balance
- `POST /api/currency/spend` - Spend currency
- `GET /api/shop/items` - Get available shop items
- `POST /api/shop/purchase` - Purchase item

#### 5.2.6 Power-Ups
- `GET /api/powerups` - Get user's power-ups
- `POST /api/powerups/activate` - Activate power-up
- `POST /api/powerups/purchase` - Buy power-up

### 5.3 Real-Time Features
- WebSocket connection for live XP updates
- Real-time leaderboard rank changes
- Live quest progress updates
- Achievement unlock notifications
- Squad activity feed updates

## 6. UI/UX Requirements

### 6.1 Visual Design System

#### 6.1.1 Animation Library
- **Level Up**: Full-screen overlay with confetti (3s)
- **XP Gain**: Floating "+X XP ✨" text (1s fade-out)
- **Achievement Unlock**: Modal with badge zoom-in (2s)
- **Streak Milestone**: Confetti + haptic + badge display (3s)
- **Rank Up/Down**: League badge transition animation (2s)
- **Progress Bars**: Smooth fill animations with easing

#### 6.1.2 Color System by Rarity
- **Common**: #6B7280 (Gray-500)
- **Rare**: #3B82F6 (Blue-500)
- **Epic**: #8B5CF6 (Purple-500)
- **Legendary**: #F59E0B (Amber-500)
- **Mythic**: Linear gradient (Rainbow)

#### 6.1.3 Badge Icons
- SVG-based for crisp rendering
- Animated on hover/tap
- Glow effects for rare badges
- Lock icon for locked achievements

### 6.2 Screen Layouts

#### 6.2.1 Gamification Hub Screen
**Header:**
- Level badge (circular with level number)
- XP progress bar
- Current XP / Next level XP

**Sections:**
- Daily Quests (3 cards with progress bars)
- Weekly Challenges (accordion-style)
- Achievements (grid of badges, 4 columns)
- Leaderboard preview (top 5 + user)
- Power-ups inventory

#### 6.2.2 Profile Gamification Tab
- Level & XP overview
- Streak calendar (heatmap)
- Achievement showcase (pinned badges)
- Statistics dashboard
- Gems & crowns balance

#### 6.2.3 Leaderboard Screen
- League indicator at top
- Promotion/demotion zones
- User's rank highlighted
- Tab navigation (Global, Squad, Friends)
- "You" badge on user's row

#### 6.2.4 Achievements Screen
- Filter by category
- Sort by: newest, rarity, progress
- Locked achievements shown with requirements
- Progress bars for multi-step achievements
- Share button for unlocked badges

#### 6.2.5 Quest Details Modal
- Quest description
- Progress tracker
- Reward preview
- Time remaining (countdown)
- "Start Quest" / "Claim Reward" button

### 6.3 Mobile-First Considerations
- Bottom sheet modals for details
- Swipeable quest cards
- Pull-to-refresh on leaderboards
- Haptic feedback on all interactions
- Offline quest progress tracking
- Background XP sync

## 7. Premium Gamification Features

### 7.1 Premium-Only Features
- **Epic Quests**: Higher rewards, more challenging
- **Custom Themes**: Personalized UI themes
- **Advanced Analytics**: Detailed progress insights
- **Exclusive Badges**: Premium-only achievements
- **Crown Currency**: Monthly crown allowance
- **Priority Leaderboards**: Premium-only leagues
- **No Ads**: Ad-free gamification experience
- **Early Access**: New features before free users

### 7.2 Premium Conversion Tactics
- Show locked premium quests with rewards
- Display premium badges with "Premium" tag
- Offer crown-exclusive shop items
- Promote premium leagues
- Limited-time premium trials

## 8. Analytics & Metrics

### 8.1 Success Metrics
- **Engagement**: Daily active users (DAU)
- **Retention**: 7-day, 30-day retention rates
- **Streak**: Average streak length
- **Quest Completion**: Daily quest completion rate
- **Achievement Unlock**: Average achievements per user
- **Leaderboard**: Leaderboard check frequency
- **Currency**: Gem earn/spend ratio
- **Premium Conversion**: Free → Premium conversion from gamification

### 8.2 Events to Track
- XP earned (by source)
- Level up events
- Achievement unlocks (by type)
- Quest completions
- Leaderboard views
- Shop purchases
- Power-up activations
- Currency transactions

## 9. Accessibility Requirements

### 9.1 Visual Accessibility
- Color-blind friendly badge indicators
- Text alternatives for all icons
- High contrast mode support
- Adjustable animation speeds
- Screen reader support for all elements

### 9.2 Cognitive Accessibility
- Clear quest instructions
- Simple achievement requirements
- Non-competitive modes option
- Stress-free gameplay option
- Tutorial for each feature

## 10. Localization Requirements

### 10.1 Translatable Content
- Achievement names and descriptions
- Quest titles and requirements
- Power-up descriptions
- UI labels and buttons
- Notification messages
- Error messages

### 10.2 Regional Considerations
- Time zones for daily resets
- Currency symbols
- Date formats
- Leaderboard grouping by region option

## 11. Performance Requirements

### 11.1 Response Times
- XP gain animation: < 100ms trigger
- Leaderboard load: < 500ms
- Achievement check: < 200ms
- Quest progress update: < 300ms

### 11.2 Scalability
- Support 1M+ users
- Handle 10K+ concurrent leaderboard queries
- Cache frequently accessed data
- Optimize database queries with indexes

## 12. Security & Anti-Cheat

### 12.1 Fraud Prevention
- Server-side XP validation
- Rate limiting on XP gains
- Anomaly detection for suspicious activity
- Cooldown periods between actions
- Audit logs for currency transactions

### 12.2 Leaderboard Integrity
- Ban cheaters from leaderboards
- Manual review for top ranks
- Report system for suspicious users
- Captcha for high-frequency actions

## 13. Testing Requirements

### 13.1 Unit Tests
- XP calculation logic
- Level progression formulas
- Achievement unlock conditions
- Quest progress tracking
- Currency transactions

### 13.2 Integration Tests
- API endpoint functionality
- Database transactions
- Real-time updates
- Leaderboard calculations

### 13.3 User Testing
- A/B test reward amounts
- Test animation preferences
- Measure engagement impact
- Collect feedback on difficulty

## 14. Launch Strategy

### 14.1 Phased Rollout
**Phase 1 (Week 1-2)**: Core System
- XP and leveling
- Basic achievements
- Streak visualization

**Phase 2 (Week 3-4)**: Social Features
- Leaderboards
- Squad gamification
- Social achievements

**Phase 3 (Week 5-6)**: Economy
- Gems currency
- Quest system
- Power-ups

**Phase 4 (Week 7-8)**: Premium
- Crown currency
- Premium quests
- Exclusive badges

### 14.2 Beta Testing
- Invite 100 power users
- Collect feedback
- Iterate based on data
- Refine reward balance

## 15. Future Enhancements

### 15.1 Potential Features
- Seasonal events (holidays)
- Limited-time badges
- Tournament mode
- Guild/clan system
- Pet/companion system
- Customizable avatars
- Profile themes
- Achievement showcase wall
- Milestone videos (generated)
- Integration with wearables

### 15.2 Advanced Mechanics
- Combo multipliers
- Prestige system (reset for bonuses)
- Skill trees per pillar
- Daily login calendar with escalating rewards
- Referral program with gamification
