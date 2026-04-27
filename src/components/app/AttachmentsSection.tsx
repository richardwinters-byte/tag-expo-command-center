'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Camera, Image as ImageIcon, Loader2, X, Trash2, Edit3 } from 'lucide-react';
import {
  uploadAttachment,
  listAttachments,
  deleteAttachment,
  updateAttachmentNote,
  type UploadTarget,
} from '@/lib/attachments';
import type { Attachment } from '@/lib/types';

export function AttachmentsSection({
  target,
  currentUserId,
  users,
}: {
  target: UploadTarget;
  currentUserId?: string;
  users?: Array<{ id: string; name: string; color: string | null }>;
}) {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const libraryInputRef = useRef<HTMLInputElement>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const list = await listAttachments(target);
      setAttachments(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Load failed');
    } finally {
      setLoading(false);
    }
  }, [target]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const onFilesSelected = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setError(null);
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const att = await uploadAttachment(file, target, { userId: currentUserId });
        // Immediately hydrate the signed URL for this single file
        const hydrated = await listAttachments(target);
        setAttachments(hydrated);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setUploading(false);
      // Reset inputs so the same file can be picked again
      if (cameraInputRef.current) cameraInputRef.current.value = '';
      if (libraryInputRef.current) libraryInputRef.current.value = '';
    }
  };

  const onDelete = async (att: Attachment) => {
    if (!confirm('Delete this photo?')) return;
    try {
      await deleteAttachment(att);
      setAttachments((prev) => prev.filter((a) => a.id !== att.id));
      setViewerIndex(null);
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Delete failed');
    }
  };

  const onEditNote = async (att: Attachment) => {
    const next = prompt('Note for this photo (e.g. "biz card front"):', att.note ?? '');
    if (next === null) return;
    const trimmed = next.trim();
    try {
      await updateAttachmentNote(att.id, trimmed || null);
      setAttachments((prev) =>
        prev.map((a) => (a.id === att.id ? { ...a, note: trimmed || null } : a)),
      );
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Update failed');
    }
  };

  return (
    <section>
      <div className="flex items-center justify-between mb-2">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-tag-700">
          Photos {attachments.length > 0 && <span className="text-tag-cold">· {attachments.length}</span>}
        </div>
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-1 text-xs font-medium text-white bg-tag-900 hover:bg-tag-800 rounded-btn px-2.5 py-1.5 disabled:opacity-50"
          >
            <Camera size={13} /> Camera
          </button>
          <button
            type="button"
            onClick={() => libraryInputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-1 text-xs font-medium text-tag-900 bg-white border border-hairline rounded-btn px-2.5 py-1.5 hover:bg-tag-50 disabled:opacity-50"
          >
            <ImageIcon size={13} /> Library
          </button>
        </div>
      </div>

      {/* Hidden file inputs — `capture` triggers camera on mobile */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={(e) => onFilesSelected(e.target.files)}
        className="hidden"
      />
      <input
        ref={libraryInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => onFilesSelected(e.target.files)}
        className="hidden"
      />

      {error && (
        <div className="card card-p mb-2 bg-red-50 border-red-200 text-red-900 text-xs">{error}</div>
      )}

      {uploading && (
        <div className="flex items-center gap-2 text-xs text-tag-cold mb-2">
          <Loader2 size={14} className="animate-spin" /> Compressing and uploading…
        </div>
      )}

      {!loading && attachments.length === 0 && !uploading && (
        <div className="card card-p text-xs text-tag-cold text-center py-6">
          No photos yet. Tap Camera to capture a business card or brochure.
        </div>
      )}

      {attachments.length > 0 && (
        <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
          {attachments.map((att, i) => (
            <button
              key={att.id}
              type="button"
              onClick={() => setViewerIndex(i)}
              className="relative aspect-square rounded-btn overflow-hidden border border-hairline bg-tag-50 group"
            >
              {att.signed_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={att.signed_url}
                  alt={att.note ?? 'Attachment'}
                  className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Loader2 size={16} className="animate-spin text-tag-cold" />
                </div>
              )}
              {att.note && (
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] font-medium px-1.5 py-1 truncate">
                  {att.note}
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Fullscreen viewer */}
      {viewerIndex !== null && attachments[viewerIndex] && (
        <Viewer
          attachment={attachments[viewerIndex]}
          uploader={
            attachments[viewerIndex].uploaded_by
              ? users?.find((u) => u.id === attachments[viewerIndex].uploaded_by)
              : undefined
          }
          onClose={() => setViewerIndex(null)}
          onDelete={() => onDelete(attachments[viewerIndex])}
          onEditNote={() => onEditNote(attachments[viewerIndex])}
          onPrev={viewerIndex > 0 ? () => setViewerIndex(viewerIndex - 1) : undefined}
          onNext={viewerIndex < attachments.length - 1 ? () => setViewerIndex(viewerIndex + 1) : undefined}
        />
      )}
    </section>
  );
}

function Viewer({
  attachment,
  uploader,
  onClose,
  onDelete,
  onEditNote,
  onPrev,
  onNext,
}: {
  attachment: Attachment;
  uploader?: { id: string; name: string; color: string | null };
  onClose: () => void;
  onDelete: () => void;
  onEditNote: () => void;
  onPrev?: () => void;
  onNext?: () => void;
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && onPrev) onPrev();
      if (e.key === 'ArrowRight' && onNext) onNext();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose, onPrev, onNext]);

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col">
      <div
        className="flex items-center justify-between p-3 text-white"
        style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 0.75rem)' }}
      >
        <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-btn hover:bg-white/10" aria-label="Close">
          <X size={20} />
        </button>
        <div className="text-xs font-medium text-white/80 truncate px-2 text-center">
          <div>{attachment.note ?? 'Photo'}</div>
          {uploader && (
            <div className="text-[10px] text-white/60 mt-0.5">
              Captured by {uploader.name.split(' ')[0]}
            </div>
          )}
        </div>
        <div className="flex gap-1">
          <button onClick={onEditNote} className="w-9 h-9 flex items-center justify-center rounded-btn hover:bg-white/10" aria-label="Edit note">
            <Edit3 size={18} />
          </button>
          <button onClick={onDelete} className="w-9 h-9 flex items-center justify-center rounded-btn hover:bg-white/10 text-red-300" aria-label="Delete">
            <Trash2 size={18} />
          </button>
        </div>
      </div>
      <div
        className="flex-1 flex items-center justify-center p-4 relative overflow-hidden"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 1rem)' }}
      >
        {attachment.signed_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={attachment.signed_url}
            alt={attachment.note ?? 'Attachment'}
            className="max-w-full max-h-full object-contain"
          />
        )}
        {onPrev && (
          <button
            onClick={onPrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
            aria-label="Previous"
          >
            ‹
          </button>
        )}
        {onNext && (
          <button
            onClick={onNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
            aria-label="Next"
          >
            ›
          </button>
        )}
      </div>
    </div>
  );
}
