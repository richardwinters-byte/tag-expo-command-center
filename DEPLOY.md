# DEPLOY.md — Zero to Live in ~90 minutes

Written for Richard. Follow in order. Every step is a click you actually have to do. If something breaks, stop and send me a screenshot.

**Total time budget:** 90 min first-timer, 30 min if you've done this before.
**What you need before starting:** laptop (easier than phone for this), both team email addresses (Richard + Michael), a credit card (you won't be charged — some signups require it to verify).

---

## Phase 1 — GitHub (15 min)

GitHub hosts your code. Free. Required because Vercel deploys *from* a GitHub repo.

1. Go to **github.com/signup** if you don't have an account. Use your work email. Free plan is fine.
2. Verify email, skip all survey questions.
3. Create a new repo:
   - Top right **+** → **New repository**
   - Repository name: `tag-expo-command-center`
   - **Private** (not Public — this has your target brief data in it)
   - Do NOT check "Add a README" — we already have one
   - Click **Create repository**
4. You'll land on an empty-repo page. Leave this tab open — you'll need the URL in Phase 2.

**Don't push code yet.** We'll do that after Supabase is set up, because some code depends on Supabase values.

---

## Phase 2 — Supabase (20 min)

Supabase is your database. Free tier: 500 MB, 50K monthly users. You'll use ~1 MB and 2 users.

1. Go to **supabase.com** → **Start your project** → sign in with GitHub (easier than a separate account).
2. **New project**:
   - Name: `tag-expo`
   - Database password: **generate a strong one and save it** (Supabase shows a copy button). You won't need it often but losing it is a hassle.
   - Region: **West US (Oregon)** — closest to LA.
   - Plan: **Free**.
   - Click **Create new project**. Takes ~2 minutes to provision.
3. While it provisions, grab 3 values you'll need. Once the project is ready, go to **Project Settings → API**:
   - `Project URL` → copy (looks like `https://abc123.supabase.co`)
   - `anon public` key → copy (long `eyJ…` string)
   - `service_role secret` key → copy (different long `eyJ…` string — this one is secret, never commit it)
   - Paste all 3 somewhere safe (a notes app).
4. Load the schema:
   - Left sidebar → **SQL Editor** → **New query**
   - Open `supabase/migrations/0001_init.sql` in this repo, copy the entire file
   - Paste into the SQL editor
   - Click **Run** (bottom right)
   - You should see "Success. No rows returned." at the bottom. If you see any red errors, screenshot and send to me.
   - **New query again**, repeat with `supabase/migrations/0002_attachments.sql`. This adds the photo-upload capability: an `attachments` table plus a private `attachments` storage bucket with team-scoped RLS policies. Run it the same way.
   - **One more query**, paste and run `supabase/migrations/0003_intel_rescope.sql`. This re-scopes intel from competitor-only to a general observations stream (adds `target_id` foreign key + `tag` free-text column; makes `subject` nullable).
   - **Final migration**, paste and run `supabase/migrations/0004_floor_plan_ingest.sql`. This updates booth numbers on 29 existing targets and inserts 26 late-wave exhibitors visible on the LE2026 floor plan (captured April 18). Safe to re-run — uses ON CONFLICT DO NOTHING and idempotent UPDATEs.
   - **One more migration** (optional), paste and run `supabase/migrations/0005_floor_plan_pass2.sql`. Second-pass floor plan ingest — 1 booth update (Calm → E104) and 18 additional exhibitors including TOHO International, Supercell, Minecraft/Mojang (3 booths), Koei Tecmo, Technicolor, and several licensing agents. Also idempotent.
   - **Final pass**, paste and run `supabase/migrations/0006_floor_plan_pass3.sql`. Third-pass ingest — Roblox confirmed at U244-1 (meeting table, not a full booth), plus the U244 meeting tables block (Paizo, Schleich, Sanrio do Brasil, Boat Rocker, Le Petit Prince, Highlights for Children, 11 others) and the Brands & Agents middle band (Earthbound Brands, Scouting America, Difuzed collective, Dimensional Branding, Design Plus, Highlight LA). 23 new exhibitors + 1 update.
   - **Latest pass**, paste and run `supabase/migrations/0007_floor_plan_pass4.sql`. Fourth-pass ingest — MAJOR strategic update: all four Japanese pillars the Target Brief flagged as "not exhibiting" are confirmed on the floor. Adds Sanrio (C80), Capcom U.S.A. (J116), Shogakukan-Shueisha Productions (E80), and Tezuka Productions (A203) as new Tier 1 Japanese IP targets, plus Zuru/Mini Brands (C78), STUDIOCANAL (B196), Youtooz (E81), Sony Creative Products (A191), USPS (F118), and 16 others. 25 new exhibitors.
   - **Pass 5**, paste and run `supabase/migrations/0008_research_audit_ingest.sql`. Research-audit ingest — 2 verified booths (TreImage G225 as ONP Platinum Sponsor, MHS Licensing H90), 13 Part-2 confirmed exhibitors logged with booth TBD (Walt Disney, Universal, Jim Henson, Viz Media, Spiralcute, Westinghouse, Beverly Hills Teddy Bear, Royal Dutch/Portuguese/French Football Federations, Kings League, Diego Maradona Estate, The Brand Liaison), and 9 retail-pass buyers added to the retailer tier.
   - **Pass 6**, paste and run `supabase/migrations/0009_planner_pass1.sql`. Event Planner lookup pass 1. Two parts: (1) Classification corrections — Netflix/Mars Snacking/Bath & Body Works/Pacsun flagged as keynote/panel access (no booth); Funko/General Mills/Unilever/Fruit of the Loom/Liquid Death flagged as unverified in Event Planner; Coca-Cola B154 flagged for on-site verification; Hangry Petz booth extended to U244-5+6; Hasbro entry updated with official MYS exhibitor name. (2) 18 new verified booths including Mainichi Broadcasting System R224-2 (corrects a miss in the research audit), Garena Free Fire K214, Medialink Animation R242, Frida Kahlo C213, Manhead C120B, and 13 others.
   - **Pass 7 — FINAL**, paste and run `supabase/migrations/0010_planner_final.sql`. Event Planner lookup pass 2 and final floor-plan ingest. Key changes: (1) Reverses 0009 flag on Liquid Death — confirmed exhibitor at O236. (2) Coca-Cola B154 verified on own booth (CAA G156 remains complementary path). (3) Earthbound Brands now shows as multi-booth: A142, A154. (4) Deletes the standalone "Universal" target — NBCUniversal U188 is the single Comcast-family booth, and Universal Pictures IP is now annotated on that record. (5) Six booth confirms for existing targets: Viz Media O208, Tokyo Broadcasting A188, Sophie La Girafe K235, Beverly Hills Teddy Bear U239, Jim Henson R239, Brand Liaison E154. (6) One net-new exhibitor: TV Tokyo S242. (7) 14 targets classification-flagged as `[NOT IN PLANNER DIRECTORY]` — PepsiCo, ATP, Funko, Krispy Kreme, GNC, Westinghouse, Walt Disney, Spiralcute, KNVB, FPF, FFF, Kings League, Maradona Estate, and a second Netflix confirmation. No booth-hunting floor time on these 14.
   - **Pass 8 — Consultant removal**, paste and run `supabase/migrations/0011_remove_consultants.sql`. Collapses `coverage_unit` to a single value (`anchor_pair`) — the app is for the anchor pair (Richard + Michael) only. Scrubs every Jiro, Dan, Griffin, and "consultant" reference from `targets.notes/proof_point/pitch_angle/opener` and from `meetings.title/agenda`. Deletes the scaffolding meeting "Jiro — ZenWorks Japan Pavilion tour". If consultant context is needed for a specific target later, add it manually in notes.

   > **Note on `scripts/seed.ts`:** The seed script carries the final state of 17 records that migrations 0009/0010 also reference (Netflix, Liquid Death, Coca-Cola, Hasbro, Sophie La Girafe, Tokyo Broadcasting, Mars Snacking, Bath & Body Works, Pacsun, General Mills, Unilever, Fruit of the Loom, PepsiCo, Krispy Kreme, ATP, Funko, GNC). This means the seed's booth numbers and classification notes on those records are the source of truth — migrations 0009/0010 are belt-and-suspenders for the same data. Running `npm run seed` after migrations produces the correct end state regardless.
5. Verify:
   - Left sidebar → **Table Editor**. You should see `users`, `allowlist`, `targets`, `meetings`, `leads`, `follow_ups`, `intel`, `debriefs`, `morning_briefs`, `activity_log`, `attachments`. All empty.
   - `intel` table should show `target_id` and `tag` columns (added by 0003).
   - Left sidebar → **Storage**. You should see an `attachments` bucket, marked **Private** (not public). If the bucket isn't there, re-run `0002_attachments.sql`.
6. Configure auth redirect URL. Left sidebar → **Authentication → URL Configuration**:
   - **Site URL**: leave as default for now (`http://localhost:3000`). We'll update it after Vercel deploys.
   - **Redirect URLs**: add `http://localhost:3000/auth/callback` and `https://*.vercel.app/auth/callback` (the wildcard lets any Vercel preview URL work).
   - Click **Save**.
7. Email rate-limit bump (optional but recommended for the show week): Left sidebar → **Authentication → Rate Limits**. Default is 2 magic-link emails per hour per IP. If the team is clustered on one venue Wi-Fi, that could bite. Bump "Rate limit for sending emails" to 30/hour. Save.

---

## Phase 3 — Push the repo to GitHub (10 min)

You need git installed. On Mac: open Terminal and type `git --version`. If it says a version, you're good. If it prompts to install Xcode Command Line Tools, click Install and wait 5 min.

1. Download this repo as a zip if you haven't already. Unzip it somewhere like `~/Desktop/tag-expo-command-center`.
2. Open Terminal, `cd` to that folder:
   ```
   cd ~/Desktop/tag-expo-command-center
   ```
3. Initialize git and push:
   ```
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/tag-expo-command-center.git
   git push -u origin main
   ```
   Replace `YOUR_USERNAME` with your GitHub handle. First `git push` will ask you to sign in — use GitHub's browser-based auth flow if prompted.
4. Refresh your GitHub repo page. You should see all the files.

---

## Phase 4 — Vercel (15 min)

1. Go to **vercel.com** → sign in with GitHub (same account).
2. **Add New → Project** → find `tag-expo-command-center` in the list → **Import**.
3. Framework preset should auto-detect **Next.js**. Leave build settings default.
4. **Environment Variables** — add these four (from the Supabase values you saved in Phase 2):

   | Key | Value |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | your Supabase Project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | your Supabase anon key |
   | `SUPABASE_SERVICE_ROLE_KEY` | your Supabase service_role key |
   | `NEXT_PUBLIC_APP_URL` | `https://tag-expo-command-center.vercel.app` (or whatever Vercel tells you your URL will be — you can edit this after first deploy) |

5. Click **Deploy**. Takes 2–3 min.
6. When it's done, you get a URL like `tag-expo-command-center.vercel.app`. **Do not open it yet.**
7. Go back to Supabase → **Authentication → URL Configuration**:
   - Update **Site URL** to your Vercel URL (e.g. `https://tag-expo-command-center.vercel.app`)
   - Add your Vercel URL to **Redirect URLs**: `https://tag-expo-command-center.vercel.app/auth/callback`
   - Click **Save**.
8. Also go to Vercel → your project → **Settings → Environment Variables** and update `NEXT_PUBLIC_APP_URL` to the real Vercel URL. Then **Deployments** → latest → **⋯ Redeploy**. Takes ~1 min.

---

## Phase 5 — Seed the database (10 min)

This loads the 40 targets from the Target Brief plus keynotes, huddles, and baseline intel.

1. In your local terminal, copy the environment template:
   ```
   cp .env.local.example .env.local
   ```
2. Open `.env.local` in any text editor. Fill in:
   - `NEXT_PUBLIC_SUPABASE_URL` = your Supabase URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = anon key
   - `SUPABASE_SERVICE_ROLE_KEY` = service_role key
   - `NEXT_PUBLIC_APP_URL` = `http://localhost:3000` (for local only; Vercel handles its own)
   - `ALLOWLIST_EMAILS` = both real team emails, comma-separated, lowercase:
     ```
     ALLOWLIST_EMAILS=richard@taggrading.com,michael@taggrading.com
     ```
3. Install dependencies and run seed:
   ```
   npm install
   npm run seed
   ```
   The install step pulls `@react-pdf/renderer`, which powers the PDF export for debriefs and the trip report. No additional runtime config is needed — PDFs are generated client-side in the browser.

   Expected seed output:
   ```
   🌱 Seeding TAG Expo Command Center...
   → Allowlist
     ✓ 2 emails
   → Targets
     ✓ 53 targets
   → Keynotes & scaffolding
     ✓ 12 scaffolding meetings
   → Intel
     ✓ 10 intel items (5 competitor + 5 target-linked)
   ✅ Seed complete.
   ```
4. Verify in Supabase Table Editor: `allowlist` should show 2 rows, `targets` ~187 rows (53 from seed + 134 from migrations 0004–0010), `intel` 5, `meetings` 12.

---

## Phase 6 — First sign-in (5 min)

1. Open your Vercel URL in your phone browser (the app is mobile-first — test there).
2. Enter your email (one of the 2 you added to `ALLOWLIST_EMAILS`).
3. Tap "Send magic link".
4. Check your email. Tap the link. It should open the app and land you on Today.
5. If you get an error about allowlist, double-check the email in `allowlist` table is all lowercase and matches exactly.

**If this works, you're live.** The next step is inviting Michael.

### UI notes

- **TAG logo**: black wordmark in the mobile header, white-on-black on the dark teal desktop sidebar. No gold on the logo itself (gold is reserved for Tier-1 badges and active nav indicators).
- **Dark mode**: toggle button (moon/sun icon) lives in the top-right of the mobile header. Preference is remembered per device via `localStorage`; first-visit default follows the OS's `prefers-color-scheme`. The toggle flips the whole `tag-*` color system via `.dark` overrides in `globals.css`, so every page gets dark mode "for free" without touching component files.
- **Meeting edit**: tapping a meeting → "Edit" now lets you change the title, start time, end time, status, agenda, outcome, and next action. (Previously only the last three were editable.)

---

## Phase 7 — Invite Michael (2 min)

1. On your phone in the app → **More** (bottom nav) → **Settings**.
2. Scroll to **Allowlist · Invite team**. Michael's row has a **Send link** button. Tap it.
3. Michael gets an email with a magic link. He taps it, he's in.

Text Michael this in advance so he knows what to expect:

> "You're getting a magic-link email from Supabase Auth — it's real, it's from me. Tap the link on your phone. Then add this URL to your home screen for PWA install: [Vercel URL]. Tap Share → Add to Home Screen on iPhone, or the browser menu on Android."

---

## Phase 8 — Install as PWA (per person, 1 min each)

On iPhone:
1. Open the Vercel URL in Safari (not Chrome — Safari is required for iOS PWA install).
2. Tap Share (bottom center) → scroll → **Add to Home Screen** → Add.
3. You now have a TAG icon on your home screen. Opens as a full-screen app, not a browser tab.

On Android:
1. Open the URL in Chrome.
2. Menu (⋯) → **Install app** or **Add to Home screen**.

---

## Phase 9 — Smoke test

Run the 10 checks in `SMOKE_TEST.md`. Takes 5 min. If all 10 pass, you're operational.

---

## After the show

- To export everything: Settings → CSV export (admin only). Dumps leads, meetings, targets, intel.
- To wind down: leave it running. Vercel Hobby and Supabase Free charge $0/month. After 30 days of no activity, some Supabase projects auto-pause — just sign back in to wake it up. Data is never deleted on free tier.
- To re-run the seed (won't duplicate): `npm run seed` is idempotent. Safe to re-run.

---

## Troubleshooting

**"Email not on allowlist" error during sign-in.**
You added the email to Supabase's auth but not to the `allowlist` table. Fix: SQL Editor → `insert into public.allowlist (email, name, role) values ('x@y.com', 'Person Name', 'member');`

**Magic link email doesn't arrive.**
Check spam. Then check Supabase → Authentication → Logs. Supabase Free tier has a low email rate limit — bumping it in Phase 2 step 7 fixes 90% of cases. If still stuck, Supabase lets you configure a custom SMTP (Gmail works) in Project Settings → Auth → SMTP Settings.

**PWA won't install on iPhone.**
Must be Safari, not Chrome. Must be HTTPS (Vercel is). Must have visited the site at least once.

**Targets not appearing after deploy.**
The seed script wasn't run, or it ran against the wrong database. Check `.env.local` values match your Supabase project.

**Something else.** Screenshot, send to me, we fix it together.
