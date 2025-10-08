# Trophy Cast MVP v2 - Architecture Documentation

## Overview

Trophy Cast is a React Native mobile application built with Expo that provides read-only access to tournament data for the Denver Bassmasters fishing club. The app uses Supabase for backend services including authentication and database management.

## Technology Stack

### Frontend
- **React Native** - Cross-platform mobile framework
- **Expo SDK 54** - Development platform and tools
- **TypeScript** - Type-safe JavaScript
- **React Navigation** - Navigation library
  - Bottom Tabs Navigator - Main app navigation
  - Native Stack Navigator - Screen transitions

### Backend
- **Supabase** - Backend-as-a-Service
  - PostgreSQL database
  - Authentication (email/password)
  - Row Level Security (RLS)
  - Real-time capabilities (not currently used)

### Storage
- **AsyncStorage** - Local storage for authentication tokens

## Project Structure

```
Trophy-Cast-MVP-v2/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Button.tsx       # Custom button with loading states
│   │   ├── Card.tsx         # Card wrapper component
│   │   └── Loading.tsx      # Loading indicator
│   │
│   ├── navigation/          # Navigation configuration
│   │   └── AppNavigator.tsx # Main navigation container
│   │
│   ├── screens/             # Screen components
│   │   ├── LoginScreen.tsx          # Authentication screen
│   │   ├── TournamentStatsScreen.tsx # Tournament list
│   │   ├── LeaderboardScreen.tsx    # Rankings display
│   │   └── ProfileScreen.tsx        # User profile & stats
│   │
│   ├── services/            # External services
│   │   ├── supabase.ts      # Supabase client configuration
│   │   └── auth.tsx         # Authentication context/hooks
│   │
│   ├── types/               # TypeScript definitions
│   │   └── index.ts         # All type definitions
│   │
│   └── utils/               # Utility functions (empty for now)
│
├── assets/                  # Static assets (images, icons)
├── App.tsx                  # Root component
├── index.ts                 # Entry point
└── app.json                 # Expo configuration

```

## Data Flow

### Authentication Flow
1. User opens app
2. AuthProvider checks for existing session (AsyncStorage)
3. If no session → LoginScreen
4. If valid session → MainTabs (app screens)
5. User can sign in/up through LoginScreen
6. Successful auth → Session stored → Navigate to MainTabs

### Data Fetching Flow
1. Screen mounts
2. useEffect triggers data fetch from Supabase
3. Loading state displayed
4. Data retrieved and stored in local state
5. UI renders with data
6. Pull-to-refresh available for manual updates

## Database Schema

### Tables

#### `anglers`
Stores angler/member information linked to auth users.
```sql
- id (UUID, PK)
- user_id (UUID, FK -> auth.users)
- first_name (TEXT)
- last_name (TEXT)
- club_member_id (TEXT, optional)
- profile_photo_url (TEXT, optional)
- created_at (TIMESTAMP)
```

#### `tournaments`
Stores tournament information.
```sql
- id (UUID, PK)
- name (TEXT)
- date (DATE)
- location (TEXT)
- status (TEXT: 'upcoming', 'active', 'completed')
- created_at (TIMESTAMP)
```

#### `tournament_results`
Stores individual tournament results for each angler.
```sql
- id (UUID, PK)
- tournament_id (UUID, FK -> tournaments)
- angler_id (UUID, FK -> anglers)
- total_weight (DECIMAL)
- big_fish_weight (DECIMAL, optional)
- placement (INTEGER)
- points (INTEGER)
- created_at (TIMESTAMP)
```

### Relationships
- `anglers.user_id` → `auth.users.id` (one-to-one)
- `tournament_results.tournament_id` → `tournaments.id` (many-to-one)
- `tournament_results.angler_id` → `anglers.id` (many-to-one)

### Security (RLS Policies)
All tables have Row Level Security enabled with read-only policies:
- Authenticated users can SELECT (read) all records
- No INSERT, UPDATE, or DELETE permissions through the app
- Data management done through Supabase dashboard or admin tools

## Component Architecture

### Screens

#### LoginScreen
- Handles both sign in and sign up
- Toggle between modes
- Form validation
- Error handling with alerts
- Uses AuthContext for authentication

#### TournamentStatsScreen
- Lists all tournaments
- Pull-to-refresh
- Status badges (upcoming, active, completed)
- Sorted by date (newest first)
- Empty state handling

#### LeaderboardScreen
- Aggregates tournament_results by angler
- Calculates total points, tournaments fished, best finish
- Displays top 3 with medal emojis
- Pull-to-refresh
- Empty state handling

