'use client';
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Plus, Trash2, Edit, Copy, Link2, X } from 'lucide-react';
import Table from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import { shortLinkApi } from '@/lib/api';
import type { ShortLink } from '@/types';
import toast from 'react-hot-toast';
import { adminContentColumnClass } from '@/components/layout/dashboard-ui';

const primaryBtn =
  'inline-flex items-center justify-center gap-1.5 rounded-lg bg-admin-text px-3 py-1.5 text-[13px] font-semibold text-white transition-colors hover:bg-[#1a1a1a] disabled:cursor-not-allowed disabled:opacity-50';
const secondaryBtn =
  'inline-flex items-center justify-center gap-1.5 rounded-lg border border-admin-border bg-white px-3 py-1.5 text-[13px] font-medium text-admin-text transition-colors hover:bg-[#f6f6f7] disabled:cursor-not-allowed disabled:opacity-50';
const inputClass =
  'w-full rounded-lg border border-admin-border bg-white px-3 py-2 text-[13px] text-admin-text placeholder:text-admin-text-subdued focus:outline-none focus:ring-2 focus:ring-[#005bd3]/30';
const labelClass = 'mb-1 block text-[12px] font-medium text-admin-text-secondary';
const modalOverlayClass =
  'fixed inset-0 z-[1300] flex items-center justify-center p-4 sm:p-6';
const modalPanelClass =
  'relative z-10 flex w-full max-w-md flex-col overflow-hidden rounded-xl border border-admin-border bg-white shadow-[0_16px_48px_rgba(16,24,40,0.18)]';

