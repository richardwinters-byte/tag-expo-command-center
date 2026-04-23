-- =============================================================
-- TAG Expo Command Center · Attachments
-- Migration 0002 · Adds photo upload capability for leads + meetings
-- Run AFTER 0001_init.sql
-- =============================================================

-- ============================================================
-- ATTACHMENTS TABLE
-- A photo (or other file) attached to a lead or meeting.
-- Exactly one of lead_id / meeting_id is set; the other is null.
-- ============================================================
create table if not exists public.attachments (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.leads(id) on delete cascade,
  meeting_id uuid references public.meetings(id) on delete cascade,
  storage_path text not null unique, -- e.g. attachments/leads/<lead_id>/<uuid>.jpg
  mime_type text not null,
  byte_size integer,
  width integer,
  height integer,
  note text, -- "biz card front", "booth signage", etc.
  uploaded_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  -- Exactly one parent
  constraint attachments_one_parent check (
    (lead_id is not null and meeting_id is null) or
    (lead_id is null and meeting_id is not null)
  )
);

create index if not exists attachments_lead_id_idx on public.attachments(lead_id) where lead_id is not null;
create index if not exists attachments_meeting_id_idx on public.attachments(meeting_id) where meeting_id is not null;
create index if not exists attachments_created_at_idx on public.attachments(created_at desc);

alter table public.attachments enable row level security;

-- All authed team members can read and write attachments
drop policy if exists "attachments_all" on public.attachments;
create policy "attachments_all" on public.attachments for all
  using (auth.uid() is not null) with check (auth.uid() is not null);

-- Realtime
alter publication supabase_realtime add table public.attachments;

-- ============================================================
-- STORAGE BUCKET
-- A dedicated 'attachments' bucket for lead and meeting photos.
-- NOT public — served via signed URLs only.
-- ============================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'attachments',
  'attachments',
  false, -- private; we generate signed URLs server-side
  10485760, -- 10 MB per file (after client-side compression most will be <1 MB)
  array['image/jpeg','image/png','image/webp','image/heic','image/heif']
)
on conflict (id) do update set
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- ============================================================
-- STORAGE POLICIES
-- Only authed team members can upload / read / delete.
-- Same-team access model as the rest of the app (no per-user isolation —
-- Richard and Michael are the only two users; they share everything).
-- ============================================================

-- Authenticated users can upload
drop policy if exists "attachments_upload" on storage.objects;
create policy "attachments_upload" on storage.objects for insert
  with check (
    bucket_id = 'attachments' and auth.uid() is not null
  );

-- Authenticated users can read
drop policy if exists "attachments_read" on storage.objects;
create policy "attachments_read" on storage.objects for select
  using (
    bucket_id = 'attachments' and auth.uid() is not null
  );

-- Authenticated users can delete
drop policy if exists "attachments_delete" on storage.objects;
create policy "attachments_delete" on storage.objects for delete
  using (
    bucket_id = 'attachments' and auth.uid() is not null
  );

-- Admins can update (for future metadata edits)
drop policy if exists "attachments_update" on storage.objects;
create policy "attachments_update" on storage.objects for update
  using (
    bucket_id = 'attachments' and auth.uid() is not null
  );
