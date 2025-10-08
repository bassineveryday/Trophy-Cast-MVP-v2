# Trophy Cast - Application Flow

## User Journey

### First Time User Flow

```
1. App Launch
   │
   ├─→ Loading Screen
   │   │
   │   └─→ Check for existing session
   │       │
   │       └─→ No session found
   │
2. Login Screen
   │
   ├─→ User taps "Don't have an account? Sign Up"
   │
3. Sign Up Mode
   │
   ├─→ User enters email and password
   │
   ├─→ User taps "Sign Up"
   │
   ├─→ Account created
   │
   ├─→ Success alert: "Check your email to verify"
   │
4. Email Verification (if enabled)
   │
   ├─→ User checks email
   │
   ├─→ User clicks verification link
   │
5. Login Screen
   │
   ├─→ User enters email and password
   │
   ├─→ User taps "Sign In"
   │
   ├─→ Authentication successful
   │
6. Main App (Tabs)
   │
   └─→ Default: Tournaments Tab
```

### Returning User Flow

```
1. App Launch
   │
   ├─→ Loading Screen
   │   │
   │   └─→ Check for existing session
   │       │
   │       └─→ Session found & valid
   │
2. Main App (Tabs)
   │
   └─→ Default: Tournaments Tab
```

---

## Main App Navigation

```
Bottom Tab Navigator
├─── 🏆 Tournaments Tab
├─── 📊 Leaderboard Tab
└─── 👤 Profile Tab
```

---

## Screen Flows

### Tournaments Screen Flow

```
Tournaments Screen
│
├─→ On Mount
│   ├─→ Show loading indicator
│   ├─→ Fetch tournaments from Supabase
│   ├─→ Sort by date (newest first)
│   └─→ Display in list
│
├─→ User pulls down to refresh
│   ├─→ Show refresh indicator
│   ├─→ Re-fetch tournaments
│   └─→ Update list
│
└─→ Display states:
    ├─→ Loading: Spinner with "Loading tournaments..."
    ├─→ Empty: "No tournaments found" message
    └─→ Success: List of tournament cards
        │
        └─→ Each card shows:
            ├─→ Tournament name
            ├─→ Status badge (Upcoming/Active/Completed)
            ├─→ Date (formatted)
            └─→ Location
```

### Leaderboard Screen Flow

```
Leaderboard Screen
│
├─→ On Mount
│   ├─→ Show loading indicator
│   ├─→ Fetch tournament results from Supabase
│   ├─→ Aggregate data by angler
│   │   ├─→ Sum total points
│   │   ├─→ Count tournaments fished
│   │   ├─→ Calculate total weight
│   │   └─→ Find best finish
│   ├─→ Sort by total points (highest first)
│   └─→ Display in list
│
├─→ User pulls down to refresh
│   ├─→ Show refresh indicator
│   ├─→ Re-fetch and recalculate
│   └─→ Update list
│
└─→ Display states:
    ├─→ Loading: Spinner with "Loading leaderboard..."
    ├─→ Empty: "No leaderboard data" message
    └─→ Success: List of angler cards
        │
        └─→ Each card shows:
            ├─→ Rank (🥇/🥈/🥉 for top 3, number for others)
            ├─→ Angler name
            ├─→ Total points (emphasized)
            ├─→ Tournaments fished
            └─→ Best finish position
```

### Profile Screen Flow

```
Profile Screen
│
├─→ On Mount
│   ├─→ Show loading indicator
│   ├─→ Get current user from auth context
│   ├─→ Fetch angler profile by user_id
│   ├─→ Fetch tournament results for this angler
│   ├─→ Calculate statistics:
│   │   ├─→ Total tournaments
│   │   ├─→ Total points
│   │   ├─→ Total weight
│   │   ├─→ Average weight
│   │   ├─→ Best finish
│   │   ├─→ Top 5 finishes
│   │   └─→ Biggest fish
│   └─→ Display profile
│
├─→ User pulls down to refresh
│   ├─→ Show refresh indicator
│   ├─→ Re-fetch and recalculate
│   └─→ Update display
│
├─→ User taps "Sign Out"
│   ├─→ Confirm action
│   ├─→ Sign out from Supabase
│   ├─→ Clear session from AsyncStorage
│   └─→ Navigate to Login Screen
│
└─→ Display states:
    ├─→ Loading: Spinner with "Loading profile..."
    ├─→ No Profile: "Profile not found" message with Sign Out button
    └─→ Success: Profile cards
        │
        ├─→ Header Card:
        │   ├─→ Avatar (initials)
        │   ├─→ Full name
        │   ├─→ Member ID
        │   └─→ Email
        │
        ├─→ Season Statistics Card:
        │   ├─→ Total tournaments (grid layout)
        │   ├─→ Total points
        │   ├─→ Total weight
        │   └─→ Average weight
        │
        ├─→ Achievements Card:
        │   ├─→ Best finish
        │   ├─→ Top 5 finishes
        │   └─→ Biggest fish (if applicable)
        │
        └─→ Sign Out Button
```

