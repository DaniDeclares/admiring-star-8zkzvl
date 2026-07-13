## WECC Portal Schema Design

> **Read-only planning section**  
> This section is documentation-only for future sprint implementation.
> No migration is executed by this change.

### Table: `dd_portal_profiles`

| Column | Type | Null | Default | Key | Notes |
|---|---|---:|---|---|---|
| id | uuid | NO | gen_random_uuid() | PK | Internal profile row identifier |
| user_id | uuid | NO |  | UNIQUE, FK | Links to authenticated account user id |
| role | text | NO | 'customer' |  | Planned enum-like role (`owner`, `customer`, `vendor`, `contractor`, `gov_partner`, `affiliate`, `training`) |
| full_name | text | YES |  |  | Display name for portal UX |
| phone | text | YES |  |  | Optional contact number |
| company_name | text | YES |  |  | Business/org context when relevant |
| is_active | boolean | NO | true |  | Soft enable/disable account access |
| referral_code | text | YES |  | UNIQUE (optional) | Optional referral identity |
| referred_by_profile_id | uuid | YES |  | FK self | Self-reference to `dd_portal_profiles.id` |
| metadata | jsonb | NO | '{}'::jsonb |  | Flexible extension payload |
| created_at | timestamptz | NO | now() |  | Audit |
| updated_at | timestamptz | NO | now() |  | Audit |

### Relationship Model (Planned)

- `dd_portal_profiles.user_id` -> auth user identifier (one profile per user).
- `dd_portal_profiles.referred_by_profile_id` -> `dd_portal_profiles.id` (optional referral lineage).
- Additional feature tables (future): service requests, estimates, jobs, invoices, deals, events, training progress.

### Index + Constraint Planning (Documentation)

- Primary key on `id`
- Unique index on `user_id`
- Optional unique index on `referral_code` where not null
- B-tree index on `role`
- B-tree index on `is_active`
- Composite index on `(role, is_active)`
- Check constraint: `char_length(trim(role)) > 0`

### RLS Planning Notes (Documentation)

- Enable RLS on `dd_portal_profiles`.
- User policy: account holders can read/update only their own profile by `user_id`.
- Elevated policy: owner/administrative roles may read broader profile sets as needed.
- Service role policy: internal backend service operations bypass user-facing restrictions.

### Example DDL Draft (Reference Only - Not Executed)

```sql
create table if not exists dd_portal_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique,
  role text not null default 'customer',
  full_name text,
  phone text,
  company_name text,
  is_active boolean not null default true,
  referral_code text unique,
  referred_by_profile_id uuid references dd_portal_profiles(id),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint dd_portal_profiles_role_not_blank check (char_length(trim(role)) > 0)
);
```
