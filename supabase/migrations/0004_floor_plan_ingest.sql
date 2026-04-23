-- =============================================================
-- TAG Expo Command Center · Floor Plan Ingest
-- Migration 0004 · Licensing Expo 2026 booth numbers + late-wave exhibitors
--
-- Source: Bayside Halls A–D floor plan (licensing26.mapyourshow.com),
-- captured April 18, 2026. Booth numbers verified against screenshots.
--
-- This migration:
--   1. Updates booth_number on existing targets (idempotent UPDATEs).
--   2. Inserts late-wave exhibitors visible on the map that weren't
--      in the original 53-target list, using ON CONFLICT to stay safe.
--
-- Run AFTER 0001_init.sql, 0002_attachments.sql, 0003_intel_rescope.sql.
-- Safe to re-run.
-- =============================================================

-- =============================================================
-- 1. BOOTH NUMBERS — existing targets
-- =============================================================
-- Tier 1 Must-Meets
update public.targets set booth_number = 'N180' where company_name = 'The Pokémon Company International';
update public.targets set booth_number = 'N236' where company_name = 'Panini America';
update public.targets set booth_number = 'U210' where company_name = 'SEGA';
update public.targets set booth_number = 'O214' where company_name = 'Warner Bros. Discovery';
update public.targets set booth_number = 'G170' where company_name = 'Hasbro / Wizards of the Coast';
update public.targets set booth_number = 'G156' where company_name = 'CAA Brand Management';
update public.targets set booth_number = 'R180' where company_name = 'Mattel';
update public.targets set booth_number = 'O180' where company_name = 'Paramount Global';
update public.targets set booth_number = 'B154' where company_name = 'The Coca-Cola Company';
update public.targets set booth_number = 'G188' where company_name = 'The LEGO Group';
update public.targets set booth_number = 'N204' where company_name = 'BBC Studios';
update public.targets set booth_number = 'U188' where company_name = 'NBCUniversal';

-- Sports Pavilion (A204 / B203 block)
update public.targets set booth_number = 'A204-3' where company_name = 'NFLPA / NFL Players Inc.';
update public.targets set booth_number = 'A204-4' where company_name = 'MLB Players Inc.';
update public.targets set booth_number = 'B203-1' where company_name = 'Newcastle United FC';
update public.targets set booth_number = 'B203-3' where company_name = 'Real Madrid FC';

-- Nice-to-Meet (booth numbers where visible on the map)
update public.targets set booth_number = 'N214' where company_name = 'Sony Pictures Entertainment / Crunchyroll';
update public.targets set booth_number = 'S226' where company_name = 'Amazon MGM Studios';
update public.targets set booth_number = 'R224-1' where company_name = 'MINISO';
update public.targets set booth_number = 'F204' where company_name = 'Riot Games';
update public.targets set booth_number = 'S214' where company_name = 'Jazwares';
update public.targets set booth_number = 'J204' where company_name = 'WildBrain CPLG';
update public.targets set booth_number = 'Q214' where company_name = 'Ubisoft';
update public.targets set booth_number = 'Q202' where company_name = 'Crayola';
update public.targets set booth_number = 'D132' where company_name = 'Artestar';
update public.targets set booth_number = 'D118' where company_name = 'Jewel Branding & Licensing';
update public.targets set booth_number = 'M230' where company_name = 'Ceremony of Roses';

