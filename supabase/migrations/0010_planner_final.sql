-- =============================================================
-- TAG Expo Command Center · Event Planner Lookup — FINAL PASS
-- Migration 0010 · Booth confirms + classification reversals
--
-- Source: Richard's second Event Planner search on Apr 19, 2026
-- (licensing26.mapyourshow.com mobile). This is the FINAL floor
-- plan ingest migration — all remaining lookup items resolved.
--
-- Rule applied: "If a name from the target list does not surface
-- in the Event Planner exhibitor directory, they are not
-- exhibiting with a booth. They may still be attending as
-- speakers, panelists, buyers, or via parent-company booths."
--
-- PART 1 — Reversal of bad 0009 flag (1 UPDATE)
--   • Liquid Death is exhibiting at O236 after all. Strip the
--     "[UNVERIFIED IN PLANNER]" note and set booth.
--
-- PART 2 — Coca-Cola B154 verification confirmed (1 UPDATE)
--   • Strip "[BOOTH B154 NEEDS ON-SITE VERIFICATION]" flag.
--     Planner confirms "The Coca-Cola Company" at B154.
--
-- PART 3 — Multi-booth update (1 UPDATE)
--   • Earthbound Brands occupies TWO booths: A142, A154.
--     App convention going forward: comma-separate multiple
--     booths in the booth_number field.
--
-- PART 4 — Merge Universal into NBCUniversal (1 DELETE)
--   • 0008 flagged Universal for reconciliation. Planner shows
--     no separate "Universal" listing. NBCUniversal U188 is the
--     single Comcast-family booth. Delete the duplicate record.
--
-- PART 5 — 6 booth confirms for existing targets (6 UPDATEs)
--
-- PART 6 — 1 net-new exhibitor (TV Tokyo — surfaced from the
--          Tokyo Broadcasting search)
--
-- PART 7 — 14 classification flags for non-exhibiting targets
--   Netflix, PepsiCo, ATP, Funko, Krispy Kreme, GNC,
--   Westinghouse, Walt Disney Company, Spiralcute, KNVB, FPF,
--   FFF, Kings League, Diego Maradona Estate
--
-- Runs AFTER 0009_planner_pass1.sql. Safe to re-run.
-- =============================================================

-- =============================================================
-- PART 1 — REVERSE BAD 0009 FLAG: LIQUID DEATH IS EXHIBITING
-- =============================================================
-- 0009 appended "[UNVERIFIED IN PLANNER]" to Liquid Death based
-- on a first-pass search that missed the listing. Second pass
-- (Apr 19 screenshot) confirms Liquid Death at booth O236.
-- Strip the bogus flag, set booth, update note.
update public.targets
set
  booth_number = 'O236',
  notes = regexp_replace(
    coalesce(notes, ''),
    '\[UNVERIFIED IN PLANNER[^\]]*\][^\|]*\| ?',
    '',
    'g'
  ) || ' | [BOOTH CONFIRMED O236 — Event Planner Apr 19, 2026] Anchor pair. Named in Informa March 11 major-exhibitor release. Backflip Playbook target: ''every Liquid Death collab ends up graded on eBay anyway — ship it pre-graded, keep the secondary margin.'''
where company_name = 'Liquid Death';

-- =============================================================
-- PART 2 — COCA-COLA B154 VERIFICATION CONFIRMED
-- =============================================================
-- 0009 flagged B154 for on-site verification. Apr 19 Planner
-- search confirms "The Coca-Cola Company" at B154. Strip flag.
update public.targets
set notes = regexp_replace(
    coalesce(notes, ''),
    '\[BOOTH B154 NEEDS ON-SITE VERIFICATION\][^\|]*\| ?',
    '',
    'g'
  ) || ' | [BOOTH B154 CONFIRMED — Event Planner Apr 19, 2026] Own booth confirmed. CAA G156 remains a complementary access path.'
where company_name = 'The Coca-Cola Company';

