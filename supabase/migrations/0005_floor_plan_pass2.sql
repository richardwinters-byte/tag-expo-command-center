-- =============================================================
-- TAG Expo Command Center · Floor Plan Ingest — Pass 2
-- Migration 0005 · Additional booths from expanded floor plan coverage
--
-- Source: LE2026 floor plan screenshots, April 18, 2026 (second pass).
-- Covered: top-right corner (A210-C230), Brands & Agents cluster
-- (C110-D120), Art & Design block (D80-J110), far-right column
-- (R240-T250), Q225 meeting tables.
--
-- Run AFTER 0004_floor_plan_ingest.sql. Safe to re-run.
-- =============================================================

-- =============================================================
-- 1. UPDATE existing target with confirmed booth
-- =============================================================
update public.targets set booth_number = 'E104' where company_name = 'Calm';

-- =============================================================
-- 2. NEW TARGETS from second-pass screenshots
-- =============================================================
insert into public.targets (company_name, tier, track, coverage_unit, priority, booth_number, proof_point, status, notes)
values
  -- Japanese IP / gaming (Jiro track)
  ('TOHO International', 'nice_to_meet', 'japanese_ip', 'anchor_pair_plus_jiro', 'high', 'D82',
    'Japanese studio — Godzilla IP holder. 70th anniversary of the original Godzilla (2024) set up an active collectibles cycle. Not to be confused with Toei Animation.',
    'not_contacted',
    'Added from LE2026 floor plan (second pass). Jiro leads — Tokyo-side credibility required. Godzilla graded collectible is high-conviction.'),
  ('Ultraman / Tsuburaya Fields Media', 'nice_to_meet', 'japanese_ip', 'anchor_pair_plus_jiro', 'moderate', 'D86',
    'Ultraman IP holder. Long-running tokusatsu franchise with collector base in Japan + growing US presence via Mill Creek and Shout! Factory.',
    'not_contacted',
    'Added from LE2026 floor plan (second pass). Jiro leads.'),
  ('Koei Tecmo Games', 'nice_to_meet', 'japanese_ip', 'anchor_pair_plus_jiro', 'moderate', 'S246',
    'Japanese gaming publisher. Dynasty Warriors, Nioh, Atelier series. Collector-adjacent gaming IP.',
    'not_contacted',
    'Added from LE2026 floor plan (second pass). Jiro leads.'),
  ('Supercell', 'nice_to_meet', 'entertainment_ip', 'anchor_pair', 'high', 'J88',
    'Clash of Clans, Clash Royale, Brawl Stars. Mobile gaming IP with massive global fan base. Licensing activity expanding into physical merchandise.',
    'not_contacted',
    'Added from LE2026 floor plan (second pass). Gaming graded collectibles lane — no grader currently owns the mobile-gaming IP category.'),
  ('Minecraft / Mojang', 'nice_to_meet', 'entertainment_ip', 'anchor_pair', 'high', 'J98',
    'Microsoft-owned. Confirmed three adjacent booths (J98, J100, J103). Minecraft movie (April 2025) grew US retail footprint; collectibles program is active.',
    'not_contacted',
    'Added from LE2026 floor plan (second pass). Three booths signals major licensing push. High-conviction Backflip-adjacent opportunity — graded cards in Happy Meals / cereal.'),
  ('Technicolor', 'opportunistic', 'agent', 'anchor_pair', 'moderate', 'S243',
    'Post-production / visual effects. Adjacent to IP world but not a direct licensor. Potential back-channel to studio content.',
    'not_contacted',
    'Added from LE2026 floor plan (second pass). Not a direct pitch target — intel/network only.'),
  ('Monaco Brands', 'opportunistic', 'agent', 'anchor_pair', 'low', 'D104',
    'Licensing agency representing sports, entertainment, and lifestyle brands.',
    'not_contacted',
    'Added from LE2026 floor plan (second pass).'),
  ('Global Icons', 'opportunistic', 'agent', 'anchor_pair', 'low', 'J108',
    'Licensing agency — represents multiple celebrity estates and heritage brands.',
    'not_contacted',
    'Added from LE2026 floor plan (second pass). Agent with multi-brand roster — worth a walk-by.'),
  ('Licensing Haüs', 'opportunistic', 'agent', 'anchor_pair', 'low', 'F108',
    'Licensing agency with international portfolio.',
    'not_contacted',
    'Added from LE2026 floor plan (second pass).'),
  ('Xavie Agency', 'opportunistic', 'agent', 'anchor_pair', 'low', 'F102',
    'Licensing agency.',
    'not_contacted',
    'Added from LE2026 floor plan (second pass).'),
  ('Adventure Media & Events, LLC', 'opportunistic', 'agent', 'anchor_pair', 'moderate', 'F106',
    'Publishes Toy Book / Pop Insider / Licensing Book. Industry media — direct access to editorial coverage.',
    'not_contacted',
    'Added from LE2026 floor plan (second pass). Not a deal target; pitch for post-show coverage of any TAG announcement.'),
  ('KO Media Management', 'opportunistic', 'agent', 'anchor_pair', 'low', 'C118',
    'Licensing agency.',
    'not_contacted',
    'Added from LE2026 floor plan (second pass).'),
  ('Dren Productions', 'opportunistic', 'agent', 'anchor_pair', 'low', 'C120',
    'Licensing agency.',
    'not_contacted',
    'Added from LE2026 floor plan (second pass).'),
  ('PAN AM', 'opportunistic', 'entertainment_ip', 'anchor_pair', 'moderate', 'H108',
    'Heritage airline brand — retail/apparel licensing sponsor of the Retail Lounge at LE2026.',
    'not_contacted',
    'Added from LE2026 floor plan (second pass). Sponsors the Retail Lounge — worth a walk-by for retailer intel.'),
  ('Maui and Sons', 'opportunistic', 'entertainment_ip', 'anchor_pair', 'low', 'D108',
    'Surf/skate lifestyle brand. Apparel licensing.',
    'not_contacted',
    'Added from LE2026 floor plan (second pass).'),
  ('Licensing Expo China', 'opportunistic', 'new_surfaced', 'anchor_pair_plus_jiro', 'moderate', 'B222',
    'Informa-operated sister expo for Chinese market. Booth staff can broker introductions to Chinese IP holders.',
    'not_contacted',
    'Added from LE2026 floor plan (second pass). Intel/networking only.'),
  ('IVEST Consumers Partners', 'opportunistic', 'agent', 'anchor_pair', 'moderate', 'T243',
    'Self-described "exclusive PE partner to Licensing International" per booth signage. Potential capital/M&A angle for TAG.',
    'not_contacted',
    'Added from LE2026 floor plan (second pass). PE relationship — worth a walk-by for TAG''s 2027+ strategic questions.'),
  ('Mr. Kringle Licensing Group', 'opportunistic', 'entertainment_ip', 'anchor_pair', 'low', 'D116',
    'Seasonal/holiday IP licensing.',
    'not_contacted',
    'Added from LE2026 floor plan (second pass).')
on conflict (company_name) do nothing;
