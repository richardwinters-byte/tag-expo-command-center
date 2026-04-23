-- =============================================================
-- TAG Expo Command Center · Consultant Removal
-- Migration 0011 · Simplify coverage_unit + scrub consultant text
--
-- Richard decision Apr 19, 2026: the app is for the anchor pair
-- (Richard + Michael) only. Consultant assignments (Jiro / Dan /
-- Griffin) are not modeled as structured data. If consultant
-- context is needed for a specific target, Richard or Michael
-- can add it in the notes field manually.
--
-- PART 1 — Normalize coverage_unit
--   Collapse every row to 'anchor_pair'. Then drop and recreate
--   the check constraint to accept only that value going forward.
--
-- PART 2 — Scrub consultant names from text fields
--   Remove "Jiro", "Dan", "Griffin", "consultant" from notes,
--   proof_point, pitch_angle, opener, and from meetings.title
--   and meetings.agenda. Use targeted replacements — don't
--   nuke legitimate uses of those words where they appear as
--   part of another noun (e.g., "Kodansha" ≠ "Dan").
--
-- PART 3 — Remove the Jiro solo meeting
--   The scaffolding meeting "Jiro — ZenWorks Japan Pavilion tour"
--   is removed since Jiro is no longer a first-class app user.
-- =============================================================

-- =============================================================
-- PART 1 — NORMALIZE coverage_unit
-- =============================================================
update public.targets set coverage_unit = 'anchor_pair' where coverage_unit <> 'anchor_pair';

alter table public.targets drop constraint if exists targets_coverage_unit_check;
alter table public.targets add constraint targets_coverage_unit_check
  check (coverage_unit in ('anchor_pair'));

-- =============================================================
-- PART 2 — SCRUB CONSULTANT NAMES FROM TEXT
-- =============================================================
-- Targeted replacements. Word-boundary regex on each name to
-- avoid touching unrelated words.

-- "Jiro-san handles the Tokyo side" → "the team handles the Tokyo side"
-- Also catches "Jiro-san" (dash-suffixed)
update public.targets
set
  proof_point = regexp_replace(proof_point, '\mJiro[-]?san\M', 'the team', 'g'),
  pitch_angle = regexp_replace(pitch_angle, '\mJiro[-]?san\M', 'the team', 'g'),
  opener      = regexp_replace(opener,      '\mJiro[-]?san\M', 'the team', 'g'),
  notes       = regexp_replace(coalesce(notes, ''), '\mJiro[-]?san\M', 'the team', 'g')
where proof_point ~ '\mJiro' or pitch_angle ~ '\mJiro' or opener ~ '\mJiro' or coalesce(notes, '') ~ '\mJiro';

-- Strip "Jiro LEAD", "JIRO LEAD", "Jiro lead", "Jiro priority", "Jiro leads"
-- and similar action-assignment phrases — these belong in manual notes now.
update public.targets
set notes = regexp_replace(notes, '\s*\|?\s*JIRO LEAD[^.|]*\.?', '', 'gi')
where notes ~* 'JIRO LEAD';

update public.targets
set notes = regexp_replace(notes, '\s*\|?\s*JIRO/ASIA LEAD[^.|]*\.?', '', 'gi')
where notes ~* 'JIRO/ASIA LEAD';

-- Generic "Jiro leads", "Jiro priority", "Jiro should" etc.
update public.targets
set
  proof_point = regexp_replace(proof_point, '\mJiro\s+(leads|priority|should|runs|handles|heads)[^.]*\.?\s*', '', 'gi'),
  pitch_angle = regexp_replace(pitch_angle, '\mJiro\s+(leads|priority|should|runs|handles|heads)[^.]*\.?\s*', '', 'gi'),
  opener      = regexp_replace(opener,      '\mJiro\s+(leads|priority|should|runs|handles|heads)[^.]*\.?\s*', '', 'gi'),
  notes       = regexp_replace(coalesce(notes, ''), '\mJiro\s+(leads|priority|should|runs|handles|heads)[^.]*\.?\s*', '', 'gi');

-- Catch remaining Jiro patterns: "— anchor pair + Jiro", "Jiro can advise",
-- "Jiro relevant", "Jiro-adjacent", "anchor pair + Jiro mandatory", etc.
update public.targets
set notes = regexp_replace(notes, '\s*\+\s*Jiro\s+(mandatory|required)\M', '', 'g')
where notes ~ '\+\s*Jiro';

update public.targets
set notes = regexp_replace(notes, '\s*—?\s*anchor pair \+ Jiro\.?', '', 'gi')
where notes ~* 'anchor pair \+ Jiro';

update public.targets
set notes = regexp_replace(notes, '\s*\|?\s*\mJiro[^.|]*\.?', '', 'gi')
where notes ~ '\mJiro';

update public.targets
set proof_point = regexp_replace(proof_point, '\s*\mJiro[^.]*\.?', '', 'gi')
where proof_point ~ '\mJiro';

update public.targets
set pitch_angle = regexp_replace(pitch_angle, '\s*\mJiro[^.]*\.?', '', 'gi')
where pitch_angle ~ '\mJiro';

update public.targets
set opener = regexp_replace(opener, '\s*\mJiro[^.]*\.?', '', 'gi')
where opener ~ '\mJiro';

-- Clean up residual "Jiro", "Dan", "Griffin", "consultant" in notes
-- only. Don't touch proof_point/pitch_angle/opener at this point —
-- whatever survives the targeted scrubs above is strategic context
-- worth preserving.
update public.targets
set notes = regexp_replace(notes, '\mconsultant[s]?\M', 'team', 'gi')
where notes ~* '\mconsultant';

update public.targets
set notes = regexp_replace(notes, '\s*\|?\s*Dan\s+(leads|runs|covers)[^.|]*\.?', '', 'g')
where notes ~ '\mDan\s+(leads|runs|covers)';

-- Scrub meetings table — titles and agendas
update public.meetings
set
  title  = regexp_replace(title, '\m(Jiro|Dan|Griffin)\M[^.|,]*[,\s]*', '', 'g'),
  agenda = regexp_replace(coalesce(agenda, ''), '\m(Jiro|Dan|Griffin|consultant[s]?)\M[^.|]*\.?\s*', '', 'gi')
where title ~ '\m(Jiro|Dan|Griffin)' or coalesce(agenda, '') ~* '\m(Jiro|Dan|Griffin|consultant)';

-- Collapse doubled spaces and stray pipes left behind by the scrubs
update public.targets set notes = regexp_replace(regexp_replace(notes, '\s{2,}', ' ', 'g'), '^\s*\|\s*|\s*\|\s*$', '', 'g') where notes is not null;
update public.meetings set agenda = regexp_replace(regexp_replace(agenda, '\s{2,}', ' ', 'g'), '^\s+|\s+$', '', 'g') where agenda is not null;
update public.meetings set title  = regexp_replace(regexp_replace(title,  '\s{2,}', ' ', 'g'), '^\s+|\s+$', '', 'g');

-- =============================================================
-- PART 3 — REMOVE JIRO-SPECIFIC MEETING
-- =============================================================
delete from public.meetings
where title ilike '%ZenWorks%Japan Pavilion tour%'
   or title ilike '%Jiro%ZenWorks%';

-- =============================================================
-- END OF MIGRATION 0011
-- =============================================================
