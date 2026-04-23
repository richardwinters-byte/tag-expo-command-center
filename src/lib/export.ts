'use client';

import { pdf } from '@react-pdf/renderer';
import { createSupabaseBrowserClient } from './supabase-browser';
import type { Attachment, Debrief, Intel, Lead, Meeting, Target, User } from './types';
import { DebriefPdf, TripReportPdf, type DebriefExportData, type TripReportData, type TripReportOptions } from '@/components/app/ExportPdfs';
import React from 'react';

const BUCKET = 'attachments';
const EXPORT_URL_TTL = 60 * 60 * 6; // 6 hours — plenty for PDF render + user download

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ============================================================
// DEBRIEF EXPORT
// ============================================================
export async function exportDebriefPdf(dates: string[]): Promise<void> {
  const supabase = createSupabaseBrowserClient();
  const [usersRes, debriefsRes] = await Promise.all([
    supabase.from('users').select('*'),
    supabase.from('debriefs').select('*').in('debrief_date', dates),
  ]);
  if (usersRes.error) throw new Error(`Failed to load users: ${usersRes.error.message}`);
  if (debriefsRes.error) throw new Error(`Failed to load debriefs: ${debriefsRes.error.message}`);
  const users = usersRes.data;
  const debriefs = debriefsRes.data;
  if (!users || !debriefs) throw new Error('Failed to load debrief data (empty response)');

  const usersById = new Map(users.map((u) => [u.id, u as User]));

  const byDate: DebriefExportData[] = dates.sort().map((date) => {
    const submissions = (debriefs as Debrief[])
      .filter((d) => d.debrief_date === date)
      .map((d) => ({ user: usersById.get(d.user_id) ?? { id: d.user_id, email: '', name: 'Unknown', role: 'member' as const, initials: null, color: null, phone: null, signature: null, created_at: '' }, debrief: d }));
    return { date, submissions };
  });

  const blob = await pdf(React.createElement(DebriefPdf, { data: byDate }) as any).toBlob();
  const filename = dates.length === 1
    ? `tag-debrief-${dates[0]}.pdf`
    : `tag-debrief-${dates[0]}-to-${dates[dates.length - 1]}.pdf`;
  triggerDownload(blob, filename);
}

// ============================================================
// TRIP REPORT EXPORT
// ============================================================
export async function exportTripReportPdf(options: TripReportOptions & { nextSteps?: string }): Promise<void> {
  const supabase = createSupabaseBrowserClient();

  const [usersRes, targetsRes, meetingsRes, leadsRes, intelRes, debriefsRes, attachmentsRes] = await Promise.all([
    supabase.from('users').select('*'),
    supabase.from('targets').select('*'),
    supabase.from('meetings').select('*, target:target_id(id, company_name, tier)').order('start_at'),
    supabase.from('leads').select('*, target:target_id(id, company_name)'),
    supabase.from('intel').select('*, target:target_id(id, company_name)').order('date_observed', { ascending: false }),
    supabase.from('debriefs').select('*').order('debrief_date'),
    options.includePhotos
      ? supabase.from('attachments').select('*, lead:lead_id(full_name), meeting:meeting_id(title)').order('created_at')
      : Promise.resolve({ data: [] }),
  ]);

  if (usersRes.error) throw new Error(`Failed to load users: ${usersRes.error.message}`);
  if (!usersRes.data) throw new Error('Failed to load users (empty response)');
  if (targetsRes.error) throw new Error(`Failed to load targets: ${targetsRes.error.message}`);
  if (meetingsRes.error) throw new Error(`Failed to load meetings: ${meetingsRes.error.message}`);
  if (leadsRes.error) throw new Error(`Failed to load leads: ${leadsRes.error.message}`);
  if (intelRes.error) throw new Error(`Failed to load intel: ${intelRes.error.message}`);
  if (debriefsRes.error) throw new Error(`Failed to load debriefs: ${debriefsRes.error.message}`);
  if (options.includePhotos && (attachmentsRes as any).error) {
    throw new Error(`Failed to load attachments: ${(attachmentsRes as any).error.message}`);
  }

  const users = usersRes.data as User[];
  const targets = (targetsRes.data ?? []) as Target[];
  const meetings = (meetingsRes.data ?? []) as Array<Meeting & { target?: any }>;
  const leads = (leadsRes.data ?? []) as Array<Lead & { target?: any }>;
  const intel = (intelRes.data ?? []) as Array<Intel & { target?: any }>;
  const debriefs = (debriefsRes.data ?? []) as Debrief[];
  let attachments: Array<Attachment & { lead_name?: string; meeting_title?: string }> = [];

  // Hydrate signed URLs for photos
  if (options.includePhotos && attachmentsRes.data && attachmentsRes.data.length > 0) {
    const raw = attachmentsRes.data as any[];
    const paths = raw.map((a) => a.storage_path);
    const { data: urls, error: signErr } = await supabase.storage.from(BUCKET).createSignedUrls(paths, EXPORT_URL_TTL);
    if (signErr) throw new Error(`Failed to generate photo URLs: ${signErr.message}`);
    const byPath = new Map(urls?.map((u) => [u.path, u.signedUrl]) ?? []);
    attachments = raw.map((a) => ({
      ...a,
      signed_url: byPath.get(a.storage_path),
      lead_name: a.lead?.full_name,
      meeting_title: a.meeting?.title,
    }));
  }

  const data: TripReportData = {
    options,
    users,
    targets,
    meetings,
    leads,
    intel,
    debriefs,
    attachments,
    generatedAt: new Date().toISOString(),
  };

  const blob = await pdf(React.createElement(TripReportPdf, { data }) as any).toBlob();
  const timestamp = new Date().toISOString().slice(0, 10);
  triggerDownload(blob, `tag-trip-report-${timestamp}.pdf`);
}
