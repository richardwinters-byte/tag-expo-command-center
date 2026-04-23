'use client';

import { Document, Page, View, Text, StyleSheet, Image, Link, Font } from '@react-pdf/renderer';
import type { Lead, Meeting, Intel, Debrief, User, Target, Attachment } from '@/lib/types';

// ============================================================
// STYLES
// ============================================================
const COLORS = {
  teal900: '#0B2F31',
  teal700: '#14595B',
  teal50: '#F2F6F6',
  gold: '#C08A30',
  goldDark: '#A0721F',
  ink: '#14171A',
  cold: '#6B7280',
  hairline: '#E5E7EB',
  hotBg: '#FEE2E2',
  hotFg: '#991B1B',
  warmBg: '#FEF3C7',
  warmFg: '#92400E',
};

const s = StyleSheet.create({
  page: { backgroundColor: '#FFFFFF', padding: 36, fontFamily: 'Helvetica', fontSize: 10, color: COLORS.ink, lineHeight: 1.4 },

  // Header
  brandBar: { flexDirection: 'row', alignItems: 'center', marginBottom: 18, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: COLORS.hairline, borderBottomStyle: 'solid' },
  brandBadge: { backgroundColor: COLORS.gold, color: '#FFFFFF', paddingHorizontal: 6, paddingVertical: 3, fontSize: 9, fontFamily: 'Helvetica-Bold', marginRight: 10 },
  brandText: { fontSize: 9, color: COLORS.cold, letterSpacing: 0.8, textTransform: 'uppercase' },
  brandConfidential: { marginLeft: 'auto', fontSize: 8, color: COLORS.goldDark, fontFamily: 'Helvetica-Bold', letterSpacing: 0.8 },

  // Titles
  title: { fontSize: 22, fontFamily: 'Helvetica-Bold', color: COLORS.teal900, marginBottom: 4 },
  subtitle: { fontSize: 11, color: COLORS.cold, marginBottom: 18 },
  h2: { fontSize: 13, fontFamily: 'Helvetica-Bold', color: COLORS.teal900, marginTop: 16, marginBottom: 8, paddingBottom: 4, borderBottomWidth: 0.5, borderBottomColor: COLORS.hairline, borderBottomStyle: 'solid' },
  h3: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: COLORS.teal700, marginTop: 10, marginBottom: 4 },

  // Text
  body: { fontSize: 10, lineHeight: 1.5, marginBottom: 6 },
  muted: { color: COLORS.cold, fontSize: 9 },
  mono: { fontFamily: 'Courier', fontSize: 9 },
  bold: { fontFamily: 'Helvetica-Bold' },
  italic: { fontFamily: 'Helvetica-Oblique' },

  // Stat grid
  statRow: { flexDirection: 'row', gap: 8, marginBottom: 18 },
  stat: { flex: 1, backgroundColor: COLORS.teal50, padding: 10, borderRadius: 6, borderLeftWidth: 3, borderLeftColor: COLORS.gold, borderLeftStyle: 'solid' },
  statLabel: { fontSize: 8, color: COLORS.teal700, textTransform: 'uppercase', letterSpacing: 0.8, fontFamily: 'Helvetica-Bold' },
  statValue: { fontSize: 18, fontFamily: 'Helvetica-Bold', color: COLORS.teal900, marginTop: 2 },
  statSub: { fontSize: 8, color: COLORS.cold, marginTop: 1 },

  // Item cards (meetings, leads, intel)
  card: { padding: 8, marginBottom: 6, borderWidth: 0.5, borderColor: COLORS.hairline, borderStyle: 'solid', borderRadius: 3 },
  cardHot: { borderLeftWidth: 3, borderLeftColor: COLORS.gold, borderLeftStyle: 'solid' },
  cardTitle: { fontSize: 10, fontFamily: 'Helvetica-Bold', marginBottom: 2 },
  cardMeta: { fontSize: 8, color: COLORS.cold, marginBottom: 3 },

  // Pills
  pillRow: { flexDirection: 'row', gap: 4, flexWrap: 'wrap', marginBottom: 4 },
  pill: { fontSize: 7, paddingHorizontal: 4, paddingVertical: 1, borderRadius: 2, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase', letterSpacing: 0.4 },
  pillHot: { backgroundColor: COLORS.hotBg, color: COLORS.hotFg },
  pillWarm: { backgroundColor: COLORS.warmBg, color: COLORS.warmFg },
  pillCold: { backgroundColor: '#F3F4F6', color: '#374151' },
  pillTier1: { backgroundColor: COLORS.gold, color: '#FFFFFF' },
  pillNeutral: { backgroundColor: COLORS.teal50, color: COLORS.teal700 },

  // Table
  tableRow: { flexDirection: 'row', borderBottomWidth: 0.25, borderBottomColor: COLORS.hairline, borderBottomStyle: 'solid', paddingVertical: 4 },
  tableHeader: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: COLORS.teal900, borderBottomStyle: 'solid', paddingVertical: 4, marginBottom: 2 },
  th: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: COLORS.teal900, textTransform: 'uppercase', letterSpacing: 0.4 },
  td: { fontSize: 9 },

  // Photos
  photoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 4 },
  photoWrap: { width: 110, marginRight: 4, marginBottom: 6 },
  photo: { width: 110, height: 110, objectFit: 'cover', borderRadius: 3 },
  photoCaption: { fontSize: 7, color: COLORS.cold, marginTop: 2, textAlign: 'center' },

  // Expanded report primitives
  coverBar: { height: 6, backgroundColor: COLORS.gold, marginBottom: 28 },
  coverTitle: { fontSize: 36, fontFamily: 'Helvetica-Bold', color: COLORS.teal900, marginBottom: 6, lineHeight: 1.1 },
  coverSubtitle: { fontSize: 14, color: COLORS.teal700, marginBottom: 40 },
  coverKicker: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: COLORS.gold, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 },
  coverMeta: { fontSize: 10, color: COLORS.cold, marginTop: 36, lineHeight: 1.6 },
  coverMetaLabel: { fontSize: 8, color: COLORS.teal700, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase', letterSpacing: 1 },

  tocRow: { flexDirection: 'row', paddingVertical: 5, borderBottomWidth: 0.25, borderBottomColor: COLORS.hairline, borderBottomStyle: 'solid' },
  tocNum: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: COLORS.teal700, width: 24 },
  tocTitle: { fontSize: 10, flex: 1, color: COLORS.ink },
  tocPage: { fontSize: 9, fontFamily: 'Courier', color: COLORS.cold },

  // Narrative callouts
  callout: { backgroundColor: COLORS.teal50, borderLeftWidth: 3, borderLeftColor: COLORS.teal700, borderLeftStyle: 'solid', padding: 10, marginBottom: 10, borderRadius: 3 },
  calloutTitle: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: COLORS.teal700, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 4 },
  calloutBody: { fontSize: 10, lineHeight: 1.5, color: COLORS.ink },
  calloutGold: { backgroundColor: '#FDF4E1', borderLeftColor: COLORS.gold },
  calloutGoldTitle: { color: COLORS.goldDark },
  calloutRed: { backgroundColor: COLORS.hotBg, borderLeftColor: COLORS.hotFg },
  calloutRedTitle: { color: COLORS.hotFg },

  // Compact KPI row for pipeline waterfall
  kpiRow: { flexDirection: 'row', gap: 6, marginBottom: 14 },
  kpi: { flex: 1, padding: 8, backgroundColor: '#FAFAFA', borderRadius: 4, borderWidth: 0.5, borderColor: COLORS.hairline, borderStyle: 'solid' },
  kpiLabel: { fontSize: 7, color: COLORS.cold, textTransform: 'uppercase', letterSpacing: 0.6, fontFamily: 'Helvetica-Bold' },
  kpiValue: { fontSize: 16, fontFamily: 'Helvetica-Bold', color: COLORS.teal900, marginTop: 2 },
  kpiPct: { fontSize: 8, color: COLORS.teal700, marginTop: 1 },
  kpiArrow: { fontSize: 14, color: COLORS.cold, alignSelf: 'center', paddingHorizontal: 2 },

  // Dense row for "per day" and "per owner" breakdowns
  splitRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 5, borderBottomWidth: 0.25, borderBottomColor: COLORS.hairline, borderBottomStyle: 'solid' },
  splitLabel: { fontSize: 9, flex: 2 },
  splitBar: { height: 8, backgroundColor: '#F3F4F6', borderRadius: 2, flex: 4, position: 'relative', marginHorizontal: 6, overflow: 'hidden' },
  splitBarFill: { position: 'absolute', top: 0, left: 0, bottom: 0, backgroundColor: COLORS.teal700, borderRadius: 2 },
  splitValue: { fontSize: 9, fontFamily: 'Courier', color: COLORS.teal900, width: 50, textAlign: 'right' },

  // Section intro blurb
  sectionIntro: { fontSize: 10, lineHeight: 1.6, color: COLORS.ink, marginBottom: 12 },

  // Dense table cells
  tdLg: { fontSize: 9, flexWrap: 'wrap' },
  tdSm: { fontSize: 8, color: COLORS.cold },

  // Recommendation block
  recItem: { flexDirection: 'row', marginBottom: 8, alignItems: 'flex-start' },
  recNum: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: COLORS.gold, width: 20 },
  recBody: { flex: 1 },
  recTitle: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: COLORS.teal900, marginBottom: 2 },
  recDesc: { fontSize: 9, lineHeight: 1.5, color: COLORS.ink },

  // Footer
  footer: { position: 'absolute', bottom: 18, left: 36, right: 36, fontSize: 7, color: COLORS.cold, flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 0.5, borderTopColor: COLORS.hairline, borderTopStyle: 'solid', paddingTop: 4 },
});

