'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Edit, Tags, Hash } from 'lucide-react';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import { tagApi } from '@/lib/api';
import type { Tag } from '@/types';
import toast from 'react-hot-toast';
import { adminContentColumnClass } from '@/components/layout/dashboard-ui';

const COLORS = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#EC4899', '#14B8A6', '#6366F1'];

const primaryBtn =
  'inline-flex items-center gap-1.5 rounded-lg bg-admin-text px-3 py-1.5 text-[13px] font-semibold text-white transition-colors hover:bg-[#1a1a1a] disabled:opacity-50';
const secondaryBtn =
  'inline-flex items-center gap-1.5 rounded-lg border border-admin-border bg-white px-3 py-1.5 text-[13px] font-medium text-admin-text transition-colors hover:bg-[#f6f6f7]';

export default function TagsPage() {
  const router = useRouter();
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTag, setEditTag] = useState<Tag | null>(null);
  const [form, setForm] = useState({ name: '', color: '#10B981' });
  const [submitting, setSubmitting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const fetchTags = async () => {
    try { const res = await tagApi.list(); setTags(res.data.data || []); } catch { /* empty */ }
    setLoading(false);
  };

  useEffect(() => { fetchTags(); }, []);

  const handleSave = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      if (editTag) { await tagApi.update(editTag._id, form); toast.success('Label updated'); }
      else { await tagApi.create(form); toast.success('Label created'); }
      setShowModal(false); setEditTag(null); setForm({ name: '', color: '#10B981' }); fetchTags();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (submitting) return;
    if (!confirm('Delete this label?')) return;
    setSubmitting(true);
    try { await tagApi.delete(id); toast.success('Deleted'); fetchTags(); } catch { toast.error('Failed'); } finally { setSubmitting(false); }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const allSelected = tags.length > 0 && selectedIds.length === tags.length;
  const toggleSelectAll = () => setSelectedIds(allSelected ? [] : tags.map(t => t._id));

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm('Delete ' + selectedIds.length + ' selected items?')) return;
    if (submitting) return;
    setSubmitting(true);
    try {
      await Promise.all(selectedIds.map(id => tagApi.delete(id)));
      toast.success(selectedIds.length + ' items deleted');
      setSelectedIds([]);
      fetchTags();
    } catch { toast.error('Failed to delete some items'); } finally { setSubmitting(false); }
  };

  return (
    <div className={adminContentColumnClass}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Tags className="h-5 w-5 shrink-0 text-admin-text-secondary" aria-hidden />
            <h1 className="text-[20px] font-semibold tracking-tight text-admin-text">Labels</h1>
          </div>
          <p className="mt-1 text-[13px] text-admin-text-secondary">
            Label and organize contacts
          </p>
        </div>
        <button
          type="button"
          className={primaryBtn}
          onClick={() => { setEditTag(null); setForm({ name: '', color: '#10B981' }); setShowModal(true); }}
        >
          <Plus className="h-4 w-4" />
          Create label
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-admin-border bg-white shadow-[0_1px_2px_rgba(16,24,40,0.06),0_1px_3px_rgba(16,24,40,0.04)]">
        {!loading && tags.length > 0 && (
          <div className={`flex flex-wrap items-center justify-between gap-2 border-b border-admin-border px-3 py-2.5 ${selectedIds.length ? 'bg-[#f6f6f7]' : 'bg-white'}`}>
            <label className="flex cursor-pointer select-none items-center gap-2 text-[13px] font-medium text-admin-text">
              <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} className="h-4 w-4 rounded border-admin-border" />
              Select all{selectedIds.length > 0 && <span className="text-admin-text-secondary"> · {selectedIds.length} selected</span>}
            </label>
            {selectedIds.length > 0 && (
              <div className="flex gap-2">
                <button type="button" className={secondaryBtn} onClick={() => setSelectedIds([])}>Clear</button>
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

        {loading ? (
          <div className="flex min-h-[280px] items-center justify-center p-10">
            <p className="inline-flex items-center gap-2 text-[13px] text-admin-text-secondary">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-admin-border border-t-admin-text" />
              Loading labels…
            </p>
          </div>
        ) : tags.length === 0 ? (
          <div className="flex min-h-[320px] items-center justify-center p-12">
            <div className="flex max-w-sm flex-col items-center gap-4 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#f1f1f1]">
                <Tags className="h-7 w-7 text-admin-text-secondary" />
              </div>
              <div>
                <p className="text-[15px] font-semibold text-admin-text">No labels yet</p>
                <p className="mt-1 text-[13px] text-admin-text-secondary">
                  Create labels to organize contacts by product, service, or status.
                </p>
              </div>
              <button
                type="button"
                className={primaryBtn}
                onClick={() => { setEditTag(null); setForm({ name: '', color: '#10B981' }); setShowModal(true); }}
              >
                <Plus className="h-4 w-4" /> Create label
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {tags.map((tag) => (
              <div
                key={tag._id}
                className={`group flex items-center gap-2 rounded-lg border bg-white p-3 transition-colors ${
                  selectedIds.includes(tag._id)
                    ? 'border-admin-text ring-1 ring-admin-text'
                    : 'border-admin-border hover:border-admin-text-subdued'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedIds.includes(tag._id)}
                  onChange={() => toggleSelect(tag._id)}
                  className="h-4 w-4 shrink-0 rounded border-admin-border"
                />
                <button
                  type="button"
                  onClick={() => router.push(`/client/contacts?tag=${tag._id}`)}
                  className="flex min-w-0 flex-1 items-center gap-2.5 text-left"
                  title="View contacts with this label"
                >
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                    style={{ backgroundColor: (tag.color || '#10B981') + '20' }}
                  >
                    <Hash className="h-4 w-4" style={{ color: tag.color || '#10B981' }} />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-medium text-admin-text group-hover:underline">{tag.name}</p>
                    <p className="text-[11px] text-admin-text-subdued">{tag.contactCount || 0} contacts</p>
                  </div>
                </button>
                <div className="flex shrink-0 gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={() => { setEditTag(tag); setForm({ name: tag.name, color: tag.color }); setShowModal(true); }}
                    className="rounded-lg p-1.5 text-admin-text-subdued hover:bg-[#f1f1f1] hover:text-admin-text"
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(tag._id)}
                    className="rounded-lg p-1.5 text-admin-text-subdued hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editTag ? 'Edit Label' : 'Create Label'} size="sm">
        <div className="space-y-4">
          <Input label="Label Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <div>
            <label className="mb-2 block text-[13px] font-medium text-admin-text">Color</label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setForm({ ...form, color: c })}
                  className={`h-8 w-8 rounded-full border-2 transition-transform ${form.color === c ? 'scale-110 border-admin-text' : 'border-transparent'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
              <input
                type="color"
                value={form.color}
                onChange={(e) => setForm({ ...form, color: e.target.value })}
                title="Custom colour"
                className="h-8 w-8 cursor-pointer rounded border border-admin-border p-0"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className={secondaryBtn} onClick={() => setShowModal(false)}>Cancel</button>
            <button type="button" className={primaryBtn} onClick={handleSave}>{editTag ? 'Update' : 'Create'}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
