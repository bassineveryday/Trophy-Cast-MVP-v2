# 🚀 Quick Start: Add Test Data

**File:** `db/INSERT-TEST-DATA.sql`

---

## ✅ Step-by-Step Instructions

### 1. Open Supabase SQL Editor
- Go to https://supabase.com/dashboard
- Select your **Trophy Cast** project
- Click **SQL Editor** in left sidebar
- Click **New Query**

### 2. Copy the SQL Script
- Open `c:\Projects\Trophy-Cast-MVP-v2\db\INSERT-TEST-DATA.sql` in VS Code
- Select all (`Ctrl+A`)
- Copy (`Ctrl+C`)

### 3. Paste & Run
- Paste into Supabase SQL Editor (`Ctrl+V`)
- Click **Run** button (or press `Ctrl+Enter`)
- Wait for "Success" message

### 4. Verify Data
Uncomment and run these queries one at a time:

```sql
-- Check member
SELECT * FROM tournament_members WHERE member_id = 'DBM019';

-- Check events  
SELECT * FROM tournament_events ORDER BY event_date DESC;

-- Check results
SELECT * FROM tournament_results WHERE member_id = 'DBM019';

-- Check AOY
SELECT * FROM aoy_standings WHERE member_id = 'DBM019';

-- Check earnings
SELECT 
  member_id,
  COUNT(*) as tournaments,
  SUM(payout) as total_earnings
FROM tournament_results 
WHERE member_id = 'DBM019' AND event_date >= '2025-01-01'
GROUP BY member_id;
```

---

## 📊 What Gets Added

| Table | Records | Details |
|-------|---------|---------|
| `tournament_members` | 1 | Tai Hunt (DBM019) |
| `tournament_events` | 4 | 2024-2025 tournaments |
| `tournament_results` | 3 | Places 1, 2, 3 for DBM019 |
| `aoy_standings` | 1 | Rank #1, 297 points |

**Total Earnings:** $1,000 ($500 + $350 + $150)

---

## 🎯 After Running SQL

Test your app:
```powershell
npm start
```

Press `w` for web browser.

**Dashboard should show:**
- ✅ AOY Rank: **1st Place** (297 points)
- ✅ Earnings: **$1,000**
- ✅ Last Tournament: Fall Championship (2nd place)
- ✅ Tournaments: **3**

---

## 🐛 If You Get Errors

**Error: "relation does not exist"**
- Table name is wrong or table doesn't exist
- Check exact table names in your Supabase

**Error: "duplicate key value"**
- Data already exists (this is OK!)
- Script uses `ON CONFLICT DO NOTHING`

**Error: "syntax error"**
- Make sure you copied the ENTIRE file
- Check for any missing characters

---

**Ready!** Copy `INSERT-TEST-DATA.sql` to Supabase now! 🚀
