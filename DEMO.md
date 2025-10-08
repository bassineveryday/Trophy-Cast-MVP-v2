# Trophy Cast MVP v2 - Demo Guide

## Overview
This guide walks you through the Trophy Cast app features and demonstrates how to use each screen.

---

## 🚀 Getting Started

### Prerequisites
Before running the demo:
1. ✅ Supabase project created
2. ✅ Database tables set up (run `supabase-setup.sql`)
3. ✅ Environment variables configured in `.env`
4. ✅ Dependencies installed (`npm install`)

### Starting the App
```bash
npm start
```

Then choose your platform:
- Press `w` for web browser (easiest for demo)
- Press `i` for iOS simulator (macOS only)
- Press `a` for Android emulator
- Scan QR code with Expo Go app on phone

---

## 📱 App Walkthrough

### 1. Login/Sign Up Screen

**First Launch:**
```
┌─────────────────────────────────────┐
│                                     │
│         Trophy Cast Logo            │
│      Denver Bassmasters             │
│                                     │
│  ┌───────────────────────────────┐ │
│  │  Email                        │ │
│  │  your.email@example.com       │ │
│  └───────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐ │
│  │  Password                     │ │
│  │  ••••••••                     │ │
│  └───────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐ │
│  │       Sign In                 │ │
│  └───────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐ │
│  │  Don't have an account?       │ │
│  │       Sign Up                 │ │
│  └───────────────────────────────┘ │
│                                     │
└─────────────────────────────────────┘
```

**Demo Steps:**
1. Tap "Don't have an account? Sign Up"
2. Enter email: `demo@denverbassmasters.com`
3. Enter password: `SecurePassword123`
4. Tap "Sign Up"
5. See success message
6. Switch back to Sign In mode
7. Enter same credentials
8. Tap "Sign In"
9. Successfully logged in!

**Features Demonstrated:**
- ✅ Form validation
- ✅ Toggle between sign in/up modes
- ✅ Loading states during authentication
- ✅ Error handling with alerts
- ✅ Clean, branded UI

---

### 2. Tournaments Screen

**Default View After Login:**
```
┌─────────────────────────────────────┐
│  Tournaments                    ⚙️  │
├─────────────────────────────────────┤
│                                     │
│  ┌───────────────────────────────┐ │
│  │  Spring Opener 2024   [COMP]  │ │
│  │  📅 Apr 15, 2024              │ │
│  │  📍 Cherry Creek Reservoir    │ │
│  └───────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐ │
│  │  Summer Classic       [COMP]  │ │
│  │  📅 Jun 20, 2024              │ │
│  │  📍 Chatfield Reservoir       │ │
│  └───────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐ │
│  │  Fall Championship    [UPCO]  │ │
│  │  📅 Sep 15, 2024              │ │
│  │  📍 Barr Lake                 │ │
│  └───────────────────────────────┘ │
│                                     │
├─────────────────────────────────────┤
│  🏆    📊    👤                     │
│  Tour  Lead  Prof                   │
└─────────────────────────────────────┘
```

**Demo Steps:**
1. View list of tournaments
2. Note status badges:
   - 🟢 Green = Completed
   - 🔵 Blue = Upcoming
   - 🟠 Orange = Active
3. Pull down to refresh
4. See loading indicator
5. List updates with fresh data

**Features Demonstrated:**
- ✅ Card-based layout
- ✅ Status color coding
- ✅ Date formatting
- ✅ Pull-to-refresh
- ✅ Scrollable list
- ✅ Empty state (if no data)

---

### 3. Leaderboard Screen

