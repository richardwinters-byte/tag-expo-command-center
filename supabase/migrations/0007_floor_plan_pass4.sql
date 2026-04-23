-- =============================================================
-- TAG Expo Command Center · Floor Plan Ingest — Pass 4
-- Migration 0007 · MAJOR: Sanrio + Capcom + Shogakukan-Shueisha
--
-- Sources:
--   IMG_5256 — Left column C78-F80 (Sanrio C80, Zuru C78, 52TOYS,
--              Shogakukan-Shueisha Productions E80, Youtooz E81,
--              pocket.watch E82, City Connection D80)
--   IMG_5258 — Creative Hub G114 + H/J 114-116 (CAPCOM U.S.A. J116,
--              Hang Ten H114, Art Brand Studios F114)
--   IMG_5259 — A196-C199 row (STUDIOCANAL B196, Licensing Works A196,
--              Sony Creative Products A191, Hong Kong Trade Dev C197)
--
-- STRATEGIC NOTE: Target Brief § 9 stated "None of the four historical
-- Japanese pillars — Bandai Namco, Sanrio, Toei Animation, Capcom —
-- appear in Informa's public 2026 confirmation list." All four are
-- now confirmed on the floor plan:
--   • Bandai Namco Entertainment America — F170 (migration 0004)
--   • Sanrio — C80 (this migration)
--   • Toei Animation Inc. — J122 (migration 0004)
--   • Capcom U.S.A., Inc. — J116 (this migration)
-- Jiro's Day-1 priority list must be updated accordingly.
--
-- Run AFTER 0006_floor_plan_pass3.sql. Safe to re-run.
-- =============================================================

-- =============================================================
-- 1. NEW TARGETS — Japanese IP (HIGHEST PRIORITY)
-- =============================================================
insert into public.targets (company_name, tier, track, coverage_unit, priority, booth_number, proof_point, pitch_angle, opener, status, notes)
values
  ('Sanrio', 'tier_1', 'japanese_ip', 'anchor_pair_plus_jiro', 'highest', 'C80',
    'Hello Kitty 50th anniversary collectibles cycle (launched 2024) still active in 2026. MINISO Sanrio collabs have driven massive US retail presence. Target Brief flagged Sanrio as "private meeting rooms" but they''re a full booth at C80.',
    'TAG Customs Hello Kitty 50th-anniversary graded slab run. US retail counter-position against CGC Gems of the Game. Jiro leads Tokyo-side relationship.',
    'Hello Kitty at 50 is the biggest IP anniversary of the decade. Jiro-san is the Tokyo path; we build the US graded-collectible layer.',
    'not_contacted',
    'Added from LE2026 floor plan (pass 4). MAJOR STRATEGIC UPDATE: Sanrio IS exhibiting (Target Brief said private rooms only). Pre-book Day 1 AM priority meeting — anchor pair + Jiro mandatory.'),

  ('Capcom U.S.A., Inc.', 'tier_1', 'japanese_ip', 'anchor_pair_plus_jiro', 'highest', 'J116',
    'Resident Evil, Street Fighter, Monster Hunter, Mega Man. Street Fighter 6 active competitive scene. Monster Hunter Wilds launched 2025 — largest launch in franchise history. Target Brief said Capcom not confirmed; they''re at J116.',
    'Custom TAG-graded Street Fighter / Monster Hunter / Resident Evil collectible card program. Gaming-IP graded collectibles has no incumbent grader. Jiro handles Tokyo parent relationship.',
    'Street Fighter 6 and Monster Hunter Wilds are the two biggest competitive gaming audiences of 2026 with zero graded-collectible presence. We build that.',
    'not_contacted',
    'Added from LE2026 floor plan (pass 4). MAJOR STRATEGIC UPDATE: Capcom IS exhibiting (Target Brief said not confirmed). Pre-book Day 1 — anchor pair + Jiro.'),

  ('Shogakukan-Shueisha Productions', 'tier_1', 'japanese_ip', 'anchor_pair_plus_jiro', 'highest', 'E80',
    'Joint production entity of Japan''s two largest manga publishers (Shogakukan + Shueisha). IP exposure: Doraemon, Detective Conan (Shogakukan); One Piece, Naruto, Bleach, Demon Slayer, Dragon Ball, Jujutsu Kaisen (Shueisha). Functions as the US-facing licensing entity.',
    'TAG-graded manga-adjacent trading card program tied to specific franchise drops (One Piece TCG anniversary, Demon Slayer NFT-to-physical). Complements Panini entertainment pivot.',
    'You hold the biggest manga IP catalog on the planet. One Piece, Demon Slayer, Naruto have graded-card aftermarkets nobody owns. Jiro-san handles the Tokyo conversation.',
    'not_contacted',
    'Added from LE2026 floor plan (pass 4). MAJOR STRATEGIC UPDATE: not in the original Target Brief. Highest-conviction Japanese pitch in the deck after Pokémon. Pre-book Day 1 — Jiro leads introductions.'),

  ('City Connection', 'nice_to_meet', 'japanese_ip', 'anchor_pair_plus_jiro', 'moderate', 'D80',
    'Japanese retro game publisher — holds Jaleco, Data East, Technos catalog rights. Classic arcade IP (Double Dragon, Burgertime, Bad Dudes).',
    'Retro gaming graded collectible lane. Heritage arcade IP with active collector base.',
    'Retro arcade collectors already trade original cabinet art. A graded collector card is the natural extension.',
    'not_contacted',
    'Added from LE2026 floor plan (pass 4). Niche but real — retro gaming has a dedicated collector base.')
