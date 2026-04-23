# TAG Expo Command Center

Internal web app for Richard + Michael at Licensing Expo 2026 (Mandalay Bay, May 18–21). Replaces the shared-spreadsheet workflow. Runs on your phones. Real-time sync between the two of you, offline read, and the entire Target Brief (53 companies) baked into a queryable database. Consultants (Jiro, Dan, Griffin) are on the floor but not in the app — their intel flows back through daily debriefs.

## What's inside

- **Event Planner** — shared team schedule May 18–21, pre-booked meetings, booth walk-ups, keynote blocks, conflict detection, coverage-unit assignments
- **Lead Tracker** — every contact captured on the floor, linked to the meeting where met, with temperature, owner, next action, deadline, 3-touch follow-up cadence, CSV export
- **Competitive Intel Log** — tabbed by PSA / CGC / Beckett / SGC / Panini / etc., with significance scoring
- **Daily Debrief** intake — one form per person per day, 7 short fields
- **Morning Brief** — auto-compiled rule-based summary of yesterday's debriefs plus today's priorities
- **Trip Report** — print-to-PDF executive summary for Mark, admin only

## Tech stack

- Next.js 15 App Router + TypeScript strict
- Tailwind CSS with TAG palette tokens (teal-900, gold)
- Supabase: Postgres, Auth (magic-link), Realtime, RLS on every table
- date-fns / date-fns-tz pinned to America/Los_Angeles
- PWA with offline read caching
- Free-tier deployment on Vercel Hobby + Supabase Free

## Start here

**If you are deploying this:** read `DEPLOY.md`. 90-minute walkthrough from zero to live URL.

**If you are using this:** read `TEAM_GUIDE.md`. 3-minute read.

**If you are running final checks:** `SMOKE_TEST.md`. 10 checks, 5 minutes.

## Environment

Copy `.env.local.example` to `.env.local` and fill in:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_APP_URL
ALLOWLIST_EMAILS
```

## Commands

```bash
npm install           # one time
npm run dev           # local dev at localhost:3000
npm run seed          # one-time: loads targets + keynotes + baseline intel
npm run build         # production build
```

## Repository layout

```
app/
  (app)/              # protected routes, behind auth middleware
    today/            # default landing
    schedule/         # 4-day schedule + meeting detail + new meeting
    targets/          # target list + detail
    leads/            # lead tracker + detail
    intel/            # competitive intel log
    debrief/          # daily debrief
    morning/          # compiled morning brief
    report/           # admin trip report
    settings/         # profile + allowlist
    more/             # mobile overflow menu
  auth/callback/      # magic-link exchange
  api/brief/          # POST to regenerate morning brief
  login/              # public login page
src/
  components/app/     # Nav, TopBar, Pills, PrintButton
  lib/                # supabase clients, types, utils, brief-compiler
supabase/migrations/  # 0001_init.sql — all tables + RLS + triggers
scripts/seed.ts       # target/intel/keynote seed from Target Brief
public/
  manifest.json       # PWA manifest
  sw.js               # service worker
  icon.svg            # TAG monogram icon
```

## Data model

10 tables: `users`, `allowlist`, `targets`, `meetings`, `leads`, `follow_ups`, `intel`, `debriefs`, `morning_briefs`, `activity_log`. RLS enforced on every table. Realtime publication on meetings / leads / intel / debriefs / targets / morning_briefs / follow_ups.

## Allowlist / Auth

Magic-link only. An email must exist in `public.allowlist` *before* sign-in — a trigger in `0001_init.sql` creates the `public.users` row automatically on first sign-in and throws if not in allowlist. Admins (Richard, Michael) can invite additional emails from Settings.

## Design system

All colors are Tailwind tokens prefixed `tag-`. Primary is `tag-900` (#0B2F31, deep teal). Accent is `tag-gold` (#C08A30). Body font is Inter, mono is JetBrains Mono. No default shadcn colors, no purple gradients, no emoji, no AI-look.

## License

Internal use only. Confidential to TAG Grading.