**Tap Leaderboard Tab:**
```
┌─────────────────────────────────────┐
│  Leaderboard                    ⚙️  │
├─────────────────────────────────────┤
│                                     │
│  ┌───────────────────────────────┐ │
│  │  🥇  John Smith          250   │ │
│  │      3 tournaments • Best: #1 │ │
│  │                           pts  │ │
│  └───────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐ │
│  │  🥈  Mike Johnson        230   │ │
│  │      4 tournaments • Best: #2 │ │
│  │                           pts  │ │
│  └───────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐ │
│  │  🥉  Sarah Williams      210   │ │
│  │      3 tournaments • Best: #3 │ │
│  │                           pts  │ │
│  └───────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐ │
│  │  4.  Tom Davis          180    │ │
│  │      2 tournaments • Best: #4 │ │
│  │                           pts  │ │
│  └───────────────────────────────┘ │
│                                     │
├─────────────────────────────────────┤
│  🏆    📊    👤                     │
│  Tour  Lead  Prof                   │
└─────────────────────────────────────┘
```

**Demo Steps:**
1. View club rankings
2. Note top 3 with medals (🥇🥈🥉)
3. See total points prominently displayed
4. View tournament participation count
5. See best finish for each angler
6. Pull down to refresh rankings
7. Scroll through full leaderboard

**Features Demonstrated:**
- ✅ Medal indicators for top 3
- ✅ Points prominently displayed
- ✅ Aggregated statistics
- ✅ Pull-to-refresh
- ✅ Sorted by performance
- ✅ Clean, scannable layout

---

### 4. Profile Screen

**Tap Profile Tab:**
```
┌─────────────────────────────────────┐
│  My Profile                     ⚙️  │
├─────────────────────────────────────┤
│                                     │
│  ┌───────────────────────────────┐ │
│  │          ┌──────┐             │ │
│  │          │  JS  │             │ │
│  │          └──────┘             │ │
│  │                               │ │
│  │        John Smith             │ │
│  │    Member ID: DBC001          │ │
│  │  demo@denverbassmasters.com   │ │
│  └───────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐ │
│  │  Season Statistics            │ │
│  │                               │ │
│  │   ┌──────┐    ┌──────┐       │ │
│  │   │  3   │    │ 250  │       │ │
│  │   │Tours │    │Points│       │ │
│  │   └──────┘    └──────┘       │ │
│  │                               │ │
│  │   ┌──────┐    ┌──────┐       │ │
│  │   │ 42.5 │    │ 14.2 │       │ │
│  │   │Tot lbs│   │Avg lb│       │ │
│  │   └──────┘    └──────┘       │ │
│  └───────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐ │
│  │  Achievements                 │ │
│  │                               │ │
│  │  Best Finish:           #1    │ │
│  │  Top 5 Finishes:         2    │ │
│  │  Biggest Fish:       5.8 lbs  │ │
│  └───────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐ │
│  │         Sign Out              │ │
│  └───────────────────────────────┘ │
│                                     │
├─────────────────────────────────────┤
│  🏆    📊    👤                     │
│  Tour  Lead  Prof                   │
└─────────────────────────────────────┘
```

**Demo Steps:**
1. View personal profile header
   - Avatar with initials
   - Full name
   - Member ID
   - Email
2. Review Season Statistics
   - Total tournaments fished
   - Total points earned
   - Total weight caught
   - Average weight per tournament
3. Check Achievements
   - Best finish position
   - Number of top 5 finishes
   - Biggest fish caught
4. Pull down to refresh stats
5. Tap "Sign Out"
6. Confirm and return to login

**Features Demonstrated:**
- ✅ Personalized profile display
- ✅ Grid layout for stats
- ✅ Achievement tracking
- ✅ Pull-to-refresh
- ✅ Sign out functionality
- ✅ Clean data visualization

---

## 🎯 Key Features to Highlight

### User Experience
- **Intuitive Navigation**: Bottom tab bar for easy access
- **Pull-to-Refresh**: Update data on any screen
- **Loading States**: Clear feedback during data fetching
- **Empty States**: Friendly messages when no data
- **Error Handling**: Graceful error messages

### Design Principles
- **Clean & Modern**: Card-based layout with shadows
- **Consistent Colors**: Blue primary, clean backgrounds
- **Readable Text**: High contrast, appropriate sizing
- **Touch-Friendly**: Large buttons and tap targets

### Performance
- **Fast Loading**: Optimized queries and rendering
- **Smooth Scrolling**: FlatList for efficient lists
- **Cached Auth**: Instant login for returning users

---

