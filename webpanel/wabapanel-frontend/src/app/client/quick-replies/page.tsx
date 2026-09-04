'use client';
import toast from 'react-hot-toast';
import React, { useState, useEffect } from 'react';
import { Plus, MessageCircle, Edit, Trash2 } from 'lucide-react';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import { quickReplyClientApi, uploadApi } from '@/lib/api';
import { adminContentColumnClass, dashboardCardShell } from '@/components/layout/dashboard-ui';

const primaryBtn =
  'inline-flex items-center justify-center gap-1.5 rounded-lg bg-admin-text px-3 py-1.5 text-[13px] font-semibold text-white transition-colors hover:bg-[#1a1a1a] disabled:cursor-not-allowed disabled:opacity-50';
const secondaryBtn =
  'inline-flex items-center justify-center gap-1.5 rounded-lg border border-admin-border bg-white px-3 py-1.5 text-[13px] font-medium text-admin-text transition-colors hover:bg-[#f6f6f7]';
const adminFieldClass =
  'w-full rounded-lg border border-admin-border bg-white px-3 py-2 text-[13px] text-admin-text placeholder:text-admin-text-subdued focus:border-admin-text focus:outline-none focus:ring-1 focus:ring-admin-text';

interface QuickReply {
  _id: string;
  title: string;
  message: string;
  stickerUrl?: string;
  shortcut: string;
  isGlobal: boolean;
}

