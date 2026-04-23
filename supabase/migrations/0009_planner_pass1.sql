-- =============================================================
-- TAG Expo Command Center · Event Planner Lookup Pass 1
-- Migration 0009 · Classification corrections + new booths
--
-- Source: Richard's direct Event Planner search on Apr 19, 2026
-- (licensing26.mapyourshow.com mobile interface) + decisions
-- on classification cleanup for 10 seed-only entries.
--
-- PART 1 — Classification corrections (10 UPDATEs)
--   • 4 keynote/panel access (Netflix, Mars, B&BW, Pacsun)
--   • 5 unverified in planner (Funko, General Mills, Unilever,
--     Fruit of the Loom, Liquid Death)
--   • 1 booth flagged for verification (Coca-Cola B154)
--
-- PART 2 — Existing-record updates (2 UPDATEs)
--   • Hangry Petz booth extended to U244-5, U244-6
--   • Hasbro entry noted with official MYS exhibitor name
--
-- PART 3 — Research report CORRECTION
--   • Mainichi Broadcasting System IS exhibiting at R224-2.
--     Earlier research audit said this was a 2025 pavilion list
--     that wouldn't return. Wrong. Adding as new Tier 1 Japanese IP.
--
-- PART 4 — 18 new exhibitors with verified booths
--
-- Runs AFTER 0008_research_audit_ingest.sql. Safe to re-run.
-- =============================================================

-- =============================================================
-- PART 1 — CLASSIFICATION CORRECTIONS
-- =============================================================

-- Keynote/panel access — not exhibiting with a booth. Meet at
-- or after their respective session. Still high-value targets.
update public.targets
set notes = '[KEYNOTE ACCESS — no booth] Marian Lee, CMO Netflix, keynoting Tue May 19 10 AM in License Global Theater. Anchor pair attends keynote, works post-keynote reception. ' || coalesce(notes, '')
where company_name = 'Netflix';

update public.targets
set notes = '[F&B PANEL ACCESS — no booth] David Lee, Sr. Director Global Licensing & Cultural Marketing. Panelist on Beyond the Plate keynote Wed May 20 12:30 PM. Anchor pair attends panel, works post-panel reception. Highest-leverage F&B keynote meeting.' || ' | ' || coalesce(notes, '')
where company_name = 'Mars Snacking';

update public.targets
set notes = '[F&B PANEL ACCESS — no booth] Brian Talbot, VP Brand Partnerships. Panelist on Beyond the Plate keynote Wed May 20 12:30 PM. Work post-panel reception.' || ' | ' || coalesce(notes, '')
where company_name = 'Bath & Body Works';

update public.targets
set notes = '[F&B PANEL ACCESS — no booth] Richard Cox, Chief Merchandising Officer. Panelist on Beyond the Plate keynote Wed May 20 12:30 PM. Work post-panel reception.' || ' | ' || coalesce(notes, '')
where company_name = 'Pacsun';

-- Unverified in Event Planner — Target Brief said "attending" but
-- Richard confirmed these 5 names do not appear in the MYS exhibitor
-- directory as of Apr 19, 2026. Attendance ambiguous — may be buyers,
-- may not be coming. Keep in app but do not waste booth-lookup time.
update public.targets
set notes = '[UNVERIFIED IN PLANNER — Apr 19, 2026] Not returned in licensing26.mapyourshow.com exhibitor search. Target Brief said "attending" but may mean as buyer not exhibitor. Confirm on-site or deprioritize.' || ' | ' || coalesce(notes, '')
where company_name in (
  'Funko',
  'General Mills',
  'Unilever',
  'Fruit of the Loom',
  'Liquid Death'
);

-- Coca-Cola at B154 was logged from floor plan screenshot in 0004.
-- Target Brief noted "Access via CAA Brand Management" as strategy.
-- Both can be true (own booth + also reachable via CAA), but flag
-- B154 for on-site verification since this is a Tier 1 target.
update public.targets
set notes = '[BOOTH B154 NEEDS ON-SITE VERIFICATION] Logged from floor plan screenshot. Target Brief says "Access via CAA Brand Management" — confirm both paths work. CAA G156 is the backup channel if B154 is something else.' || ' | ' || coalesce(notes, '')
where company_name = 'The Coca-Cola Company';

