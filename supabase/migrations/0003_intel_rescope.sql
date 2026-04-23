-- =============================================================
-- TAG Expo Command Center · Intel re-scope
-- Migration 0003 · Intel becomes a general observations stream.
-- Intel can now link to a target (target_id) or carry a free-text tag.
-- The old `subject` enum is retained nullable for backward-compat
-- with existing competitor-watch entries.
-- Run AFTER 0001_init.sql and 0002_attachments.sql.
-- =============================================================

-- Add the two new columns
alter table public.intel
  add column if not exists target_id uuid references public.targets(id) on delete set null;

alter table public.intel
  add column if not exists tag text;

-- Make subject nullable (was not null with a check constraint)
-- Drop the check constraint first, then drop NOT NULL
do $$
begin
  if exists (
    select 1 from information_schema.table_constraints
    where table_schema = 'public' and table_name = 'intel' and constraint_name = 'intel_subject_check'
  ) then
    alter table public.intel drop constraint intel_subject_check;
  end if;
end $$;

alter table public.intel alter column subject drop not null;

-- Re-add a looser check: subject can be null OR one of the known enum values
-- (entries that don't fit a competitor bucket should use target_id or tag instead)
alter table public.intel add constraint intel_subject_check
  check (subject is null or subject in ('psa','cgc','beckett','sgc','panini','collectors_holdings','fanatics','other'));

-- At least one of (target_id, tag, subject) should be set for any intel entry.
-- If someone logs a pure "industry observation" with none set, that's still allowed —
-- we don't enforce this at the DB level since some general observations are legit.

-- Index for the new filter surface
create index if not exists intel_target_id_idx on public.intel(target_id) where target_id is not null;
create index if not exists intel_tag_idx on public.intel(tag) where tag is not null;
