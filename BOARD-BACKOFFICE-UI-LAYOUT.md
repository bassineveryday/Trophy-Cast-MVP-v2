# DBM Board Back Office UI Layout

## Screen Flow

```
Trophy Cast App
    ↓
DBM Tab (Club Info)
    ↓
Board Tools Button (⭐ Gold button, only visible for board members)
    ↓
[Board Back Office Screen]
    ├─ Header: "DBM Board Back Office" + Shield Icon
    └─ 8 Menu Cards (2 columns, responsive):
        
        ┌─────────────────────────────────────────┐
        │  🔐 DBM Board                          │
        │     Back Office                         │
        ├─────────────────────────────────────────┤
        │                                         │
        │  ┌──────────────┐  ┌──────────────┐   │
        │  │ 📄 Board     │  │ 👥 Member   │   │
        │  │   Notes      │  │    Mgmt     │   │
        │  │              │  │             │   │
        │  │ Agendas,    │  │ Manage      │   │
        │  │ minutes...  │  │ roster...   │   │
        │  └──────────────┘  └──────────────┘   │
        │                                         │
        │  ┌──────────────┐  ┌──────────────┐   │
        │  │ 🏆 Tourna-  │  │ 💰 Finance  │   │
        │  │    ments    │  │             │   │
        │  │              │  │ Budget &    │   │
        │  │ Schedule     │  │ reports     │   │
        │  │ events       │  │             │   │
        │  └──────────────┘  └──────────────┘   │
        │                                         │
        │  ┌──────────────┐  ┌──────────────┐   │
        │  │ 🌿 Conserv- │  │ 🎓 Juniors  │   │
        │  │    ation    │  │    Program  │   │
        │  │              │  │             │   │
        │  │ Projects     │  │ Youth       │   │
        │  │ & init...    │  │ outreach    │   │
        │  └──────────────┘  └──────────────┘   │
        │                                         │
        │  ┌──────────────┐  ┌──────────────┐   │
        │  │ 🎓 High     │  │ ⚙️  Settings │   │
        │  │    School   │  │             │   │
        │  │             │  │ Board       │   │
        │  │ HS program  │  │ preferences │   │
        │  │ mgmt        │  │             │   │
        │  └──────────────┘  └──────────────┘   │
        │                                         │
        │  🔐 Board-Only Area • All actions     │
        │     are logged                         │
        │                                         │
        └─────────────────────────────────────────┘
```

## Color Scheme

- **Background**: Navy (`#0B1A2F`)
- **Cards**: Dark Navy (`#0F2238`)
- **Accent Lines**: Gold (`#C9A646`)
- **Text**: Light Gray (`#E7ECF2`)
- **Card Colors** (top accent bar):
  - Board Notes: Orange (`#E8944A`)
  - Members: Green (`#4CAF50`)
  - Tournaments: Orange (`#FF9100`)
  - Finance: Blue (`#2196F3`)
  - Conservation: Light Green (`#66BB6A`)
  - Juniors: Purple (`#AB47BC`)
  - High School: Deep Purple (`#7E57C2`)
  - Settings: Gray (`#78909C`)

## Access Control

```
User Login
    ↓
Auth Check via Supabase
    ↓
Query: Is user in dbm_board_members?
    ├─ YES → Show Board Tools Button
    │         → Can access BoardBackOfficeScreen
    └─ NO  → Hide Board Tools Button
            → Show "Not Authorized" if accessed
```

## Files Modified/Created

```
✅ hooks/useBoardAccess.ts          [NEW]
✅ components/BoardGuard.tsx        [NEW]
✅ screens/BoardBackOfficeScreen.tsx [NEW]
✅ App.tsx                          [MODIFIED - added import & route]
✅ screens/DBMMembersScreen.tsx     [MODIFIED - added Board Tools button]
```

## What's Next?

All 8 buttons are ready for implementation. Each one will have its own:
- Supabase table(s) for data storage
- CRUD operations (Create, Read, Update, Delete)
- Form/list components
- RLS policies to protect data

**Currently**: Buttons are styled and visible but non-functional.

**Ready to build**: Pick the first feature! 🎯
