# Smoke Test — 10 Checks, 5 Minutes

Run these right after first deploy. All 10 should pass. If any fail, stop and fix before inviting the team.

---

**1. Sign in with magic link.**
Go to your Vercel URL → enter your email → receive email within 1 min → tap link → land on Today page with "Good morning, [your first name]".
Pass ✓ / Fail ✗

**2. Targets pre-loaded.**
Bottom nav → More → Targets. Should see ~50 companies grouped by tier. "Tier 1" should have ~17 entries. Tap Panini America — should show opener ("You're the only card manufacturer on this floor…"), proof point, pitch angle. All populated.
Pass ✓ / Fail ✗

**3. Schedule shows pre-seeded events.**
Bottom nav → Schedule. Tap the Tue May 19 day tile. Should show:
- Breakfast Huddle 8:30 AM
- Netflix keynote 10:00 AM (gold left border)
- ZenWorks tour 11:00 AM
- Evening Debrief 6:30 PM
- Opening Night Party 7:00 PM
Pass ✓ / Fail ✗

**4. Add a lead — 10 seconds.**
Today → Add Lead (top quick actions). Enter "Test Person" + "Test Company" + Warm. Submit. Should redirect to lead detail page.
Pass ✓ / Fail ✗

**5. Realtime sync across devices.**
Open the app on a second device (laptop + phone, or two phones). Sign in as a second user if possible, or same user. Add a lead on device 1. Within 2 seconds, it should appear on device 2 without refreshing.
Pass ✓ / Fail ✗

**6. Filter persists to URL.**
Leads page → filter by Temperature = Hot. URL should change to `/leads?temperature=hot`. Copy that URL. Open it in a fresh tab — filter should be pre-applied.
Pass ✓ / Fail ✗

**7. CSV export works.**
Leads page → Download CSV (admin only). File should download. Open in Excel or Numbers. Should have columns: name, company, title, email, owner, temperature, etc. No mangled encoding.
Pass ✓ / Fail ✗

**8. Add to calendar (ICS).**
Schedule → tap any meeting → tap "Add to calendar" (↓ icon). An `.ics` file downloads. Open it → iPhone/Mac asks if you want to add to Apple Calendar. Android asks about Google Calendar.
Pass ✓ / Fail ✗

**9. Conflict detection fires.**
Schedule → New Meeting. Create a meeting Tue May 19 10:00 AM – 11:00 AM (overlaps the Netflix keynote). Select yourself as attendee. Save. Go back to Schedule → Tue May 19. Both your new meeting and the Netflix keynote should have a red ⚠ icon.
Pass ✓ / Fail ✗

**10. PWA installs and opens full-screen.**
iPhone Safari → your URL → Share → Add to Home Screen. Tap the new icon on your home screen. Should open full-screen (no Safari URL bar). Status bar should be teal.
Pass ✓ / Fail ✗

---

## Expected time per check: 30 sec.

If you're past 15 min on this, something's off — send screenshots of what you're seeing.
