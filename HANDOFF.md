# Tag Expo Command Center — Session Handoff

_Last updated: 2026-04-29. Latest commit on `main`: `c18b0f4`._

This is a knowledge dump for the next Claude session so nothing from the previous session is lost. Skim the whole thing once before touching code.

---

## 1. What this app is

Internal command-center PWA for the **TAG team working Licensing Expo 2026 (May 18–21, Mandalay Bay, Las Vegas)**. Used live on the booth floor by Richard (admin) and Michael. Plans + tracks targets, books meetings, captures leads/intel during conversations, drafts follow-ups, generates an exec trip report.

**Stack**: Next.js 15 (App Router, React 19, TypeScript, Turbopack) + Supabase (auth via `@supabase/ssr`, Postgres, RLS) + Tailwind + react-zoom-pan-pinch + @react-pdf/renderer + Playwright (the booth-capture helper). Deployed to Vercel; PWA with custom service worker.

**Repo**: `richardwinters-byte/tag-expo-command-center` on `main`.
**Local path**: `C:\Users\RichardWinterstern\Desktop\tag-expo-command-center`.

**Auth**: only one user record so far — `richard@swipemarket.com` (Admin). Michael isn't in the DB yet.

---

## 2. Current health

- ✅ TypeScript clean (`npx tsc --noEmit`)
- ✅ Vercel `main` deploying automatically (with one historical hiccup that required a manual `vercel deploy --prod`)
- ✅ All routes render under auth
- ✅ DB inserts work via service role and via browser (RLS in place but permissive enough for Richard)
- 🟡 `package.json` has no `test` script (Codex flagged this as misleading PR claim)
- 🟡 Some dark-mode contrast issues on stat-card labels still pending

---

## 3. Recent commits (this session, top → bottom = oldest → newest)

| SHA | Note |
|---|---|
| `aa134c3` | QuickAdd sheets: reserve TopBar zone via paddingTop on outer wrapper |
| `29e6ffc` | Codex PR #1 (squash) — PWA + offline support, motion utilities, robustness |
| `e848b31` | NextUp: restore expo end-date cap on meetings query |
| `dcedec2` | **Critical fix**: HotCaptureFab hooks-order crash on create→detail navigation |
| `95a1791` | Lead + Intel capture: convert from bottom-sheet modals to full pages |
| `f4af41f` | SW: bump cache to v5 |
| `c7d0255` | Ambient: turn it up — 7 orbs, 20 embers, comet, breathing wash |
| `c691dab` | Ambient: turn it up further — orbs/embers/comet count |
| `cf83388` | Ambient: Vegas mode — neon pink + purple + cyan, searchlight, twinkles |
| `a165901` | Ambient: full Vegas — marquee bulb chase, suits, three comets |
| `253f399` | Ambient: replace orb blobs with floating SUIT shapes + 6 comets |
| `53e25ce` | Ambient: drop circle particles + add color-depth wash |
| `2c30113` | **Audit pass**: critical bug fixes + Targets search/verified filter |
| `5ad9b24` | Pipeline charts + more spotlights + Vegas muzak + extra suits |
| `c18b0f4` | More spotlights, faster rising suits, real upbeat groove |

---

## 4. Bugs fixed this session

- **HotCaptureFab hooks-order crash** (`dcedec2`) — the FAB had an early `return null` for hidden routes BEFORE its `useEffect`s, so navigating `/schedule/new`→`/schedule/<id>` (FAB hidden→visible) violated React's Rules of Hooks and crashed the entire detail page with "Application error". Fix: move all hooks before the conditional return. Symptom from user's POV was *"I can't add anything — it errors!"*; mutations actually succeeded but the redirect target crashed.
- **Booth Map image broken** — Next/Image at `w=3840` returned 0×0. Fix: `unoptimized` prop on the floor-plan `<Image>` so Next serves the JPG directly.
- **`/leads/new?company=&target=` did nothing** — clicking "Add lead" from a target detail lost the binding. Fix: page now reads `searchParams` and forwards `defaultCompany` + `defaultTargetId` props; form initialises from them (target id falls back to company-name lookup).
- **Day-pill / filter rows clipped silently** at right edge across Schedule/Leads/Map/Debrief/Intel. Fix: added `.scroll-fade-r` mask-image utility in `app/globals.css` and applied to those scroll containers.
- **CSV export hidden when leads list empty** — admin couldn't see the button at all. Fix: always render for admins; disabled state with tooltip when nothing to export.
- **FAB "Capture intel" subtitle clipped** ("PSA, CGC, booth si…") — shortened to "Competitor or booth note".
- **Intel page subtitle clipped** ("Observations on targets + competit…") — shortened to "Targets + competitor observations".
- **NextUpBanner expo end-date cap accidentally removed** by Codex's PR — restored.