-- =============================================================
-- PART 2 — EXISTING RECORD UPDATES
-- =============================================================

-- Hangry Petz occupies two adjacent meeting tables
update public.targets
set booth_number = 'U244-5, U244-6'
where company_name = 'Hangry Petz';

-- Official MYS exhibitor name for Hasbro is "Hasbro Licensed Consumer
-- Products" — update display name. Booth G170 unchanged. WotC is an
-- access path through this entity, not a separate booth.
update public.targets
set notes = '[MYS EXHIBITOR NAME: "Hasbro Licensed Consumer Products"] Same booth G170. Request a WotC / Magic licensing rep when scheduling.' || ' | ' || coalesce(notes, '')
where company_name = 'Hasbro / Wizards of the Coast';

-- =============================================================
-- PART 3 — CORRECTION TO EARLIER RESEARCH AUDIT
-- Mainichi Broadcasting System IS exhibiting at R224-2
-- =============================================================
insert into public.targets (company_name, tier, track, coverage_unit, priority, booth_number, proof_point, pitch_angle, opener, status, notes)
values
  ('Mainichi Broadcasting System', 'tier_1', 'japanese_ip', 'anchor_pair_plus_jiro', 'high', 'R224-2',
    'Major Japanese commercial TV broadcaster (MBS, based in Osaka). Key anime production partner — Mobile Suit Gundam, Code Geass, Full Metal Alchemist, Attack on Titan. Heavy drama and variety IP.',
    'Anime-IP graded collectible program. Drama-IP merchandising adjacent to the broader Japan pavilion strategy.',
    'MBS has the anime co-production pipeline that nobody outside Japan is licensing graded collectibles against. Jiro-san is the Tokyo bridge.',
    'not_contacted',
    'Added from LE2026 Event Planner lookup (pass 6). ⚠ CORRECTION to earlier research audit which incorrectly flagged this as a 2025-only listing. Confirmed at R224-2 via MYS Apr 19, 2026. JIRO LEAD. Cluster with MINISO R224-1 — same booth block.')
on conflict (company_name) do nothing;