-- =============================================================
-- PART 3 — MULTI-BOOTH UPDATE: EARTHBOUND BRANDS
-- =============================================================
-- Planner directory shows "Earthbound Brands  A142, A154".
-- App convention: comma-separate multiple booths in the
-- booth_number field. Earthbound previously logged at A142 only.
update public.targets
set
  booth_number = 'A142, A154',
  notes = coalesce(notes, '') || ' | [MULTI-BOOTH — Apr 19, 2026] Planner confirms two locations: A142 and A154.'
where company_name = 'Earthbound Brands';

-- =============================================================
-- PART 4 — MERGE UNIVERSAL INTO NBCUNIVERSAL
-- =============================================================
-- 0008 inserted a standalone "Universal" target pending
-- Planner reconciliation. No separate Universal booth exists
-- in the directory. NBCUniversal at U188 is the Comcast-family
-- entity covering Universal Pictures IP. Delete the duplicate.
delete from public.targets
where company_name = 'Universal';

-- Note the merge on NBCUniversal so pitch angles transfer.
update public.targets
set notes = coalesce(notes, '') || ' | [UNIVERSAL MERGED HERE — Apr 19, 2026] No separate Universal booth in Planner. This U188 record now covers Universal Pictures IP: Jurassic World, Fast & Furious, Minions/Despicable Me, Wicked Part 2. Wicked Part 2 is the priority movie-tie-in pitch.'
where company_name = 'NBCUniversal';

-- =============================================================
-- PART 5 — BOOTH CONFIRMS FOR EXISTING TARGETS (6 UPDATEs)
-- =============================================================

-- Viz Media → O208 (Planner name: "VIZ")
update public.targets
set
  booth_number = 'O208',
  notes = coalesce(notes, '') || ' | [BOOTH CONFIRMED O208 — Event Planner Apr 19, 2026] Directory name: "VIZ". Jiro lead — manga/anime IP distribution.'
where company_name in ('Viz Media', 'VIZ Media', 'Viz Media LLC');

-- Tokyo Broadcasting Television Systems → A188
update public.targets
set
  booth_number = 'A188',
  notes = coalesce(notes, '') || ' | [BOOTH CONFIRMED A188 — Event Planner Apr 19, 2026] Directory name: "Tokyo Broadcasting System Television, Inc. (TBS)". Jiro lead.'
where company_name = 'Tokyo Broadcasting Television Systems';

-- Sophie La Girafe → K235 (Planner name: "Deliso Sophie la girafe")
update public.targets
set
  booth_number = 'K235',
  notes = coalesce(notes, '') || ' | [BOOTH CONFIRMED K235 — Event Planner Apr 19, 2026] Directory name: "Deliso Sophie la girafe" — Deliso is the parent French co. New-to-show 2026 per Feb 19 Informa release.'
where company_name = 'Sophie La Girafe';

-- Beverly Hills Teddy Bear Company → U239
update public.targets
set
  booth_number = 'U239',
  notes = coalesce(notes, '') || ' | [BOOTH CONFIRMED U239 — Event Planner Apr 19, 2026] Directory name: "Beverly Hills Teddy Bear Co. / Butts on Things".'
where company_name = 'Beverly Hills Teddy Bear Company';

-- The Jim Henson Company → R239 (shared booth with Precious Moments)
update public.targets
set
  booth_number = 'R239',
  notes = coalesce(notes, '') || ' | [BOOTH CONFIRMED R239 — Event Planner Apr 19, 2026] Directory name: "The Jim Henson Co/Precious Moments" — shared booth. Two IP conversations available at one stop.'
where company_name = 'The Jim Henson Company';

-- The Brand Liaison → E154 (shared with Brentwood Licensing)
update public.targets
set
  booth_number = 'E154',
  notes = coalesce(notes, '') || ' | [BOOTH CONFIRMED E154 — Event Planner Apr 19, 2026] Directory name: "The Brand Liaison / Brentwood Licensing" — shared booth. Silver sponsor of Opening Night Party.'
where company_name = 'The Brand Liaison';

