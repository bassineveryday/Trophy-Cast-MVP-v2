# DBM Board Back Office - Architecture Diagram

## Complete System Flow

```
┌──────────────────────────────────────────────────────────────────┐
│                      Trophy Cast Mobile App                      │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Bottom Tab Navigation                                   │ │
│  ├────────────────────────────────────────────────────────────┤ │
│  │ Home | LogCatch | AICoach | DBM ← Click | TrophyRoom     │ │
│  └────────────────────────────────────────────────────────────┘ │
│                           ↓                                      │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  DBM Tab (Club Info)                                       │ │
│  ├────────────────────────────────────────────────────────────┤ │
│  │                                                             │ │
│  │  Club Information Display                                  │ │
│  │                                                             │ │
│  │  [Board Tools] ← Gold button (only for board members)  │ │
│  │       ↓                                                     │ │
│  │   NAVIGATION  ← Routes to Board Back Office               │ │
│  │                                                             │ │
│  └────────────────────────────────────────────────────────────┘ │
│                           ↓                                      │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Stack.Group Modal (App.tsx)                              │ │
│  │                                                             │ │
│  │  Wraps: BoardBackOfficeScreen                             │ │
│  │  With: BoardGuard access control                          │ │
│  │  Header: "Board Back Office" (gold text)                  │ │
│  └────────────────────────────────────────────────────────────┘ │
│                           ↓                                      │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  BoardGuard Component (Access Control)                    │ │
│  ├────────────────────────────────────────────────────────────┤ │
│  │                                                             │ │
│  │  Checks: useBoardAccess hook                              │ │
│  │                                                             │ │
│  │  if (loading) → Show spinner                              │ │
│  │  else if (!isBoard) → Show "Not Authorized"               │ │
│  │  else → Render children (BoardBackOfficeScreen)           │ │
│  │                                                             │ │
│  └────────────────────────────────────────────────────────────┘ │
│                           ↓                                      │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  useBoardAccess Hook (Query Layer)                        │ │
│  ├────────────────────────────────────────────────────────────┤ │
│  │                                                             │ │
│  │  1. Get current auth user (auth.getUser)                  │ │
│  │  2. Query: SELECT * FROM dbm_board_members                │ │
│  │     WHERE profile_id = auth.uid()                         │ │
│  │  3. Return: { loading, isBoard, role, error }             │ │
│  │                                                             │ │
│  │  Result stored in React state                             │ │
│  │                                                             │ │
│  └────────────────────────────────────────────────────────────┘ │
│                           ↓                                      │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  BoardBackOfficeScreen (Dashboard UI)                     │ │
│  ├────────────────────────────────────────────────────────────┤ │
│  │                                                             │ │
│  │  Header: "DBM Board" + "Back Office" + Shield Icon        │ │
│  │                                                             │ │
│  │  Menu Grid (2 columns, responsive):                       │ │
│  │  ┌─────────────────────────────────────────────────────┐ │ │
│  │  │  📄 Board       │  👥 Member     │ [NOT FUNCTIONAL] │ │ │
│  │  │     Notes       │     Mgmt       │                 │ │ │
│  │  ├─────────────────┼─────────────────┤                 │ │ │
│  │  │  🏆 Tourna     │  💰 Finance     │  [Buttons are   │ │ │
│  │  │     ments       │                 │   styled UI     │ │ │
│  │  ├─────────────────┼─────────────────┤   only - will   │ │ │
│  │  │  🌿 Conserv    │  🎓 Juniors     │   implement     │ │ │
│  │  │     ation       │     Program     │   one at a      │ │ │
│  │  ├─────────────────┼─────────────────┤   time with     │ │ │
│  │  │  🎓 High       │  ⚙️  Settings   │   your input]   │ │ │
│  │  │     School      │                 │                 │ │ │
│  │  └─────────────────┴─────────────────┘                 │ │ │
│  │                                                             │ │
│  │  Footer: "🔐 Board-Only Area • All actions are logged"    │ │
│  │                                                             │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
                           ↓
                    (Button clicks)
              [No navigation - placeholder]
                     (Coming soon)
```

---

## Database & Security Layer

```
┌─────────────────────────────────────────────────────────────┐
│                    Supabase Backend                         │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  Authentication (auth.users table)                    │ │
│  │  ┌─────────────────────────────────────────────────┐ │ │
│  │  │  id (UUID)      │  email         │  password    │ │ │
│  │  ├─────────────────┼────────────────┼──────────────┤ │ │
│  │  │ uuid-1234       │  pres@dbm.com  │ hashed       │ │ │
│  │  │ uuid-5678       │  vp@dbm.com    │ hashed       │ │ │
│  │  │ uuid-9999       │  member@dbm... │ hashed       │ │ │
│  │  └─────────────────────────────────────────────────┘ │ │
│  └───────────────────────────────────────────────────────┘ │
│                           ↓                                 │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  dbm_board_members (New Table - RLS Enabled)         │ │
│  │  ┌─────────────────────────────────────────────────┐ │ │
│  │  │ profile_id    │ member_id │ role       │created │ │ │
│  │  │ (UUID, FK)    │ (TEXT)    │ (TEXT)     │_at     │ │ │
│  │  ├───────────────┼───────────┼────────────┼────────┤ │ │
│  │  │ uuid-1234     │ DBM020    │ DBM        │ 2024   │ │ │
│  │  │               │           │ President  │        │ │ │
│  │  ├───────────────┼───────────┼────────────┼────────┤ │ │
│  │  │ uuid-5678     │ DBM021    │ DBM Vice   │ 2024   │ │ │
│  │  │               │           │ President  │        │ │ │
│  │  ├───────────────┼───────────┼────────────┼────────┤ │ │
│  │  │ uuid-9999     │ DBM063    │ DBM        │ 2024   │ │ │
│  │  │               │           │ Treasurer  │        │ │ │
│  │  └─────────────────────────────────────────────────┘ │ │
│  │                                                       │ │
│  │  RLS Policy: Authenticated users can only SELECT     │ │
│  │  rows where profile_id = auth.uid()                  │ │
│  │  (via is_dbm_board_member() function)                │ │
│  │                                                       │ │
│  │  RLS Policy: Only SERVICE_ROLE can INSERT/UPDATE     │ │
│  │  (prevents clients from adding themselves)           │ │
│  └───────────────────────────────────────────────────────┘ │
│                           ↓                                 │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  is_dbm_board_member() Function (PL/pgSQL)           │ │
│  │                                                       │ │
│  │  SELECT EXISTS (                                     │ │
│  │    SELECT 1 FROM dbm_board_members                   │ │
│  │    WHERE profile_id = auth.uid()                     │ │
│  │  )                                                   │ │
│  │                                                       │ │
│  │  Returns: TRUE if user is board member               │ │
│  │           FALSE otherwise                            │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
     ↓
[Future board tables will use same pattern]
  - dbm_board_notes
  - dbm_tournaments
  - dbm_finance
  - dbm_conservation
  - etc.
```

