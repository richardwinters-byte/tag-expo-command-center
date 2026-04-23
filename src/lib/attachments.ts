import { createSupabaseBrowserClient } from './supabase-browser';
import { compressImage } from './compress';
import type { Attachment } from './types';

const BUCKET = 'attachments';
const SIGNED_URL_TTL_SECONDS = 60 * 60; // 1 hour — plenty for a session

export type UploadTarget =
  | { kind: 'lead'; id: string }
  | { kind: 'meeting'; id: string };

/**
 * Compress and upload an image, then create the attachments row.
 * Returns the new Attachment (without signed_url; call getSignedUrls separately).
 */
export async function uploadAttachment(
  file: File,
  target: UploadTarget,
  opts?: { note?: string; userId?: string },
): Promise<Attachment> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Only image files are supported');
  }

  const supabase = createSupabaseBrowserClient();
  const compressed = await compressImage(file);

  // Path: attachments/{kind}/{parent_id}/{random}.jpg
  const parentFolder = target.kind === 'lead' ? 'leads' : 'meetings';
  const random = crypto.randomUUID();
  const storagePath = `${parentFolder}/${target.id}/${random}.jpg`;

  const { error: uploadErr } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, compressed.blob, {
      contentType: compressed.mime_type,
      cacheControl: '3600',
      upsert: false,
    });

  if (uploadErr) {
    // Translate the most common deploy-time failure into actionable text
    const raw = uploadErr.message ?? '';
    if (/not.*found|bucket/i.test(raw)) {
      throw new Error(
        `Photo upload failed — the '${BUCKET}' storage bucket is not configured. ` +
        `An admin needs to run migration 0002_attachments.sql in Supabase.`
      );
    }
    if (/permission|policy|unauthorized|forbidden/i.test(raw)) {
      throw new Error(
        `Photo upload failed — you don't have permission. ` +
        `Make sure you're signed in and migration 0002_attachments.sql has been applied.`
      );
    }
    throw new Error(`Upload failed: ${raw}`);
  }

  const row: Partial<Attachment> & { lead_id: string | null; meeting_id: string | null } = {
    lead_id: target.kind === 'lead' ? target.id : null,
    meeting_id: target.kind === 'meeting' ? target.id : null,
    storage_path: storagePath,
    mime_type: compressed.mime_type,
    byte_size: compressed.byte_size,
    width: compressed.width,
    height: compressed.height,
    note: opts?.note ?? null,
    uploaded_by: opts?.userId ?? null,
  };

  const { data, error } = await supabase
    .from('attachments')
    .insert(row)
    .select()
    .single();

  if (error) {
    // Best-effort cleanup of the uploaded blob if the DB insert failed
    await supabase.storage.from(BUCKET).remove([storagePath]);
    throw new Error(`Save failed: ${error.message}`);
  }

  return data as Attachment;
}

/**
 * Given a list of attachments, populate signed_url on each.
 * Returns a new array (does not mutate input).
 */
export async function hydrateSignedUrls(attachments: Attachment[]): Promise<Attachment[]> {
  if (attachments.length === 0) return [];
  const supabase = createSupabaseBrowserClient();
  const paths = attachments.map((a) => a.storage_path);
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrls(paths, SIGNED_URL_TTL_SECONDS);
  if (error || !data) {
    throw new Error(`Signed URL fetch failed: ${error?.message ?? 'unknown'}`);
  }
  const byPath = new Map(data.map((r) => [r.path, r.signedUrl]));
  return attachments.map((a) => ({
    ...a,
    signed_url: byPath.get(a.storage_path) ?? undefined,
  }));
}

/**
 * Delete an attachment row + its storage blob.
 */
export async function deleteAttachment(attachment: Attachment): Promise<void> {
  const supabase = createSupabaseBrowserClient();
  // Delete the DB row first; the storage cleanup is best-effort.
  const { error: dbErr } = await supabase.from('attachments').delete().eq('id', attachment.id);
  if (dbErr) throw new Error(`Delete failed: ${dbErr.message}`);
  await supabase.storage.from(BUCKET).remove([attachment.storage_path]);
}

/**
 * Update attachment note.
 */
export async function updateAttachmentNote(id: string, note: string | null): Promise<void> {
  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase.from('attachments').update({ note }).eq('id', id);
  if (error) throw new Error(`Update failed: ${error.message}`);
}

/**
 * List attachments for a lead or meeting, with signed URLs populated.
 */
export async function listAttachments(target: UploadTarget): Promise<Attachment[]> {
  const supabase = createSupabaseBrowserClient();
  const column = target.kind === 'lead' ? 'lead_id' : 'meeting_id';
  const { data, error } = await supabase
    .from('attachments')
    .select('*')
    .eq(column, target.id)
    .order('created_at', { ascending: true });
  if (error || !data) throw new Error(`Fetch failed: ${error?.message ?? 'unknown'}`);
  return hydrateSignedUrls(data as Attachment[]);
}