-- =============================================================
-- PART 6 — 1 NET-NEW EXHIBITOR
-- =============================================================
-- Surfaced during the "Tokyo" directory search alongside TBS.
-- TV Tokyo is a major Japanese commercial broadcaster, heavy
-- anime production (Naruto, One Piece, Yu-Gi-Oh! historically).
insert into public.targets (company_name, tier, track, coverage_unit, priority, booth_number, proof_point, pitch_angle, opener, status, notes)
values
  ('TV Tokyo', 'tier_1', 'japanese_ip', 'anchor_pair_plus_jiro', 'high', 'S242',
    'Major Japanese commercial TV broadcaster. Historical home of Naruto, Pokémon anime, One Piece (original), Yu-Gi-Oh!. Active anime IP licensing program.',
    'Anime-IP graded collectible program. Long-running shonen franchises have deep trading-card heritage — Yu-Gi-Oh! in particular is a native TCG IP.',
    'Yu-Gi-Oh! cards are graded by everyone except the people who made the show. Jiro-san is the Tokyo bridge; we''re the authentication layer.',
    'not_contacted',
    'Added from Event Planner lookup (pass 7 final). Surfaced alongside TBS in "Tokyo" search. JIRO LEAD. Pair with Medialink R242 (Asia distribution) and TBS A188 for Japanese-broadcaster sweep.')
on conflict (company_name) do update
  set booth_number = excluded.booth_number,
      notes = coalesce(public.targets.notes, '') || ' | ' || excluded.notes;

-- =============================================================
-- PART 7 — CLASSIFICATION FLAGS FOR 14 NON-EXHIBITING TARGETS
-- =============================================================
-- Per Richard's rule: these names were searched in the Event
-- Planner Apr 19, 2026 and did NOT return as exhibitors. They
-- may still be attending as speakers, panelists, buyers, or
-- through parent-company booths. Flag them so the anchor pair
-- doesn't waste floor time hunting for booths that don't exist.
--
-- Exceptions to note:
--   • Netflix — already flagged [KEYNOTE ACCESS] in 0009. Keep.
--     Adding supplementary confirmation.
--   • ATP, Funko, PepsiCo — named in Informa's March 11 "major
--     exhibitors" release but NOT returned in the Planner
--     directory search. Either the release was aspirational or
--     they're in the Planner under a different legal name.
--     Flag for on-site confirmation as a safety net.

update public.targets
set notes = coalesce(notes, '') || ' | [NOT IN PLANNER DIRECTORY — Apr 19, 2026] Searched exhibitor list; no booth returned. Informa''s March 11 major-exhibitor release named them but Planner is source of truth. Possible reasons: attending as speaker/panelist/buyer, listed under a different legal name, or late addition. Do not spend floor time hunting — pursue via networking events, panels, or off-show follow-up.'
where company_name in (
  'PepsiCo',
  'Association of Tennis Professionals (ATP)',
  'Funko',
  'Krispy Kreme',
  'GNC',
  'Westinghouse',
  'The Walt Disney Company',
  'Spiralcute International',
  'Royal Dutch Football Federation (KNVB)',
  'Portuguese Football Federation (FPF)',
  'French Football Federation (FFF)',
  'Kings League',
  'Diego Maradona Estate'
);

-- Netflix already has a keynote-access flag from 0009. Layer a
-- second confirmation so the non-exhibiting status is clearly
-- recorded twice (keynote + directory absence).
update public.targets
set notes = coalesce(notes, '') || ' | [CONFIRMED NO BOOTH — Event Planner Apr 19, 2026] Not in exhibitor directory. Meeting path is the Marian Lee keynote Tue 10 AM and post-keynote reception only.'
where company_name = 'Netflix';

-- =============================================================
-- END OF MIGRATION 0010 — FLOOR PLAN INGEST COMPLETE
-- =============================================================
-- After this migration runs, the targets table should contain
-- the complete, verified Licensing Expo 2026 target universe:
--   • ~193 total targets (187 after 0009 + TV Tokyo - Universal merge)
--   • ~165 with verified booth numbers
--   • ~28 with classification flags (keynote/panel/buyer/
--     directory-absent) explaining why no booth
--
-- No further floor-plan migrations planned. Subsequent
-- migrations should focus on app features, not data ingest.
-- =============================================================
