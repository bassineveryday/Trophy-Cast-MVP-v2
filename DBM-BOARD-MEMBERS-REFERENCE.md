# 👥 DBM Board Members - Complete Reference

## 8 Denver Bassmasters Board of Directors

| # | Name | Member ID | Role | Email | UUID | Status |
|---|------|-----------|------|-------|------|--------|
| 1 | Jeremiah Hofstetter | DBM001 | DBM President | ❓ | TBD | Pending |
| 2 | Bobby Martin | DBM002 | DBM Vice President | ❓ | TBD | Pending |
| 3 | **Tai Hunt** | **DBM019** | **DBM Secretary** | bassin@bassineveryday.com | 8338ec05-7839-45b5-9b3a-115d6d485603 | ✅ **ACTIVE** |
| 4 | Gordon Phair | DBM004 | DBM Treasurer | ❓ | TBD | Pending |
| 5 | Howard Binkley | DBM005 | DBM Tournament Director | ❓ | TBD | Pending |
| 6 | Justin Apfel | DBM006 | DBM Conservation Director | ❓ | TBD | Pending |
| 7 | Cliff Purslow | DBM007 | DBM Juniors Director | ❓ | TBD | Pending |
| 8 | Bill Cancellieri | DBM008 | DBM High School Director | ❓ | TBD | Pending |

---

## ✅ Confirmed Board Member

### Tai Hunt
- **Member ID**: DBM019
- **Role**: DBM Secretary
- **Email**: bassin@bassineveryday.com
- **UUID**: `8338ec05-7839-45b5-9b3a-115d6d485603`
- **Status**: ✅ Active (Already in system)

**SQL to add**:
```sql
insert into public.dbm_board_members (profile_id, member_id, role)
values ('8338ec05-7839-45b5-9b3a-115d6d485603', 'DBM019', 'DBM Secretary');
```

---

## 🔍 How to Get UUIDs for Other Board Members

### Step 1: In Supabase, run this query:
```sql
select id, email from auth.users 
where email in (
  'jeremiah@email.com',
  'bobby@email.com',
  'gordon@email.com',
  'howard@email.com',
  'justin@email.com',
  'cliff@email.com',
  'bill@email.com'
);
```

**Replace emails with actual emails** for each board member.

### Step 2: Copy the UUIDs

You'll get results like:
```
id                                   | email
8338ec05-7839-45b5-9b3a-115d6d485603 | bassin@bassineveryday.com
```

### Step 3: Update the table below

---

## 📝 Fill In Board Member UUIDs

Copy/paste UUID here when you have it:

### 1. Jeremiah Hofstetter (DBM001 - President)
```
Email: [NEED EMAIL]
UUID: [NEED UUID]
```

### 2. Bobby Martin (DBM002 - Vice President)
```
Email: [NEED EMAIL]
UUID: [NEED UUID]
```

### 3. Gordon Phair (DBM004 - Treasurer)
```
Email: [NEED EMAIL]
UUID: [NEED UUID]
```

### 4. Howard Binkley (DBM005 - Tournament Director)
```
Email: [NEED EMAIL]
UUID: [NEED UUID]
```

### 5. Justin Apfel (DBM006 - Conservation Director)
```
Email: [NEED EMAIL]
UUID: [NEED UUID]
```

### 6. Cliff Purslow (DBM007 - Juniors Director)
```
Email: [NEED EMAIL]
UUID: [NEED UUID]
```

### 7. Bill Cancellieri (DBM008 - High School Director)
```
Email: [NEED EMAIL]
UUID: [NEED UUID]
```

---

## 🔧 SQL Templates

### Add Single Board Member
```sql
insert into public.dbm_board_members (profile_id, member_id, role)
values ('<UUID>', 'DBMXXX', 'Role Name');
```

### Add Multiple Board Members
```sql
insert into public.dbm_board_members (profile_id, member_id, role)
values
  ('<UUID1>', 'DBM001', 'DBM President'),
  ('<UUID2>', 'DBM002', 'DBM Vice President'),
  ('<UUID3>', 'DBM004', 'DBM Treasurer'),
  ('<UUID4>', 'DBM005', 'DBM Tournament Director'),
  ('<UUID5>', 'DBM006', 'DBM Conservation Director'),
  ('<UUID6>', 'DBM007', 'DBM Juniors Director'),
  ('<UUID7>', 'DBM008', 'DBM High School Director');
```

### Verify All Board Members
```sql
select 
  m.profile_id,
  m.member_id,
  m.role,
  u.email,
  m.created_at
from public.dbm_board_members m
left join auth.users u on m.profile_id = u.id
order by m.member_id;
```

---

## 📋 Checklist

- [ ] Find Jeremiah Hofstetter's UUID
- [ ] Find Bobby Martin's UUID
- [ ] Find Gordon Phair's UUID
- [ ] Find Howard Binkley's UUID
- [ ] Find Justin Apfel's UUID
- [ ] Find Cliff Purslow's UUID
- [ ] Find Bill Cancellieri's UUID
- [ ] Add all to `dbm_board_members` table
- [ ] Verify with SELECT query
- [ ] Test access control in app

---

## 🚀 Current Setup Status

✅ **Complete**:
- Table: `dbm_board_members` created
- Function: `is_dbm_board_member()` created
- RLS Policies: All 4 configured
- Tai Hunt: Added to board

⏳ **Pending**:
- Get UUIDs for other 7 board members
- Add them to the table
- Test access control

---

## 📞 Next Steps

1. **Find emails**: Get the actual emails for each board member
2. **Query Supabase**: Run the SELECT query to get their UUIDs
3. **Fill in table**: Update this document with UUIDs
4. **Run SQL**: Insert all board members into Supabase
5. **Verify**: Run verification query
6. **Test**: Log in as each board member and verify access

---

## 🎯 Board Roles Summary

| Member ID | Role | Description |
|-----------|------|-------------|
| DBM001 | President | Overall board leadership |
| DBM002 | Vice President | Support president, handle meetings |
| DBM019 | Secretary | Minutes, records, correspondence |
| DBM004 | Treasurer | Financial management |
| DBM005 | Tournament Director | Run tournaments, manage scheduling |
| DBM006 | Conservation Director | Environmental protection programs |
| DBM007 | Juniors Director | Youth programs, mentoring |
| DBM008 | High School Director | High school partnerships |

---

**Status**: ⏳ Waiting for other board member UUIDs

**Current**: Tai Hunt (DBM019) ready to test!
