-- =============================================================
-- TAG Expo Command Center · Initial Schema
-- Run this in the Supabase SQL Editor (paste and click Run)
-- =============================================================

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- ============================================================
-- USERS (mirrors auth.users; created via trigger on signup)
-- ============================================================
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  name text not null,
  role text not null default 'member' check (role in ('admin','member')),
  initials text,
  color text default '#14595B',
  phone text,
  signature text,
  created_at timestamptz not null default now()
);

-- ============================================================
-- ALLOWLIST (emails permitted to sign in)
-- ============================================================
create table if not exists public.allowlist (
  email text primary key,
  name text not null,
  role text not null default 'member' check (role in ('admin','member')),
  color text default '#14595B',
  created_at timestamptz not null default now()
);

-- ============================================================
-- TARGETS (the strategic target list)
-- ============================================================
create table if not exists public.targets (
  id uuid primary key default gen_random_uuid(),
  company_name text not null unique,
  tier text not null check (tier in ('tier_1','tier_2','tier_3','nice_to_meet','opportunistic','retailer')),
  track text not null check (track in ('entertainment_ip','sports','cpg_backflip','japanese_ip','retail','agent','competitor','new_surfaced')),
  coverage_unit text not null check (coverage_unit in ('anchor_pair','anchor_pair_plus_jiro','anchor_pair_plus_dan','jiro_independent','dan_independent','griffin_tbd')),
  priority text not null check (priority in ('highest','high','moderate','low','opportunistic')),
  booth_number text,
  key_contacts jsonb default '[]'::jsonb,
  proof_point text,
  pitch_angle text,
  opener text,
  status text not null default 'not_contacted' check (status in ('not_contacted','outreach_sent','meeting_booked','met','follow_up','closed_won','closed_lost','dead')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_targets_tier on public.targets(tier);
create index if not exists idx_targets_track on public.targets(track);
create index if not exists idx_targets_status on public.targets(status);

-- ============================================================
-- MEETINGS
-- ============================================================
create table if not exists public.meetings (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  target_id uuid references public.targets(id) on delete set null,
  start_at timestamptz not null,
  end_at timestamptz not null,
  location text,
  type text not null default 'pre_booked' check (type in ('pre_booked','walk_up','keynote','party','internal_huddle','travel','dinner')),
  status text not null default 'scheduled' check (status in ('scheduled','confirmed','completed','no_show','cancelled')),
  owner_id uuid references public.users(id) on delete set null,
  attendee_ids uuid[] default '{}',
  agenda text,
  outcome text,
  next_action text,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_meetings_start on public.meetings(start_at);
create index if not exists idx_meetings_owner on public.meetings(owner_id);
create index if not exists idx_meetings_target on public.meetings(target_id);

-- ============================================================
-- LEADS
-- ============================================================
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  company text not null,
  title text,
  email text,
  phone text,
  linkedin_url text,
  target_id uuid references public.targets(id) on delete set null,
  met_by_id uuid references public.users(id) on delete set null,
  meeting_id uuid references public.meetings(id) on delete set null,
  temperature text not null default 'cold' check (temperature in ('cold','warm','hot')),
  owner_id uuid references public.users(id) on delete set null,
  next_action text,
  deadline date,
  preferred_followup_channel text check (preferred_followup_channel in ('email','phone','linkedin','in_person')),
  follow_up_stage text not null default 'not_started' check (follow_up_stage in ('not_started','t1_immediate_thanks','t2_value_add','t3_proposal')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_leads_owner on public.leads(owner_id);
create index if not exists idx_leads_temperature on public.leads(temperature);
create index if not exists idx_leads_deadline on public.leads(deadline);
create index if not exists idx_leads_met_by on public.leads(met_by_id);

-- ============================================================
-- FOLLOW-UPS (3-touch cadence)
-- ============================================================
create table if not exists public.follow_ups (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  touch text not null check (touch in ('t1','t2','t3')),
  channel text not null check (channel in ('email','phone','linkedin','in_person')),
  draft text,
  sent_at timestamptz,
  sent_by_id uuid references public.users(id) on delete set null,
  response_received boolean default false,
  response_notes text,
  created_at timestamptz not null default now(),
  unique(lead_id, touch)
);

create index if not exists idx_followups_lead on public.follow_ups(lead_id);

-- ============================================================
-- INTEL (competitive intelligence log)
-- ============================================================
create table if not exists public.intel (
  id uuid primary key default gen_random_uuid(),
  subject text not null check (subject in ('psa','cgc','beckett','sgc','panini','collectors_holdings','fanatics','other')),
  type text not null check (type in ('booth_observation','overheard','announced_deal','pricing','tech_demo','rumor','personnel')),
  date_observed date not null default current_date,
  captured_by_id uuid references public.users(id) on delete set null,
  significance text not null default 'medium' check (significance in ('low','medium','high')),
  headline text not null,
  details text,
  source text,
  follow_up_needed boolean default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_intel_subject on public.intel(subject);
create index if not exists idx_intel_date on public.intel(date_observed);
create index if not exists idx_intel_significance on public.intel(significance);

-- ============================================================
-- DEBRIEFS (per-person daily submissions)
-- ============================================================
create table if not exists public.debriefs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  debrief_date date not null,
  meetings_taken text,
  booths_visited text,
  contacts_captured text,
  competitive_intel text,
  surprises text,
  open_follow_ups text,
  one_thing_different text,
  submitted_at timestamptz not null default now(),
  unique(user_id, debrief_date)
);

create index if not exists idx_debriefs_date on public.debriefs(debrief_date);
create index if not exists idx_debriefs_user on public.debriefs(user_id);

-- ============================================================
-- MORNING BRIEFS (auto-compiled daily summaries)
-- ============================================================
create table if not exists public.morning_briefs (
  id uuid primary key default gen_random_uuid(),
  brief_date date not null unique,
  compiled_at timestamptz not null default now(),
  content_markdown text not null,
  published boolean default true
);

create index if not exists idx_briefs_date on public.morning_briefs(brief_date);

-- ============================================================
-- ACTIVITY LOG (change history on leads for audit)
-- ============================================================
create table if not exists public.activity_log (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null,
  entity_id uuid not null,
  user_id uuid references public.users(id) on delete set null,
  action text not null,
  changes jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_activity_entity on public.activity_log(entity_type, entity_id);

-- ============================================================
-- updated_at trigger
-- ============================================================
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_targets_updated on public.targets;
create trigger trg_targets_updated before update on public.targets
  for each row execute function public.set_updated_at();

drop trigger if exists trg_meetings_updated on public.meetings;
create trigger trg_meetings_updated before update on public.meetings
  for each row execute function public.set_updated_at();

drop trigger if exists trg_leads_updated on public.leads;
create trigger trg_leads_updated before update on public.leads
  for each row execute function public.set_updated_at();

drop trigger if exists trg_intel_updated on public.intel;
create trigger trg_intel_updated before update on public.intel
  for each row execute function public.set_updated_at();

-- ============================================================
-- Trigger: when a user signs in via magic link, create public.users row
-- only if they are in the allowlist. Otherwise block.
-- ============================================================
create or replace function public.handle_new_user()
returns trigger as $$
declare
  _email text;
  _allowed public.allowlist%rowtype;
begin
  _email := lower(new.email);

  select * into _allowed from public.allowlist where lower(email) = _email;

  if not found then
    raise exception 'Email % is not on the TAG allowlist', new.email;
  end if;

  insert into public.users (id, email, name, role, color, initials)
  values (
    new.id,
    _email,
    _allowed.name,
    _allowed.role,
    _allowed.color,
    upper(substr(_allowed.name, 1, 1) || coalesce(substr(split_part(_allowed.name, ' ', 2), 1, 1), ''))
  )
  on conflict (id) do nothing;

  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- Row Level Security
-- ============================================================
alter table public.users enable row level security;
alter table public.allowlist enable row level security;
alter table public.targets enable row level security;
alter table public.meetings enable row level security;
alter table public.leads enable row level security;
alter table public.follow_ups enable row level security;
alter table public.intel enable row level security;
alter table public.debriefs enable row level security;
alter table public.morning_briefs enable row level security;
alter table public.activity_log enable row level security;

-- Helper: check if current user is admin
create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.users where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer stable;

-- USERS
drop policy if exists "users_select" on public.users;
create policy "users_select" on public.users for select
  using (auth.uid() is not null);

drop policy if exists "users_update_self_or_admin" on public.users;
create policy "users_update_self_or_admin" on public.users for update
  using (id = auth.uid() or public.is_admin());

-- ALLOWLIST - admin only
drop policy if exists "allowlist_admin_all" on public.allowlist;
create policy "allowlist_admin_all" on public.allowlist for all
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "allowlist_read_self" on public.allowlist;
create policy "allowlist_read_self" on public.allowlist for select
  using (auth.uid() is not null);

-- TARGETS - any authenticated can read; admin can write; members can update status/booth/notes
drop policy if exists "targets_select" on public.targets;
create policy "targets_select" on public.targets for select
  using (auth.uid() is not null);

drop policy if exists "targets_insert_admin" on public.targets;
create policy "targets_insert_admin" on public.targets for insert
  with check (public.is_admin());

drop policy if exists "targets_update_any_authed" on public.targets;
create policy "targets_update_any_authed" on public.targets for update
  using (auth.uid() is not null);

drop policy if exists "targets_delete_admin" on public.targets;
create policy "targets_delete_admin" on public.targets for delete
  using (public.is_admin());

-- MEETINGS - owner, attendee, or admin can edit; all authed can read
drop policy if exists "meetings_select" on public.meetings;
create policy "meetings_select" on public.meetings for select
  using (auth.uid() is not null);

drop policy if exists "meetings_insert" on public.meetings;
create policy "meetings_insert" on public.meetings for insert
  with check (auth.uid() is not null);

drop policy if exists "meetings_update" on public.meetings;
create policy "meetings_update" on public.meetings for update
  using (
    public.is_admin()
    or owner_id = auth.uid()
    or auth.uid() = any(attendee_ids)
  );

drop policy if exists "meetings_delete" on public.meetings;
create policy "meetings_delete" on public.meetings for delete
  using (public.is_admin() or owner_id = auth.uid());

-- LEADS - shared intel; any authed can read/write
drop policy if exists "leads_select" on public.leads;
create policy "leads_select" on public.leads for select
  using (auth.uid() is not null);

drop policy if exists "leads_all" on public.leads;
create policy "leads_all" on public.leads for all
  using (auth.uid() is not null) with check (auth.uid() is not null);

-- FOLLOW-UPS - same as leads
drop policy if exists "followups_all" on public.follow_ups;
create policy "followups_all" on public.follow_ups for all
  using (auth.uid() is not null) with check (auth.uid() is not null);

-- INTEL - shared; any authed can read/write
drop policy if exists "intel_all" on public.intel;
create policy "intel_all" on public.intel for all
  using (auth.uid() is not null) with check (auth.uid() is not null);

-- DEBRIEFS - any authed can read; only self can write own
drop policy if exists "debriefs_select" on public.debriefs;
create policy "debriefs_select" on public.debriefs for select
  using (auth.uid() is not null);

drop policy if exists "debriefs_own_write" on public.debriefs;
create policy "debriefs_own_write" on public.debriefs for all
  using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());

-- MORNING BRIEFS - all read, admin write
drop policy if exists "briefs_select" on public.morning_briefs;
create policy "briefs_select" on public.morning_briefs for select
  using (auth.uid() is not null);

drop policy if exists "briefs_admin_write" on public.morning_briefs;
create policy "briefs_admin_write" on public.morning_briefs for all
  using (public.is_admin()) with check (public.is_admin());

-- ACTIVITY LOG - read any authed, insert any authed, no updates
drop policy if exists "activity_select" on public.activity_log;
create policy "activity_select" on public.activity_log for select
  using (auth.uid() is not null);

drop policy if exists "activity_insert" on public.activity_log;
create policy "activity_insert" on public.activity_log for insert
  with check (auth.uid() is not null);

-- ============================================================
-- Enable realtime on key tables
-- (also do this in Supabase Dashboard → Database → Replication)
-- ============================================================
alter publication supabase_realtime add table public.meetings;
alter publication supabase_realtime add table public.leads;
alter publication supabase_realtime add table public.intel;
alter publication supabase_realtime add table public.debriefs;
alter publication supabase_realtime add table public.targets;
alter publication supabase_realtime add table public.morning_briefs;
alter publication supabase_realtime add table public.follow_ups;