export default function QuickRepliesPage() {
  const [replies, setReplies] = useState<QuickReply[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<QuickReply | null>(null);
  const [form, setForm] = useState({ title: '', message: '', stickerUrl: '', shortcut: '' });
  const [qrUploading, setQrUploading] = useState(false);
  const qrFileRef = React.useRef<HTMLInputElement>(null);
  const handleQrSticker = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setQrUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('folder', 'stickers');
      const res = await uploadApi.uploadFile(fd);
      setForm((f) => ({ ...f, stickerUrl: res.data.data.url }));
      toast.success('Sticker uploaded');
    } catch {
      toast.error('Upload failed');
    }
    setQrUploading(false);
    if (qrFileRef.current) qrFileRef.current.value = '';
  };
  const [submitting, setSubmitting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const fetchReplies = async () => {
    try {
      const res = await quickReplyClientApi.list();
      setReplies(res.data.data || []);
    } catch {
      /* empty */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReplies();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    if (submitting) return;
    setSubmitting(true);

    e.preventDefault();
    try {
      if (editing) {
        await quickReplyClientApi.update(editing._id, form);
      } else {
        await quickReplyClientApi.create(form);
      }
      setShowForm(false);
      setEditing(null);
      setForm({ title: '', message: '', stickerUrl: '', shortcut: '' });
      fetchReplies();
      toast.success(editing ? 'Quick reply updated' : 'Quick reply created');
    } catch {
      toast.error('Failed to save');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (r: QuickReply) => {
    setEditing(r);
    setForm({ title: r.title, message: r.message, stickerUrl: r.stickerUrl || '', shortcut: r.shortcut });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (submitting) return;
    setSubmitting(true);

    if (!confirm('Delete this quick reply?')) {
      setSubmitting(false);
      return;
    }
    try {
      await quickReplyClientApi.delete(id);
      fetchReplies();
      toast.success('Quick reply deleted');
    } catch {
      toast.error('Delete failed');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const selectableIds = replies.filter((r) => !r.isGlobal).map((r) => r._id);
  const allSelected = selectableIds.length > 0 && selectedIds.length === selectableIds.length;
  const toggleSelectAll = () => setSelectedIds(allSelected ? [] : selectableIds);

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm('Delete ' + selectedIds.length + ' selected items?')) return;
    if (submitting) return;
    setSubmitting(true);
    try {
      await Promise.all(selectedIds.map((id) => quickReplyClientApi.delete(id)));
      toast.success(selectedIds.length + ' items deleted');
      setSelectedIds([]);
      fetchReplies();
    } catch {
      toast.error('Failed to delete some items');
    } finally {
      setSubmitting(false);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ title: '', message: '', stickerUrl: '', shortcut: '' });
    setShowForm(true);
  };

  if (loading) {
    return (
      <div className={`${adminContentColumnClass} space-y-4`}>
        <div className="flex min-h-[280px] items-center justify-center">
          <p className="inline-flex items-center gap-2 text-[13px] text-admin-text-secondary">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-admin-border border-t-admin-text" />
            Loading quick replies…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${adminContentColumnClass} space-y-4`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 shrink-0 text-admin-text-secondary" aria-hidden />
            <h1 className="text-[20px] font-semibold tracking-tight text-admin-text">Quick Replies</h1>
          </div>
          <p className="mt-1 text-[13px] text-admin-text-secondary">
            Pre-saved message templates for fast replies in chat
          </p>
        </div>
        <button type="button" onClick={openCreate} className={primaryBtn}>
          <Plus className="h-4 w-4" />
          Add Quick Reply
        </button>
      </div>

      {selectableIds.length > 0 && (
        <div
          className={`flex flex-wrap items-center justify-between gap-2 rounded-xl border border-admin-border px-3 py-2.5 ${
            selectedIds.length ? 'bg-[#f6f6f7]' : 'bg-white'
          }`}
        >
          <label className="flex cursor-pointer select-none items-center gap-2 text-[13px] font-medium text-admin-text">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={toggleSelectAll}
              className="h-4 w-4 rounded border-admin-border"
            />
            Select all
            {selectedIds.length > 0 && (
              <span className="text-admin-text-secondary"> · {selectedIds.length} selected</span>
            )}
          </label>
          {selectedIds.length > 0 && (
            <div className="flex gap-2">
              <button type="button" className={secondaryBtn} onClick={() => setSelectedIds([])}>
                Clear
              </button>
              <button
                type="button"
                onClick={handleBulkDelete}
                disabled={submitting}
                className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-[13px] font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" /> Delete selected
              </button>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {replies.length === 0 ? (
          <div className={`${dashboardCardShell} md:col-span-2 lg:col-span-3`}>
            <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 p-4 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#f1f1f1]">
                <MessageCircle className="h-7 w-7 text-admin-text-secondary" />
              </div>
              <div>
                <p className="text-[15px] font-semibold text-admin-text">No quick replies yet</p>
                <p className="mt-1 text-[13px] text-admin-text-secondary">
                  Create one to use in chat.
                </p>
              </div>
              <button type="button" className={primaryBtn} onClick={openCreate}>
                <Plus className="h-4 w-4" /> Add Quick Reply
              </button>
            </div>
          </div>
        ) : (
          replies.map((r) => (
            <div key={r._id} className={dashboardCardShell}>
              <div className="mb-2 flex items-start justify-between gap-2">
                <div className="flex min-w-0 items-start gap-2">
                  {!r.isGlobal && (
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(r._id)}
                      onChange={() => toggleSelect(r._id)}
                      className="mt-1 h-4 w-4 shrink-0 rounded border-admin-border"
                    />
                  )}
                  <h3 className="text-[13px] font-semibold text-admin-text">{r.title}</h3>
                </div>
                {r.shortcut && (
                  <span className="shrink-0 rounded bg-[#f1f1f1] px-2 py-0.5 text-[11px] text-admin-text-secondary">
                    {r.shortcut}
                  </span>
                )}
              </div>
              <p className="mb-3 line-clamp-3 text-[13px] text-admin-text-secondary">{r.message}</p>
              {r.isGlobal && (
                <span className="mr-2 rounded bg-[#f1f1f1] px-2 py-0.5 text-[11px] font-medium text-admin-text-secondary">
                  Global
                </span>
              )}
              <div className="mt-2 flex gap-0.5">
                <button
                  type="button"
                  onClick={() => handleEdit(r)}
                  className="rounded-lg p-1.5 text-admin-text-subdued hover:bg-[#f6f6f7] hover:text-admin-text"
                  title="Edit"
                >
                  <Edit className="h-4 w-4" />
                </button>
                {!r.isGlobal && (
                  <button
                    type="button"
                    onClick={() => handleDelete(r._id)}
                    className="rounded-lg p-1.5 text-admin-text-subdued hover:bg-red-50 hover:text-red-600"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <Modal
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setEditing(null);
        }}
        title={editing ? 'Edit Quick Reply' : 'New Quick Reply'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input
              label="Title *"
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
              placeholder="e.g. Welcome Message"
            />
            <Input
              label="Shortcut"
              type="text"
              value={form.shortcut}
              onChange={(e) => setForm({ ...form, shortcut: e.target.value })}
              placeholder="e.g. /welcome"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-admin-text">Message</label>
            <textarea
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              rows={3}
              className={adminFieldClass}
              placeholder="Type your quick reply message..."
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-admin-text">Sticker (optional)</label>
            <input
              ref={qrFileRef}
              type="file"
              className="hidden"
              accept="image/*,.webp,.gif"
              onChange={handleQrSticker}
            />
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => qrFileRef.current?.click()}
                disabled={qrUploading}
                className={secondaryBtn}
              >
                {qrUploading ? 'Uploading...' : 'Upload sticker'}
              </button>
              {form.stickerUrl && (
                <>
                  <img
                    src={form.stickerUrl}
                    alt=""
                    className="h-12 w-12 rounded-lg border border-admin-border object-contain"
                  />
                  <button
                    type="button"
                    className="text-[12px] font-medium text-red-600 hover:underline"
                    onClick={() => setForm((f) => ({ ...f, stickerUrl: '' }))}
                  >
                    Remove
                  </button>
                </>
              )}
            </div>
            <p className="mt-1 text-[12px] text-admin-text-subdued">
              If a sticker is set, clicking this quick reply in chat sends the sticker instantly.
            </p>
          </div>
          <div className="flex gap-2 pt-2">
            <button type="submit" disabled={submitting} className={primaryBtn}>
              {submitting ? 'Saving…' : editing ? 'Update' : 'Create'}
            </button>
            <button
              type="button"
              className={secondaryBtn}
              onClick={() => {
                setShowForm(false);
                setEditing(null);
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
