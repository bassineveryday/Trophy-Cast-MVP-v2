# 🧪 Test Access Control - Board Back Office

## ✅ Supabase Setup Complete!

Tai Hunt (DBM019) is now in the database with board access.

---

## 🚀 Testing Steps

### Test 1: Log in as Tai Hunt (Board Member)

1. **Open Trophy Cast app** (running on http://localhost:8081 or in Expo)
2. **Sign in** with:
   - Email: `bassin@bassineveryday.com`
   - Password: [your password]
3. **Navigate to**: DBM tab
4. **Expected Result**: 
   - ✅ See gold "Board Tools" button
   - ✅ Button is clickable

### Test 2: Click Board Tools

1. **Click** the gold "Board Tools" button
2. **Expected Result**:
   - ✅ Navigate to Board Back Office
   - ✅ See 8 menu items:
     - Board Notes
     - Member Management
     - Tournament Admin
     - Finance
     - Conservation
     - Juniors Program
     - High School Program
     - Settings

### Test 3: Verify Layout

1. **Check responsive design**:
   - ✅ Grid layout (2 columns on desktop, 1 on mobile)
   - ✅ Navy background (#0B1A2F)
   - ✅ Gold accent buttons (#C9A646)
   - ✅ Each card has icon and title

### Test 4: Log in as Non-Board Member

1. **Create test user** (or use existing non-board member)
2. **Sign in**
3. **Navigate to**: DBM tab
4. **Expected Result**:
   - ❌ NO "Board Tools" button visible
   - ✅ Button is completely hidden (not greyed out)

---

## 📊 Access Control Flow

```
User Logs In
    ↓
useBoardAccess Hook
    ↓
Query: is_dbm_board_member()
    ↓
Yes? → Show "Board Tools" button
No?  → Hide "Board Tools" button
    ↓
Click → Navigate to BoardBackOfficeScreen
    ↓
BoardGuard Component
    ↓
Wrapped in RLS Policy
    ↓
Only board members can see data
```

---

## 🔍 Debug Commands

### In Supabase SQL Editor:

**Check if Tai Hunt is still in the database:**
```sql
select * from public.dbm_board_members 
where member_id = 'DBM019';
```

**Check RLS is working:**
```sql
-- As service role (will show data)
select * from public.dbm_board_members;

-- As authenticated user (will respect RLS)
select * from public.dbm_board_members;
```

**Check function:**
```sql
select public.is_dbm_board_member();
```

---

## ✅ Checklist

### Board Member (Tai Hunt) Should See:
- [ ] Logged in successfully
- [ ] DBM tab visible
- [ ] Gold "Board Tools" button visible
- [ ] Button is clickable
- [ ] Navigates to Board Back Office
- [ ] 8 menu items displayed
- [ ] Responsive layout works
- [ ] Navy/Gold theme applied

### Non-Board Member Should See:
- [ ] Logged in successfully
- [ ] DBM tab visible
- [ ] NO "Board Tools" button
- [ ] Rest of interface works normally

---

## 🎯 Expected Results

### Success:
```
✅ Tai Hunt sees Board Tools button
✅ Can click and see 8 menu items
✅ Non-board member doesn't see button
✅ RLS policies enforced
✅ UI is responsive
✅ Navy/Gold theme matches
```

### If Button Doesn't Show:

**Troubleshoot**:
1. ✅ Tai Hunt is logged in? (Check auth)
2. ✅ Tai Hunt is in `dbm_board_members` table? (Check Supabase)
3. ✅ `useBoardAccess` hook is imported? (Check DBMMembersScreen.tsx)
4. ✅ `isBoard` state is true? (Add console.log)
5. ✅ App reloaded after code changes? (Reload Metro)

---

## 🐛 Troubleshooting

### "Board Tools button doesn't appear"

**Step 1**: Check RLS query worked
```sql
select * from public.dbm_board_members;
-- Should show: DBM019 | Tai Hunt | DBM Secretary | bassin@bassineveryday.com
```

**Step 2**: Check hook is reading data
- Open DevTools
- Look for console logs from `useBoardAccess`
- Should show `isBoard: true`

**Step 3**: Check component renders
- Open `screens/DBMMembersScreen.tsx`
- Verify `const { isBoard } = useBoardAccess();` exists
- Verify button is wrapped in `{isBoard && (...)}`

**Step 4**: Reload app
- Press `r` in Metro Bundler
- Try again

---

## 📝 What's Being Tested

| Layer | Component | Status |
|-------|-----------|--------|
| Database | RLS Policy | Should enforce access |
| Function | is_dbm_board_member() | Should return true for Tai Hunt |
| Hook | useBoardAccess | Should query function |
| Component | BoardGuard | Should show/hide based on access |
| Navigation | BoardBackOfficeScreen | Should render 8 items |
| UI | Board Menu | Should be responsive |
| Security | Unauthenticated | Should see nothing |

---

## 🚀 Next After Testing

Once access control is verified ✅:

1. **Pick first feature** to build:
   - Recommendation: **Board Notes** (simplest CRUD)
   - Or pick your priority feature

2. **Build the feature** (1-2 hours):
   - Create Supabase table
   - Add CRUD operations
   - Build React screens
   - Connect navigation

3. **Test feature**:
   - Create/Read/Update/Delete notes
   - Verify only board members can access
   - Test on multiple devices

4. **Deploy**:
   - Commit to git
   - Push to main branch
   - Deploy to Expo

---

**Status**: ✅ Ready to test!

**Next**: Log in as Tai Hunt and verify Board Tools button appears! 🎣