on conflict (company_name) do nothing;

-- =============================================================
-- 2. NEW TARGETS — Major US / Western IP
-- =============================================================
insert into public.targets (company_name, tier, track, coverage_unit, priority, booth_number, proof_point, pitch_angle, opener, status, notes)
values
  ('Zuru LLC', 'nice_to_meet', 'entertainment_ip', 'anchor_pair', 'high', 'C78',
    'Mini Brands — the viral collectible toy phenomenon (Walmart, Target, ubiquitous retail). 5 Surprise, Rainbocorns, Bunch O Balloons. Active blind-box collectible economy.',
    'Zuru already operates the blind-box collectible playbook at scale. Graded rare Mini Brands = natural upgrade tier. Direct CGC Gems of the Game counter-position.',
    'Mini Brands runs the blind-box collectible economy Walmart already approved. A graded rare tier is the next price-point up, and we already ship to Walmart.',
    'not_contacted',
    'Added from LE2026 floor plan (pass 4). Direct Backflip/Gems-of-the-Game adjacency. High priority.'),

  ('STUDIOCANAL', 'nice_to_meet', 'entertainment_ip', 'anchor_pair', 'high', 'B196',
    'French film IP holder — Highlander, Terminator (pre-Skydance), Shaun of the Dead, Rambo franchise, Paddington. Active library licensing with global retailer reach.',
    'Cinematic-universe graded slab program for Paddington / Terminator / Highlander — no current grader holds this catalog.',
    'Your Paddington alone is a $1B+ brand with no graded collectibles. Let''s fix that.',
    'not_contacted',
    'Added from LE2026 floor plan (pass 4).'),

  ('Youtooz', 'nice_to_meet', 'entertainment_ip', 'anchor_pair', 'high', 'E81',
    'Collectible figures for YouTube / streaming / gaming creators. Direct adjacency to graded collectibles — their limited-drop model is TAG''s pitch.',
    'Joint drop: Youtooz figure + TAG-graded collector card in each box. Limited-run, serialized.',
    'Your model is already collector-first. Add a graded card in every box and you''ve got a secondary-market product.',
    'not_contacted',
    'Added from LE2026 floor plan (pass 4). Direct collectibles adjacency — one of the most natural Nice-to-Meet targets.'),

  ('Sony Creative Products Inc. / Sony Music Labels Inc.', 'nice_to_meet', 'entertainment_ip', 'anchor_pair_plus_jiro', 'high', 'A191',
    'Sony music publishing + creative products arm. Separate from Sony Pictures Entertainment (N214). Music-artist IP licensing through Sony Music Japan, plus character/art licensing.',
    'TAG-graded artist collector card run. Music-IP graded collectibles has no grader.',
    'Your music catalog artists already generate grey-market graded collectibles. Next drop, ship them pre-graded.',
    'not_contacted',
    'Added from LE2026 floor plan (pass 4). Not Sony Pictures — this is the music/creative products entity. Jiro relevant for Tokyo ties.')
on conflict (company_name) do nothing;