## 🧪 Testing Scenarios

### Authentication
- ✅ Sign up with new account
- ✅ Sign in with existing account
- ✅ Invalid credentials error
- ✅ Empty field validation
- ✅ Session persistence
- ✅ Sign out

### Data Display
- ✅ View tournaments list
- ✅ View leaderboard rankings
- ✅ View personal profile
- ✅ Pull-to-refresh on each screen
- ✅ Handle empty states
- ✅ Handle loading states

### Navigation
- ✅ Switch between tabs
- ✅ Tab highlights when active
- ✅ Navigate after authentication
- ✅ Return to login after sign out

---

## 📸 Screenshots Checklist

For a complete demo, capture:
1. ☐ Login screen (both sign in and sign up)
2. ☐ Tournaments screen with data
3. ☐ Tournaments screen empty state
4. ☐ Leaderboard screen with rankings
5. ☐ Leaderboard showing top 3 medals
6. ☐ Profile screen with stats
7. ☐ Profile achievements section
8. ☐ Pull-to-refresh in action
9. ☐ Loading states
10. ☐ Tab navigation

---

## 🎬 Demo Script

### Quick 2-Minute Demo
```
1. Open app (5s)
2. Sign in (10s)
3. Show tournaments screen (20s)
   - Point out status badges
   - Demonstrate pull-to-refresh
4. Switch to leaderboard (20s)
   - Show medal indicators
   - Point out statistics
5. Switch to profile (30s)
   - Show personal stats
   - Show achievements
6. Sign out (5s)
```

### Full 5-Minute Demo
```
1. Open app and show login screen (10s)
2. Demonstrate sign up process (30s)
3. Sign in with new account (20s)
4. Tour tournaments screen (60s)
   - Explain status badges
   - Show date/location info
   - Demonstrate pull-to-refresh
   - Show empty state if possible
5. Tour leaderboard screen (60s)
   - Explain ranking system
   - Show aggregated stats
   - Point out top 3 medals
   - Demonstrate pull-to-refresh
6. Tour profile screen (90s)
   - Show personal information
   - Explain season statistics
   - Detail achievements
   - Demonstrate pull-to-refresh
7. Demonstrate navigation (30s)
   - Switch between tabs
   - Show smooth transitions
8. Sign out and wrap up (30s)
```

---

## 💡 Talking Points

### For Club Members
- "Easy access to tournament information"
- "Track your personal progress throughout the season"
- "Compare your performance with other members"
- "All your stats in one place"

### For Club Administrators
- "Read-only app ensures data integrity"
- "Members can't accidentally modify records"
- "Easy to manage through Supabase dashboard"
- "Scalable as club grows"

### For Developers
- "Modern React Native with TypeScript"
- "Clean architecture with separation of concerns"
- "Reusable components for consistency"
- "Supabase for backend simplicity"
- "Cross-platform support out of the box"

---

## 🚨 Troubleshooting During Demo

### App Won't Load
- Check Expo dev tools for errors
- Verify .env file is configured
- Ensure Supabase is accessible
- Try clearing cache: `expo start -c`

### No Data Showing
- Check Supabase tables have data
- Verify RLS policies are set up
- Check console for error messages
- Try pull-to-refresh

### Authentication Issues
- Verify Supabase URL and anon key
- Check user was created in auth.users
- Ensure angler profile exists
- Try signing out and back in

---

## 📝 Feedback Collection

During/after demo, note:
- ☐ What features did users like most?
- ☐ What was confusing or unclear?
- ☐ What features do they want added?
- ☐ Any UI/UX improvements suggested?
- ☐ Performance issues noticed?

---

## 🎉 Demo Success Criteria

A successful demo shows:
- ✅ Smooth authentication flow
- ✅ All three main screens working
- ✅ Data loading and displaying correctly
- ✅ Pull-to-refresh functioning
- ✅ Clean, modern UI impressing viewers
- ✅ No critical errors or crashes
- ✅ Responsive and performant

---

**Ready to impress? Let's cast this demo!** 🎣

**Denver Bassmasters - Where Every Cast Counts**
