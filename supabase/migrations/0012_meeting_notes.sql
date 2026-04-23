-- =============================================================
-- TAG Expo Command Center · Meeting notes field
-- Migration 0012 · Adds a free-form notes column to meetings
-- Run AFTER 0011_remove_consultants.sql
-- =============================================================

-- Distinct from agenda (pre-meeting plan) and outcome (what happened):
-- notes is a free-form scratchpad for anything else worth remembering —
-- booth context, overheard intel, things to follow up on separately.
alter table public.meetings add column if not exists notes text;

comment on column public.meetings.notes is
  'Free-form scratch notes for the meeting. Distinct from agenda (pre) and outcome (post).';