---

## Data Flow: User Tries to Access Board Back Office

```
User Clicks "Board Tools" Button
        ↓
Navigate to "BoardBackOffice" route
        ↓
BoardBackOfficeScreen Component Mounts
        ↓
<BoardGuard> Component Wraps It
        ↓
useBoardAccess Hook Executes:
  ├─ supabase.auth.getUser()
  │  └─ Returns: { user: { id: "uuid-1234" } }
  │
  ├─ supabase.from('dbm_board_members')
  │  .select('role')
  │  .eq('profile_id', "uuid-1234")
  │  .maybeSingle()
  │  └─ Returns query result (data or null)
  │
  └─ Set state: { isBoard: true/false, role: "...", loading: false }
        ↓
    ┌─────────────────────────────┐
    │ Is isBoard === true?        │
    ├─────────────────────────────┤
    │ YES → Render children       │
    │       (Dashboard)           │
    │                             │
    │ NO  → Render "Not Auth"     │
    └─────────────────────────────┘
        ↓
Conditional Rendering Happens
        ↓
Dashboard or "Not Authorized" Screen Displayed
```

---

## Component Hierarchy

```
App Component (App.tsx)
  └─ Stack.Navigator
     └─ Stack.Screen name="MainTabs"
        └─ BottomTabs Navigator
           ├─ Tab.Screen "Home"
           ├─ Tab.Screen "LogCatch"
           ├─ Tab.Screen "AICoach"
           ├─ Tab.Screen "DBM"
           │  └─ ClubInfo Component
           │     └─ [Board Tools Button]
           │        └─ On Press: navigate("BoardBackOffice")
           ├─ Tab.Screen "TrophyRoom"
     └─ Stack.Group screenOptions={{presentation: 'modal'}}
        └─ Stack.Screen name="BoardBackOffice"
           └─ BoardBackOfficeScreen Component
              └─ <BoardGuard>
                 └─ [Dashboard with 8 menu items]
```

---

## Authentication & Authorization Flow

```
┌─────────────────────────────────────────────────────────────┐
│                  Trinity of Security                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Layer 1: Device Layer (Client-Side)                      │
│  ├─ useBoardAccess hook checks if user is board member   │
│  ├─ BoardGuard component blocks render if not authorized │
│  └─ "Board Tools" button hidden for non-board            │
│     (UX convenience, NOT security)                        │
│                                                             │
│  Layer 2: Authentication Layer (Supabase Auth)            │
│  ├─ User must be logged in (auth.getUser() succeeds)     │
│  ├─ Session token validates against auth.users table     │
│  └─ Unauthorized requests rejected outright              │
│                                                             │
│  Layer 3: Authorization Layer (RLS Policies)             │
│  ├─ dbm_board_members table has RLS enabled              │
│  ├─ Query only succeeds if:                              │
│  │  • User is authenticated                              │
│  │  • User's UUID is in dbm_board_members table          │
│  ├─ Non-board members get ZERO rows (not error)         │
│  └─ Service role can modify membership (backend only)    │
│                                                             │
│  Trust Model: Layer 3 (RLS) is source of truth            │
│              Layers 1 & 2 enhance UX                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Future Expansion Pattern

```
Each New Board Feature Follows Same Pattern:
│
├─ Create Supabase table (dbm_<feature>)
│  ├─ Enable RLS
│  ├─ Add RLS policy using is_dbm_board_member()
│  └─ Seed with initial data if needed
│
├─ Create Screen Component (<Feature>Screen.tsx)
│  ├─ Wrap with <BoardGuard>
│  ├─ Query Supabase for data
│  ├─ Build UI (list, form, etc.)
│  └─ Add CRUD operations
│
├─ Create Sub-Components as needed
│  ├─ List components
│  ├─ Form components
│  └─ Detail components
│
├─ Add to Navigation (App.tsx)
│  └─ Add Stack.Screen with route
│
├─ Wire up button (BoardBackOfficeScreen.tsx)
│  ├─ Update handleCardPress()
│  └─ Add navigation.navigate()
│
└─ Test & Deploy
   ├─ Test access control
   ├─ Test CRUD operations
   ├─ Test RLS policies
   └─ Monitor performance
```

---

**This architecture ensures**:
✅ Secure board access (RLS at database level)
✅ Clean separation of concerns
✅ Easy feature expansion
✅ Consistent styling & UX
✅ Production-ready code
✅ Audit trail capability
