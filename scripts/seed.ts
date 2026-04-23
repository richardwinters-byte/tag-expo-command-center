/**
 * TAG Expo Command Center — Seed Script
 *
 * Seeds the allowlist, targets (from Target Brief), scheduled keynotes/parties,
 * and baseline competitive intel.
 *
 * Usage:
 * 1. Fill in .env.local with SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY
 * 2. pnpm seed (or npm run seed)
 *
 * Idempotent: safe to re-run. Uses upserts where possible.
 */
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import path from 'path';

config({ path: path.resolve(process.cwd(), '.env.local') });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
 console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
 process.exit(1);
}

const supabase = createClient(url, key, {
 auth: { persistSession: false, autoRefreshToken: false },
});

// =============================================================
// 1. ALLOWLIST - parse from env
// =============================================================
const allowlistEmails = (process.env.ALLOWLIST_EMAILS ??
 'richard@taggrading.com,michael@taggrading.com'
).split(',').map(e => e.trim().toLowerCase()).filter(Boolean);

if (allowlistEmails.length < 2) {
 throw new Error(
   `[seed] ALLOWLIST_EMAILS must contain at least 2 comma-separated emails (Richard + Michael). Got ${allowlistEmails.length}: ${JSON.stringify(allowlistEmails)}`
 );
}

const [richardEmail, michaelEmail, ...extraEmails] = allowlistEmails;

const allowlist = [
 { email: richardEmail, name: 'Richard Winterstern', role: 'admin', color: '#0B2F31' },
 { email: michaelEmail, name: 'Michael Cook', role: 'admin', color: '#14595B' },
 // Any additional emails get seeded as admins with placeholder names so they're invitable
 // without another code change. Richard can rename them in the DB afterward.
 ...extraEmails.map((email, i) => ({
   email,
   name: email.split('@')[0] || `Admin ${i + 3}`,
   role: 'admin' as const,
   color: ['#C08A30', '#8B2A1F', '#0F7B4A'][i % 3],
 })),
];

// =============================================================
// 2. TARGETS - full roster from TAG_LicensingExpo2026_TargetBrief
// =============================================================
type Target = {
  company_name: string;
  tier: 'tier_1' | 'tier_2' | 'tier_3' | 'nice_to_meet' | 'opportunistic' | 'retailer';
  track: 'entertainment_ip' | 'sports' | 'cpg_backflip' | 'japanese_ip' | 'retail' | 'agent' | 'competitor' | 'new_surfaced';
  coverage_unit: 'anchor_pair';
  priority: 'highest' | 'high' | 'moderate' | 'low' | 'opportunistic';
  booth_number?: string;
  key_contacts?: { name: string; title: string }[];
  proof_point: string;
  pitch_angle: string;
  opener: string;
  notes?: string;
};

