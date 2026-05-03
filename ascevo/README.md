# Growthovo - Personal Growth PWA

A comprehensive personal growth application built with React Native and Expo, featuring AI coaching, gamification, and multi-pillar life improvement tracking.

## 🌟 Features

### Core Functionality

#### 1. **Six Growth Pillars**
Track and improve across six key life areas:
- 🧠 **Mental** - Mindfulness, mental health, and cognitive development
- 💬 **Relations** - Communication skills and relationship building
- 💼 **Career** - Professional development and career growth
- 💪 **Fitness** - Physical health and exercise
- 💰 **Finance** - Financial literacy and money management
- 🎨 **Hobbies** - Creative pursuits and personal interests

#### 2. **Daily Check-In System**
- Multi-step check-in modal with mood tracking
- Focus setting for daily intentions
- **+50 XP reward** for completing daily check-ins
- Persistent storage in Supabase
- Beautiful completion animations

#### 3. **Rex AI Coach**
- Conversational AI assistant for personal growth
- Keyword-based responses for common challenges:
  - Anxiety management and breathing techniques
  - Focus and productivity tips
  - Motivational support
  - Relationship advice
  - Career guidance
  - SOS crisis support
- Real-time typing indicators
- Quick reply suggestions

#### 4. **Gamification System**
- **XP Points**: Earn experience points for completing activities
- **Level System**: Automatic level calculation (every 100 XP = 1 level)
- **Streak Tracking**: Daily streak counter for consistency
- **Achievement Badges**: Unlock badges for milestones
- **Weekly Leagues**: Compete in Bronze, Silver, Gold leagues
- **Leaderboards**: See your rank among other users

#### 5. **Social Features**
- Squad system for accountability partners
- Online/offline status indicators
- Friend invitations
- Leaderboard competition

### Technical Features

#### Architecture
- **React Native** with Expo for cross-platform development
- **TypeScript** for type safety
- **Supabase** for backend (PostgreSQL database, authentication, real-time)
- **React Context API** for global state management
- **React Navigation** for routing

#### State Management
- **AppContext**: Global XP, streak, and level tracking
- Optimistic UI updates for responsive experience
- Automatic retry logic for failed network operations
- Error handling with user-friendly messages

#### Performance Optimizations
- Memoized components to prevent unnecessary re-renders
- FlatList optimization for long lists
- Debounced input handlers
- Lazy loading for pillar lessons
- Native driver animations for 60fps

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Expo CLI: `npm install -g expo-cli`
- Supabase account and project

### Installation

1. **Clone the repository**
   ```bash
   cd ascevo
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your Supabase credentials:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run database migrations**
   - See `supabase/migrations/` for SQL schema
   - Run migrations in your Supabase dashboard

5. **Start the development server**
   ```bash
   npm start
   ```

### Running on Different Platforms

- **Web (PWA)**: Press `w` in the Expo CLI
- **iOS Simulator**: Press `i` (requires Xcode)
- **Android Emulator**: Press `a` (requires Android Studio)
- **Physical Device**: Scan QR code with Expo Go app

## 📁 Project Structure

```
ascevo/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── CheckInModal.tsx # Daily check-in modal
│   │   └── ...
│   ├── context/             # React Context providers
│   │   └── AppContext.tsx   # Global XP/streak/level state
│   ├── screens/             # Screen components
│   │   ├── home/            # Home screen with stats
│   │   ├── pillars/         # Pillar selection and lessons
│   │   ├── rex/             # AI chat interface
│   │   ├── league/          # Leaderboard and leagues
│   │   ├── profile/         # User profile and settings
│   │   └── ...
│   ├── services/            # Business logic and API calls
│   │   ├── supabaseClient.ts
│   │   ├── lessonService.ts
│   │   └── ...
│   ├── theme/               # Design system (colors, typography, spacing)
│   ├── types/               # TypeScript type definitions
│   └── __tests__/           # Unit and integration tests
├── supabase/                # Database schema and migrations
├── public/                  # Static assets for PWA
├── .env.example             # Environment variable template
├── app.json                 # Expo configuration
├── package.json             # Dependencies
└── README.md                # This file
```

## 🎨 Design System

### Theme
- **Background**: `#0A0A12` (deep dark blue)
- **Card Background**: `#1A1A2E` (dark purple-blue)
- **Primary Purple**: `#7C3AED` (vibrant purple)
- **Light Purple**: `#A78BFA` (soft purple)
- **Success Green**: `#16A34A`
- **Warning Orange**: `#F59E0B`
- **Error Red**: `#EF4444`