-- Opportunistic / surfaced in Target Brief
update public.targets set booth_number = 'C144' where company_name = 'NASCAR';
-- (Skipped: TMS Entertainment isn't in seed under that name; if added later, booth is Q236.)

-- =============================================================
-- 2. LATE-WAVE EXHIBITORS — new targets visible on the floor plan
-- =============================================================
-- Inserted as 'nice_to_meet' or 'opportunistic' with an anchor_pair default.
-- Richard can re-tier after review via the Targets screen.
-- ON CONFLICT (company_name) DO NOTHING keeps this idempotent.

-- Update existing tokidoki record (it's already in the seed as Nice-to-Meet)
update public.targets set booth_number = 'F182' where company_name = 'tokidoki';

insert into public.targets (company_name, tier, track, coverage_unit, priority, booth_number, proof_point, status, notes)
values
  -- Nintendo wasn't in the original 53 (Target Brief skipped them — direct Nintendo licensing is generally not available).
  -- Captured here because they're a visible exhibitor and worth at least a walk-by if anchor pair has time.
  ('Nintendo', 'opportunistic', 'entertainment_ip', 'anchor_pair', 'low', 'A209',
    'Confirmed exhibiting. Nintendo does not typically license IP for third-party physical collectibles — expect a hard no. Walk-by only for intel.',
    'not_contacted',
    'Added from LE2026 floor plan April 18. Opportunistic only — Nintendo''s licensing posture is famously closed.'),
  -- Confirmed major brands from floor plan
  ('BANDAI NAMCO Entertainment America', 'nice_to_meet', 'japanese_ip', 'anchor_pair_plus_jiro', 'high', 'F170',
    'Confirmed exhibiting. Entertainment America division — US retail/licensing arm. TCG-adjacent via Hololive Official Card Game partnership.',
    'not_contacted',
    'Added from LE2026 floor plan April 18. Jiro should confirm Tokyo-side relationship before outreach.'),
  ('Spin Master', 'nice_to_meet', 'entertainment_ip', 'anchor_pair', 'high', 'J192',
    'Major toy/entertainment licensee. Paw Patrol cited by Informa as a $300M brand extension success story. Active collector-adjacent lines (Bakugan, Monster Jam).',
    'not_contacted',
    'Added from LE2026 floor plan April 18. Paw Patrol graded insert card is the natural Backflip-playbook pitch.'),
  ('Bravado', 'nice_to_meet', 'entertainment_ip', 'anchor_pair', 'moderate', 'D170',
    'Music merch licensee. Universal Music Group subsidiary. Tour merch, artist collabs. Secondary relevance to TAG collector-card lane.',
    'not_contacted',
    'Added from LE2026 floor plan April 18. Artist-tied graded collectibles could be a back-pocket pitch.'),
  ('Moonbug Entertainment', 'nice_to_meet', 'entertainment_ip', 'anchor_pair', 'moderate', 'R214',
    'Kids IP — CoComelon, Blippi, Little Angel. High-velocity licensing pipeline.',
    'not_contacted',
    'Added from LE2026 floor plan April 18. Kids-first; graded card is a harder pitch but premium collectible plush/toy insert viable.'),
  ('Peanuts Worldwide', 'nice_to_meet', 'entertainment_ip', 'anchor_pair', 'high', 'G204',
    'WildBrain-owned legacy IP. 75+ years of merchandise precedent. Heavy collector base.',
    'not_contacted',
    'Added from LE2026 floor plan April 18. WildBrain connection makes this an extension of the Sonic/Panini/SEGA trilateral.'),
  ('Legendary Entertainment', 'nice_to_meet', 'entertainment_ip', 'anchor_pair', 'moderate', 'H214',
    'Monsterverse IP (Godzilla, Kong), Dune. Active collectibles program with multiple licensees.',
    'not_contacted',
    'Added from LE2026 floor plan April 18.'),
  ('Kodansha Ltd.', 'nice_to_meet', 'japanese_ip', 'anchor_pair_plus_jiro', 'high', 'C214',
    'Japan''s largest manga publisher. Attack on Titan, Ghost in the Shell, Akira, Blue Lock licensing.',
    'not_contacted',
    'Added from LE2026 floor plan April 18. Jiro leads — Tokyo-side credibility required.'),
  ('NECA', 'nice_to_meet', 'entertainment_ip', 'anchor_pair', 'moderate', 'D214',
    'Collectibles manufacturer across 100+ IPs. Direct competitor-adjacent (they make the figures; we could grade the packaging/cards bundled).',
    'not_contacted',
    'Added from LE2026 floor plan April 18. Careful positioning — they''re in adjacent space.'),
  ('CD PROJEKT RED', 'nice_to_meet', 'entertainment_ip', 'anchor_pair', 'moderate', 'K230',
    'Cyberpunk 2077, The Witcher IP. Gaming-adjacent collectibles lane.',
    'not_contacted',
    'Added from LE2026 floor plan April 18.'),
  ('Aniplex of America', 'nice_to_meet', 'japanese_ip', 'anchor_pair_plus_jiro', 'moderate', 'E196',
    'Sony Music Entertainment Japan subsidiary. Demon Slayer, Fate series, Sword Art Online licensing.',
    'not_contacted',
    'Added from LE2026 floor plan April 18. Jiro leads on Tokyo parent relationship.'),
  ('King Features Syndicate', 'nice_to_meet', 'entertainment_ip', 'anchor_pair', 'moderate', 'E208',
    'Hearst-owned classic IP: Popeye, Betty Boop, Flash Gordon, The Phantom. Collector-nostalgia lane.',
    'not_contacted',
    'Added from LE2026 floor plan April 18.'),
  ('YOLOPARK', 'opportunistic', 'entertainment_ip', 'anchor_pair', 'moderate', 'R236',
    'Transformers, Dragon Ball, My Hero Academia premium collectibles manufacturer.',
    'not_contacted',
    'Added from LE2026 floor plan April 18.'),
  ('FADEL', 'opportunistic', 'agent', 'anchor_pair', 'low', 'A203',
    'Rights management software platform — IP licensing ops/tech layer. Not a direct deal target; potential infra partner.',
    'not_contacted',
    'Added from LE2026 floor plan April 18. Tech platform, not IP holder.'),
  ('Pinkfong (The Pinkfong Company)', 'opportunistic', 'entertainment_ip', 'anchor_pair', 'low', 'F196',
    'Baby Shark owner. Music/kids IP.',
    'not_contacted',
    'Added from LE2026 floor plan April 18.'),
  ('Avatar World', 'opportunistic', 'entertainment_ip', 'anchor_pair', 'low', 'F188',
    'Kids app/IP. Early-stage licensing brand.',
    'not_contacted',
    'Added from LE2026 floor plan April 18.'),
  ('Rebellion', 'opportunistic', 'entertainment_ip', 'anchor_pair', 'low', 'L228',
    'UK-based game dev + comics (2000 AD, Judge Dredd). Collector-comic lane.',
    'not_contacted',
    'Added from LE2026 floor plan April 18.'),
  ('The Smurfs', 'opportunistic', 'entertainment_ip', 'anchor_pair', 'moderate', 'M214',
    'IMPS-owned legacy IP. 65th anniversary approaching.',
    'not_contacted',
    'Added from LE2026 floor plan April 18.'),
  ('Dr. Seuss Enterprises', 'opportunistic', 'entertainment_ip', 'anchor_pair', 'low', 'M204',
    'Classic children''s IP. Premium-nostalgia lane.',
    'not_contacted',
    'Added from LE2026 floor plan April 18.'),
  ('Tetris', 'opportunistic', 'entertainment_ip', 'anchor_pair', 'low', 'L218',
    'Gaming IP — classic, broad collab history.',
    'not_contacted',
    'Added from LE2026 floor plan April 18.'),
  ('Feld Entertainment', 'opportunistic', 'entertainment_ip', 'anchor_pair', 'low', 'C124',
    'Live entertainment IP — Disney on Ice, Monster Jam, Jurassic World Live.',
    'not_contacted',
    'Added from LE2026 floor plan April 18.'),
  ('OneTeam Partners', 'nice_to_meet', 'sports', 'anchor_pair_plus_dan', 'high', 'A204-2',
    'Group-licensing rights holder for MLBPA, NFLPA, WNBPA, USWNT. Caesars Entertainment NIL deal announced April 15, 2026.',
    'not_contacted',
    'Added from LE2026 floor plan April 18. Dan leads — this is the non-Fanatics sports rights entity.'),
  ('FC Barcelona', 'nice_to_meet', 'sports', 'anchor_pair_plus_dan', 'high', 'B203-3',
    'Confirmed Sports Pavilion exhibitor. Two booths (B203-3 + B203-4).',
    'not_contacted',
    'Added from LE2026 floor plan April 18. Dan leads; Spanish-speaking teammate ideal.'),
  ('Pro Licensing', 'opportunistic', 'sports', 'anchor_pair_plus_dan', 'moderate', 'A204-3',
    'Sports Pavilion exhibitor. Agent-side representation.',
    'not_contacted',
    'Added from LE2026 floor plan April 18. Dan leads.'),
  ('Informa / License Global', 'opportunistic', 'agent', 'anchor_pair', 'moderate', 'K122',
    'Event organizer. Worth a walk-by for intel on 2027 booth availability and speaker slots.',
    'not_contacted',
    'Added from LE2026 floor plan April 18. Use for 2027 reconnaissance.'),
  ('Platinum Lounge (Angry Birds sponsor)', 'opportunistic', 'entertainment_ip', 'anchor_pair', 'moderate', 'J132',
    'Rovio / Sega-owned Angry Birds branded lounge. Walk-in for Angry Birds team contact opportunity.',
    'not_contacted',
    'Added from LE2026 floor plan April 18. Networking venue — use for informal Angry Birds access.')
on conflict (company_name) do nothing;