// ============================================================
// SHARED COMPONENTS
// ============================================================
function BrandBar({ type }: { type: string }) {
  return (
    <View style={s.brandBar}>
      <Text style={s.brandBadge}>TAG</Text>
      <Text style={s.brandText}>{type} · Licensing Expo 2026</Text>
      <Text style={s.brandConfidential}>CONFIDENTIAL — INTERNAL USE</Text>
    </View>
  );
}

function Footer({ pageLabel }: { pageLabel: string }) {
  return (
    <View style={s.footer} fixed>
      <Text>TAG Grading · Confidential</Text>
      <Text>{pageLabel}</Text>
      <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
    </View>
  );
}

const fmtDate = (iso: string) => {
  const d = new Date(iso);
  // Treat YYYY-MM-DD as local to avoid UTC shift
  if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
    const [y, m, da] = iso.split('-').map(Number);
    return new Date(y, m - 1, da).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  }
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const fmtTime = (iso: string) =>
  new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'America/Los_Angeles' });

// ============================================================
// DEBRIEF PDF
// ============================================================
export type DebriefExportData = {
  date: string; // YYYY-MM-DD
  submissions: Array<{
    user: User;
    debrief: Debrief;
  }>;
};

export function DebriefPdf({ data }: { data: DebriefExportData[] }) {
  const dateLabel = data.length === 1
    ? fmtDate(data[0].date)
    : `${fmtDate(data[0].date)} – ${fmtDate(data[data.length - 1].date)}`;
  return (
    <Document title={`TAG Debrief ${dateLabel}`} author="TAG Grading">
      {data.map((day, i) => (
        <Page key={day.date} size="LETTER" style={s.page}>
          <BrandBar type="Daily Debrief" />
          <Text style={s.title}>Daily Debrief — {fmtDate(day.date)}</Text>
          <Text style={s.subtitle}>Licensing Expo 2026 · {day.submissions.length} submission{day.submissions.length !== 1 ? 's' : ''}</Text>

          {day.submissions.length === 0 ? (
            <Text style={[s.body, s.italic, s.muted]}>No debriefs submitted for this date.</Text>
          ) : (
            day.submissions.map((sub) => <DebriefSection key={sub.user.id} user={sub.user} debrief={sub.debrief} />)
          )}

          <Footer pageLabel={`Debrief · ${fmtDate(day.date)}`} />
        </Page>
      ))}
    </Document>
  );
}

function DebriefSection({ user, debrief }: { user: User; debrief: Debrief }) {
  const fields: Array<[string, string | null | undefined]> = [
    ['Meetings taken', debrief.meetings_taken],
    ['Booths visited', debrief.booths_visited],
    ['Contacts captured', debrief.contacts_captured],
    ['Competitive intel', debrief.competitive_intel],
    ['Surprises / opportunities', debrief.surprises],
    ['Open follow-ups', debrief.open_follow_ups],
    ['One thing to do differently', debrief.one_thing_different],
  ];
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={s.h2}>{user.name}</Text>
      {fields.map(([label, val]) => (
        <View key={label} style={{ marginBottom: 6 }}>
          <Text style={s.h3}>{label}</Text>
          {val && val.trim() ? (
            <Text style={s.body}>{val}</Text>
          ) : (
            <Text style={[s.body, s.italic, s.muted]}>—</Text>
          )}
        </View>
      ))}
    </View>
  );
}

// ============================================================
// TRIP REPORT PDF
// ============================================================
export type TripReportOptions = {
  includeMeetings: 'all' | 'tier1' | 'none';
  includeLeads: 'all' | 'hot' | 'none';
  includeIntel: 'all' | 'high' | 'none';
  includePhotos: boolean;
  includeDebriefs: boolean;
  nextSteps?: string;
};