### Typography
- **Headings**: SF Pro Display / System font
- **Body**: SF Pro Text / System font
- **Weights**: Regular (400), Semibold (600), Bold (700)

### Spacing
- **xs**: 4px
- **sm**: 8px
- **md**: 16px
- **lg**: 24px
- **xl**: 32px

## 🧪 Testing

### Run Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test Coverage
- Unit tests for components and services
- Integration tests for user flows
- Property-based tests for critical logic
- Target: 80% code coverage

## 📚 API Documentation

### AppContext

Global state management for XP, streak, and level.

```typescript
import { useAppContext } from './context/AppContext';

function MyComponent() {
  const { xp, streak, level, updateXP, refreshUserData } = useAppContext();
  
  // Award XP
  await updateXP(50);
  
  // Refresh data from database
  await refreshUserData();
}
```

**Available Methods:**
- `updateXP(amount: number)`: Add/subtract XP and sync with database
- `updateStreak(newStreak: number)`: Update streak value
- `refreshUserData()`: Fetch latest data from Supabase
- `clearError()`: Clear error state

### CheckInModal

Daily check-in modal with 3-step flow.

```typescript
import CheckInModal from './components/CheckInModal';

<CheckInModal
  visible={isVisible}
  userId={user.id}
  onComplete={(data) => {
    console.log('Mood:', data.mood);
    console.log('Focus:', data.focus);
    updateXP(50); // Award XP
  }}
  onClose={() => setIsVisible(false)}
/>
```

**Props:**
- `visible`: boolean - Controls modal visibility
- `userId`: string - User ID for saving check-in
- `onComplete`: (data) => void - Called when check-in completes
- `onClose`: () => void - Called when modal closes

## 🗄️ Database Schema

### Key Tables

#### `users`
- `id`: UUID (primary key)
- `email`: TEXT
- `total_xp`: INTEGER
- `current_streak`: INTEGER
- `created_at`: TIMESTAMPTZ

#### `check_ins`
- `id`: UUID (primary key)
- `user_id`: UUID (foreign key)
- `mood`: TEXT
- `focus`: TEXT
- `intention`: TEXT
- `xp_awarded`: INTEGER
- `created_at`: TIMESTAMPTZ

#### `pillars`
- `id`: UUID (primary key)
- `name`: TEXT
- `emoji`: TEXT
- `color`: TEXT

#### `lessons`
- `id`: UUID (primary key)
- `unit_id`: UUID (foreign key)
- `title`: TEXT
- `content`: JSONB
- `xp_reward`: INTEGER

See `supabase/migrations/` for complete schema.

## 🔒 Security

- Row Level Security (RLS) enabled on all tables
- User authentication via Supabase Auth
- Parameterized queries to prevent SQL injection
- Input validation on all user inputs
- XSS protection via React's built-in escaping
- Environment variables for sensitive data

## 🚢 Deployment

### Web (PWA)
```bash
# Build for production
npm run build:web

# Deploy to Vercel
vercel deploy
```

### iOS
```bash
# Build for App Store
eas build --platform ios
```

### Android
```bash
# Build for Play Store
eas build --platform android
```

## 📈 Performance

- **Screen render time**: < 100ms
- **Modal animations**: 200-300ms
- **API response time**: < 500ms
- **FlatList optimization**: Virtualized rendering
- **Image optimization**: WebP format, lazy loading
- **Bundle size**: < 5MB (web)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Code Style
- TypeScript strict mode enabled
- ESLint + Prettier for formatting
- No `any` types (except navigation props)
- JSDoc comments for all public functions
- Meaningful variable names

## 📝 License

This project is proprietary and confidential.

## 🙏 Acknowledgments

- **Expo** for the amazing development platform
- **Supabase** for backend infrastructure
- **React Native** community for excellent libraries
- **Design inspiration** from Duolingo, Headspace, and Strava

## 📞 Support

For issues and questions:
- Create an issue on GitHub
- Email: support@growthovo.com
- Documentation: https://docs.growthovo.com

## 🗺️ Roadmap

### Q2 2024
- [ ] Real AI integration for Rex (OpenAI/Anthropic)
- [ ] Push notifications for check-in reminders
- [ ] Offline mode with sync queue
- [ ] Social sharing features

### Q3 2024
- [ ] Video lessons
- [ ] Live coaching sessions
- [ ] Community forums
- [ ] Mobile app release (iOS/Android)

### Q4 2024
- [ ] Wearable integration (Apple Watch, Fitbit)
- [ ] Advanced analytics dashboard
- [ ] Premium subscription tiers
- [ ] Multi-language support

---

**Built with ❤️ by the Growthovo team**

Version 1.0.0 | Last updated: January 2024