---

## Data Flow

### Authentication Flow

```
App Start
    │
    ▼
AuthProvider mounts
    │
    ├─→ Check AsyncStorage for session
    │   │
    │   ├─→ Session found
    │   │   │
    │   │   ├─→ Validate with Supabase
    │   │   │   │
    │   │   │   ├─→ Valid → Set user state
    │   │   │   └─→ Invalid → Clear session, show Login
    │   │   │
    │   │   └─→ loading = false
    │   │
    │   └─→ No session
    │       │
    │       ├─→ user = null
    │       └─→ loading = false
    │
    ├─→ Listen for auth state changes
    │   │
    │   └─→ On change → Update user state
    │
    └─→ Provide context to app
        │
        ├─→ user
        ├─→ session
        ├─→ loading
        ├─→ signIn()
        ├─→ signUp()
        └─→ signOut()
```

### Sign In Flow

```
User enters credentials
    │
    ▼
User taps "Sign In"
    │
    ├─→ Validate inputs (not empty)
    │   │
    │   ├─→ Invalid → Show alert
    │   └─→ Valid → Continue
    │
    ├─→ Set loading = true
    │
    ├─→ Call supabase.auth.signInWithPassword()
    │   │
    │   ├─→ Success
    │   │   │
    │   │   ├─→ Session created
    │   │   ├─→ Saved to AsyncStorage
    │   │   ├─→ User state updated
    │   │   ├─→ Set loading = false
    │   │   └─→ Navigate to Main App
    │   │
    │   └─→ Error
    │       │
    │       ├─→ Set loading = false
    │       └─→ Show error alert
    │
    └─→ End
```

### Data Fetching Flow

```
Screen Component Mounts
    │
    ├─→ Set loading = true
    │
    ├─→ useEffect triggered
    │   │
    │   ├─→ Call fetch function
    │   │   │
    │   │   ├─→ Query Supabase
    │   │   │   │
    │   │   │   ├─→ Success
    │   │   │   │   │
    │   │   │   │   ├─→ Receive data
    │   │   │   │   ├─→ Process/transform data
    │   │   │   │   ├─→ Update state with data
    │   │   │   │   └─→ Set loading = false
    │   │   │   │
    │   │   │   └─→ Error
    │   │   │       │
    │   │   │       ├─→ Log error to console
    │   │   │       ├─→ Set data to empty/null
    │   │   │       └─→ Set loading = false
    │   │   │
    │   │   └─→ Finally block
    │   │       │
    │   │       └─→ Set loading = false (safety)
    │   │
    │   └─→ Cleanup on unmount
    │
    └─→ Render UI based on state
        │
        ├─→ if loading → Show Loading component
        ├─→ if no data → Show Empty state
        └─→ if data → Show list/content
```

---

## Error Handling Flow

```
Error Occurs
    │
    ├─→ Network Error
    │   │
    │   ├─→ Log to console
    │   ├─→ Show user-friendly message
    │   └─→ Suggest pull-to-refresh
    │
    ├─→ Authentication Error
    │   │
    │   ├─→ Invalid credentials → Show alert
    │   ├─→ Session expired → Sign out, go to Login
    │   └─→ Network timeout → Retry suggestion
    │
    ├─→ Database Error
    │   │
    │   ├─→ Log to console
    │   ├─→ Show empty state
    │   └─→ Allow refresh
    │
    └─→ Unknown Error
        │
        ├─→ Log full error
        ├─→ Show generic error message
        └─→ Provide contact info for support
```

---

## State Management

### Global State (Context)
- Authentication state (user, session, loading)
- Auth methods (signIn, signUp, signOut)

### Local State (Component)
- Screen-specific data (tournaments, leaderboard, profile)
- Loading states
- Refresh states
- Form inputs

### Persistent State (AsyncStorage)
- Authentication tokens
- Session data

---

## Navigation Flow

```
App Navigator (Stack)
    │
    ├─→ Not Authenticated
    │   │
    │   └─→ Login Screen
    │
    └─→ Authenticated
        │
        └─→ Main (Tab Navigator)
            │
            ├─→ Tournaments Tab
            │   └─→ TournamentStatsScreen
            │
            ├─→ Leaderboard Tab
            │   └─→ LeaderboardScreen
            │
            └─→ Profile Tab
                └─→ ProfileScreen
                    │
                    └─→ Sign Out → Back to Login
```

---

## Pull-to-Refresh Flow

```
User pulls down on list
    │
    ├─→ RefreshControl activates
    │   │
    │   ├─→ Set refreshing = true
    │   ├─→ Show refresh indicator
    │   │
    │   ├─→ Call onRefresh handler
    │   │   │
    │   │   ├─→ Re-fetch data from Supabase
    │   │   ├─→ Process new data
    │   │   ├─→ Update component state
    │   │   └─→ Set refreshing = false
    │   │
    │   └─→ Hide refresh indicator
    │
    └─→ List updates with fresh data
```

---

This flow diagram represents the complete user journey and data flow through the Trophy Cast application.