const targets: Target[] = [
 // ---------- TIER 1 ENTERTAINMENT & IP ----------
 {
 company_name: 'Panini America',
 tier: 'tier_1',
 track: 'sports',
 coverage_unit: 'anchor_pair',
 priority: 'highest',
 proof_point: 'First-ever Licensing Expo exhibitor (Informa, Feb 19, 2026). NBA exclusive ended 2025; Fanatics takes exclusive NFL card rights April 1, 2026. Panini signed Sonic the Hedgehog Gotta Go Fast TCG deal with WildBrain CPLG (Oct 2025) — their first major non-sports pivot.',
 pitch_angle: 'Tier 1 Manufacturer Partnership at $25/slab Tier 1 / 75% pass rate / sub-9 raw return at $8.50. Pair with NoWhyProjects $0.80–$0.85/slab unit economics. Layer TAG Customs for a Sonic 35th anniversary co-branded slab tied directly to the existing Panini x WildBrain CPLG deal.',
 opener: "You're the only card manufacturer on this floor — which is the whole point. We're the only grader here, too. Let's solve your Sonic program and your entertainment pipeline in one deal.",
 },
 {
 company_name: 'The Pokémon Company International',
 tier: 'tier_1',
 track: 'japanese_ip',
 coverage_unit: 'anchor_pair',
 priority: 'highest',
 key_contacts: [
 { name: 'Kenji Okubo', title: 'President' },
 { name: 'Amy Sachtleben', title: 'Sr. Director, Licensing & Promotion' },
 ],
 proof_point: 'Excell Brands acquisition announced Feb 19, 2026 (30-year TCG distribution partner). Target 30th-anniversary exclusive collection launched April 15, 2026 — 100+ items, Joe Jonas campaign. First-ever LEGO Pokémon sets launched February 2026 ($649.99 flagship).',
 pitch_angle: 'TAG Customs co-branded 30th-anniversary graded slabs. Position TAG as the domestic authentication layer complementary to Excell\'s U.S. distribution footprint. Retail integration with Walmart/Target counters CGC Gems of the Game.',
 opener: "Your Excell acquisition and the Target 30th-anniversary drop tell us you're building a vertical U.S. physical-product stack. We're the domestic authentication piece, and the team handles the Tokyo side.",
 },
 {
 company_name: 'Hasbro / Wizards of the Coast',
 tier: 'tier_1',
 track: 'entertainment_ip',
 coverage_unit: 'anchor_pair',
 priority: 'highest',
 key_contacts: [
 { name: 'Tim Kilpin', title: 'President, Toy, Licensing & Entertainment' },
 { name: 'Marianne James', title: 'SVP Global Licensing' },
 ],
 proof_point: 'Magic x TMNT Universes Beyond released March 6, 2026 — first UB set Standard-legal; Kevin Eastman artist cards; 4 Commander decks. Co-master toy licensee with Mattel for Netflix KPop Demon Hunters. D&D Fan Expo launching London 2026. MagicCon Las Vegas ran May 1–3.',
 pitch_angle: 'Custom MTG Universes Beyond graded singles. TMNT x MTG co-branded slab. "Proof-of-play" graded encapsulation for tournament-heritage cards. Layer D&D 50th-anniversary collectibles program.',
 opener: "Two conversations: MTG singles grading at a price Wizards can defend to distributors, and a custom D&D collectible line that doesn't look like every other merch booth.",
 booth_number: 'G170',
 notes: '[MYS EXHIBITOR NAME: "Hasbro Licensed Consumer Products"] Same booth G170 (logged from floor plan 0004). Request a WotC / Magic licensing rep when scheduling.',
 },
 {
 company_name: 'Netflix',
 tier: 'tier_1',
 track: 'entertainment_ip',
 coverage_unit: 'anchor_pair',
 priority: 'highest',
 key_contacts: [{ name: 'Marian Lee', title: 'CMO (Tue 10:00 AM Keynote)' }],
 proof_point: 'Marian Lee keynote Tuesday 10:00 AM. Netflix installed Hasbro and Mattel as co-master toy licensees for KPop Demon Hunters — first-ever dual structure. Film: 325M views in 91 days. Stranger Things Season 5 final-season CP rollout active. Netflix House Las Vegas opens 2027.',
 pitch_angle: 'Limited-drop TAG-graded HUNTR/X trading cards as in-pack premiums, tied to both S5 final-season and Netflix House Vegas launch. Position as the physical-collectible layer Netflix does not yet own.',
 opener: "Marian just told 5,000 people fandom is the product. We turn Netflix fandom into a graded physical artifact — not another plush.",
 notes: '[KEYNOTE ACCESS — no booth] Marian Lee, CMO Netflix, keynoting Tue May 19 10 AM in License Global Theater. Anchor pair attends keynote, works post-keynote reception. | [CONFIRMED NO BOOTH — Event Planner Apr 19, 2026] Not in exhibitor directory. Meeting path is the Marian Lee keynote Tue 10 AM and post-keynote reception only.',
 },
 {
 company_name: 'Warner Bros. Discovery',
 tier: 'tier_1',
 track: 'entertainment_ip',
 coverage_unit: 'anchor_pair',
 priority: 'high',
 proof_point: 'Superman Day 2026 global program April 18 (Daily Planet pop-ups LA/Milan/Fuzhou; Superman Experience: Defenders Unite LBE at WB Studios Burbank). Wicked Part 2 and White Lotus S4 cycles active. DC Superman Fortress of Solitude photo-op on-floor.',
 pitch_angle: 'Cinematic-universe slab program for DC — four licensees today, no WBD-branded graded experience. Wicked movie-tie-in premium trading card retail drop. Harry Potter 25th anniversary collectibles positioning for 2027.',
 opener: "DC has a card program across four licensees; none offer a WBD-branded graded experience. That's the product.",
 },
 {
 company_name: 'The LEGO Group',
 tier: 'tier_1',
 track: 'entertainment_ip',
 coverage_unit: 'anchor_pair',
 priority: 'high',
 proof_point: 'LEGO Pokémon partnership (biggest license win since Star Wars, per Jan 12 reveal). Full AFOL portfolio expansion: F1, Mario, Zelda, Animal Crossing, Game Boy. SMART Brick set 72164 Pikachu\'s Training House launches summer 2026. $1B Virginia plant topped out October 2025.',
 pitch_angle: 'TAG Customs collectible card program for AFOLs and the Collectible Minifigures line. A LEGO Pokémon graded moment maps onto both LEGO\'s and Pokémon\'s 30th-anniversary momentum.',
 opener: "AFOLs already grade sealed LEGO sets through aftermarket authenticators. You could own that program and make it official.",
 },
 {
 company_name: 'Mattel',
 tier: 'tier_1',
 track: 'entertainment_ip',
 coverage_unit: 'anchor_pair',
 priority: 'high',
 key_contacts: [{ name: 'Roberto Stanichi', title: 'Chief Global Brand Officer' }],
 proof_point: 'Stanichi is KPop Demon Hunters lead spokesperson. Hot Wheels, Barbie, UNO, American Girl active. MEGA no longer producing Pokémon (Dec 2025 license expiration) — opens space for Mattel to rebuild collector-grade IP vertical.',
 pitch_angle: 'Hot Wheels premium graded insert cards (natural Backflip Playbook analog). Barbie 65th+ anniversary custom slabs. UNO co-brand graded drops. Position TAG as the grading partner Mattel does not yet have locked.',
 opener: "Hot Wheels has a billion-dollar grey-market grading economy. Mattel doesn't get a cent of it. We fix that.",
 },
 {
 company_name: 'Paramount Global',
 tier: 'tier_1',
 track: 'entertainment_ip',
 coverage_unit: 'anchor_pair',
 priority: 'high',
 proof_point: 'MTG x TMNT Universes Beyond (March 6, 2026) is the tentpole co-brand of the show. Tales of the TMNT Season 2 and TMNT: Empire City VR in market. Paramount on Roblox content panel. Star Trek 60th anniversary 2026.',
 pitch_angle: 'TMNT custom slab run targeted at the MTG crossover audience — first-party Paramount graded product that currently runs through licensees. Star Trek 60th anniversary graded program.',
 opener: "TMNT is live in MTG right now — that's the crossover we want to graduate into a first-party Paramount graded collectible, not a licensee afterthought.",
 },
 {
 company_name: 'SEGA',
 tier: 'tier_1',
 track: 'japanese_ip',
 coverage_unit: 'anchor_pair',
 priority: 'high',
 key_contacts: [
 { name: 'Ivo Gerscovich', title: 'Head of SEGA Brands, CBO Sonic' },
 { name: 'Marcella Churchill', title: 'VP SEGA/Atlus Brand Marketing, SEGA of America' },
 ],
 proof_point: 'Sonic 35th anniversary "Fast Forever" campaign launched January 15, 2026. WildBrain CPLG rollout with Puma, UHU, Panini, LC Waikiki, PXL energy drinks (Nordics), Cuétara (Iberia), Eurospin (Italy, 1,100 stores), Hachette Livre (France).',
 pitch_angle: 'Highest-conviction single pitch. Sonic 35th anniversary TAG-graded Panini card tie-in. Panini is already a WildBrain CPLG licensee for Sonic, and all three are at the show. A trilateral meeting (TAG + SEGA + Panini, brokered through WildBrain CPLG) is realistic to book inside the show week.',
 opener: "Sonic is 35. You have a graded anniversary collectible window that closes if someone else gets there first.",
 },

 // ---------- TIER 1 SPORTS ----------
 {
 company_name: 'MLB Players Inc.',
 tier: 'tier_1',
 track: 'sports',
 coverage_unit: 'anchor_pair',
 priority: 'high',
 key_contacts: [
 { name: 'Evan Kaplan', title: 'President, MLB Players Inc.' },
 { name: 'Florence Louisgrand', title: 'VP Licensing, MLBPA' },
 ],
 proof_point: 'MLBPI–Caesars Entertainment multi-year NIL licensing deal via OneTeam Partners (April 15, 2026). MLBPI featured in a dedicated LE 2026 session.',
 pitch_angle: 'Grading-as-a-service for player-NIL memorabilia and fan cards outside the Fanatics exclusive lane.',
 opener: "Fanatics has your cards. We do everything that isn't a card — graded patches, graded tickets, graded memorabilia — at a cost structure that protects league margin.",
 },
 {
 company_name: 'NFLPA / NFL Players Inc.',
 tier: 'tier_1',
 track: 'sports',
 coverage_unit: 'anchor_pair',
 priority: 'high',
 key_contacts: [{ name: 'Ben Ruiz', title: 'VP Consumer Products, NFL Players Inc.' }],
 proof_point: 'Ben Ruiz confirmed at the Sports Licensing Summit preceding the show. Player NIL rights are separate from NFL league marks, opening a clean wedge against Fanatics\' new card exclusive.',
 pitch_angle: 'Custom slabs and authentication for player-controlled memorabilia and group-rights cards.',
 opener: "Fanatics has the league. You have the players. We do the collectible the players can actually control and monetize.",
 },
 {
 company_name: 'NASCAR',
 tier: 'tier_1',
 track: 'sports',
 coverage_unit: 'anchor_pair',
 priority: 'high',
 key_contacts: [
 { name: 'Megan Malayter', title: 'Managing Director, Licensing & Consumer Products' },
 { name: 'Michelle Byron', title: 'EVP & Chief Partnership & Licensing Officer' },
 ],
 proof_point: 'Justice x NASCAR tween apparel launch Jan 7, 2026. Coca-Cola partnership extension with BodyArmor as Official Sports Drink, Feb 12, 2026. Panini holds NASCAR card rights.',
 pitch_angle: 'Grading-as-a-service for driver memorabilia. TAG Customs limited-edition program tied to individual drivers.',
 opener: "Every NASCAR card manufacturer you license pays someone to grade them. We want to be the one that ships graded product into retail with the NASCAR mark on the slab.",
 },
 {
 company_name: 'Real Madrid FC',
 tier: 'tier_1',
 track: 'sports',
 coverage_unit: 'anchor_pair',
 priority: 'high',
 proof_point: 'LEGO Ronaldo/Messi/Mbappé/Vini Jr. football sets launched April 6, 2026. No Fanatics exclusive covers most non-U.S. football memorabilia. First-time LE exhibitor in new Soccer Pavilion. European football trading cards are the fastest-growing category outside Fanatics\' reach.',
 pitch_angle: 'Premium European football card grading for a U.S.-facing Real Madrid program. Custom slabs tied to the 2026 World Cup calendar and the Socios member program.',
 opener: "Your socios program is the most valuable fan-identity asset in club football. We turn that into a graded, serialized physical collectible you own end-to-end.",
 },
 {
 company_name: 'Newcastle United FC',
 tier: 'tier_1',
 track: 'sports',
 coverage_unit: 'anchor_pair',
 priority: 'high',
 proof_point: 'PIF-owned; aggressive global brand push. 2023–2028 adidas kit deal (£30M–£40M/season). Champions League quarter-final vs FC Barcelona March 2026. Smaller licensing organization than Real Madrid = faster decisions.',
 pitch_angle: 'Memorabilia authentication for a non-Fanatics fan base. Win the first call.',
 opener: "You're the only Premier League club on this floor. That means you're building a U.S. collectibles program from a clean sheet — we'd rather be the first call than the third.",
 },
 {
 company_name: 'Association of Tennis Professionals (ATP)',
 tier: 'tier_1',
 track: 'sports',
 coverage_unit: 'anchor_pair',
 priority: 'moderate',
 proof_point: 'New CEO Eno Polo (replaced Massimo Calvelli in 2025). 2026 calendar change for Saudi tournament. New Levy UK & Ireland merchandising deal. Nitto renewed as finals title sponsor through 2030. PTPA lawsuit ongoing.',
 pitch_angle: 'Grading-as-a-service for the emerging tennis card market. The Alcaraz/Sinner era creates a fresh collectibles narrative with no legacy grader locked in.',
 opener: "Topps does your sticker books. Nobody does your graded player collectibles. That's a category you could own before Fanatics notices.",
 notes: '[NOT IN PLANNER DIRECTORY — Apr 19, 2026] Searched exhibitor list; no booth returned. Informa\'s March 11 major-exhibitor release named them but Planner is source of truth. Pursue via networking events or off-show follow-up.',
 },

 // ---------- TIER 1 CPG / BACKFLIP LANE ----------
 {
 company_name: 'CAA Brand Management',
 tier: 'tier_1',
 track: 'agent',
 coverage_unit: 'anchor_pair',
 priority: 'highest',
 key_contacts: [{ name: 'Allison Ames', title: 'Co-President (F&B Keynote Moderator)' }],
 proof_point: 'CAA Brand Management acquired Beanstalk (announced Nov 19, 2025; closed Feb 9, 2026). One meeting = 20+ global consumer brands. Combined roster: Coca-Cola, Kellanova, Stanley, P&G brands, HGTV, Paramount F&B, Goodyear, Dole, WK Kellogg, Guinness, Baileys, CPK, The Cheesecake Factory. Crayola x Ms. Rachel (Feb 13, 2026).',
 pitch_angle: 'Backflip case study + TAG Customs. Position as the single execution partner for the graded-collectible version of every brand on their roster.',
 opener: "Your F&B keynote is literally our pitch. We're the execution partner for the graded, collectible version of every brand you represent.",
 },
 {
 company_name: 'Mars Snacking',
 tier: 'tier_1',
 track: 'cpg_backflip',
 coverage_unit: 'anchor_pair',
 priority: 'highest',
 key_contacts: [{ name: 'David Lee', title: 'Sr. Director, Global Licensing & Cultural Marketing (F&B Keynote Panelist)' }],
 proof_point: 'Mars completed Kellanova acquisition 2025–26 — Pringles and Cheez-It now join M&Ms, Snickers, Skittles, Twix. Pringles x Crocs collab cited by organizers in pre-show coverage.',
 pitch_angle: 'Cheez-It / Pringles limited-edition collectible graded card drop. Direct parallel to the Pringles x Crocs positioning Mars is publicly endorsing.',
 opener: "You're on the Pringles x Crocs side of the keynote. The other side is Skittles packs with a graded card in them. We make that.",
 notes: '[F&B PANEL ACCESS — no booth] David Lee, Sr. Director Global Licensing & Cultural Marketing. Panelist on Beyond the Plate keynote Wed May 20 12:30 PM. Highest-leverage F&B keynote meeting. Work post-panel reception.',
 },
 {
 company_name: 'The Coca-Cola Company',
 tier: 'tier_1',
 track: 'cpg_backflip',
 coverage_unit: 'anchor_pair',
 priority: 'highest',
 proof_point: 'Coca-Cola invented brand licensing. Recent Oreo collab and Marvel tie-ins. Extended NASCAR partnership with BodyArmor as Official Sports Drink, Feb 12, 2026. Represented by CAA Brand Management.',
 pitch_angle: 'Backflip Playbook for a Coca-Cola limited-drop. The simplest and most iconic CPG collectible use case on the floor.',
 opener: "Shaun Neff's cereal put 500,000 of our cards into grocery. Coke could do the same number at lunchtime.",
 booth_number: 'B154',
 notes: '[BOOTH B154 CONFIRMED — Event Planner Apr 19, 2026] Own booth confirmed. CAA G156 remains a complementary access path.',
 },
 {
 company_name: 'PepsiCo',
 tier: 'tier_1',
 track: 'cpg_backflip',
 coverage_unit: 'anchor_pair',
 priority: 'highest',
 proof_point: 'Explicitly called out by organizers as "entering the licensing arena" for 2026 (new-to-show exhibitor). Mountain Dew, Gatorade, Frito-Lay (Lay\'s, Doritos, Cheetos). PepsiCo acquired Poppi (~$2B) during 2025.',
 pitch_angle: 'Mountain Dew is the single highest-velocity CPG-to-collector match on the floor. Backflip cereal insert economics translate directly to chip-bag or 12-pack inserts.',
 opener: "Mountain Dew's Gen-Z collab history already lives in the collectibles aisle. We're the graded, authenticated version of that.",
 notes: '[NOT IN PLANNER DIRECTORY — Apr 19, 2026] Searched exhibitor list; no booth returned. Informa\'s March 11 major-exhibitor release named them but Planner is source of truth. Possible reasons: attending as speaker/panelist/buyer, listed under a different legal name, or late addition. Do not spend floor time hunting — pursue via networking events, panels, or off-show follow-up.',
 },
 {
 company_name: 'Liquid Death',
 tier: 'tier_1',
 track: 'cpg_backflip',
 coverage_unit: 'anchor_pair',
 priority: 'high',
 key_contacts: [{ name: 'Andy Pearson', title: 'VP Creative' }],
 proof_point: 'Named in F&B keynote release. Entire marketing engine is limited drops and collabs. Pearson on record that no category is off-limits.',
 pitch_angle: 'TAG-graded "collector death card" drops — pre-graded and authenticated at source, keeping the secondary margin inside Liquid Death.',
 opener: "Every Liquid Death collab ends up on eBay graded by someone. Next one, you ship it pre-graded and keep the secondary margin.",
 booth_number: 'O236',
 notes: '[BOOTH CONFIRMED O236 — Event Planner Apr 19, 2026] Anchor pair. Named in Informa March 11 major-exhibitor release. Backflip Playbook target: \'every Liquid Death collab ends up graded on eBay anyway — ship it pre-graded, keep the secondary margin.\'',
 },
 {
 company_name: 'Pacsun',
 tier: 'tier_1',
 track: 'cpg_backflip',
 coverage_unit: 'anchor_pair',
 priority: 'high',
 key_contacts: [{ name: 'Richard Cox', title: 'Chief Merchandising Officer (F&B Keynote Panelist)' }],
 proof_point: 'Richard Cox confirmed F&B panelist. Pacsun x McDonald\'s collab cited in pre-coverage. Gen Z audience skewing toward collectible/streetwear adjacency.',
 pitch_angle: 'Retail integration for TAG custom slab-in-retail-environment as counter to CGC Gems of the Game at Walmart. Pacsun\'s audience is the demographic CGC cannot reach.',
 opener: "Your Mars panel is half the pitch. The other half is where graded collectibles live in the store — and we're that product.",
 notes: '[F&B PANEL ACCESS — no booth] Richard Cox, Chief Merchandising Officer. Panelist on Beyond the Plate keynote Wed May 20 12:30 PM. Work post-panel reception.',
 },
 {
 company_name: 'General Mills',
 tier: 'tier_1',
 track: 'cpg_backflip',
 coverage_unit: 'anchor_pair',
 priority: 'highest',
 proof_point: 'Called out by Licensing Magazine as attending manufacturer. #1 direct Backflip proof-point retarget. Lucky Charms, Trix, Cinnamon Toast Crunch, Cocoa Puffs — precise analogs to the Backflip cereal case study.',
 pitch_angle: 'Repeat the exact Backflip motion at larger scale — $0.096/card at 500K+ volume, 40% margin, food-grade coating, already proven at retail.',
 opener: "Shaun Neff's cereal put 500,000 graded cards in grocery. Yours can do 50 million. Let's talk.",
 notes: '[ATTENDEE NOT EXHIBITOR] Feb 19 Informa release names General Mills in the "manufacturers attending" paragraph (same tier as Walmart/Target buyers). No booth. Meet via Event Planner attendee search, not exhibitor floor.',
 },
 {
 company_name: 'Krispy Kreme',
 tier: 'tier_1',
 track: 'cpg_backflip',
 coverage_unit: 'anchor_pair',
 priority: 'high',
 proof_point: 'Krispy Kreme x Hershey\'s "Chocomania" collab Jan 27–Feb 1, 2026. New-to-show 2026 exhibitor — actively prospecting for licensing partners.',
 pitch_angle: 'Limited-drop QR-coded TAG-graded card as in-box premium in Krispy Kreme boxes. Marquee Backflip-style activation.',
 opener: "Your Hershey's collab proved the fan demand. The next layer is a graded collectible that makes the box itself a keepsake.",
 notes: '[NOT IN PLANNER DIRECTORY — Apr 19, 2026] Searched exhibitor list; no booth returned. Was named as new-to-show in 2025; 2026 re-appearance not confirmed. Do not spend floor time hunting.',
 },
 {
 company_name: 'Bath & Body Works',
 tier: 'tier_1',
 track: 'cpg_backflip',
 coverage_unit: 'anchor_pair',
 priority: 'high',
 proof_point: 'F&B keynote panelist (name TBA as of April 17). New CEO Daniel Heaf. Amazon marketplace launch. Disney Princess 2026 collection (Feb 2026).',
 pitch_angle: 'Fragrance-brand collectible card in-pack premium. Clean "beauty meets TCG" narrative that no grader currently owns.',
 opener: "Your Disney Princess collection sells out every drop. A graded collector-card inside each fragrance set makes that drop permanent.",
 notes: '[F&B PANEL ACCESS — no booth] Brian Talbot, VP Brand Partnerships. Panelist on Beyond the Plate keynote Wed May 20 12:30 PM. Work post-panel reception.',
 },
 {
 company_name: 'Unilever',
 tier: 'tier_1',
 track: 'cpg_backflip',
 coverage_unit: 'anchor_pair',
 priority: 'moderate',
 proof_point: 'Called out in Licensing Magazine attending-manufacturer list. Cross-category CPG giant; licensing-heavy on fandom drops. Dove, Axe, Ben & Jerry\'s legacy brands.',
 pitch_angle: 'Personal-care graded trading-card premium. Dove 70th anniversary and Axe limited-drop lanes both viable.',
 opener: "You're here because you buy licenses. We're the only grader that ships a licensed product, not a service.",
 notes: '[ATTENDEE NOT EXHIBITOR] Feb 19 Informa release names Unilever in the "manufacturers attending" paragraph. No booth. Meet via Event Planner attendee search.',
 },
 {
 company_name: 'Fruit of the Loom',
 tier: 'tier_1',
 track: 'cpg_backflip',
 coverage_unit: 'anchor_pair',
 priority: 'opportunistic',
 proof_point: 'Confirmed attending (Licensing Magazine). Apparel-adjacent IP partner brand programs.',
 pitch_angle: 'Apparel co-brand with TAG-graded collectible insert.',
 opener: "Apparel brands sit on a lot of graphic IP. We turn that IP into a graded physical object that isn't a T-shirt.",
 notes: '[ATTENDEE NOT EXHIBITOR] Feb 19 Informa release names Fruit of the Loom in the "manufacturers attending" paragraph. No booth. Meet via Event Planner attendee search.',
 },

 // ---------- NICE-TO-MEET ----------
 {
 company_name: 'Sony Pictures Entertainment / Crunchyroll',
 tier: 'nice_to_meet',
 track: 'entertainment_ip',
 coverage_unit: 'anchor_pair',
 priority: 'moderate',
 proof_point: 'Anime IP + Sony retail ecosystem; Crunchyroll consumer products expanding. HAYATE Inc. anime JV (Mar 2025); Ghost of Tsushima anime (2027).',
 pitch_angle: 'Anime collectible graded program. Crunchyroll consumer products layer.',
 opener: "The anime collectible market runs on unofficial grading today. You could own it.",
 },
 {
 company_name: 'Amazon MGM Studios',
 tier: 'nice_to_meet',
 track: 'entertainment_ip',
 coverage_unit: 'anchor_pair',
 priority: 'moderate',
 proof_point: 'James Bond, LOTR; Amazon retail channel integration (counter to Walmart/CGC). The Hunt for Gollum (2026/27); 007 licensing refresh under Amazon.',
 pitch_angle: 'Retail integration via Amazon channel. 007 graded collectible program.',
 opener: "Your 007 refresh under Amazon is a clean-sheet collectibles moment. We'd like to be in that conversation.",
 },
 {
 company_name: 'MINISO',
 tier: 'nice_to_meet',
 track: 'retail',
 coverage_unit: 'anchor_pair',
 priority: 'moderate',
 proof_point: '7,000+ stores globally; major Sanrio / Disney / MLB / Japanese IP retailer. Ada Dou was 2025 Head of IP Licensing; 2026 title TBC.',
 pitch_angle: 'Retail integration for TAG custom slabs in a global chain outside Walmart.',
 opener: "You're in 7,000 stores. We ship authenticated physical collectibles. Let's find one IP and one program.",
 },
 {
 company_name: 'BBC Studios',
 tier: 'nice_to_meet',
 track: 'entertainment_ip',
 coverage_unit: 'anchor_pair',
 priority: 'moderate',
 proof_point: 'Bluey tentpole; Dr. Who 2026 programming. Bluey launching across six Japanese national TV networks 2025/26.',
 pitch_angle: 'Bluey collectibles; Dr. Who 60th+ anniversary graded program.',
 opener: "Bluey and Dr. Who both have collector bases that already grade aftermarket. We fix that.",
 },
 {
 company_name: 'Funko',
 tier: 'nice_to_meet',
 track: 'entertainment_ip',
 coverage_unit: 'anchor_pair',
 priority: 'high',
 proof_point: 'Entire business is limited-drop collectibles. Funko Grails aftermarket is 100% unofficially authenticated today — grading gap is obvious.',
 pitch_angle: 'Official Funko Grails authentication partnership.',
 opener: "Grails is already graded — just not by you. That's revenue leaving the building.",
 notes: '[NOT IN PLANNER DIRECTORY — Apr 19, 2026] Searched exhibitor list; no booth returned. Toy Book Feb 23 named them as "confirmed participant" but Planner is source of truth. Possible reasons: attending as speaker/panelist/buyer, listed under a different legal name, or late addition. Do not spend floor time hunting — pursue via networking events, panels, or off-show follow-up.',
 },
 {
 company_name: 'Crayola',
 tier: 'nice_to_meet',
 track: 'entertainment_ip',
 coverage_unit: 'anchor_pair',
 priority: 'moderate',
 key_contacts: [{ name: 'Kimberly Rompilla', title: 'SVP Global Licensing' }],
 proof_point: 'Crayola x Ms. Rachel (Feb 13, 2026) brokered by CAA. Family-segment retail; kids/nostalgia category.',
 pitch_angle: 'Nostalgia-driven graded art card series.',
 opener: "Crayola has 100+ years of art that's never been a collector category. We could make that a first.",
 },
 {
 company_name: 'Artestar',
 tier: 'nice_to_meet',
 track: 'agent',
 coverage_unit: 'anchor_pair',
 priority: 'moderate',
 proof_point: 'Keith Haring / Basquiat / Warhol Foundation licensing — ultra-premium positioning. Fine-art IP collectibles lane has no grading competitor.',
 pitch_angle: 'Ultra-premium fine-art graded collectibles. No competitor in this lane.',
 opener: "Haring, Basquiat, Warhol — nobody has a graded collector product in this lane. We'd like to build the first.",
 },
 {
 company_name: 'Jewel Branding & Licensing',
 tier: 'nice_to_meet',
 track: 'agent',
 coverage_unit: 'anchor_pair',
 priority: 'moderate',
 proof_point: 'Premium lifestyle/art IP; New York Botanical Garden. Smaller agent, roster fit for lifestyle-first drops.',
 pitch_angle: 'Lifestyle-first graded collectible drops.',
 opener: "Your roster skews lifestyle and art. We ship that as a permanent physical object.",
 },
 {
 company_name: 'Ceremony of Roses',
 tier: 'nice_to_meet',
 track: 'entertainment_ip',
 coverage_unit: 'anchor_pair',
 priority: 'moderate',
 key_contacts: [{ name: 'Brad Scoffern', title: 'Founder' }],
 proof_point: 'Sony Music global merch flagship; Adele / Olivia Rodrigo / A$AP Rocky. Absorbed Thread Shop division.',
 pitch_angle: 'Music-tour graded collectible program.',
 opener: "Music merch lives and dies at the show. A graded collectible lives forever.",
 },
 {
 company_name: 'WildBrain CPLG',
 tier: 'nice_to_meet',
 track: 'agent',
 coverage_unit: 'anchor_pair',
 priority: 'high',
 proof_point: 'Agency of record for Sonic x Panini; Peanuts; Teletubbies; Hasbro Gaming. Unlocks the three-way TAG + Panini + SEGA meeting.',
 pitch_angle: 'Broker the trilateral SEGA + Panini + TAG deal for Sonic 35th.',
 opener: "You broker Sonic for Panini. We grade for Panini. Let's run the Sonic 35th program through all three of us at the same table.",
 },
 {
 company_name: 'Riot Games',
 tier: 'nice_to_meet',
 track: 'entertainment_ip',
 coverage_unit: 'anchor_pair',
 priority: 'high',
 proof_point: 'Riftbound TCG launched Feb 13, 2026 — 4 sets in 2026 roadmap plus RQ circuit. Grading partner positioning from day one — explicit counter to CGC.',
 pitch_angle: 'TCG grading partner for Riftbound from day one — before CGC locks it in.',
 opener: "Riftbound is months old. Pick a grading partner before the aftermarket picks one for you.",
 },
 {
 company_name: 'Jazwares',
 tier: 'nice_to_meet',
 track: 'sports',
 coverage_unit: 'anchor_pair',
 priority: 'moderate',
 proof_point: 'FIFA World Cup 2026 Squishmallows; Roblox plush. In-pack graded card activation for FIFA 2026.',
 pitch_angle: 'FIFA 2026 in-pack graded card activation.',
 opener: "FIFA 2026 is in your portfolio. A graded trading card inside each Squishmallow drop doubles the collectible moment.",
 },
 {
 company_name: 'NBCUniversal',
 tier: 'nice_to_meet',
 track: 'entertainment_ip',
 coverage_unit: 'anchor_pair',
 priority: 'moderate',
 proof_point: 'Wicked Part 2, Jurassic World Rebirth, Minions/Despicable Me. 2026 slate creates multiple movie-tie-in lanes.',
 pitch_angle: 'Movie-tie-in graded collectible program across 2026 slate.',
 opener: "Three tentpoles in 2026. One graded collectible program that works across all three.",
 },
 {
 company_name: 'Ubisoft',
 tier: 'nice_to_meet',
 track: 'entertainment_ip',
 coverage_unit: 'anchor_pair',
 priority: 'moderate',
 proof_point: 'Gaming IP collectibles lane is under-served. Assassin\'s Creed Shadows; Rainbow Six; Far Cry.',
 pitch_angle: 'Gaming IP collector graded product.',
 opener: "Gaming IP has collectors but no graded products. That's the gap.",
 },
 {
 company_name: 'Calm',
 tier: 'nice_to_meet',
 track: 'cpg_backflip',
 coverage_unit: 'anchor_pair',
 priority: 'opportunistic',
 proof_point: 'Aggressive cross-category licensing posture. Wellness + limited-edition collectibility — exploratory.',
 pitch_angle: 'Wellness brand collectible meditation-card program.',
 opener: "Wellness and collectibility both reward permanence. Worth one conversation.",
 },

 // ---------- NEWLY SURFACED ----------
 {
 company_name: 'Tokyo Broadcasting Television Systems',
 tier: 'opportunistic',
 track: 'new_surfaced',
 coverage_unit: 'anchor_pair',
 priority: 'high',
 proof_point: 'New-to-show 2026 exhibitor. Drama IP and Japanese retail entry point. ',
 pitch_angle: 'Japanese drama IP collectible program.',
 opener: "First-year exhibitor means you're looking for partners. We'd like to be one.",
 booth_number: 'A188',
 notes: '[BOOTH CONFIRMED A188 — Event Planner Apr 19, 2026] Directory name: "Tokyo Broadcasting System Television, Inc. (TBS)".',
 },
 {
 company_name: 'Sophie La Girafe',
 tier: 'opportunistic',
 track: 'new_surfaced',
 coverage_unit: 'anchor_pair',
 priority: 'moderate',
 proof_point: 'New-to-show 2026 exhibitor. Premium baby/toddler IP with collab potential.',
 pitch_angle: 'Premium baby/toddler collab.',
 opener: "Premium baby brands are the stealth collectible lane — parents grade for their kids' kids.",
 booth_number: 'K235',
 notes: '[BOOTH CONFIRMED K235 — Event Planner Apr 19, 2026] Directory name: "Deliso Sophie la girafe" — Deliso is the parent French co. New-to-show 2026 per Feb 19 Informa release.',
 },
 {
 company_name: 'Republic Brands Group',
 tier: 'opportunistic',
 track: 'new_surfaced',
 coverage_unit: 'anchor_pair',
 priority: 'moderate',
 proof_point: 'New-to-show fashion IP portfolio. K-Swiss, Jason Wu, Current/Elliott. Retail-adjacent Backflip pitch.',
 pitch_angle: 'Fashion-IP graded collectible insert.',
 opener: "Fashion brands ship collectibles without knowing it. We're the authentication layer.",
 },
 {
 company_name: 'Roblox',
 tier: 'opportunistic',
 track: 'new_surfaced',
 coverage_unit: 'anchor_pair',
 priority: 'high',
 proof_point: 'New-to-show exhibitor. Digital-to-physical via Jazwares. 15-minute meeting worth it.',
 pitch_angle: 'Digital-to-physical graded collectible bridge.',
 opener: "Your users already value Robux. The next step is a physical graded object they can hold.",
 },
 {
 company_name: 'tokidoki',
 tier: 'opportunistic',
 track: 'new_surfaced',
 coverage_unit: 'anchor_pair',
 priority: 'moderate',
 proof_point: 'Confirmed exhibitor. Gen Z fashion-collectibles crossover.',
 pitch_angle: 'Gen Z fashion-collectible hybrid program.',
 opener: "Your audience already collects you. We just add the grade.",
 },
 {
 company_name: 'Killer Merch',
 tier: 'opportunistic',
 track: 'new_surfaced',
 coverage_unit: 'anchor_pair',
 priority: 'opportunistic',
 proof_point: 'Music/fashion merch; additional music-tour collectible lane.',
 pitch_angle: 'Music-tour graded merch.',
 opener: "Tour merch is a collectible category that nobody grades. We'd like to be the first.",
 },
 {
 company_name: 'Mossy Oak',
 tier: 'opportunistic',
 track: 'new_surfaced',
 coverage_unit: 'anchor_pair',
 priority: 'opportunistic',
 proof_point: 'Gen Z-targeting; outdoor-lifestyle collab potential.',
 pitch_angle: 'Outdoor-lifestyle collectible trading card series.',
 opener: "Outdoor lifestyle has a collectibles gap. Fifteen minutes?",
 },
 {
 company_name: 'GNC',
 tier: 'opportunistic',
 track: 'new_surfaced',
 coverage_unit: 'anchor_pair',
 priority: 'moderate',
 proof_point: 'Confirmed F&B-adjacent; supplement-bottle collectible insert opportunity.',
 pitch_angle: 'Supplement-bottle collectible insert.',
 opener: "Supplement bottles are the quiet CPG category. A graded card inside makes them collectible.",
 notes: '[NOT IN PLANNER DIRECTORY — Apr 19, 2026] Searched exhibitor list; no booth returned. Was named as new-to-show in 2025; 2026 re-appearance not confirmed. Do not spend floor time hunting.',
 },

 // ---------- RETAILERS ----------
 {
 company_name: 'Walmart',
 tier: 'retailer',
 track: 'retail',
 coverage_unit: 'anchor_pair',
 priority: 'highest',
 proof_point: 'Direct CGC Gems of the Game counter — MJ Holding program live in ~4,000 stores since May 2025. No publicly-announced expansion Nov 2025 – April 2026 — the window is open.',
 pitch_angle: 'TAG retail-slab economics ($0.80–$0.85/unit via NoWhyProjects) beat CGC retail cost structure.',
 opener: "Gems of the Game hasn't expanded in 11 months. We have better unit economics and more IP access. Let's build what comes next.",
 },
 {
 company_name: 'Target',
 tier: 'retailer',
 track: 'retail',
 coverage_unit: 'anchor_pair',
 priority: 'highest',
 proof_point: 'Pokémon 30th partner; confirmed April 15, 2026 launch with 100+ SKUs.',
 pitch_angle: 'TAG-graded Pokémon 30th anniversary retail SKU tied to the existing Target partnership.',
 opener: "You're already the Pokémon 30th retailer. A graded slab SKU inside that program is the next step.",
 },
 {
 company_name: 'Kohl\'s',
 tier: 'retailer',
 track: 'retail',
 coverage_unit: 'anchor_pair',
 priority: 'high',
 proof_point: 'Family demographic overlap. Tier 1 retailer in Informa-confirmed list.',
 pitch_angle: 'Family-segment collectible retail program.',
 opener: "Family retail is the under-served lane for collectibles. Worth a conversation.",
 },
 {
 company_name: 'Hot Topic / Urban Outfitters',
 tier: 'retailer',
 track: 'retail',
 coverage_unit: 'anchor_pair',
 priority: 'high',
 proof_point: 'Collector demographic alignment. Tier 2 retailer in Informa-confirmed list.',
 pitch_angle: 'Collector-first retail SKU.',
 opener: "Your customer already collects. A graded slab in your aisle is just the next step.",
 },
 {
 company_name: 'Barnes & Noble',
 tier: 'retailer',
 track: 'retail',
 coverage_unit: 'anchor_pair',
 priority: 'high',
 proof_point: 'Book/collectible crossover. Tier 2 retailer.',
 pitch_angle: 'Book-adjacent graded collectible (comics, graphic novels, art books + graded card).',
 opener: "Collector books and graded collectibles belong on the same shelf. We'd like to build that shelf.",
 },
];