export type TripReportData = {
  options: TripReportOptions;
  users: User[];
  targets: Target[];
  meetings: Array<Meeting & { target?: { company_name: string; tier: string } }>;
  leads: Array<Lead & { target?: { company_name: string } }>;
  intel: Array<Intel & { target?: { company_name: string } | null }>;
  debriefs: Debrief[];
  attachments: Array<Attachment & { lead_name?: string; meeting_title?: string }>;
  generatedAt: string;
};

export function TripReportPdf({ data }: { data: TripReportData }) {
  const { options, targets, meetings, leads, intel, attachments, debriefs, users } = data;
  const usersById = new Map(users.map((u) => [u.id, u]));

  // Filter by options
  const filteredMeetings = options.includeMeetings === 'none' ? []
    : options.includeMeetings === 'tier1' ? meetings.filter((m) => m.target?.tier === 'tier_1')
    : meetings;
  const filteredLeads = options.includeLeads === 'none' ? []
    : options.includeLeads === 'hot' ? leads.filter((l) => l.temperature === 'hot')
    : leads;
  const filteredIntel = options.includeIntel === 'none' ? []
    : options.includeIntel === 'high' ? intel.filter((i) => i.significance === 'high')
    : intel;

  // ============================================================
  // DERIVED ANALYSIS — compute everything once, render later
  // ============================================================

  // Pipeline waterfall
  const tier1 = targets.filter((t) => t.tier === 'tier_1');
  const tier2 = targets.filter((t) => t.tier === 'tier_2');
  const tier3 = targets.filter((t) => t.tier === 'tier_3');
  const nice = targets.filter((t) => t.tier === 'nice_to_meet');
  const opp = targets.filter((t) => t.tier === 'opportunistic');

  const targetsEngaged = targets.filter((t) => ['met', 'meeting_booked', 'follow_up', 'closed_won'].includes(t.status));
  const targetsMet = targets.filter((t) => ['met', 'follow_up', 'closed_won'].includes(t.status));
  const targetsClosed = targets.filter((t) => t.status === 'closed_won');

  const hotLeads = leads.filter((l) => l.temperature === 'hot');
  const warmLeads = leads.filter((l) => l.temperature === 'warm');
  const coldLeads = leads.filter((l) => l.temperature === 'cold');
  const highIntel = intel.filter((i) => i.significance === 'high');

  // Per-user meeting counts
  const meetingsByUser = new Map<string, number>();
  for (const m of meetings) {
    if (m.owner_id) meetingsByUser.set(m.owner_id, (meetingsByUser.get(m.owner_id) ?? 0) + 1);
  }
  const leadsByUser = new Map<string, number>();
  for (const l of leads) {
    if (l.owner_id) leadsByUser.set(l.owner_id, (leadsByUser.get(l.owner_id) ?? 0) + 1);
  }

  // Meetings per day
  const meetingsByDay = new Map<string, number>();
  for (const m of meetings) {
    const day = m.start_at.slice(0, 10);
    meetingsByDay.set(day, (meetingsByDay.get(day) ?? 0) + 1);
  }
  const dayList = ['2026-05-18', '2026-05-19', '2026-05-20', '2026-05-21'];

  // Meetings per type
  const meetingsByType = new Map<string, number>();
  for (const m of meetings) {
    meetingsByType.set(m.type, (meetingsByType.get(m.type) ?? 0) + 1);
  }

  // Leads per follow-up stage
  const leadsByStage = new Map<string, number>();
  for (const l of leads) {
    leadsByStage.set(l.follow_up_stage, (leadsByStage.get(l.follow_up_stage) ?? 0) + 1);
  }

  // Per-track (Entertainment, Sports, CPG, Japan, Retail) breakdown
  const tracks = ['entertainment_ip', 'sports', 'cpg_backflip', 'japanese_ip', 'retail', 'agent', 'competitor', 'new_surfaced'];
  const trackAnalysis = tracks.map((tr) => {
    const targetsInTrack = targets.filter((t) => t.track === tr);
    const engagedInTrack = targetsInTrack.filter((t) => ['met', 'meeting_booked', 'follow_up', 'closed_won'].includes(t.status));
    const leadsInTrack = leads.filter((l) => {
      const t = targets.find((x) => x.id === l.target_id);
      return t?.track === tr;
    });
    const hotInTrack = leadsInTrack.filter((l) => l.temperature === 'hot');
    return {
      track: tr,
      label: TRACK_LABELS[tr] ?? tr,
      total: targetsInTrack.length,
      engaged: engagedInTrack.length,
      leads: leadsInTrack.length,
      hotLeads: hotInTrack.length,
    };
  }).filter((x) => x.total > 0);

  // Competitive intel by subject (PSA, CGC, Beckett, SGC, Panini, etc.)
  const intelBySubject = new Map<string, Intel[]>();
  for (const i of intel) {
    const key = i.subject ?? i.target?.company_name ?? 'unclassified';
    if (!intelBySubject.has(key)) intelBySubject.set(key, []);
    intelBySubject.get(key)!.push(i);
  }

  // Tier 1 unconverted (didn't meet — need follow-up plan)
  const tier1Unconverted = tier1.filter((t) => !['met', 'follow_up', 'closed_won', 'meeting_booked'].includes(t.status));

  // Coverage percentages
  const tier1Coverage = tier1.length > 0 ? Math.round((tier1.filter((t) => ['met', 'meeting_booked', 'follow_up', 'closed_won'].includes(t.status)).length / tier1.length) * 100) : 0;
  const overallCoverage = targets.length > 0 ? Math.round((targetsEngaged.length / targets.length) * 100) : 0;
  const leadConversionRate = targetsMet.length > 0 ? Math.round((leads.length / targetsMet.length) * 100) : 0;
  const hotConversionRate = leads.length > 0 ? Math.round((hotLeads.length / leads.length) * 100) : 0;

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <Document title="TAG Licensing Expo 2026 Trip Report" author="TAG Grading">
      {/* ==================== COVER PAGE ==================== */}
      <Page size="LETTER" style={s.page}>
        <View style={s.coverBar} />
        <Text style={s.coverKicker}>TAG Grading · Confidential · Internal</Text>
        <Text style={s.coverTitle}>Licensing Expo{'\n'}2026 Trip Report</Text>
        <Text style={s.coverSubtitle}>May 19–21, 2026 · Mandalay Bay Convention Center · Las Vegas</Text>

        <View style={{ marginTop: 50 }}>
          <Text style={s.coverMetaLabel}>Prepared by</Text>
          <Text style={[s.body, { marginBottom: 14 }]}>Richard Winterstern, Lead of Growth &amp; Partnerships</Text>

          <Text style={s.coverMetaLabel}>For</Text>
          <Text style={[s.body, { marginBottom: 14 }]}>Mark (COO) · Steve Kass (Founder) · TAG Customs &amp; Collectibles</Text>

          <Text style={s.coverMetaLabel}>Team on-site</Text>
          <Text style={[s.body, { marginBottom: 14 }]}>
            {users.map((u) => u.name).join(' · ')}
          </Text>

          <Text style={s.coverMetaLabel}>Reporting period</Text>
          <Text style={s.body}>May 18 (Travel Day) – May 21, 2026 (Show Close)</Text>
        </View>

        <Text style={[s.coverMeta, { position: 'absolute', bottom: 50, left: 36, right: 36 }]}>
          <Text style={s.bold}>Confidential — for TAG internal use only.</Text>{' '}
          Contains competitive intelligence, internal economics, and unconfirmed partnership status.
          Do not forward outside TAG.{'\n'}Generated {new Date(data.generatedAt).toLocaleDateString('en-US', { dateStyle: 'long' })}.
        </Text>
      </Page>

      {/* ==================== TABLE OF CONTENTS ==================== */}
      <Page size="LETTER" style={s.page}>
        <BrandBar type="Trip Report" />
        <Text style={s.title}>Contents</Text>
        <View style={{ marginTop: 12 }}>
          <TocEntry n="01" title="Executive Summary" />
          <TocEntry n="02" title="Pipeline Waterfall — Targets to Closed" />
          <TocEntry n="03" title="Tier 1 Target Coverage" />
          <TocEntry n="04" title="Track Analysis — Entertainment, Sports, CPG, Japan, Retail" />
          <TocEntry n="05" title="Meetings Held — Day-by-Day" />
          <TocEntry n="06" title="Leads Captured" />
          <TocEntry n="07" title="Competitive Intelligence" />
          <TocEntry n="08" title="Unconverted Tier 1 — Follow-up Priorities" />
          {options.includePhotos && attachments.length > 0 && <TocEntry n="09" title="Photo Evidence" />}
          {options.includeDebriefs && debriefs.length > 0 && <TocEntry n="10" title="Daily Debriefs" />}
          <TocEntry n="11" title="Recommendations — 2027 Planning" />
        </View>
        <Footer pageLabel="Contents" />
      </Page>

      {/* ==================== 1. EXECUTIVE SUMMARY ==================== */}
      <Page size="LETTER" style={s.page}>
        <BrandBar type="Trip Report" />
        <Text style={s.coverKicker}>Section 01</Text>
        <Text style={s.title}>Executive Summary</Text>
        <Text style={s.subtitle}>The decision-ready view for Mark and Steve</Text>

        <View style={s.statRow}>
          <Stat label="Tier 1 coverage" value={tier1Coverage} sub={`${targetsEngaged.filter((t) => t.tier === 'tier_1').length} of ${tier1.length} engaged · %`} />
          <Stat label="Meetings held" value={meetings.length} sub={`across ${meetingsByDay.size || 3} days`} />
          <Stat label="Leads captured" value={leads.length} sub={`${hotLeads.length} hot · ${warmLeads.length} warm`} />
          <Stat label="Intel items" value={intel.length} sub={`${highIntel.length} high-significance`} />
        </View>

        <View style={[s.callout, s.calloutGold]} wrap={false}>
          <Text style={[s.calloutTitle, s.calloutGoldTitle]}>Bottom line</Text>
          <Text style={s.calloutBody}>
            {tier1Coverage >= 75
              ? `Strong coverage — ${tier1Coverage}% of Tier 1 targets engaged. `
              : tier1Coverage >= 50
              ? `Moderate coverage — ${tier1Coverage}% of Tier 1 engaged. Follow-up priority is closing the remaining gap. `
              : `Coverage gap — only ${tier1Coverage}% of Tier 1 engaged. Post-show outreach is the difference between a trip and a pipeline. `}
            {hotLeads.length > 0 && `${hotLeads.length} hot lead${hotLeads.length !== 1 ? 's' : ''} need immediate follow-up (T+48h). `}
            {highIntel.length > 0 && `${highIntel.length} high-significance intel item${highIntel.length !== 1 ? 's' : ''} logged — see Section 07 for the competitive read.`}
          </Text>
        </View>

        <Text style={s.h2}>What shifted this trip</Text>
        <Text style={s.body}>
          TAG arrived at Licensing Expo 2026 positioned as a credible non-Collectors grader at the moment
          the grading landscape consolidated (PSA, PCGS, SGC, WATA, Beckett under one roof, ~80% of volume)
          and Panini pivoted to entertainment licensing after losing NFL exclusivity to Fanatics. The Sonic
          × Panini × WildBrain CPLG three-way, Pokémon&apos;s 30th-anniversary retail push, and Netflix&apos;s
          KPop Demon Hunters co-master licensing structure together formed the richest single week the show
          has ever reflected. This section quantifies what we captured against that backdrop.
        </Text>

        <Text style={s.h2}>Top 5 outcomes</Text>
        {hotLeads.slice(0, 5).map((l, i) => (
          <View key={l.id} style={{ marginBottom: 8 }} wrap={false}>
            <Text style={[s.body, { marginBottom: 2 }]}>
              <Text style={s.bold}>{i + 1}. {l.full_name}</Text> · {l.company}
              {l.title ? ` · ${l.title}` : ''}
            </Text>
            {l.next_action && <Text style={[s.muted, { fontSize: 9 }]}>Next: {l.next_action}</Text>}
          </View>
        ))}
        {hotLeads.length === 0 && (
          <Text style={[s.body, s.italic, s.muted]}>No hot leads flagged — review lead temperature before finalizing the report.</Text>
        )}

        {options.nextSteps && (
          <View style={[s.callout, { marginTop: 16 }]} wrap={false}>
            <Text style={s.calloutTitle}>Recommended next steps</Text>
            <Text style={s.calloutBody}>{options.nextSteps}</Text>
          </View>
        )}

        <Footer pageLabel="01 · Executive Summary" />
      </Page>

      {/* ==================== 2. PIPELINE WATERFALL ==================== */}
      <Page size="LETTER" style={s.page}>
        <BrandBar type="Trip Report" />
        <Text style={s.coverKicker}>Section 02</Text>
        <Text style={s.title}>Pipeline Waterfall</Text>
        <Text style={s.subtitle}>Targets → engaged → met → leads → hot leads → closed</Text>

        <Text style={s.sectionIntro}>
          The funnel below reads left-to-right. Each stage is a filter on the previous. Drop-off between
          stages is where 2027 planning should focus — if most of the loss is between &ldquo;engaged&rdquo;
          and &ldquo;met,&rdquo; we need more on-floor throughput (bigger team, pre-booked slots). If the loss is
          between &ldquo;met&rdquo; and &ldquo;hot leads,&rdquo; we need better qualification or a stronger pitch.
        </Text>

        <View style={s.kpiRow}>
          <Kpi label="Targets tracked" value={targets.length} sub="full list" />
          <Text style={s.kpiArrow}>→</Text>
          <Kpi label="Engaged" value={targetsEngaged.length} pct={targets.length ? Math.round((targetsEngaged.length / targets.length) * 100) : 0} />
          <Text style={s.kpiArrow}>→</Text>
          <Kpi label="Met on floor" value={targetsMet.length} pct={targetsEngaged.length ? Math.round((targetsMet.length / targetsEngaged.length) * 100) : 0} />
          <Text style={s.kpiArrow}>→</Text>
          <Kpi label="Closed / Won" value={targetsClosed.length} pct={targetsMet.length ? Math.round((targetsClosed.length / targetsMet.length) * 100) : 0} />
        </View>

        <Text style={s.h3}>Target tier distribution</Text>
        <Bar label={`Tier 1 (must-meet)`} value={tier1.length} max={targets.length} />
        <Bar label={`Tier 2 (high-priority)`} value={tier2.length} max={targets.length} />
        <Bar label={`Tier 3 (exploratory)`} value={tier3.length} max={targets.length} />
        <Bar label={`Nice-to-meet`} value={nice.length} max={targets.length} />
        <Bar label={`Opportunistic`} value={opp.length} max={targets.length} />

        <Text style={s.h3}>Lead temperature mix</Text>
        <Bar label="Hot" value={hotLeads.length} max={leads.length || 1} tone="hot" />
        <Bar label="Warm" value={warmLeads.length} max={leads.length || 1} tone="warm" />
        <Bar label="Cold" value={coldLeads.length} max={leads.length || 1} />

        <Text style={s.h3}>Follow-up stage (where the pipeline sits right now)</Text>
        {['not_started', 't1_immediate_thanks', 't2_value_add', 't3_proposal'].map((stage) => {
          const count = leadsByStage.get(stage) ?? 0;
          const label = stage === 'not_started' ? 'Not started (T+0)'
            : stage === 't1_immediate_thanks' ? 'Touch 1 — Thanks (T+48h)'
            : stage === 't2_value_add' ? 'Touch 2 — Value add (T+7d)'
            : 'Touch 3 — Proposal (T+14d)';
          return <Bar key={stage} label={label} value={count} max={leads.length || 1} />;
        })}

        <Text style={s.h3}>Conversion ratios</Text>
        <Text style={s.body}>
          <Text style={s.bold}>Leads per target met:</Text> {leadConversionRate}% — we captured {leads.length} lead{leads.length !== 1 ? 's' : ''} from {targetsMet.length} target{targetsMet.length !== 1 ? 's' : ''} met.{'\n'}
          <Text style={s.bold}>Hot lead rate:</Text> {hotConversionRate}% of captured leads qualified as hot.{'\n'}
          <Text style={s.bold}>Overall coverage:</Text> {overallCoverage}% of tracked targets reached at least &ldquo;meeting booked&rdquo; status.
        </Text>

        <Footer pageLabel="02 · Pipeline" />
      </Page>

      {/* ==================== 3. TIER 1 TARGET COVERAGE ==================== */}
      <Page size="LETTER" style={s.page}>
        <BrandBar type="Trip Report" />
        <Text style={s.coverKicker}>Section 03</Text>
        <Text style={s.title}>Tier 1 Target Coverage</Text>
        <Text style={s.subtitle}>
          {tier1.length} must-meet targets · {targetsEngaged.filter((t) => t.tier === 'tier_1').length} engaged ({tier1Coverage}%)
        </Text>

        <Text style={s.sectionIntro}>
          Tier 1 is where the trip is won or lost. Each row below is a target flagged as mission-critical
          pre-trip. Status reflects the end state on show-close. The &ldquo;track&rdquo; column maps to the four
          strategic pillars: Manufacturer Partnership (card manufacturers), TAG Customs (IP holders),
          Backflip-style CPG (consumer brands), and sports licensing.
        </Text>

        <View style={s.tableHeader}>
          <Text style={[s.th, { flex: 3 }]}>Company</Text>
          <Text style={[s.th, { flex: 2 }]}>Track</Text>
          <Text style={[s.th, { flex: 2 }]}>Status</Text>
          <Text style={[s.th, { flex: 1 }]}>Priority</Text>
          <Text style={[s.th, { flex: 1 }]}>Mtgs</Text>
        </View>
        {tier1.map((t) => {
          const tMeetings = meetings.filter((m) => m.target_id === t.id).length;
          return (
            <View key={t.id} style={s.tableRow} wrap={false}>
              <Text style={[s.tdLg, { flex: 3 }]}>{t.company_name}</Text>
              <Text style={[s.tdSm, { flex: 2 }]}>{TRACK_LABELS[t.track] ?? t.track.replace(/_/g, ' ')}</Text>
              <Text style={[s.tdLg, { flex: 2 }]}>{t.status.replace(/_/g, ' ')}</Text>
              <Text style={[s.tdSm, { flex: 1 }]}>{t.priority}</Text>
              <Text style={[s.tdLg, { flex: 1, fontFamily: 'Courier' }]}>{tMeetings}</Text>
            </View>
          );
        })}

        <Footer pageLabel="03 · Tier 1 Coverage" />
      </Page>

      {/* ==================== 4. TRACK ANALYSIS ==================== */}
      <Page size="LETTER" style={s.page}>
        <BrandBar type="Trip Report" />
        <Text style={s.coverKicker}>Section 04</Text>
        <Text style={s.title}>Track Analysis</Text>
        <Text style={s.subtitle}>Coverage &amp; conversion by strategic pillar</Text>

        <Text style={s.sectionIntro}>
          Each track below is a coherent go-to-market motion with its own proof point and pitch. Track-level
          performance tells you where TAG has product-market fit on the show floor — the tracks with the highest
          lead-to-target ratio are the ones worth doubling down on in 2027.
        </Text>

        <View style={s.tableHeader}>
          <Text style={[s.th, { flex: 3 }]}>Track</Text>
          <Text style={[s.th, { flex: 1, textAlign: 'right' }]}>Targets</Text>
          <Text style={[s.th, { flex: 1, textAlign: 'right' }]}>Engaged</Text>
          <Text style={[s.th, { flex: 1, textAlign: 'right' }]}>Leads</Text>
          <Text style={[s.th, { flex: 1, textAlign: 'right' }]}>Hot</Text>
          <Text style={[s.th, { flex: 1, textAlign: 'right' }]}>Conv %</Text>
        </View>
        {trackAnalysis.map((t) => {
          const conv = t.engaged > 0 ? Math.round((t.leads / t.engaged) * 100) : 0;
          return (
            <View key={t.track} style={s.tableRow} wrap={false}>
              <Text style={[s.tdLg, { flex: 3 }]}>{t.label}</Text>
              <Text style={[s.tdLg, { flex: 1, textAlign: 'right', fontFamily: 'Courier' }]}>{t.total}</Text>
              <Text style={[s.tdLg, { flex: 1, textAlign: 'right', fontFamily: 'Courier' }]}>{t.engaged}</Text>
              <Text style={[s.tdLg, { flex: 1, textAlign: 'right', fontFamily: 'Courier' }]}>{t.leads}</Text>
              <Text style={[s.tdLg, { flex: 1, textAlign: 'right', fontFamily: 'Courier', color: t.hotLeads > 0 ? COLORS.goldDark : COLORS.cold }]}>{t.hotLeads}</Text>
              <Text style={[s.tdLg, { flex: 1, textAlign: 'right', fontFamily: 'Courier' }]}>{conv}%</Text>
            </View>
          );
        })}

        <Text style={s.h2}>Operational split</Text>
        <Text style={s.h3}>Meetings owned — by attendee</Text>
        {users.map((u) => {
          const count = meetingsByUser.get(u.id) ?? 0;
          const maxCount = Math.max(1, ...Array.from(meetingsByUser.values()));
          return <Bar key={u.id} label={u.name} value={count} max={maxCount} />;
        })}

        <Text style={s.h3}>Leads captured — by attendee</Text>
        {users.map((u) => {
          const count = leadsByUser.get(u.id) ?? 0;
          const maxCount = Math.max(1, ...Array.from(leadsByUser.values()));
          return <Bar key={u.id} label={u.name} value={count} max={maxCount} />;
        })}

        <Text style={s.h3}>Meeting volume — by day</Text>
        {dayList.map((d) => {
          const count = meetingsByDay.get(d) ?? 0;
          const maxCount = Math.max(1, ...Array.from(meetingsByDay.values()));
          const label = d === '2026-05-18' ? 'Mon May 18 (Travel)'
            : d === '2026-05-19' ? 'Tue May 19 (Day 1)'
            : d === '2026-05-20' ? 'Wed May 20 (Day 2)'
            : 'Thu May 21 (Day 3)';
          return <Bar key={d} label={label} value={count} max={maxCount} />;
        })}

        <Footer pageLabel="04 · Tracks" />
      </Page>

      {/* ==================== 5. MEETINGS LOG ==================== */}
      {filteredMeetings.length > 0 && (
        <Page size="LETTER" style={s.page}>
          <BrandBar type="Trip Report" />
          <Text style={s.coverKicker}>Section 05</Text>
          <Text style={s.title}>Meetings — Day-by-Day Log</Text>
          <Text style={s.subtitle}>
            {options.includeMeetings === 'tier1' ? `Tier 1 only · ${filteredMeetings.length} meetings` : `${filteredMeetings.length} meetings across ${meetingsByDay.size || 3} days`}
          </Text>

          {dayList.map((day) => {
            const dayMtgs = filteredMeetings.filter((m) => m.start_at.slice(0, 10) === day);
            if (dayMtgs.length === 0) return null;
            const dayLabel = day === '2026-05-18' ? 'Monday, May 18 — Travel Day'
              : day === '2026-05-19' ? 'Tuesday, May 19 — Day 1'
              : day === '2026-05-20' ? 'Wednesday, May 20 — Day 2'
              : 'Thursday, May 21 — Day 3';
            return (
              <View key={day}>
                <Text style={s.h2}>{dayLabel}</Text>
                {dayMtgs.sort((a, b) => a.start_at.localeCompare(b.start_at)).map((m) => {
                  const creator = m.created_by ? usersById.get(m.created_by) : null;
                  return (
                    <View key={m.id} style={s.card} wrap={false}>
                      <View style={s.pillRow}>
                        {m.target?.tier === 'tier_1' && <Text style={[s.pill, s.pillTier1]}>TIER 1</Text>}
                        <Text style={[s.pill, s.pillNeutral]}>{m.type.replace(/_/g, ' ').toUpperCase()}</Text>
                        {m.status && m.status !== 'scheduled' && <Text style={[s.pill, s.pillCold]}>{m.status.toUpperCase()}</Text>}
                      </View>
                      <Text style={s.cardTitle}>{m.title}</Text>
                      <Text style={s.cardMeta}>
                        {fmtTime(m.start_at)} – {fmtTime(m.end_at)}
                        {m.location ? ` · ${m.location}` : ''}
                        {creator ? ` · Created by ${creator.name.split(' ')[0]}` : ''}
                      </Text>
                      {m.target?.company_name && (
                        <Text style={[s.cardMeta, s.bold]}>{m.target.company_name}</Text>
                      )}
                      {m.agenda && <Text style={[s.body, { marginTop: 3 }]}><Text style={s.bold}>Agenda: </Text>{m.agenda}</Text>}
                      {m.outcome && <Text style={s.body}><Text style={s.bold}>Outcome: </Text>{m.outcome}</Text>}
                      {m.notes && <Text style={s.body}><Text style={s.bold}>Notes: </Text>{m.notes}</Text>}
                      {m.next_action && <Text style={[s.body, { color: COLORS.teal700 }]}><Text style={s.bold}>Next: </Text>{m.next_action}</Text>}
                    </View>
                  );
                })}
              </View>
            );
          })}

          <Footer pageLabel="05 · Meetings" />
        </Page>
      )}

      {/* ==================== 6. LEADS ==================== */}
      {filteredLeads.length > 0 && (
        <Page size="LETTER" style={s.page}>
          <BrandBar type="Trip Report" />
          <Text style={s.coverKicker}>Section 06</Text>
          <Text style={s.title}>Leads Captured</Text>
          <Text style={s.subtitle}>
            {options.includeLeads === 'hot' ? `Hot leads only · ${filteredLeads.length}` : `${filteredLeads.length} total · ${hotLeads.length} hot · ${warmLeads.length} warm · ${coldLeads.length} cold`}
          </Text>

          <Text style={s.sectionIntro}>
            Sorted hot → warm → cold. Hot leads require a T+48h thanks touch; warm within T+7d with a
            value-add. Cold leads are logged but not actively worked unless they self-reactivate.
          </Text>

          {['hot', 'warm', 'cold'].map((temp) => {
            const group = filteredLeads.filter((l) => l.temperature === temp);
            if (group.length === 0) return null;
            return (
              <View key={temp}>
                <Text style={s.h2}>{temp.charAt(0).toUpperCase() + temp.slice(1)} — {group.length}</Text>
                {group.map((l) => {
                  const tempStyle = l.temperature === 'hot' ? s.pillHot : l.temperature === 'warm' ? s.pillWarm : s.pillCold;
                  const owner = l.owner_id ? usersById.get(l.owner_id) : null;
                  return (
                    <View key={l.id} style={[s.card, l.temperature === 'hot' ? s.cardHot : {}]} wrap={false}>
                      <View style={s.pillRow}>
                        <Text style={[s.pill, tempStyle]}>{l.temperature}</Text>
                        {l.target?.company_name && <Text style={[s.pill, s.pillNeutral]}>{l.target.company_name}</Text>}
                        <Text style={[s.pill, s.pillCold]}>{l.follow_up_stage.replace(/_/g, ' ')}</Text>
                      </View>
                      <Text style={s.cardTitle}>{l.full_name} · {l.company}</Text>
                      {l.title && <Text style={s.cardMeta}>{l.title}{l.email ? ` · ${l.email}` : ''}</Text>}
                      {!l.title && l.email && <Text style={s.cardMeta}>{l.email}</Text>}
                      {owner && <Text style={s.cardMeta}>Owner: {owner.name}</Text>}
                      {l.next_action && <Text style={[s.body, { color: COLORS.teal700 }]}><Text style={s.bold}>Next: </Text>{l.next_action}{l.deadline ? ` · due ${fmtDate(l.deadline)}` : ''}</Text>}
                      {l.notes && <Text style={[s.body, { marginTop: 3 }]}>{l.notes}</Text>}
                    </View>
                  );
                })}
              </View>
            );
          })}

          <Footer pageLabel="06 · Leads" />
        </Page>
      )}

      {/* ==================== 7. COMPETITIVE INTELLIGENCE ==================== */}
      {filteredIntel.length > 0 && (
        <Page size="LETTER" style={s.page}>
          <BrandBar type="Trip Report" />
          <Text style={s.coverKicker}>Section 07</Text>
          <Text style={s.title}>Competitive Intelligence</Text>
          <Text style={s.subtitle}>
            {filteredIntel.length} items · {highIntel.length} high-significance · organized by subject
          </Text>

          <Text style={s.sectionIntro}>
            Intel is grouped by subject — the thing the observation is about (PSA, CGC, Beckett, Fanatics,
            Panini, or a specific target company). High-significance items are the ones that materially
            affect TAG strategy or are worth surfacing to Mark and Steve before any 2027 planning conversation.
          </Text>

          {Array.from(intelBySubject.entries()).map(([subject, items]) => {
            const subjectItems = items.filter((i) => filteredIntel.some((fi) => fi.id === i.id));
            if (subjectItems.length === 0) return null;
            const subjectHigh = subjectItems.filter((i) => i.significance === 'high').length;
            const label = subject.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
            return (
              <View key={subject}>
                <Text style={s.h2}>{label}{subjectHigh > 0 ? ` · ${subjectHigh} high` : ''}</Text>
                {subjectItems
                  .sort((a, b) => b.date_observed.localeCompare(a.date_observed))
                  .map((i) => (
                    <View key={i.id} style={[s.card, i.significance === 'high' ? s.cardHot : {}]} wrap={false}>
                      <View style={s.pillRow}>
                        <Text style={[s.pill, s.pillCold]}>{i.type.replace(/_/g, ' ')}</Text>
                        {i.significance === 'high' && <Text style={[s.pill, s.pillTier1]}>HIGH</Text>}
                        <Text style={[s.pill, s.pillCold]}>{fmtDate(i.date_observed)}</Text>
                      </View>
                      <Text style={s.cardTitle}>{i.headline}</Text>
                      {i.details && <Text style={s.body}>{i.details}</Text>}
                      {i.source && <Text style={[s.muted, s.italic]}>Source: {i.source}</Text>}
                    </View>
                  ))}
              </View>
            );
          })}

          <Footer pageLabel="07 · Intel" />
        </Page>
      )}

      {/* ==================== 8. UNCONVERTED TIER 1 ==================== */}
      {tier1Unconverted.length > 0 && (
        <Page size="LETTER" style={s.page}>
          <BrandBar type="Trip Report" />
          <Text style={s.coverKicker}>Section 08</Text>
          <Text style={s.title}>Unconverted Tier 1</Text>
          <Text style={s.subtitle}>
            {tier1Unconverted.length} must-meet targets we did not reach · follow-up priority list
          </Text>

          <View style={[s.callout, s.calloutRed]} wrap={false}>
            <Text style={[s.calloutTitle, s.calloutRedTitle]}>Why this section matters</Text>
            <Text style={s.calloutBody}>
              These are the Tier 1 targets that did not advance to met/follow-up/closed. The trip is
              not over until each of these has a named owner and a 30-day action. Left unworked, a
              Tier 1 miss becomes next year&apos;s same miss.
            </Text>
          </View>

          <View style={s.tableHeader}>
            <Text style={[s.th, { flex: 3 }]}>Target</Text>
            <Text style={[s.th, { flex: 2 }]}>Track</Text>
            <Text style={[s.th, { flex: 2 }]}>Status</Text>
            <Text style={[s.th, { flex: 3 }]}>Notes</Text>
          </View>
          {tier1Unconverted.map((t) => (
            <View key={t.id} style={s.tableRow} wrap={false}>
              <Text style={[s.tdLg, { flex: 3 }]}>{t.company_name}</Text>
              <Text style={[s.tdSm, { flex: 2 }]}>{TRACK_LABELS[t.track] ?? t.track.replace(/_/g, ' ')}</Text>
              <Text style={[s.tdLg, { flex: 2 }]}>{t.status.replace(/_/g, ' ')}</Text>
              <Text style={[s.tdSm, { flex: 3 }]}>{t.notes?.slice(0, 80) ?? ''}{t.notes && t.notes.length > 80 ? '…' : ''}</Text>
            </View>
          ))}

          <Footer pageLabel="08 · Unconverted" />
        </Page>
      )}

      {/* ==================== 9. PHOTOS ==================== */}
      {options.includePhotos && attachments.length > 0 && (
        <Page size="LETTER" style={s.page}>
          <BrandBar type="Trip Report" />
          <Text style={s.coverKicker}>Section 09</Text>
          <Text style={s.title}>Photo Evidence</Text>
          <Text style={s.subtitle}>
            {attachments.length} captured · business cards, brochures, booth signage
          </Text>
          <View style={s.photoGrid}>
            {attachments.map((a) => (
              <View key={a.id} style={s.photoWrap} wrap={false}>
                {a.signed_url && <Image src={a.signed_url} style={s.photo} />}
                <Text style={s.photoCaption}>
                  {a.note ?? 'Photo'} — {a.lead_name ?? a.meeting_title ?? '—'}
                </Text>
              </View>
            ))}
          </View>
          <Footer pageLabel="09 · Photos" />
        </Page>
      )}

      {/* ==================== 10. DEBRIEFS ==================== */}
      {options.includeDebriefs && debriefs.length > 0 && (
        <Page size="LETTER" style={s.page}>
          <BrandBar type="Trip Report" />
          <Text style={s.coverKicker}>Section 10</Text>
          <Text style={s.title}>Daily Debriefs</Text>
          <Text style={s.subtitle}>{debriefs.length} submission{debriefs.length !== 1 ? 's' : ''} across the trip</Text>
          {debriefs
            .sort((a, b) => a.debrief_date.localeCompare(b.debrief_date))
            .map((d) => {
              const u = usersById.get(d.user_id);
              return (
                <View key={d.id} style={{ marginBottom: 14 }} wrap={false}>
                  <Text style={s.h3}>{fmtDate(d.debrief_date)} — {u?.name ?? 'Unknown'}</Text>
                  {d.meetings_taken && <DebriefRow label="Meetings" value={d.meetings_taken} />}
                  {d.booths_visited && <DebriefRow label="Booths" value={d.booths_visited} />}
                  {d.contacts_captured && <DebriefRow label="Contacts" value={d.contacts_captured} />}
                  {d.competitive_intel && <DebriefRow label="Intel" value={d.competitive_intel} />}
                  {d.surprises && <DebriefRow label="Surprises" value={d.surprises} />}
                  {d.open_follow_ups && <DebriefRow label="Follow-ups" value={d.open_follow_ups} />}
                  {d.one_thing_different && <DebriefRow label="Do differently" value={d.one_thing_different} />}
                </View>
              );
            })}
          <Footer pageLabel="10 · Debriefs" />
        </Page>
      )}

      {/* ==================== 11. RECOMMENDATIONS ==================== */}
      <Page size="LETTER" style={s.page}>
        <BrandBar type="Trip Report" />
        <Text style={s.coverKicker}>Section 11</Text>
        <Text style={s.title}>Recommendations — 2027 Planning</Text>
        <Text style={s.subtitle}>Where the trip pointed us for next year</Text>

        <Text style={s.sectionIntro}>
          Based on {tier1Coverage}% Tier 1 coverage, {leads.length} leads captured, and {highIntel.length} high-significance
          intel items, the following are the five recommended plays for TAG&apos;s Licensing Expo 2027 strategy.
        </Text>

        <Recommendation n={1} title="Lock Tier 1 pre-schedule by April 2027" desc={`Tier 1 targets fill their show calendar 4–6 weeks out. For 2027, use the Matchmaking Lounge priority-booking window immediately upon its opening — TAG's 2026 Tier 1 coverage of ${tier1Coverage}% suggests ${tier1Coverage < 80 ? 'calendar access is the primary constraint, not pitch quality' : 'booking cadence is working and should be preserved'}.`} />
        <Recommendation n={2} title={`Double down on ${trackAnalysis.sort((a, b) => b.hotLeads - a.hotLeads)[0]?.label ?? 'the strongest track'}`} desc={`Track-level hot lead density was highest in ${trackAnalysis.sort((a, b) => b.hotLeads - a.hotLeads)[0]?.label ?? 'N/A'} (${trackAnalysis.sort((a, b) => b.hotLeads - a.hotLeads)[0]?.hotLeads ?? 0} hot leads from ${trackAnalysis.sort((a, b) => b.hotLeads - a.hotLeads)[0]?.engaged ?? 0} engaged targets). Pre-trip resource allocation for 2027 should reflect this.`} />
        <Recommendation n={3} title="Consider a sponsored presence or speaking slot" desc="Current trip was attendee-only. For 2027, evaluate a mid-tier sponsorship — the Matchmaking Lounge, a Platinum-style booth, or a panel seat on the F&B or Entertainment tracks. Sponsor slots drive inbound Tier 1 meetings that we chased down manually this year." />
        <Recommendation n={4} title="Bigger team, narrower coverage" desc={`With Richard and Michael as the anchor pair covering ${meetings.length} meetings, per-attendee bandwidth was the binding constraint. 2027 should either grow the team by 1–2 specialists (Japan, sports, or retail) or deliberately narrow the Tier 1 list to what an anchor-pair-only team can close in depth.`} />
        <Recommendation n={5} title="Post-show follow-up discipline is the win condition" desc={`${leads.length} leads captured; ${hotLeads.length} currently flagged hot. If the T+48h, T+7d, T+14d cadence slips, the trip spend does not convert. Lock follow-up ownership and deadlines in the first 72 hours off-show — before momentum evaporates.`} />

        <Footer pageLabel="11 · Recommendations" />
      </Page>
    </Document>
  );
}

