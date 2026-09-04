'use client';
import React, { useState, useEffect } from 'react';
import { Plus, Layers, Trash2, Edit, Users } from 'lucide-react';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import Select from '@/components/ui/Select';
import { segmentApi, campaignApi } from '@/lib/api';
import type { Segment, SegmentRule } from '@/types';
import toast from 'react-hot-toast';
import { adminContentColumnClass, dashboardCardShell } from '@/components/layout/dashboard-ui';

const primaryBtn =
  'inline-flex items-center justify-center gap-1.5 rounded-lg bg-admin-text px-3 py-1.5 text-[13px] font-semibold text-white transition-colors hover:bg-[#1a1a1a] disabled:cursor-not-allowed disabled:opacity-50';
const secondaryBtn =
  'inline-flex items-center justify-center gap-1.5 rounded-lg border border-admin-border bg-white px-3 py-1.5 text-[13px] font-medium text-admin-text transition-colors hover:bg-[#f6f6f7]';
const dangerBtn =
  'inline-flex items-center justify-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-[13px] font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-50';

export default function SegmentsPage() {
  const [segments, setSegments] = useState<Segment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editSegment, setEditSegment] = useState<Segment | null>(null);
  type BehaviorRule = { campaign: string; condition: string };
  const [form, setForm] = useState({ name: '', description: '', rules: [{ field: 'name', operator: 'contains', value: '' }] as SegmentRule[], behaviorRules: [] as BehaviorRule[] });
  const [campaigns, setCampaigns] = useState<{ _id: string; name: string }[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const fetchSegments = async () => {
    try {
      const res = await segmentApi.list();
      setSegments(res.data.data || []);
    } catch { /* empty */ }
    setLoading(false);
  };

  useEffect(() => {
    fetchSegments();
    campaignApi.list({ limit: 100 }).then(r => setCampaigns(r.data.data || [])).catch(() => {});
  }, []);

  const handleSave = async () => {
    if (submitting) return;
    if (!form.name.trim()) { toast.error('Segment name is required'); return; }
    setSubmitting(true);
    const payload = { ...form, behaviorRules: form.behaviorRules.filter(br => br.campaign) };
    try {
      if (editSegment) {
        await segmentApi.update(editSegment._id, payload);
        toast.success('Segment updated');
      } else {
        await segmentApi.create(payload);
        toast.success('Segment created');
      }
      setShowModal(false); setEditSegment(null);
      setForm({ name: '', description: '', rules: [{ field: 'name', operator: 'contains', value: '' }], behaviorRules: [] });
      fetchSegments();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (submitting) return;
    if (!confirm('Delete this segment?')) return;
    setSubmitting(true);
    try { await segmentApi.delete(id); toast.success('Deleted'); fetchSegments(); } catch { toast.error('Failed'); } finally { setSubmitting(false); }
  };

  const addRule = () => setForm({ ...form, rules: [...form.rules, { field: 'name', operator: 'contains', value: '' }] });
  const removeRule = (i: number) => setForm({ ...form, rules: form.rules.filter((_, idx) => idx !== i) });
  const updateRule = (i: number, updates: Partial<SegmentRule>) => {
    const rules = [...form.rules]; rules[i] = { ...rules[i], ...updates }; setForm({ ...form, rules });
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const allSelected = segments.length > 0 && selectedIds.length === segments.length;
  const toggleSelectAll = () => setSelectedIds(allSelected ? [] : segments.map(s => s._id));

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm('Delete ' + selectedIds.length + ' selected items?')) return;
    if (submitting) return;
    setSubmitting(true);
    try {
      await Promise.all(selectedIds.map(id => segmentApi.delete(id)));
      toast.success(selectedIds.length + ' items deleted');
      setSelectedIds([]);
      fetchSegments();
    } catch { toast.error('Failed to delete some items'); } finally { setSubmitting(false); }
  };

  return (
    <div className={`${adminContentColumnClass} space-y-4`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 shrink-0 text-admin-text-secondary" aria-hidden />
            <h1 className="text-[20px] font-semibold tracking-tight text-admin-text">Segments</h1>
          </div>
          <p className="mt-1 text-[13px] text-admin-text-secondary">
            Group contacts dynamically
          </p>
        </div>
        <button
          type="button"
          className={primaryBtn}
          onClick={() => {
            setEditSegment(null);
            setForm({ name: '', description: '', rules: [{ field: 'name', operator: 'contains', value: '' }], behaviorRules: [] });
            setShowModal(true);
          }}
        >
          <Plus className="h-4 w-4" /> Create Segment
        </button>
      </div>

      {!loading && segments.length > 0 && (
        <div className={`flex flex-wrap items-center justify-between gap-2 rounded-xl border px-4 py-2.5 ${selectedIds.length ? 'border-red-200 bg-red-50' : 'border-admin-border bg-white'}`}>
          <label className="flex cursor-pointer items-center gap-2 text-[13px] font-medium text-admin-text">
            <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} className="h-4 w-4 cursor-pointer accent-red-500" />
            Select all{selectedIds.length > 0 && <span className="text-red-700"> · {selectedIds.length} selected</span>}
          </label>
          {selectedIds.length > 0 && (
            <div className="flex gap-2">
              <button type="button" className={secondaryBtn} onClick={() => setSelectedIds([])}>Clear</button>
              <button type="button" className={dangerBtn} onClick={handleBulkDelete} disabled={submitting}>
                <Trash2 className="h-4 w-4" /> Delete selected
              </button>
            </div>
          )}
        </div>
      )}

      {loading ? (
        <div className="py-10 text-center text-[13px] text-admin-text-subdued">Loading…</div>
      ) : segments.length === 0 ? (
        <div className={`${dashboardCardShell} py-12 text-center`}>
          <Layers className="mx-auto mb-3 h-10 w-10 text-admin-text-subdued" />
          <p className="text-[13px] text-admin-text-secondary">No segments created yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {segments.map((seg) => (
            <div key={seg._id} className={dashboardCardShell}>
              <div className="mb-3 flex items-start justify-between gap-2">
                <div className="flex min-w-0 items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(seg._id)}
                    onChange={() => toggleSelect(seg._id)}
                    className="h-4 w-4 shrink-0 cursor-pointer accent-red-500"
                  />
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#f1f1f1]">
                    <Layers className="h-4 w-4 text-admin-text-secondary" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate text-[13px] font-semibold text-admin-text">{seg.name}</h3>
                    <p className="truncate text-[12px] text-admin-text-subdued">{seg.description || 'No description'}</p>
                  </div>
                </div>
                <div className="flex shrink-0 gap-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      setEditSegment(seg);
                      setForm({
                        name: seg.name,
                        description: seg.description,
                        rules: seg.rules,
                        behaviorRules: ((seg as unknown as { behaviorRules?: BehaviorRule[] }).behaviorRules || []),
                      });
                      setShowModal(true);
                    }}
                    className="rounded-lg p-1.5 text-admin-text-subdued hover:bg-[#f6f6f7] hover:text-admin-text"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(seg._id)}
                    className="rounded-lg p-1.5 text-admin-text-subdued hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2 text-[12px] text-admin-text-secondary">
                <Users className="h-3.5 w-3.5" />
                <span>{seg.contactCount || 0} contacts</span>
                <span className="text-admin-text-subdued">·</span>
                <span>{seg.rules?.length || 0} rules</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editSegment ? 'Edit Segment' : 'Create Segment'} size="lg">
        <div className="space-y-4">
          <Input label="Segment Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Input label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div>
            <label className="mb-2 block text-[13px] font-medium text-admin-text">Rules</label>
            {form.rules.map((rule, i) => (
              <div key={i} className="mb-2 flex items-center gap-2">
                <Select value={rule.field} onChange={(e) => updateRule(i, { field: e.target.value })} options={[
                  { value: 'name', label: 'Name' }, { value: 'phone', label: 'Phone' }, { value: 'email', label: 'Email' },
                  { value: 'tag', label: 'Tag' }, { value: 'source', label: 'Source' }, { value: 'status', label: 'Status' },
                ]} />
                <Select value={rule.operator} onChange={(e) => updateRule(i, { operator: e.target.value })} options={[
                  { value: 'contains', label: 'Contains' }, { value: 'equals', label: 'Equals' },
                  { value: 'not_equals', label: 'Not Equals' }, { value: 'starts_with', label: 'Starts with' },
                ]} />
                <Input value={rule.value} onChange={(e) => updateRule(i, { value: e.target.value })} placeholder="Value" />
                {form.rules.length > 1 && (
                  <button type="button" onClick={() => removeRule(i)} className="rounded-lg p-1.5 text-admin-text-subdued hover:bg-red-50 hover:text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
            <button type="button" className={secondaryBtn} onClick={addRule}>
              <Plus className="h-3.5 w-3.5" /> Add Rule
            </button>
          </div>
          <div>
            <label className="mb-1 block text-[13px] font-medium text-admin-text">Broadcast Retargeting (optional)</label>
            <p className="mb-2 text-[12px] text-admin-text-subdued">
              Target contacts based on how they responded to a past broadcast — e.g. re-send an offer to everyone who read it but never replied.
            </p>
            {form.behaviorRules.map((br, i) => (
              <div key={i} className="mb-2 flex items-center gap-2">
                <Select
                  value={br.campaign}
                  onChange={(e) => {
                    const rules = [...form.behaviorRules];
                    rules[i] = { ...rules[i], campaign: e.target.value };
                    setForm({ ...form, behaviorRules: rules });
                  }}
                  options={[{ value: '', label: 'Select broadcast...' }, ...campaigns.map(c => ({ value: c._id, label: c.name }))]}
                />
                <Select
                  value={br.condition}
                  onChange={(e) => {
                    const rules = [...form.behaviorRules];
                    rules[i] = { ...rules[i], condition: e.target.value };
                    setForm({ ...form, behaviorRules: rules });
                  }}
                  options={[
                    { value: 'delivered_not_replied', label: 'Delivered but not replied' },
                    { value: 'read_not_replied', label: 'Read but not replied' },
                    { value: 'not_read', label: 'Not read' },
                    { value: 'replied', label: 'Replied' },
                    { value: 'failed', label: 'Failed to deliver' },
                    { value: 'sent', label: 'Was sent (everyone)' },
                  ]}
                />
                <button
                  type="button"
                  onClick={() => setForm({ ...form, behaviorRules: form.behaviorRules.filter((_, idx) => idx !== i) })}
                  className="rounded-lg p-1.5 text-admin-text-subdued hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            <button
              type="button"
              className={secondaryBtn}
              onClick={() => setForm({ ...form, behaviorRules: [...form.behaviorRules, { campaign: '', condition: 'delivered_not_replied' }] })}
            >
              <Plus className="h-3.5 w-3.5" /> Add Retargeting Rule
            </button>
          </div>
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={handleSave} disabled={submitting} className={primaryBtn}>
              {submitting ? 'Saving…' : editSegment ? 'Update' : 'Create'}
            </button>
            <button type="button" className={secondaryBtn} onClick={() => setShowModal(false)}>Cancel</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