// =============================================================
// 3. BASELINE COMPETITIVE INTEL
// =============================================================
const baselineIntel = [
 {
 subject: 'collectors_holdings',
 type: 'announced_deal',
 date_observed: '2025-12-15',
 significance: 'high',
 headline: 'Collectors signs definitive agreement to acquire Beckett Grading Services',
 details: 'Consolidates PSA, PCGS, SGC, WATA, and now Beckett under one corporate umbrella — roughly 80% of grading volume. Creates clear positioning for TAG as a credible non-Collectors grader.',
 source: 'Public announcement, Dec 15, 2025',
 },
 {
 subject: 'collectors_holdings',
 type: 'announced_deal',
 date_observed: '2025-12-19',
 significance: 'high',
 headline: 'Congressman Pat Ryan requests FTC antitrust investigation',
 details: 'Ryan wrote to the FTC four days after the Collectors–Beckett announcement. Adds regulatory tailwind to TAG\'s non-Collectors positioning through the 2026 cycle.',
 source: 'Public FTC correspondence',
 },
 {
 subject: 'psa',
 type: 'pricing',
 date_observed: '2026-02-10',
 significance: 'high',
 headline: 'PSA raises prices $5 flat across 5 tiers',
 details: 'Price umbrella lifted for TAG Tier 1 Manufacturer Partnership pricing at $25/slab. Supports margin thesis in all Panini / Pokémon / Hasbro pitches.',
 source: 'PSA pricing page',
 },
 {
 subject: 'fanatics',
 type: 'announced_deal',
 date_observed: '2026-04-01',
 significance: 'high',
 headline: 'Fanatics takes exclusive NFL card rights',
 details: 'Combined with the 2025 NBA exclusive expiry, Panini is pivoting to entertainment/non-sports — producing Panini\'s first-ever Licensing Expo appearance in 2026. Single hottest sports-card meeting at the show.',
 source: 'Industry reporting, April 2026',
 },
 {
 subject: 'cgc',
 type: 'booth_observation',
 date_observed: '2026-04-17',
 significance: 'medium',
 headline: 'Gems of the Game / Walmart program stable — no expansion Nov 2025 through April 2026',
 details: 'MJ Holding program live in ~4,000 Walmart stores since May 2025. No publicly-announced expansion in 11 months. Retail counter-positioning window remains open. TAG $0.80–$0.85/slab via NoWhyProjects is the economic wedge.',
 source: 'Internal research, Target Brief Section 10',
 },
];

