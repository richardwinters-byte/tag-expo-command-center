-- =============================================================
-- TAG Expo Command Center · Research Audit Ingest
-- Migration 0008 · Verified 2026 exhibitors + retail buyers
--
-- Source: deep research audit (April 19, 2026) cross-referencing
-- public 2026 sources against the 145-target working list.
--
-- PART 1 — Verified booths from public 2026 sources (2)
-- PART 2 — Confirmed-exhibiting, booth TBD from Event Planner (13)
-- PART 3 — Retail-pass buyers, no booth by design (9)
--
-- Runs AFTER 0007_floor_plan_pass4.sql. Safe to re-run.
-- =============================================================

-- =============================================================
-- PART 1 — VERIFIED BOOTHS (public 2026 sources corroborate)
-- =============================================================
insert into public.targets (company_name, tier, track, coverage_unit, priority, booth_number, proof_point, pitch_angle, opener, status, notes)
values
  ('TreImage LLC', 'nice_to_meet', 'agent', 'anchor_pair', 'high', 'G225',
    'Platinum Sponsor of Licensing Expo 2026 Opening Night Party. Hosts The Temptations meet-and-greet at booth G225. CEO Charles Singleton. Multi-brand licensing agency.',
    'High-profile agent — one meeting exposes TAG to their full brand roster. The ONP sponsorship signals they''re actively investing in show-floor visibility.',
    'You''re hosting the biggest room at the party. We turn the brands in that room into graded, authenticated product. Let''s find which ones fit first.',
    'not_contacted',
    'Added from LE2026 research audit (pass 5). BOOTH VERIFIED via GlobeNewswire/Toy Book/Licensing.biz April 9, 2026 releases. Catch at G225 any time; ONP Tuesday night is bonus access.'),
  ('MHS Licensing + Consulting', 'opportunistic', 'agent', 'anchor_pair', 'moderate', 'H90',
    'Mid-tier art-licensing agency. Represents illustrators and fine-art IP for consumer products.',
    'Art-licensing roster could feed a premium/limited TAG Customs run tied to a named artist.',
    'Your illustrator roster has a graded-collectible ceiling nobody is pitching yet.',
    'not_contacted',
    'Added from LE2026 research audit (pass 5). BOOTH VERIFIED via MHS own 2026 microsite (mhslicensing.com/news-and-events/events/licensing-expo-2026).')
on conflict (company_name) do nothing;