function Stat({ label, value, sub }: { label: string; value: number; sub?: string }) {
  return (
    <View style={s.stat}>
      <Text style={s.statLabel}>{label}</Text>
      <Text style={s.statValue}>{value}</Text>
      {sub && <Text style={s.statSub}>{sub}</Text>}
    </View>
  );
}

function DebriefRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ marginBottom: 4 }}>
      <Text style={[s.muted, { fontSize: 8, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase', letterSpacing: 0.4 }]}>{label}</Text>
      <Text style={s.body}>{value}</Text>
    </View>
  );
}

// Track labels — duplicated here rather than imported from Pills.tsx
// because Pills.tsx ships browser-style strings and this file is rendered
// through React-PDF which has no DOM.
const TRACK_LABELS: Record<string, string> = {
  entertainment_ip: 'Entertainment & IP',
  sports: 'Sports',
  cpg_backflip: 'CPG / Backflip',
  japanese_ip: 'Japanese IP',
  retail: 'Retail',
  agent: 'Licensing Agent',
  competitor: 'Competitor',
  new_surfaced: 'Newly Surfaced',
};

function TocEntry({ n, title }: { n: string; title: string }) {
  return (
    <View style={s.tocRow}>
      <Text style={s.tocNum}>{n}</Text>
      <Text style={s.tocTitle}>{title}</Text>
    </View>
  );
}

function Kpi({ label, value, sub, pct }: { label: string; value: number; sub?: string; pct?: number }) {
  return (
    <View style={s.kpi}>
      <Text style={s.kpiLabel}>{label}</Text>
      <Text style={s.kpiValue}>{value}</Text>
      {pct !== undefined && <Text style={s.kpiPct}>{pct}% retained</Text>}
      {sub && !pct && <Text style={s.kpiPct}>{sub}</Text>}
    </View>
  );
}

function Bar({ label, value, max, tone }: { label: string; value: number; max: number; tone?: 'hot' | 'warm' }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  const fillColor = tone === 'hot' ? COLORS.hotFg : tone === 'warm' ? COLORS.goldDark : COLORS.teal700;
  return (
    <View style={s.splitRow}>
      <Text style={s.splitLabel}>{label}</Text>
      <View style={s.splitBar}>
        <View style={[s.splitBarFill, { width: `${pct}%`, backgroundColor: fillColor }]} />
      </View>
      <Text style={s.splitValue}>{value} ({pct}%)</Text>
    </View>
  );
}

function Recommendation({ n, title, desc }: { n: number; title: string; desc: string }) {
  return (
    <View style={s.recItem} wrap={false}>
      <Text style={s.recNum}>{n}.</Text>
      <View style={s.recBody}>
        <Text style={s.recTitle}>{title}</Text>
        <Text style={s.recDesc}>{desc}</Text>
      </View>
    </View>
  );
}
