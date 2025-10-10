# 🎯 REAL LOGIN SETUP - Tai Hunt (DBM019)

**CORRECTED - Using Real Email: bassin@bassineveryday.com**

---

## ✅ Your Real Information

- **Name:** Tai Hunt
- **Member Code:** DBM019
- **Email:** bassin@bassineveryday.com (REAL)
- **Boater Status:** B (Boater)
- **Tournament:** Cedar Bluff (2-day event)

---

## 🚀 Setup Steps (3 Minutes)

### Step 1: Get Your Auth User ID

Run this in **Supabase SQL Editor**:

```sql
SELECT 
  id as user_id,
  email,
  confirmed_at
FROM auth.users 
WHERE email = 'bassin@bassineveryday.com';
```

**Copy the `user_id`** - it looks like: `8b8e7f4a-1234-5678-90ab-cdef12345678`

---

### Step 2: Link Profile to DBM019

**Replace `YOUR-USER-ID-HERE` with the ID from Step 1**, then run:

```sql
INSERT INTO profiles (
  id,
  member_code,
  name,
  hometown
)
VALUES (
  'YOUR-USER-ID-HERE',  -- ← PASTE YOUR USER ID HERE
  'DBM019',
  'Tai Hunt',
  'Denver, CO'
)
ON CONFLICT (id) 
DO UPDATE SET
  member_code = EXCLUDED.member_code,
  name = EXCLUDED.name;
```

---

### Step 3: Verify It Worked

```sql
SELECT 
  p.id,
  p.member_code,
  p.name,
  u.email
FROM profiles p
JOIN auth.users u ON u.id = p.id
WHERE u.email = 'bassin@bassineveryday.com';
```

**Expected Result:**
| id | member_code | name | email |
|----|-------------|------|-------|
| (your-id) | DBM019 | Tai Hunt | bassin@bassineveryday.com |

---

## 🧪 Test the App

```powershell
npm start
```

Press `w` to open in browser.

**Login:**
- Email: `bassin@bassineveryday.com`
- Your password

---

## 📊 What You'll See

### Dashboard
- ✅ Your real Cedar Bluff tournament data
- ✅ Your actual AOY standing
- ✅ Your real payouts and stats
- ✅ All DBM events

---

## 🐛 Troubleshooting

### If you don't have an auth account yet
1. Go to app login screen
2. Click **Register**
3. Use: `bassin@bassineveryday.com`
4. Create a password
5. Confirm email
6. Then run Step 2 to link to DBM019

### If Step 1 returns no rows
- You need to register first (see above)
- Check spelling of email

### If dashboard says "No member code"
- Re-run Step 2 with correct user ID
- Verify with Step 3

---

## 📝 Summary

**Old (FAKE):** tai@denverbass.com  
**New (REAL):** bassin@bassineveryday.com ✅

**Member Code:** DBM019  
**Name:** Tai Hunt  
**Status:** Boater (B)  

---

**Ready!** Follow the 3 steps above, then test your app! 🎣