-- =============================================================
-- PART 2 — CONFIRMED EXHIBITING, BOOTH TBD
-- Booth lookup needed via Event Planner for migration 0009
-- =============================================================
insert into public.targets (company_name, tier, track, coverage_unit, priority, proof_point, pitch_angle, opener, status, notes)
values
  ('The Walt Disney Company', 'tier_1', 'entertainment_ip', 'anchor_pair', 'highest',
    'Named as entertainment powerhouse in Informa''s "Spotlights Global Industry Momentum" 2026 release. Largest single IP catalog on the floor — Marvel, Star Wars, Pixar, Disney Animation, National Geographic, ESPN, 20th Century Studios.',
    'Graded collectible program for limited-run Marvel/Star Wars/Pixar drops. Position TAG as the physical authentication layer no licensee currently owns.',
    'Your IP portfolio has the biggest aftermarket for graded collectibles on the planet. Nobody is the official first-party grader. That''s the ask.',
    'not_contacted',
    'Added from LE2026 research audit (pass 5). Booth TBD — requires Event Planner lookup.'),

  ('Universal', 'tier_1', 'entertainment_ip', 'anchor_pair', 'high',
    'Named in April 9 TreImage/ONP release as confirmed exhibitor. Universal Pictures + NBCUniversal Consumer Products share a parent (Comcast); LE presence may be distinct from the NBCUniversal U188 booth.',
    'Jurassic World, Fast & Furious, Minions/Despicable Me, Wicked Part 2 licensing programs. Movie-tie-in graded collectibles.',
    'Wicked Part 2 is a bigger cultural moment than Part 1. We want to be the graded-collectible layer for that rollout, and for Jurassic, and for Fast.',
    'not_contacted',
    'Added from LE2026 research audit (pass 5). ⚠ CONFIRM with Event Planner whether this is a separate booth from NBCUniversal at U188. If same entity, merge; if different, log separately.'),

  ('The Jim Henson Company', 'tier_1', 'entertainment_ip', 'anchor_pair', 'high',
    'Muppets (via licensing — Disney owns), Fraggle Rock, Dark Crystal, Labyrinth, Sid the Science Kid. Strong nostalgia/adult-collector audience.',
    'Adult-collector nostalgia IP = natural graded-collectible audience. Dark Crystal and Labyrinth especially have deep fandoms.',
    'Dark Crystal and Labyrinth fans already buy and trade memorabilia. A first-party graded collectible is the product line you don''t run yet.',
    'not_contacted',
    'Added from LE2026 research audit (pass 5). Was in original Target Brief confirmed-exhibitor list but never logged. Booth TBD.'),

  ('Viz Media', 'tier_1', 'japanese_ip', 'anchor_pair_plus_jiro', 'highest',
    'Explicitly flagged on the official event site as a 2026 anime-fandom showcase. Publishes manga and licenses anime in North America: Naruto, Bleach, My Hero Academia, Chainsaw Man, Jujutsu Kaisen (overlap with Shueisha catalog), One Punch Man, Tokyo Ghoul.',
    'Graded manga + anime-TCG cards. Complements the Shogakukan-Shueisha Productions (E80) conversation — Viz is the US distribution arm of that catalog.',
    'You''re the US face of half the Weekly Shōnen Jump catalog. Let''s make sure TAG is the US graded-card layer when Shogakukan-Shueisha signs a physical program.',
    'not_contacted',
    'Added from LE2026 research audit (pass 5). JIRO LEAD. Cluster with Shogakukan-Shueisha (E80), Kodansha (C214), Aniplex (E196), Crunchyroll/Sony Pictures (N214). Booth TBD but likely in anime/Japan zone.'),

  ('Spiralcute International', 'nice_to_meet', 'japanese_ip', 'anchor_pair_plus_jiro', 'moderate',
    'Featured in License Global "10 Minutes With" for scaling Japanese IPs for global fandom. Smaller-catalog Japanese IP aggregator — positions between major publishers and individual creators.',
    'Faster decision-making than the Tier 1 Japanese pillars; Jiro-led relationship.',
    'The big Japanese houses are slower. Smaller catalogs can move. Let''s see what you''ve got that fits TAG Customs.',
    'not_contacted',
    'Added from LE2026 research audit (pass 5). Booth TBD — likely International Pavilion near the Japan cluster.'),

  ('Westinghouse', 'nice_to_meet', 'entertainment_ip', 'anchor_pair', 'moderate',
    'Legacy brand new-to-show 2026. Heritage IP spans appliances, electronics, lighting. Brand licensing play for nostalgia/vintage aesthetics.',
    'Legacy-brand retro collectible program. Similar positioning to how USPS heritage marks work.',
    'Westinghouse has a heritage-brand aesthetic that already exists in collector culture. Make it official and graded.',
    'not_contacted',
    'Added from LE2026 research audit (pass 5). Booth TBD.'),

  ('Beverly Hills Teddy Bear Company', 'nice_to_meet', 'entertainment_ip', 'anchor_pair', 'moderate',
    'Plush toy manufacturer new-to-show 2026. Licensed plush catalog.',
    'Licensed plush + graded premium card insert = Backflip-style premium.',
    'Plush buyers already open boxes looking for something. Put a graded card in each collector-grade plush.',
    'not_contacted',
    'Added from LE2026 research audit (pass 5). Booth TBD.'),

  ('Royal Dutch Football Federation (KNVB)', 'nice_to_meet', 'sports', 'anchor_pair_plus_dan', 'high',
    'Soccer Pavilion exhibitor for 2026 FIFA World Cup. National team brand with strong European and US fan base. 2026 World Cup proximity drives licensing activity.',
    'Pre-World Cup graded memorabilia + player-NIL cards outside Fanatics exclusive.',
    'World Cup is 18 months out. The graded-collectible program needs to be in market on day one, not after the tournament.',
    'not_contacted',
    'Added from LE2026 research audit (pass 5). DAN LEAD. Soccer Pavilion — likely booth cluster near Real Madrid B203-3 / Newcastle B203-1.'),

  ('Portuguese Football Federation (FPF)', 'nice_to_meet', 'sports', 'anchor_pair_plus_dan', 'high',
    'Soccer Pavilion exhibitor. Cristiano Ronaldo era transitioning; Bernardo Silva, João Félix carrying the brand into 2026 World Cup cycle.',
    'Portuguese national team graded memorabilia. Portugal''s diaspora market in the US is licensing-active.',
    'Your diaspora audience in the US is larger than most clubs. Graded collectibles built for that audience is the opening.',
    'not_contacted',
    'Added from LE2026 research audit (pass 5). DAN LEAD. Soccer Pavilion cluster.'),

  ('French Football Federation (FFF)', 'nice_to_meet', 'sports', 'anchor_pair_plus_dan', 'high',
    'Soccer Pavilion exhibitor. Mbappé-era national brand, 2018 + 2022 World Cup final. Aggressive global licensing posture.',
    'French national team graded memorabilia. Mbappé-centric collector program.',
    'Mbappé already has a graded-collectible aftermarket. The FFF can own that channel instead of watching it.',
    'not_contacted',
    'Added from LE2026 research audit (pass 5). DAN LEAD. Soccer Pavilion cluster.'),

  ('Kings League', 'nice_to_meet', 'sports', 'anchor_pair_plus_dan', 'high',
    'Gerard Piqué''s 7-a-side football league. Confirmed Soccer Pavilion presence. Explosive Gen Z audience, streaming-native format, aggressive merch/licensing behavior.',
    'Graded collectible drops tied to streaming moments and individual Kings League figures. Direct Gen Z collector alignment.',
    'Your audience already trades clips. Add a graded physical artifact to every viral moment and you''ve built a whole new merch tier.',
    'not_contacted',
    'Added from LE2026 research audit (pass 5). DAN LEAD. Soccer Pavilion.'),

  ('Diego Maradona Estate', 'nice_to_meet', 'sports', 'anchor_pair_plus_dan', 'moderate',
    'Rights representation for Diego Maradona in Soccer Pavilion. Legacy iconic footballer with active collector market.',
    'Graded Maradona memorabilia. Iconic legacy-player market with long-tail collector demand.',
    'Maradona memorabilia is already a $100M+ secondary market. A first-party graded program is the product line that doesn''t exist yet.',
    'not_contacted',
    'Added from LE2026 research audit (pass 5). DAN LEAD. May be represented under a rights-agent entity name on the floor plan.'),

  ('The Brand Liaison', 'opportunistic', 'agent', 'anchor_pair', 'moderate',
    'Silver Sponsor of the Licensing Expo 2026 Opening Night Party. Multi-brand licensing agency.',
    'ONP sponsorship signals active LE investment. Multi-brand agent = efficient meeting.',
    'You''re the Silver to TreImage''s Platinum. Between the two of you that''s a big slice of the small-to-mid-cap licensing market. We want to be on your recommendation list.',
    'not_contacted',
    'Added from LE2026 research audit (pass 5). Booth TBD but almost certainly has visible floor presence given sponsorship level.')