---

## 5. Features added this session

### `/leads/new` and `/intel/new` are now full pages
Mirror `NewMeetingForm` (TopBar + Back + card-p + Field helper + btn-primary submit). The old `QuickAddLead` and `LogIntelDrawer` modals are deleted (~470 lines gone). HotCaptureFab and Today dashboard already linked to these routes.

### Targets — search + Verified at expo filter
Added a search input (filters by `company_name`) and a **Verified at expo** toggle that v1-proxies "verified" off `booth_number` (122 of 188 today). Wired through `filtered`, `activeCount`, `clearAll`. **The schema migration to add `meeting_table` / `is_speaker` / `is_panelist` is still pending** — see §7.

### Pipeline charts (commit `5ad9b24`)
Three SVG/HTML charts in a new "Pipeline charts" section (between Goal framework and Current state):
1. **Funnel** — Tier 1+2 targets → Captured leads → Reached T2+ → Hot leads → Pilot closed, with per-step drop %.
2. **Stage distribution** — vertical bar chart for Not started / T1 / T2 / T3.
3. **Track donut** — clickable SVG donut, tapping a segment toggles `trackFilter`.
Implementation lives at the end of `src/components/app/PipelineClient.tsx` (FunnelChart, StageBarChart, TrackDonut). Track color map: `TRACK_COLORS` const.

### Ambient background ("Vegas mode")
File: `src/components/app/AmbientBackground.tsx`. Layers (back→front):
- Static color-depth wash (5 fixed radial gradients: teal, gold, pink, purple, cyan)
- Whole-viewport breathing pulse
- Wide aurora gradient (5-stop, panning)
- 12 vertical searchlight beams (white, gold, pink, purple, cyan, deep green, sunshine, etc.) with 14–30s cycles
- 6 diagonal comet streaks at varied angles
- Top + bottom marquee bulb chase rows (gold/white top, pink/cyan bottom)
- 35 floating playing-card SUIT symbols (♠♥♦♣) rising upward, 4–15s durations, varied sizes 2–12rem, mix of TAG palette + Vegas neons (pink/purple/cyan/white) — main motion element
- 12 twinkle stars popping in/out

`prefers-reduced-motion` disables all of the above.

### VegasMusic toggle
File: `src/components/app/VegasMusic.tsx`, mounted in `app/(app)/layout.tsx`.
Floating gold/dark button bottom-left. Synthesises an upbeat ~120 BPM groove entirely via Web Audio (no audio file dep): 4-on-the-floor kick + snare on 2 & 4 + 16th-note hi-hat with open accents + walking sawtooth bass with filter envelope + square-wave pentatonic lead arpeggio + casino bell on downbeats. Off by default (autoplay rules + politeness). State persisted at `localStorage['tag-vegas-music']`.

### Service worker (Codex PR #1, kept)
`public/sw.js` v3→v15. Important behaviour:
- **Cache key bump on every UI deploy** so PWAs invalidate. Current cache is `tag-expo-v15`. Bump to `v16` etc. on next change that affects bundles.
- Public-only precache (`/offline`, manifest, icons).
- Auth pages cached lazily under `/__authcache/` prefix after a successful signed-in nav. Login redirects are explicitly NOT cached.
- `CLEAR_AUTH_CACHE` `postMessage` handler. `SettingsClient.signOut()` posts this before navigating to `/login`.
- `skipWaiting()` + `clients.claim()` in install/activate so updates apply on the next visit without a hard refresh.

### Other Codex PR #1 carry-overs (already merged)
- `getErrorMessage()` helper in `src/lib/utils.ts`. Used everywhere a Supabase mutation can fail (LeadDetailClient, SettingsClient, NextUpBanner, NewLeadForm, NewIntelForm). Pattern: `try/finally` with `setSaving(false)` in `finally`.
- Local-time "due today" filter (`localDateYYYYMMDD()` in `LeadsClient`) — fixes a UTC bug.
- Company-name normalization in QuickAdd save (`.trim()`).
- `motion-list` / `fade-up` / `scale-in` / `motion-card-sheen` CSS classes in `globals.css`.
- `PwaStatus` component (online/offline/syncing pill) mounted globally on authed pages and on `/login`.
- `OfflineClient` extracted to its own client component.