export default function ShortLinksPage() {
  const [links, setLinks] = useState<ShortLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editLink, setEditLink] = useState<ShortLink | null>(null);
  const [form, setForm] = useState({ title: '', originalUrl: '', customSlug: '' });
  const [submitting, setSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    if (showModal) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [showModal]);

  const fetchLinks = async () => {
    try { const res = await shortLinkApi.list(); setLinks(res.data.data || []); } catch { /* empty */ }
    setLoading(false);
  };

  useEffect(() => { fetchLinks(); }, []);

  const closeModal = () => setShowModal(false);

  const openCreate = () => {
    setEditLink(null);
    setForm({ title: '', originalUrl: '', customSlug: '' });
    setShowModal(true);
  };

  const openEdit = (l: ShortLink) => {
    setEditLink(l);
    setForm({ title: l.title, originalUrl: l.originalUrl, customSlug: l.shortCode || '' });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (submitting) return;
    if (!form.originalUrl.trim()) {
      toast.error('Destination URL is required');
      return;
    }
    setSubmitting(true);
    try {
      if (editLink) { await shortLinkApi.update(editLink._id, form); }
      else { await shortLinkApi.create(form); }
      toast.success(editLink ? 'Updated' : 'Created');
      closeModal();
      fetchLinks();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed');
    } finally {
      setSubmitting(false);
    }
  };

  const slugPreview =
    (typeof window !== 'undefined' ? window.location.origin : '') +
    '/s/' +
    (form.customSlug.trim() || (editLink?.shortCode || 'your-slug'));

  const columns = [
    { key: 'title', title: 'Title', render: (l: ShortLink) => (
      <div>
        <p className="text-[13px] font-medium text-admin-text">{l.title || 'Untitled'}</p>
        <p className="mt-0.5 max-w-[220px] truncate text-[12px] text-admin-text-subdued">{l.originalUrl}</p>
      </div>
    )},
    { key: 'short', title: 'Short URL', render: (l: ShortLink) => (
      <div className="flex items-center gap-2">
        <code className="rounded-md border border-admin-border bg-[#f6f6f7] px-2 py-0.5 text-[12px] text-admin-text">
          {typeof window !== 'undefined' ? window.location.origin : ''}/s/{l.shortCode}
        </code>
        <button
          type="button"
          onClick={() => { navigator.clipboard.writeText(window.location.origin + '/s/' + l.shortCode); toast.success('Link copied!'); }}
          className="rounded-lg p-1.5 text-admin-text-subdued hover:bg-[#f6f6f7] hover:text-admin-text"
          title="Copy link"
        >
          <Copy className="h-3.5 w-3.5" />
        </button>
      </div>
    )},
    { key: 'clicks', title: 'Clicks', render: (l: ShortLink) => (
      <span className="text-[13px] font-medium tabular-nums text-admin-text">{l.clicks || 0}</span>
    )},
    { key: 'status', title: 'Status', render: (l: ShortLink) => (
      <Badge variant={l.isActive !== false ? 'success' : 'default'}>{l.isActive !== false ? 'Active' : 'Inactive'}</Badge>
    )},
    { key: 'actions', title: '', render: (l: ShortLink) => (
      <div className="flex gap-1">
        <button
          type="button"
          onClick={() => openEdit(l)}
          className="rounded-lg p-1.5 text-admin-text-subdued hover:bg-[#f6f6f7] hover:text-admin-text"
          title="Edit"
        >
          <Edit className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => { if (confirm('Delete?')) shortLinkApi.delete(l._id).then(() => { fetchLinks(); toast.success('Link deleted'); }).catch(() => toast.error('Delete failed')); }}
          className="rounded-lg p-1.5 text-admin-text-subdued hover:bg-red-50 hover:text-red-600"
          title="Delete"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    )},
  ];

  return (
    <div className={`${adminContentColumnClass} space-y-4`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Link2 className="h-5 w-5 shrink-0 text-admin-text-secondary" aria-hidden />
            <h1 className="text-[20px] font-semibold tracking-tight text-admin-text">Short Links</h1>
          </div>
          <p className="mt-1 text-[13px] text-admin-text-secondary">
            Create trackable short links for campaigns and messages
          </p>
        </div>
        <button type="button" className={primaryBtn} onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Create link
        </button>
      </div>

      <Table
        columns={columns}
        data={links}
        loading={loading}
        emptyText="No short links yet"
        onBulkDelete={async (ids) => {
          await Promise.all(ids.map((id) => shortLinkApi.delete(id).catch(() => null)));
          fetchLinks();
        }}
      />

      {showModal && mounted && createPortal(
        <div className={modalOverlayClass}>
          <div className="absolute inset-0 bg-black/45" onClick={closeModal} />
          <div
            className={modalPanelClass}
            role="dialog"
            aria-modal="true"
            aria-label={editLink ? 'Edit link' : 'Create short link'}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 border-b border-admin-border px-5 py-4">
              <div className="min-w-0">
                <h3 className="text-[16px] font-semibold tracking-tight text-admin-text">
                  {editLink ? 'Edit link' : 'Create short link'}
                </h3>
                <p className="mt-0.5 text-[12px] text-admin-text-secondary">
                  Point a short URL at any destination and track clicks.
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg p-1.5 text-admin-text-subdued hover:bg-[#f6f6f7] hover:text-admin-text"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 p-5">
              <div>
                <label className={labelClass}>Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className={inputClass}
                  placeholder="My Link"
                />
              </div>
              <div>
                <label className={labelClass}>Destination URL *</label>
                <input
                  type="url"
                  value={form.originalUrl}
                  onChange={(e) => setForm({ ...form, originalUrl: e.target.value })}
                  className={inputClass}
                  placeholder="https://example.com"
                  required
                />
              </div>
              <div>
                <label className={labelClass}>Custom slug (optional)</label>
                <input
                  type="text"
                  value={form.customSlug}
                  onChange={(e) => setForm({ ...form, customSlug: e.target.value.replace(/\s+/g, '-').toLowerCase() })}
                  className={inputClass}
                  placeholder="my-link"
                />
                <p className="mt-1.5 truncate rounded-lg border border-admin-border bg-[#f6f6f7] px-2.5 py-1.5 font-mono text-[11px] text-admin-text-secondary">
                  {slugPreview}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-admin-border bg-[#fafafa] px-5 py-3.5">
              <button type="button" className={secondaryBtn} onClick={closeModal}>Cancel</button>
              <button type="button" className={primaryBtn} disabled={submitting} onClick={handleSave}>
                {submitting ? 'Saving...' : editLink ? 'Update link' : 'Create link'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
