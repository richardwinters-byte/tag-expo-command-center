-- =============================================================
-- TAG Expo Command Center · Meeting live-status
-- Migration 0013 · Adds running_late / wrapping_early one-tap status
-- Run AFTER 0012_meeting_notes.sql
-- =============================================================

-- Transient status for "is this meeting running behind?" — shown on the
-- schedule block and in the detail view. Not meaningful after the meeting
-- ends, but safe to leave populated (client filters by end_at + 15min).
alter table public.meetings add column if not exists live_status text
  check (live_status in ('on_time', 'running_late', 'wrapping_early'));

alter table public.meetings add column if not exists live_status_at timestamptz;

comment on column public.meetings.live_status is
  'Broadcast to anchor pair: on_time | running_late | wrapping_early. Set via one-tap status strip.';