on conflict (company_name) do nothing;

-- =============================================================
-- PART 3 — RETAIL-PASS BUYERS (no booth by design)
-- These attend as verified retailers on the free Retail Pass.
-- Schedule meetings via Event Planner; they do not have floor booths.
-- =============================================================
insert into public.targets (company_name, tier, track, coverage_unit, priority, proof_point, status, notes)
values
  ('Abercrombie & Fitch', 'retailer', 'retail', 'anchor_pair', 'moderate',
    'Retail-pass buyer confirmed in Informa''s March 11, 2026 release. Gen Z/millennial apparel. Active licensing collaborations (Emily in Paris, other IP collabs).',
    'not_contacted',
    'Added from LE2026 research audit (pass 5). BUYER, NOT EXHIBITOR — no booth. Schedule via Event Planner. Retail Lounge access.'),

  ('Coach', 'retailer', 'retail', 'anchor_pair', 'moderate',
    'Retail-pass buyer. Tapestry Inc. flagship brand. Premium positioning with strong licensing collab history.',
    'not_contacted',
    'Added from LE2026 research audit (pass 5). BUYER — schedule via Event Planner.'),

  ('Converse Inc.', 'retailer', 'retail', 'anchor_pair', 'moderate',
    'Retail-pass buyer. Nike subsidiary. Heavy IP collab program — Stranger Things, Peanuts, Space Jam, BT21, etc.',
    'not_contacted',
    'Added from LE2026 research audit (pass 5). BUYER — schedule via Event Planner.'),

  ('Gap Inc.', 'retailer', 'retail', 'anchor_pair', 'moderate',
    'Retail-pass buyer. Gap, Old Navy, Banana Republic, Athleta portfolio. Regular IP collab purchaser.',
    'not_contacted',
    'Added from LE2026 research audit (pass 5). BUYER — schedule via Event Planner.'),

  ('H&M', 'retailer', 'retail', 'anchor_pair', 'moderate',
    'Retail-pass buyer. Fast-fashion with heavy IP collab cadence.',
    'not_contacted',
    'Added from LE2026 research audit (pass 5). BUYER — schedule via Event Planner.'),

  ('Inditex S.A.', 'retailer', 'retail', 'anchor_pair', 'moderate',
    'Retail-pass buyer. Parent of Zara, Pull&Bear, Bershka, Stradivarius, Massimo Dutti, Oysho. World''s largest fast-fashion conglomerate.',
    'not_contacted',
    'Added from LE2026 research audit (pass 5). BUYER — schedule via Event Planner. Highest-leverage retailer in this cohort.'),

  ('The Home Depot', 'retailer', 'retail', 'anchor_pair', 'low',
    'Retail-pass buyer. Unusual for LE — home-improvement retailer rarely a licensing lane, but attending means they''re prospecting.',
    'not_contacted',
    'Added from LE2026 research audit (pass 5). BUYER — schedule via Event Planner. Low priority but worth a 15-min probe given unusual attendance signal.'),

  ('TJX Companies', 'retailer', 'retail', 'anchor_pair', 'moderate',
    'Retail-pass buyer. T.J. Maxx, Marshalls, HomeGoods, Sierra, Homesense. Off-price channel for licensed product closeouts.',
    'not_contacted',
    'Added from LE2026 research audit (pass 5). BUYER — schedule via Event Planner. Off-price channel for overstock graded product.'),

  ('Wild Cosmetics', 'retailer', 'retail', 'anchor_pair', 'low',
    'Retail-pass buyer named alongside Unilever in Informa''s March 11 release. Unilever-owned personal care brand.',
    'not_contacted',
    'Added from LE2026 research audit (pass 5). BUYER — schedule via Event Planner. Low priority; mention in any Unilever conversation.')
on conflict (company_name) do nothing;