-- =============================================================
-- 3. NEW TARGETS — Moderate priority
-- =============================================================
insert into public.targets (company_name, tier, track, coverage_unit, priority, booth_number, proof_point, status, notes)
values
  ('52TOYS', 'nice_to_meet', 'entertainment_ip', 'anchor_pair_plus_jiro', 'moderate', 'C82',
    'Chinese premium collectible figure brand. Double booth (C82 + C84). Active in US specialty retail.',
    'not_contacted',
    'Added from LE2026 floor plan (pass 4). Double-booth = real LE2026 investment.'),

  ('pocket.watch', 'nice_to_meet', 'entertainment_ip', 'anchor_pair', 'moderate', 'E82',
    'Kids digital media network. Ryan''s World (Ryan Kaji) ecosystem — massive kids YouTube-to-retail licensing empire.',
    'not_contacted',
    'Added from LE2026 floor plan (pass 4). Ryan''s World graded collectible insert is a Backflip-adjacent kids-CPG pitch.'),

  ('Hang Ten', 'opportunistic', 'entertainment_ip', 'anchor_pair', 'moderate', 'H114',
    'Surf/lifestyle apparel heritage brand. Active IP collab license program.',
    'not_contacted',
    'Added from LE2026 floor plan (pass 4). Lifestyle apparel collab lane.'),

  ('Licensing Works!®', 'nice_to_meet', 'agent', 'anchor_pair', 'moderate', 'A196',
    'Multi-brand licensing agency. Notable for representing Peanuts (ended 2010s) and multiple nostalgia IPs.',
    'not_contacted',
    'Added from LE2026 floor plan (pass 4). Multi-brand agent — one meeting can open doors to roster.'),

  ('Legends', 'nice_to_meet', 'entertainment_ip', 'anchor_pair_plus_dan', 'moderate', 'A200',
    'Global sports-licensing agency (venues + teams). Dallas Cowboys ownership-adjacent.',
    'not_contacted',
    'Added from LE2026 floor plan (pass 4). Dan track — sports licensing agency angle.'),

  ('Art Brand Studios', 'opportunistic', 'agent', 'anchor_pair', 'low', 'F114',
    'Licensing agency.',
    'not_contacted',
    'Added from LE2026 floor plan (pass 4).'),

  ('The Arena Media Brands', 'opportunistic', 'sports', 'anchor_pair_plus_dan', 'low', 'J114',
    'Sports media licensing (publisher of Sports Illustrated and fan-site network).',
    'not_contacted',
    'Added from LE2026 floor plan (pass 4). Dan track.'),

  ('Hong Kong Trade Development Council', 'opportunistic', 'agent', 'anchor_pair_plus_jiro', 'moderate', 'C197',
    'Institutional trade body. Back-channel access to Hong Kong/mainland China licensees.',
    'not_contacted',
    'Added from LE2026 floor plan (pass 4). Jiro-adjacent; institutional relationship for future China expansion.'),

  ('Futureshirts', 'opportunistic', 'entertainment_ip', 'anchor_pair', 'low', 'C195',
    'Licensed apparel manufacturer.',
    'not_contacted',
    'Added from LE2026 floor plan (pass 4).'),

  ('Lococo Licensing', 'opportunistic', 'agent', 'anchor_pair', 'low', 'C199',
    'Licensing agency.',
    'not_contacted',
    'Added from LE2026 floor plan (pass 4).'),

  ('Puremind', 'opportunistic', 'agent', 'anchor_pair', 'low', 'B198',
    'Licensing agency.',
    'not_contacted',
    'Added from LE2026 floor plan (pass 4).'),

  ('Licensed Right International', 'opportunistic', 'agent', 'anchor_pair', 'low', 'B200',
    'Licensing agency.',
    'not_contacted',
    'Added from LE2026 floor plan (pass 4).'),

  ('Golden Link Inc.', 'opportunistic', 'agent', 'anchor_pair', 'low', 'F79',
    'Licensing / manufacturing services.',
    'not_contacted',
    'Added from LE2026 floor plan (pass 4).'),

  ('Juiced Studio LTD', 'opportunistic', 'agent', 'anchor_pair', 'low', 'G114-1',
    'Creative Hub tenant.',
    'not_contacted',
    'Added from LE2026 floor plan (pass 4).')
on conflict (company_name) do nothing;

-- =============================================================
-- 4. ADDITIONAL FINDS (April 19 supplementary review)
-- =============================================================
insert into public.targets (company_name, tier, track, coverage_unit, priority, booth_number, proof_point, pitch_angle, opener, status, notes)
values
  ('Tezuka Productions', 'tier_1', 'japanese_ip', 'anchor_pair_plus_jiro', 'high', 'A203',
    'Osamu Tezuka''s studio — foundational figure of modern Japanese animation (the "Walt Disney of Japan"). Portfolio: Astro Boy (Mighty Atom), Black Jack, Phoenix, Kimba the White Lion, Princess Knight. Astro Boy turns 75 in 2028 with anniversary programming in market.',
    'Graded Astro Boy commemorative cards tied to the 75th-anniversary cycle. Legacy-IP collector base with deep nostalgia across US + Japan.',
    'Astro Boy is Japanese animation''s foundational IP. Nobody owns the graded-collectible layer. Jiro-san handles the Tokyo path.',
    'not_contacted',
    'Added from LE2026 floor plan (pass 4 supplementary). JIRO LEAD. Cluster with Sanrio / Capcom / Shogakukan-Shueisha / Bandai Namco / Toei / TOHO as a Day-1 Japanese IP block.')
on conflict (company_name) do nothing;

insert into public.targets (company_name, tier, track, coverage_unit, priority, booth_number, proof_point, status, notes)
values
  ('United States Postal Service', 'nice_to_meet', 'entertainment_ip', 'anchor_pair', 'moderate', 'F118',
    'USPS licenses stamp designs, mailbox iconography, and heritage marks. Philatelic community is a dedicated collectibles adjacent audience — Scott catalog and Mystic Stamp are the incumbents in stamp grading.',
    'not_contacted',
    'Added from LE2026 floor plan (pass 4 supplementary). Philatelic adjacency to TAG grading. Commemorative stamp-collectible authentication is a real category.'),
  ('Treasures Gifted', 'opportunistic', 'entertainment_ip', 'anchor_pair', 'low', 'A193',
    'Collectibles / gift brand — small exhibitor in the A-row near FADEL and Tezuka Productions.',
    'not_contacted',
    'Added from LE2026 floor plan (pass 4 supplementary).')
on conflict (company_name) do nothing;