// =============================================================
// 4. RUN SEED
// =============================================================
async function seed() {
 console.log('🌱 Seeding TAG Expo Command Center...\n');

 // Allowlist
 console.log('→ Allowlist');
 const { error: allowErr } = await supabase
 .from('allowlist')
 .upsert(allowlist, { onConflict: 'email' });
 if (allowErr) throw allowErr;
 console.log(` ✓ ${allowlist.length} emails`);

 // Targets
 console.log('→ Targets');
 const { error: targetErr } = await supabase
 .from('targets')
 .upsert(
 targets.map(t => ({
 ...t,
 key_contacts: t.key_contacts ?? [],
 booth_number: t.booth_number ?? null,
 notes: t.notes ?? null,
 })),
 { onConflict: 'company_name' }
 );
 if (targetErr) throw targetErr;
 console.log(` ✓ ${targets.length} targets`);

 // Keynote meetings - these reference targets, so insert after.
 // We'll insert them without owners/attendees; users can claim them after sign-in.
 console.log('→ Keynotes & scaffolding');
 const { data: targetRows } = await supabase.from('targets').select('id, company_name');
 const targetByName = new Map(targetRows?.map(r => [r.company_name, r.id]) ?? []);

 // Intel — clear + reinsert baseline (competitor items) plus target-linked examples
 console.log('→ Intel');
 for (const item of baselineIntel) {
 await supabase.from('intel').delete().eq('headline', item.headline);
 }
 const targetLinkedIntel = [
 {
 target_id: targetByName.get('Panini America') ?? null,
 subject: null,
 tag: null,
 type: 'announced_deal',
 date_observed: '2026-02-19',
 significance: 'high',
 headline: 'Panini America confirmed as first-ever Licensing Expo exhibitor',
 details: 'First LE appearance in Panini\'s history. Signals active prospecting for non-sports licensing partners after losing NBA (2025) and NFL (April 2026) exclusives to Fanatics.',
 source: 'Informa announcement, Feb 19, 2026',
 },
 {
 target_id: targetByName.get('The Pokémon Company International') ?? null,
 subject: null,
 tag: null,
 type: 'announced_deal',
 date_observed: '2026-02-19',
 significance: 'high',
 headline: 'Pokémon Company acquires Excell Brands',
 details: 'Brings TCG distribution partner in-house after 30 years. Signals vertical integration of US physical-product stack — leaves authentication layer as open opportunity for TAG.',
 source: 'Pokémon Company press release',
 },
 {
 target_id: targetByName.get('SEGA') ?? null,
 subject: null,
 tag: null,
 type: 'announced_deal',
 date_observed: '2026-01-15',
 significance: 'high',
 headline: 'Sonic 35th anniversary "Fast Forever" campaign launched',
 details: 'Year-long global program via WildBrain CPLG. Panini is already a licensee. A trilateral TAG + SEGA + Panini meeting at LE 2026 is the single highest-conviction deal path in the target brief.',
 source: 'SEGA press release, Jan 15, 2026',
 },
 {
 target_id: targetByName.get('CAA Brand Management') ?? null,
 subject: null,
 tag: null,
 type: 'announced_deal',
 date_observed: '2026-02-09',
 significance: 'high',
 headline: 'CAA Brand Management closes Beanstalk acquisition',
 details: 'Single meeting now accesses 20+ global consumer brands: Coca-Cola, Kellanova, Stanley, P&G brands, HGTV, Paramount F&B, Guinness, Baileys. Highest-leverage single slot of the show.',
 source: 'CAA announcement, Feb 9, 2026',
 },
 {
 target_id: targetByName.get('Netflix') ?? null,
 subject: null,
 tag: null,
 type: 'personnel',
 date_observed: '2026-03-24',
 significance: 'medium',
 headline: 'Marian Lee confirmed as Netflix keynote Tuesday 10:00 AM',
 details: 'CMO since 2022 (prior: Spotify, Condé Nast, J.Crew). Fireside with Amanda Cioletti of License Global. Topics: Stranger Things S5 final season, Netflix House (PA + Dallas open, Vegas 2027), KPop Demon Hunters dual master-toy licensee structure (Hasbro + Mattel).',
 source: 'Informa release, Mar 24, 2026',
 },
 ];

 const allIntel = [...baselineIntel, ...targetLinkedIntel];
 // Clean target-linked intel by headline too
 for (const item of targetLinkedIntel) {
 await supabase.from('intel').delete().eq('headline', item.headline);
 }
 const { error: intelErr } = await supabase.from('intel').insert(allIntel);
 if (intelErr) throw intelErr;
 console.log(` ✓ ${allIntel.length} intel items (${baselineIntel.length} competitor + ${targetLinkedIntel.length} target-linked)`);

 const meetings = [
 // Day 0 - Travel
 {
 title: 'Drive LA → Vegas (anchor pair)',
 start_at: '2026-05-18T10:00:00-07:00',
 end_at: '2026-05-18T14:00:00-07:00',
 type: 'travel',
 location: 'I-15 N',
 agenda: 'Richard + Michael travel. 4-hour drive.',
 },
 // Tuesday May 19
 {
 title: 'Breakfast Huddle — Day 1',
 start_at: '2026-05-19T08:30:00-07:00',
 end_at: '2026-05-19T09:15:00-07:00',
 type: 'internal_huddle',
 location: 'Hotel lobby / suite',
 agenda: 'Richard + Michael only. Confirm Day 1 meetings. ',
 },
 {
 title: 'KEYNOTE — The Netflix Effect on Fandom (Marian Lee)',
 target_id: targetByName.get('Netflix') ?? null,
 start_at: '2026-05-19T10:00:00-07:00',
 end_at: '2026-05-19T11:00:00-07:00',
 type: 'keynote',
 location: 'License Global Theater',
 agenda: 'Anchor pair. Stay for post-keynote Netflix booth walk-up. Key topics: Stranger Things S5, Netflix House, KPop Demon Hunters (Hasbro+Mattel dual toy structure).',
 },
 {
 title: '',
 start_at: '2026-05-19T11:00:00-07:00',
 end_at: '2026-05-19T12:30:00-07:00',
 type: 'walk_up',
 location: 'ZenWorks meet point',
 agenda: 'Capture outcomes in his debrief note to us.',
 },
 {
 title: 'Evening Debrief — Day 1',
 start_at: '2026-05-19T18:30:00-07:00',
 end_at: '2026-05-19T18:50:00-07:00',
 type: 'internal_huddle',
 location: 'Suite',
 agenda: 'Richard + Michael submit debriefs. Capture team intel from . 20 min max.',
 },
 {
 title: 'Opening Night Party — Tailgate Beach Club',
 start_at: '2026-05-19T19:00:00-07:00',
 end_at: '2026-05-19T23:00:00-07:00',
 type: 'party',
 location: 'Tailgate Beach Club, Mandalay Bay',
 agenda: 'Whole team on-site including team. 21+. The Temptations headline. Soft-opening window — sports and CPG reps soften up here.',
 },
 // Wednesday May 20
 {
 title: 'Breakfast Huddle — Day 2',
 start_at: '2026-05-20T08:30:00-07:00',
 end_at: '2026-05-20T09:15:00-07:00',
 type: 'internal_huddle',
 location: 'Hotel lobby / suite',
 agenda: 'Richard + Michael only. Confirm Day 2 meetings, review Day 1 notes.',
 },
 {
 title: 'KEYNOTE — Beyond the Plate (F&B Brand Extension)',
 target_id: targetByName.get('CAA Brand Management') ?? null,
 start_at: '2026-05-20T12:30:00-07:00',
 end_at: '2026-05-20T14:00:00-07:00',
 type: 'keynote',
 location: 'License Global Theater',
 agenda: 'Anchor pair, full 90 min + post-panel reception. Panelists: David Lee (Mars), Richard Cox (Pacsun), B&BW TBA; moderated by Allison Ames (CAA Brand Management). This is literally the Backflip Playbook pitch.',
 },
 {
 title: 'Evening Debrief — Day 2',
 start_at: '2026-05-20T18:30:00-07:00',
 end_at: '2026-05-20T18:50:00-07:00',
 type: 'internal_huddle',
 location: 'Suite',
 agenda: 'Richard + Michael. Capture team intel. 20 min max.',
 },
 // Thursday May 21
 {
 title: 'Breakfast Huddle — Day 3',
 start_at: '2026-05-21T08:30:00-07:00',
 end_at: '2026-05-21T09:15:00-07:00',
 type: 'internal_huddle',
 location: 'Hotel lobby / suite',
 agenda: 'Richard + Michael. Close plan review.',
 },
 {
 title: 'Floor Close',
 start_at: '2026-05-21T15:30:00-07:00',
 end_at: '2026-05-21T15:45:00-07:00',
 type: 'internal_huddle',
 location: 'MBCC floor',
 agenda: 'Show floor closes 3:30 PM.',
 },
 {
 title: 'Post-show Debrief',
 start_at: '2026-05-21T16:00:00-07:00',
 end_at: '2026-05-21T17:00:00-07:00',
 type: 'internal_huddle',
 location: 'Suite',
 agenda: 'Richard + Michael full-trip debrief. Incorporate team input captured verbally. 1 hour.',
 },
 ];

 // Clear scaffolding meetings and reinsert (idempotent)
 const scaffoldTitles = meetings.map(m => m.title);
 await supabase.from('meetings').delete().in('title', scaffoldTitles);
 const { error: meetingErr } = await supabase.from('meetings').insert(meetings);
 if (meetingErr) throw meetingErr;
 console.log(` ✓ ${meetings.length} scaffolding meetings`);

 console.log('\n✅ Seed complete.');
 console.log('\nNext: invite your 5 users from /settings after first sign-in.');
}

seed().catch(err => {
 console.error('❌ Seed failed:', err);
 process.exit(1);
});
