# TAG Expo Command Center — Team Guide

For: Richard + Michael.
Time to read: 3 minutes.

## What this is

A private tool for you and Michael to track every meeting, lead, and piece of intel gathered at Licensing Expo 2026. Jiro, Dan, and Griffin are on the show floor but don't use the app — their outcomes get captured through debrief notes and verbal handoffs at the end of each day. Keeps the app fast for the two of you, avoids burning consultant time on data entry.

Works on your phone. Add it to your home screen.

## Getting in

1. One of you gets the magic-link email from **Supabase Auth** (subject: "Your Magic Link"). Real email, not phishing.
2. Tap the link on your phone. That's it — signed in, no password.
3. iPhone → Safari → Share → Add to Home Screen. Installs as **TAG Expo** on your home screen.
4. Android → Chrome → menu → Install app.

Link expires in 1 hour. Expired? Go back to the URL and re-enter your email.

## The 5 screens you'll use 90% of the time

**Today** (bottom-nav leftmost tab) — your meetings today, open follow-ups, hot intel. First thing you check each morning.

**Schedule** — 4-day view, May 18–21. Tap a day tile, tap a meeting for detail. "Just me" filter for yours only. Tap the ↓ icon on a meeting to add it to Apple/Google Calendar.

**Leads** — the one you'll use most *during* meetings. Tap + Add Lead: name + company + hot/warm/cold. 10 seconds. Expand for more fields after. Filters stack — by owner, temperature, stage. The Quick-Add drawer has a **Snap business card** button — tap it to shoot the card, then fill in the name/company. Photo compresses client-side (under 500 KB for a typical card) and attaches to the lead on save. Add more photos — brochures, booth signage — from the lead detail page, with a note per photo ("biz card front", "page 2 brochure").

**Intel** — tap + Log Intel. Pick subject (PSA/CGC/Beckett/Panini/etc), significance. One-line headline. Done. High-sig items surface on Today for both of you.

**Debrief** — end of each show day, before sleep. 7 short fields. 10 minutes. Includes a field for consultant intel you heard verbally during the day — capture Jiro/Dan/Griffin's takeaways here so they don't get lost.

## During the show — the rhythm

**08:30 AM breakfast huddle** (pre-seeded): you two only. Confirm today's meetings, review open follow-ups. Consultants head to their own start-of-day activities.

**On the floor:** every card/contact goes to Leads immediately. Temperature cues:
- **Hot** = asked for a proposal, or wants a call
- **Warm** = interested, wants to stay in touch
- **Cold** = exchanged cards, no real traction

**Every competitor observation** → Intel. Small stuff counts. 2 minutes now saves guessing later.

**Consultant activity during the day** — Jiro, Dan, Griffin run their own tracks. Their meetings aren't in your Schedule because they're not users. But the Target Brief shows which targets they cover (`coverage_unit` field on each target). At day-end, ask them what they captured and log it in your debrief under "Consultant intel" or add leads/intel on their behalf.

**18:30 PM evening debrief** (pre-seeded): the two of you, suite. Submit debrief on your phone. You see each other's in real time.

## Follow-ups — 3-touch cadence

Tap any lead → scroll to follow-ups. Three cards: T1 (thanks within 24h), T2 (value-add within 7 days), T3 (proposal within 14 days). Tap "Draft T1 message" — the app writes a draft using the lead's info. Copy it, paste into your mail client, send. Tap "Mark sent" in the app so the other of you knows where it stands.

Drafts are starter text — edit before sending. Don't send generic.

## Rules

1. Every card goes into Leads **same day**. Not the flight home.
2. Every competitor observation goes into Intel **same day**.
3. Every evening, submit your debrief. Capture consultant takeaways here.
4. New meeting on the floor → add to Schedule immediately. Flag the target if it's one of the 53 in our brief.
5. Don't worry about which of you owns what — either of you can edit anything.

## Targets — the intelligence baked in

All 53 companies from the Target Brief are pre-loaded. Tap a target:
- Proof point
- Pitch angle
- The opener Richard wrote for that room
- Key contacts
- **Coverage unit** — tells you whether it's Anchor Pair (you two), Anchor Pair + Jiro, Anchor Pair + Dan, Jiro solo, or Dan solo

Read before walking in. Update status after ("Met", "Follow up", "Closed won"). Live pipeline.

## Consultant coordination — practical

Jiro / Dan / Griffin do not have app access. You coordinate with them in person:
- **Morning huddle** — you two only. Text or call the consultants to align on their day.
- **On the floor** — consultants pass leads verbally or on paper; you log them as you go.
- **Evening debrief** — consultants give you their intel verbally; you log it in your debrief.

If this coordination gets painful and you decide you want them in the app, Settings → Allowlist → add their emails. Four extra magic links and they're in.

## If something breaks

Text Richard. He has deploy access.

## After the show

Debriefs feed the trip report (auto-generated admin view). Follow-up drafts stay in the app — send T2 and T3 from your phone over the next two weeks. Everything exports to CSV on close.