---

## 6. User preferences captured (also in `~/.claude/projects/C--/memory/`)

- **Full-page captures over bottom-sheet modals.** `/schedule/new` is the model UX. All capture flows now match that.
- **Maximalist visual richness.** "More animated", "more vegasy", "more up", "more colour" repeated as direction. Subtle is not enough. The current 12-spotlight + 35-suit + breathing wash + comets baseline is the floor, not the ceiling.
- **Vegas neon palette welcomed alongside TAG brand**: hot pink `#EC4899`, electric purple `#A855F7`, cyan `#22D3EE`, sunshine yellow, plus the original teal `#14595B` and gold `#C08A30`.
- **No round dots / "bokeh orbs" in the bg.** Earlier ember/twinkle circles got removed at user's explicit request. Suits-only motion now.
- **Iterates aggressively.** Push harder; expect another round.

---

## 7. Pending work (priority order)

### High value
1. **Booth Map daily walking routes** — overlay polyline + numbered stops on the floor plan, computed from each day's confirmed meetings. Requested explicitly. `BoothMap.tsx` already has the meeting list and zoom/pan; need to map booth_number → x,y on the JPG and draw an SVG path.
2. **Pipeline charts → PDF export** — the three new SVG charts render in-app but the trip report uses `@react-pdf/renderer`, which needs separate React-PDF chart components. Inline the same data into PDF-friendly primitives (Rect/Path inside `<Svg>` tag from `@react-pdf`).
3. **Targets schema expansion** — add `meeting_table TEXT`, `is_speaker BOOL`, `is_panelist BOOL` columns + migrate; expand the "Verified at expo" filter to combine all four signals (it's currently OR'd off `booth_number` only).
4. **Map functionality test** — pinch-zoom, pan, tier filter, fullscreen all flagged for a real run-through. Codex's PR didn't touch the map, but it hasn't been functionally exercised end-to-end this session.
5. **Image upload test** — business-card camera input on `/leads/new` saves to `attachments` via `uploadAttachment()`; never end-to-end tested in dev. Verify the file actually lands in the Supabase storage bucket.
6. **Export tests** — CSV from Leads (admin) and PDF from `/report` and `/debrief`. Verify file actually downloads + opens, not just that the button click fires.

### UX polish
7. **Dark-mode contrast** — "MEETINGS TODAY" / "OPEN FOLLOW-UPS" labels are very low contrast on dark teal cards. Other dark-mode pages were never systematically swept.
8. **Today dashboard intel feed** — welcome card says "3 hot intel" but doesn't surface the items inline; user noted this.
9. **Schedule pre/post-trip planning** — currently only May 18–21 are shown; no way to schedule prep meetings before trip or follow-ups after.