-- =============================================================
-- PART 4 — NEW EXHIBITORS FROM EVENT PLANNER (18)
-- =============================================================
insert into public.targets (company_name, tier, track, coverage_unit, priority, booth_number, proof_point, status, notes)
values
  ('Garena Free Fire', 'nice_to_meet', 'entertainment_ip', 'anchor_pair_plus_jiro', 'high', 'K214',
    'Massively popular mobile battle-royale (Garena / Sea Ltd, Singapore). Among the top-grossing mobile games in Latin America and Southeast Asia. Active IP licensing program.',
    'not_contacted',
    'Added from Event Planner lookup (pass 6). Mobile gaming IP with strong Latin America market. TCG adjacency possible.'),

  ('Medialink Animation International Limited', 'nice_to_meet', 'japanese_ip', 'anchor_pair_plus_jiro', 'high', 'R242',
    'Hong Kong-based anime distribution and licensing agency for the Asia-Pacific region. Distributes major anime titles into Chinese-language markets.',
    'not_contacted',
    'Added from Event Planner lookup (pass 6). JIRO/ASIA LEAD. Gateway to Hong Kong and Taiwan anime distribution channels.'),

  ('Frida Kahlo', 'nice_to_meet', 'entertainment_ip', 'anchor_pair', 'moderate', 'C213',
    'Frida Kahlo Corporation — estate-managed IP for Frida Kahlo. Active global licensing program (apparel, accessories, art reproductions).',
    'not_contacted',
    'Added from Event Planner lookup (pass 6). Art/legacy-IP lane. Licensed collectibles program adjacent to Artestar D132.'),

  ('Baby Einstein / Hello Einstein Studios', 'nice_to_meet', 'entertainment_ip', 'anchor_pair', 'moderate', 'L235',
    'Early-childhood education brand, heritage recognition. Hello Einstein Studios is the active content/licensing entity.',
    'not_contacted',
    'Added from Event Planner lookup (pass 6). Kids nostalgia category.'),

  ('Magic Wheelchair', 'nice_to_meet', 'entertainment_ip', 'anchor_pair', 'moderate', 'K237',
    'Non-profit that builds costume wheelchairs for kids with disabilities in collaboration with major IP holders. Frequent partner of Marvel, Disney, Lucasfilm.',
    'not_contacted',
    'Added from Event Planner lookup (pass 6). Mission-aligned angle; may surface IP-holder intros through shared-cause collaboration.'),

  ('Baps Animation Studios (BAPS)', 'opportunistic', 'entertainment_ip', 'anchor_pair', 'moderate', 'Q243',
    'Animation studio; licensing-track presence.',
    'not_contacted',
    'Added from Event Planner lookup (pass 6).'),

  ('Maya Studio', 'opportunistic', 'entertainment_ip', 'anchor_pair', 'low', 'L245',
    'Animation/design studio — licensing-track exhibitor.',
    'not_contacted',
    'Added from Event Planner lookup (pass 6).'),

  ('FortressHeart Studio', 'opportunistic', 'entertainment_ip', 'anchor_pair', 'low', 'O243',
    'Animation/content studio.',
    'not_contacted',
    'Added from Event Planner lookup (pass 6).'),

  ('Giordano Studios / Greg & Company', 'opportunistic', 'agent', 'anchor_pair', 'low', 'H87',
    'Art licensing agency.',
    'not_contacted',
    'Added from Event Planner lookup (pass 6). In the west International Pavilion area near Sanrio C80.'),

  ('Manhead', 'opportunistic', 'entertainment_ip', 'anchor_pair', 'low', 'C120B',
    'Music merchandising company — licenses for major artists and bands (Billie Eilish, Post Malone, etc). Trades under Manhead Merch brand.',
    'not_contacted',
    'Added from Event Planner lookup (pass 6). Music IP merchandise — similar positioning to Ceremony of Roses M230 and Bravado D170.'),

  ('MAURITIUS', 'opportunistic', 'new_surfaced', 'anchor_pair', 'low', 'G108',
    'Country of Mauritius exhibitor — tourism/location branding. International Pavilion-style presence.',
    'not_contacted',
    'Added from Event Planner lookup (pass 6). National-branding booth; low TAG relevance but intel value.'),

  ('Bazuuyu', 'opportunistic', 'entertainment_ip', 'anchor_pair', 'low', 'J214',
    'Licensing-track exhibitor.',
    'not_contacted',
    'Added from Event Planner lookup (pass 6). Unknown entity — walk-up scout.'),

  ('M.RAGE', 'opportunistic', 'entertainment_ip', 'anchor_pair', 'low', 'F109',
    'Licensing-track exhibitor.',
    'not_contacted',
    'Added from Event Planner lookup (pass 6). Unknown entity — walk-up scout.'),

  ('Henrial Corp', 'opportunistic', 'agent', 'anchor_pair', 'low', 'D117',
    'Licensing-track exhibitor in the C/D 116–120 Brands & Agents block.',
    'not_contacted',
    'Added from Event Planner lookup (pass 6). Small agent.'),

  ('Global Link Electronics', 'opportunistic', 'agent', 'anchor_pair', 'low', 'E109',
    'Electronics licensing/distribution.',
    'not_contacted',
    'Added from Event Planner lookup (pass 6).'),

  ('Gaastra, SuperTrash, Alzúarr and Flipsnack', 'opportunistic', 'entertainment_ip', 'anchor_pair', 'low', 'D131',
    'Portfolio booth — Gaastra (maritime apparel), SuperTrash (fashion), Alzúarr, and Flipsnack co-located.',
    'not_contacted',
    'Added from Event Planner lookup (pass 6). European fashion/lifestyle portfolio.'),

  ('Babones de futbol', 'opportunistic', 'sports', 'anchor_pair_plus_dan', 'low', 'A219',
    'Football/soccer licensing entity. Soccer Pavilion cluster.',
    'not_contacted',
    'Added from Event Planner lookup (pass 6). DAN TRACK. Adjacent to Soccer Pavilion core at B203 block.')
on conflict (company_name) do nothing;