#### ProfileScreen
- Displays current user's profile
- Shows angler information
- Calculates and displays statistics:
  - Total tournaments
  - Total points
  - Average weight
  - Best finish
  - Top 5 finishes
  - Biggest fish
- Sign out functionality
- Pull-to-refresh

### Reusable Components

#### Button
Props: `title`, `onPress`, `loading`, `disabled`, `variant`, `style`, `textStyle`
- Primary and secondary variants
- Loading state with spinner
- Disabled state handling

#### Card
Props: `children`, `style`
- Consistent shadow and padding
- White background with rounded corners

#### Loading
Props: `message`
- Full-screen loading indicator
- Customizable message

### Services

#### Supabase Client (`src/services/supabase.ts`)
- Configured with environment variables
- AsyncStorage for session persistence
- Auto-refresh tokens enabled

#### Auth Context (`src/services/auth.tsx`)
- React Context for global auth state
- Hooks: `useAuth()`
- Methods: `signIn()`, `signUp()`, `signOut()`
- State: `user`, `session`, `loading`
- Listens to auth state changes

## Navigation Structure

```
Stack Navigator (Root)
├─ Login (if not authenticated)
└─ Main (if authenticated)
   └─ Tab Navigator
      ├─ Tournaments Tab
      ├─ Leaderboard Tab
      └─ Profile Tab
```

## State Management

Currently using:
- **React Context** - Authentication state
- **Local Component State** - UI and data state
- **AsyncStorage** - Persistent auth tokens

Future considerations:
- Could add Redux/Zustand for more complex state
- Could add React Query for better data fetching/caching

## Styling

- React Native StyleSheet API
- Inline styles for component-specific needs
- Consistent color scheme:
  - Primary: `#0066CC` (blue)
  - Background: `#F5F5F5` (light gray)
  - Text: `#333` (dark gray)
  - Secondary text: `#666` (medium gray)
- Shadow/elevation for depth
- Responsive font sizes

## Environment Variables

Required variables in `.env`:
```
EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
```

Note: Expo requires `EXPO_PUBLIC_` prefix for client-side variables.

## Error Handling

- Try/catch blocks around Supabase queries
- Console logging for debugging
- Alert dialogs for user-facing errors
- Empty states for no data scenarios
- Loading states for async operations

## Performance Considerations

- FlatList for efficient list rendering
- Pull-to-refresh instead of polling
- Lazy loading with AsyncStorage for auth
- Optimized queries (indexes on database)
- Minimal re-renders with proper React patterns

## Security Considerations

1. **Environment Variables** - Sensitive data not in source code
2. **Row Level Security** - Database-level access control
3. **Read-Only App** - No data modification through app
4. **Auth Required** - All screens protected except login
5. **Secure Storage** - Tokens in AsyncStorage (encrypted on device)
6. **HTTPS** - All Supabase communication over HTTPS

## Future Enhancements

Potential features to add:
- Push notifications for new tournaments
- Photo uploads for tournament catches
- Social features (comments, likes)
- Real-time leaderboard updates during tournaments
- Offline support with data caching
- Dark mode
- Tournament filtering and search
- Detailed tournament views with all results
- Charts and graphs for statistics
- Export data (PDF reports)

## Testing Strategy

Current state: No automated tests

Recommended additions:
- Unit tests for utility functions
- Component tests with React Native Testing Library
- Integration tests for data fetching
- E2E tests with Detox
- Type checking with TypeScript (already in place)

## Deployment

### Development
```bash
npm start
```

### Production Builds

#### iOS
```bash
eas build --platform ios
```

#### Android
```bash
eas build --platform android
```

#### Web
```bash
npm run web
```

Note: Requires EAS (Expo Application Services) account for building native apps.

## Maintenance

### Updating Dependencies
```bash
npm outdated
npx expo install --fix
```

### Database Migrations
- Handled through Supabase dashboard
- SQL migrations can be version controlled
- Test on staging environment first

### Monitoring
- Check Supabase dashboard for:
  - Database health
  - API usage
  - Auth statistics
  - Error logs
- Monitor app store reviews
- Track app crashes (consider Sentry)

## Resources

- [Expo Documentation](https://docs.expo.dev)
- [React Native Documentation](https://reactnative.dev)
- [Supabase Documentation](https://supabase.com/docs)
- [React Navigation Documentation](https://reactnavigation.org)

---

**Last Updated**: January 2025
**Version**: 1.0.0