### Codex's open offer
Codex (in the chatgpt.com/codex tab) offered to do a **prioritized P0/P1 cleanup PR** addressing its findings 1–6 from the original PR review:
- "package.json has no `test` script, so 'npm test passed' is not reproducible from repo scripts as-is" (Codex's finding #6).
- Risk areas Codex flagged: SW auth-cache isolation, sign-out flow robustness, telemetry honesty in offline UI.
- Codex hasn't been told to start. Decide before pinging it whether it's still useful.

---

## 8. Tribal knowledge / gotchas

- **`env(safe-area-inset-*)` only resolves to non-zero on real iOS Safari with notch.** Chrome devtools mobile emulation returns 0px. Visual verification of notch padding only happens on a real iPhone post-deploy.
- **Vercel auto-deploy hiccupped once on push `dcedec2`.** Manual `vercel deploy --prod --yes` triggered it. If a push appears not to deploy in ~2 minutes, check `vercel ls` and trigger manually.
- **SW cache MUST be bumped on every UI deploy.** Otherwise existing PWAs serve stale HTML referencing old bundles. Pattern: edit one line in `public/sw.js` (`const CACHE = 'tag-expo-vN'`).
- **Magic-link login for testing** — the Supabase Site URL is set to the production Vercel URL, so `redirectTo: localhost` is rejected. Workaround: generate a token with `supabase.auth.admin.generateLink()` and visit `/auth/callback?token_hash=<hashed_token>&type=magiclink&next=/today` directly. Helper script (creates and deletes itself):
  ```js
  // scripts/magic.cjs (gitignored, write fresh each time)
  const { createClient } = require('@supabase/supabase-js');
  const env = /* read .env.local */;
  const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
  const { data } = await sb.auth.admin.generateLink({ type: 'magiclink', email: 'richard@swipemarket.com' });
  console.log(data.properties.hashed_token);
  ```
- **Probe data is real DB writes.** When testing lead/meeting creation in dev, the rows go to the production Supabase project. Always clean up afterwards (`scripts/cleanup_probe.cjs` was used in past sessions; delete by name pattern).
- **Codex tab in user's Edge browser** — `chatgpt.com/codex/cloud/tasks/...`. Use desktop screenshots via PowerShell + `Read` tool to inspect. Browser extension MCPs (Kapture, Claude_in_Chrome) were not connected.
- **Floorplan must use `unoptimized`** Next/Image prop. The 1522×1297 source upscaled by Next/Image at `w=3840` returns a 0×0 broken image.
- **"Verified at expo" filter is a v1 proxy** — currently keyed off `booth_number` only. Schema hasn't been migrated to add the table/speaker/panelist flags yet.

---

## 9. Where to look

| Topic | File / Path |
|---|---|
| App layout (where global components mount) | `app/(app)/layout.tsx` |
| Auth callback (handles token_hash + code flows) | `app/auth/callback/route.ts` |
| Lead capture (full page) | `app/(app)/leads/new/{page,NewLeadForm}.tsx` |
| Lead detail edit | `app/(app)/leads/[id]/LeadDetailClient.tsx` |
| Intel capture (full page) | `app/(app)/intel/new/{page,NewIntelForm}.tsx` |
| Targets list (search + verified filter live here) | `app/(app)/targets/TargetsClient.tsx` |
| Pipeline (KPIs + drag-drop kanban + charts) | `src/components/app/PipelineClient.tsx` |
| Booth map (zoom/pan over floorplan.jpg) | `src/components/app/BoothMap.tsx` |
| Trip report PDF builder | `app/(app)/report/...` (uses `@react-pdf/renderer`) |
| Service worker | `public/sw.js` |
| Ambient background (suits, spotlights, comets) | `src/components/app/AmbientBackground.tsx` |
| Music toggle | `src/components/app/VegasMusic.tsx` |
| Theme toggle | `src/components/app/ThemeToggle.tsx` |
| Pwa online/sync pill | `src/components/app/PwaStatus.tsx` |
| Hot capture FAB (bottom-right +) | `src/components/app/HotCaptureFab.tsx` |
| Top bar | `src/components/app/TopBar.tsx` |
| Bottom + side nav | `src/components/app/Nav.tsx` |
| Command palette (⌘K) | `src/components/app/CommandPalette.tsx` |
| Error helper | `src/lib/utils.ts` (`getErrorMessage`) |
| Type definitions | `src/lib/types.ts` |

---

## 10. How to start a fresh session

1. `cd C:\Users\RichardWinterstern\Desktop\tag-expo-command-center`
2. Confirm `git status` is clean except for `.gitignore` adding `.vercel` and the untracked `scripts/capture-booths.ts` (Playwright helper, intentionally local).
3. `git pull origin main` to make sure you're at HEAD.
4. `npm run dev` (or use the Claude Preview server config at `.claude/launch.json` named `tag-expo-dev`, port 3000).
5. For UI testing, generate a magic-link token via the helper above, then visit `http://localhost:3000/auth/callback?token_hash=<token>&type=magiclink&next=/today`.
6. CLI auth context already wired in this machine: `gh` (PATH `/c/Users/RichardWinterstern/bin/gh/bin`, logged in as `richardwinters-byte`, scopes include `repo`); Vercel CLI logged in; `.env.local` has all four Supabase keys. `git push` and `gh pr ...` work without further setup.

---

## 11. Memory references

`C:\Users\RichardWinterstern\.claude\projects\C--\memory\` already has:
- `MEMORY.md` (index)
- `project_tag_expo.md` (project context)
- `reference_tag_expo_paths.md` (paths)
- `feedback_tag_expo_visual.md` (visual + UX preferences)

The above files are the durable, cross-session memory. This `HANDOFF.md` lives in the repo and captures *this session's specific delta* on top of those.
