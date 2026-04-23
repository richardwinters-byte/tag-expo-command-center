-- =============================================================
-- TAG Expo Command Center · Floor Plan Ingest — Pass 3
-- Migration 0006 · Roblox + U244 meeting tables + Brands & Agents gap
--
-- Sources:
--   IMG_5255 — U244 meeting tables (Roblox at U244-1, 20 other tenants)
--   IMG_5254 — B/C/D rows at columns 142-154 (Earthbound Brands,
--              Scouting America, Difuzed, Dimensional Branding, etc.)
--
-- Key find: ROBLOX is a meeting-table slot (U244-1), not a booth.
-- That's why it wasn't in earlier screenshot coverage.
--
-- Run AFTER 0005_floor_plan_pass2.sql. Safe to re-run.
-- =============================================================

-- =============================================================
-- 1. UPDATE existing targets
-- =============================================================
update public.targets set booth_number = 'U244-1' where company_name = 'Roblox';

-- =============================================================
-- 2. NEW TARGETS from third-pass screenshots
-- =============================================================
insert into public.targets (company_name, tier, track, coverage_unit, priority, booth_number, proof_point, status, notes)
values
  -- ========== U244 MEETING TABLES ==========
  ('Paizo', 'nice_to_meet', 'entertainment_ip', 'anchor_pair', 'high', 'U243',
    'Pathfinder RPG publisher. TTRPG collectible/gaming IP with active secondary market on specialty cards and rulebooks.',
    'not_contacted',
    'Added from LE2026 floor plan (pass 3). Magic/WotC adjacent — graded RPG collectibles lane, no current grader.'),
  ('Schleich', 'nice_to_meet', 'entertainment_ip', 'anchor_pair', 'moderate', 'U244-7',
    'German premium toy/figure manufacturer. Horse Club, Eldrador, dinosaurs. Collector-quality figures; naturally adjacent to graded packaging/card inserts.',
    'not_contacted',
    'Added from LE2026 floor plan (pass 3). Premium figures + graded insert card = Backflip-adjacent pitch.'),
  ('Sanrio do Brasil', 'nice_to_meet', 'japanese_ip', 'anchor_pair_plus_jiro', 'high', 'U244-9',
    'Brazilian Sanrio licensee. Back-channel access to Sanrio IP without going through Tokyo HQ.',
    'not_contacted',
    'Added from LE2026 floor plan (pass 3). Sanrio HQ not publicly confirmed exhibiting; this is the closest access point. Jiro can advise on Tokyo approach.'),
  ('Boat Rocker Studios', 'nice_to_meet', 'entertainment_ip', 'anchor_pair', 'moderate', 'U244-18',
    'Kids entertainment production company. Daniel Tiger''s Neighborhood, The Next Step. Active licensing program.',
    'not_contacted',
    'Added from LE2026 floor plan (pass 3).'),
  ('Carlin West Agency (CWA)', 'nice_to_meet', 'agent', 'anchor_pair', 'moderate', 'U244-20',
    'Independent licensing agency with lifestyle/fashion/beauty portfolio.',
    'not_contacted',
    'Added from LE2026 floor plan (pass 3). Multi-brand agent — worth a walk-up.'),
  ('Le Petit Prince Licensing', 'nice_to_meet', 'entertainment_ip', 'anchor_pair', 'moderate', 'U244-14',
    'Classic French IP. 80+ years of continuous merchandising; premium-nostalgia lane.',
    'not_contacted',
    'Added from LE2026 floor plan (pass 3). Graded collector-edition printing could land well.'),
  ('Highlights for Children', 'nice_to_meet', 'entertainment_ip', 'anchor_pair', 'moderate', 'U244-11',
    'Legacy kids magazine + brand. Deep nostalgia with multi-generational collector base.',
    'not_contacted',
    'Added from LE2026 floor plan (pass 3).'),
  ('Flynn Collective', 'opportunistic', 'agent', 'anchor_pair', 'low', 'U244-12',
    'Licensing agency.',
    'not_contacted',
    'Added from LE2026 floor plan (pass 3).'),
  ('International Literary Properties', 'opportunistic', 'agent', 'anchor_pair', 'moderate', 'U244-4',
    'Licensing agency for literary estates — classic authors, poetry, heritage IP.',
    'not_contacted',
    'Added from LE2026 floor plan (pass 3). Interesting for literary-nostalgia graded collectibles.'),
  ('Major League Fishing', 'opportunistic', 'sports', 'anchor_pair_plus_dan', 'low', 'U244-3',
    'Competitive fishing league. Niche sports collector audience.',
    'not_contacted',
    'Added from LE2026 floor plan (pass 3). Dan track; opportunistic.'),
  ('Pixite', 'opportunistic', 'entertainment_ip', 'anchor_pair', 'low', 'U244-2',
    'Creative apps / digital IP.',
    'not_contacted',
    'Added from LE2026 floor plan (pass 3).'),
  ('Hangry Petz', 'opportunistic', 'entertainment_ip', 'anchor_pair', 'moderate', 'U244-5',
    'Kids/pet IP. Sponsor of the Matchmaking Lounge per LE2026 materials.',
    'not_contacted',
    'Added from LE2026 floor plan (pass 3). Powers the Matchmaking Lounge — worth a relationship.'),
  ('Brand Equity Solutions', 'opportunistic', 'agent', 'anchor_pair', 'low', 'U244-8',
    'Licensing agency.',
    'not_contacted',
    'Added from LE2026 floor plan (pass 3).'),
  ('CP Brands Group', 'opportunistic', 'agent', 'anchor_pair', 'low', 'U244-10',
    'Licensing agency.',
    'not_contacted',
    'Added from LE2026 floor plan (pass 3).'),
  ('Grant Thornton', 'opportunistic', 'agent', 'anchor_pair', 'low', 'U244-16',
    'Major accounting firm. Likely providing licensing-deal financial advisory services. Not a deal target.',
    'not_contacted',
    'Added from LE2026 floor plan (pass 3). Professional services — intel only.'),
  ('Thrilljoy', 'opportunistic', 'agent', 'anchor_pair', 'low', 'U244-15',
    'Licensing agency.',
    'not_contacted',
    'Added from LE2026 floor plan (pass 3).'),
  ('OAK9 Entertainment', 'opportunistic', 'entertainment_ip', 'anchor_pair', 'low', 'U244-17',
    'Entertainment IP holder.',
    'not_contacted',
    'Added from LE2026 floor plan (pass 3).'),

  -- ========== BRANDS & AGENTS GAP ROW (B/C/D 142-154) ==========
  ('Earthbound Brands', 'nice_to_meet', 'agent', 'anchor_pair', 'high', 'A142',
    'Major licensing agency — A142 + A154 double booth signals top-tier presence. Represents multiple consumer/lifestyle brands.',
    'not_contacted',
    'Added from LE2026 floor plan (pass 3). Double-booth footprint = worth a scheduled meeting, not a walk-up. Highest-priority agent encounter in the middle band.'),
  ('Scouting America', 'nice_to_meet', 'entertainment_ip', 'anchor_pair', 'moderate', 'C154',
    'Formerly Boy Scouts of America. Rebrand announced 2024, effective Feb 2025. Active IP/merit-badge licensing revamp underway.',
    'not_contacted',
    'Added from LE2026 floor plan (pass 3). Heritage IP with active rebrand — graded merit-badge / commemorative card lane has precedent (BSA centennial was a collector event).'),
  ('Difuzed / Aquarius LTD / San Diego Hat Co. / H3 Sportgear', 'nice_to_meet', 'agent', 'anchor_pair', 'moderate', 'B142',
    'Four apparel/accessories brands in one booth. Licensed merchandise manufacturers — Aquarius is a major licensed-goods distributor (puzzles, cards, drinkware).',
    'not_contacted',
    'Added from LE2026 floor plan (pass 3). Aquarius LTD already does licensed playing cards — adjacency to TAG''s core product is real.'),
  ('Highlight LA', 'opportunistic', 'agent', 'anchor_pair', 'low', 'C142',
    'Licensing agency.',
    'not_contacted',
    'Added from LE2026 floor plan (pass 3).'),
  ('Dimensional Branding', 'opportunistic', 'agent', 'anchor_pair', 'low', 'D142',
    'Licensing agency / brand strategy.',
    'not_contacted',
    'Added from LE2026 floor plan (pass 3).'),
  ('Design Plus', 'opportunistic', 'agent', 'anchor_pair', 'low', 'D144',
    'Licensing agency.',
    'not_contacted',
    'Added from LE2026 floor plan (pass 3).')
on conflict (company_name) do nothing;
