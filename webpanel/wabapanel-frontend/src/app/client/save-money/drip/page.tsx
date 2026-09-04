'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Plus, Play, Pause, Trash2, Send, Clock, CheckCircle, AlertCircle, PiggyBank, Users, X, Edit, BarChart3 } from 'lucide-react';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Table from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import CampaignReportModal from '@/components/campaigns/CampaignReportModal';
import { campaignApi, presetMessageApi, segmentApi, tagApi, templateApi } from '@/lib/api';
import type { Campaign, Segment, Tag } from '@/types';
import toast from 'react-hot-toast';
import { adminContentColumnClass, dashboardCardShell } from '@/components/layout/dashboard-ui';

const primaryBtn =
  'inline-flex items-center justify-center gap-1.5 rounded-lg bg-admin-text px-3 py-1.5 text-[13px] font-semibold text-white transition-colors hover:bg-[#1a1a1a] disabled:cursor-not-allowed disabled:opacity-50';
const secondaryBtn =
  'inline-flex items-center justify-center gap-1.5 rounded-lg border border-admin-border bg-white px-3 py-1.5 text-[13px] font-medium text-admin-text transition-colors hover:bg-[#f6f6f7] disabled:cursor-not-allowed disabled:opacity-50';
const inputClass =
  'w-full rounded-lg border border-admin-border bg-white px-3 py-2 text-[13px] text-admin-text placeholder:text-admin-text-subdued focus:outline-none focus:ring-2 focus:ring-[#005bd3]/30';
const selectClass =
  'flex-1 text-[13px] px-3 py-1.5 rounded-lg border border-admin-border bg-white text-admin-text focus:outline-none focus:ring-2 focus:ring-[#005bd3]/30';
const labelClass = 'mb-1 block text-[12px] font-medium text-admin-text-secondary';
const modalOverlayClass =
  'fixed inset-0 z-[1300] flex items-center justify-center p-4 sm:p-6';
const modalPanelClass =
  'relative z-10 flex max-h-[min(90vh,880px)] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-admin-border bg-white shadow-[0_16px_48px_rgba(16,24,40,0.18)]';

interface Preset { _id: string; name: string; body: string; }
interface DripStep { presetMessage: string; template: string; delayDays: number; delayHours: number; delayMinutes: number; }
type DripCampaign = Campaign & { dripSteps?: DripStep[]; variables?: { currentStep?: number }; targetType?: string; targetSegments?: string[]; targetTags?: string[]; targetNumbers?: string[] };

const emptyStep = (): DripStep => ({ presetMessage: '', template: '', delayDays: 0, delayHours: 0, delayMinutes: 0 });

export default function DripCampaignsPage() {
  const [campaigns, setCampaigns] = useState<DripCampaign[]>([]);
  const [presets, setPresets] = useState<Preset[]>([]);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [eligible, setEligible] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', audienceType: 'all', segments: [] as string[], tags: [] as string[] });
  const [steps, setSteps] = useState<DripStep[]>([emptyStep()]);
  const [numbersText, setNumbersText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [reportTarget, setReportTarget] = useState<{ id: string; name: string } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    if (showModal) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [showModal]);

  const parseNumbers = (text: string) =>
    Array.from(new Set(text.split(/[\s,;|]+/).map(n => n.replace(/\D/g, '')).filter(n => n.length >= 10)));

  const handleCsvUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const nums = parseNumbers(String(reader.result || ''));
      if (!nums.length) { toast.error('No valid numbers found in the CSV'); return; }
      setNumbersText(prev => Array.from(new Set(parseNumbers(prev).concat(nums))).join('\n'));
      toast.success(`${nums.length} numbers imported from CSV`);
    };
    reader.readAsText(file);
  };

  const [waTemplates, setWaTemplates] = useState<{ _id: string; name: string }[]>([]);
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [campRes, presetRes, segRes, tagRes, eligRes, tplRes] = await Promise.allSettled([
        campaignApi.list({ type: 'drip' }),
        presetMessageApi.list(),
        segmentApi.list(),
        tagApi.list(),
        presetMessageApi.eligibleCount(),
        templateApi.list({ limit: 500 }),
      ]);
      if (tplRes.status === 'fulfilled') setWaTemplates(((tplRes.value.data.data || []) as { _id: string; name: string; status?: string }[]).filter(t => (t.status || '').toLowerCase() === 'approved'));
      if (campRes.status === 'fulfilled') setCampaigns(campRes.value.data.data || []);
      if (presetRes.status === 'fulfilled') setPresets(presetRes.value.data.data || []);
      if (segRes.status === 'fulfilled') setSegments(segRes.value.data.data || []);
      if (tagRes.status === 'fulfilled') setTags(tagRes.value.data.data || []);
      if (eligRes.status === 'fulfilled') setEligible(eligRes.value.data.data?.count ?? null);
    } catch { /* empty */ }
    setLoading(false);
  }, []);
  useEffect(() => { fetchData(); }, [fetchData]);

  const closeModal = () => {
    setShowModal(false);
    setEditId(null);
  };

  const handleCreate = async () => {
    if (submitting) return;
    if (!form.name) { toast.error('Campaign name required'); return; }
    const validSteps = steps.filter(s => s.presetMessage || s.template);
    if (!validSteps.length) { toast.error('Select a preset for at least one step'); return; }
    const numbers = form.audienceType === 'numbers' ? parseNumbers(numbersText) : [];
    if (form.audienceType === 'numbers' && !numbers.length) { toast.error('Enter at least one valid number'); return; }
    setSubmitting(true);
    try {
      const payload = {
        name: form.name, type: 'drip',
        dripSteps: validSteps.map((s, i) => ({ order: i, presetMessage: s.presetMessage || undefined, template: s.template || undefined, delayDays: s.delayDays || 0, delayHours: s.delayHours || 0, delayMinutes: s.delayMinutes || 0 })),
        audience: { type: form.audienceType, segments: form.segments, tags: form.tags, numbers },
      };
      if (editId) await campaignApi.update(editId, payload);
      else await campaignApi.create(payload);
      toast.success(editId ? 'Drip campaign updated' : 'Drip campaign created — press Start to begin');
      closeModal();
      setForm({ name: '', audienceType: 'all', segments: [], tags: [] });
      setSteps([emptyStep()]); setNumbersText('');
      fetchData();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed');
    }
    setSubmitting(false);
  };

  const handleEdit = (c: DripCampaign) => {
    setEditId(c._id);
    setForm({
      name: c.name, audienceType: c.targetType || 'all',
      segments: (c.targetSegments || []).map(String), tags: (c.targetTags || []).map(String),
    });
    setSteps((c.dripSteps && c.dripSteps.length ? c.dripSteps : [emptyStep()]).map(s => ({ presetMessage: String(s.presetMessage || ''), template: String((s as unknown as { template?: string }).template || ''), delayDays: s.delayDays || 0, delayHours: s.delayHours || 0, delayMinutes: s.delayMinutes || 0 })));
    setNumbersText((c.targetNumbers || []).join('\n'));
    setShowModal(true);
  };

  const handleAction = async (id: string, action: 'start' | 'pause' | 'delete') => {
    try {
      if (action === 'delete') { if (!confirm('Delete?')) return; await campaignApi.delete(id); }
      else if (action === 'start') await campaignApi.start(id);
      else await campaignApi.pause(id);
      toast.success(action === 'delete' ? 'Deleted' : action === 'start' ? 'Started' : 'Paused');
      fetchData();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed');
    }
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, { variant: 'success' | 'warning' | 'danger' | 'info' | 'default'; icon: React.ReactNode }> = {
      draft: { variant: 'default', icon: <Clock className="w-3 h-3" /> },
      scheduled: { variant: 'info', icon: <Clock className="w-3 h-3" /> },
      running: { variant: 'success', icon: <Play className="w-3 h-3" /> },
      completed: { variant: 'success', icon: <CheckCircle className="w-3 h-3" /> },
      paused: { variant: 'warning', icon: <Pause className="w-3 h-3" /> },
      failed: { variant: 'danger', icon: <AlertCircle className="w-3 h-3" /> },
    };
    const s = map[status] || map.draft;
    return <Badge variant={s.variant}>{s.icon} {status}</Badge>;
  };

  const delayLabel = (s: DripStep, i: number) => {
    if (i === 0) return 'Immediately';
    const parts = [];
    if (s.delayDays) parts.push(`${s.delayDays}d`);
    if (s.delayHours) parts.push(`${s.delayHours}h`);
    if (s.delayMinutes) parts.push(`${s.delayMinutes}m`);
    return parts.length ? `+${parts.join(' ')}` : 'Immediately';
  };

  const columns = [
    { key: 'name', title: 'Campaign', render: (c: DripCampaign) => <span className="font-medium text-admin-text">{c.name}</span> },
    { key: 'status', title: 'Status', render: (c: DripCampaign) => getStatusBadge(c.status) },
    { key: 'steps', title: 'Step Progress', render: (c: DripCampaign) => {
      const total = c.dripSteps?.length || 0;
      const cur = c.status === 'draft' || c.status === 'scheduled' ? 0 : Math.min((c.variables?.currentStep ?? -1) + 1, total);
      return <span className="text-sm text-admin-text-secondary">{cur}/{total} steps</span>;
    }},
    { key: 'sent', title: 'Sent', render: (c: DripCampaign) => c.stats?.sent || 0 },
    { key: 'skipped', title: 'Skipped', render: (c: DripCampaign) => (c.stats as { skipped?: number })?.skipped || 0 },
    { key: 'failed', title: 'Failed', render: (c: DripCampaign) => c.stats?.failed || 0 },
    { key: 'date', title: 'Created', render: (c: DripCampaign) => new Date(c.createdAt).toLocaleDateString() },
    { key: 'actions', title: '', render: (c: DripCampaign) => (
      <div className="flex gap-1">
        {c.status === 'draft' && <button type="button" onClick={() => handleAction(c._id, 'start')} className="rounded-lg p-1.5 text-admin-text-subdued hover:bg-[#f6f6f7] hover:text-admin-text"><Play className="w-4 h-4" /></button>}
        {(c.status === 'draft' || c.status === 'paused') && <button type="button" onClick={() => handleEdit(c)} className="rounded-lg p-1.5 text-admin-text-subdued hover:bg-[#f6f6f7] hover:text-admin-text"><Edit className="w-4 h-4" /></button>}
        {c.status === 'running' && <button type="button" onClick={() => handleAction(c._id, 'pause')} className="rounded-lg p-1.5 text-admin-text-subdued hover:bg-yellow-50 hover:text-yellow-600"><Pause className="w-4 h-4" /></button>}
        {['running', 'completed', 'paused'].includes(c.status) && <button type="button" title="Report" onClick={() => setReportTarget({ id: c._id, name: c.name })} className="rounded-lg p-1.5 text-admin-text-subdued hover:bg-[#f6f6f7] hover:text-admin-text"><BarChart3 className="w-4 h-4" /></button>}
        <button type="button" onClick={() => handleAction(c._id, 'delete')} className="rounded-lg p-1.5 text-admin-text-subdued hover:bg-red-50 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
      </div>
    )},
  ];

  return (
    <div className={`${adminContentColumnClass} space-y-4`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <PiggyBank className="h-5 w-5 shrink-0 text-admin-text-secondary" aria-hidden />
            <h1 className="text-[20px] font-semibold tracking-tight text-admin-text">Drip Campaigns</h1>
          </div>
          <p className="mt-1 text-[13px] text-admin-text-secondary">
            Message series — Step 1 goes immediately, remaining steps go automatically after your set gap (days/hours/minutes)
          </p>
        </div>
        <button
          type="button"
          className={primaryBtn}
          onClick={() => setShowModal(true)}
        >
          <Plus className="h-4 w-4" />
          New Drip Campaign
        </button>
      </div>

      <div className={`${dashboardCardShell} flex items-center gap-2 text-[13px] text-admin-text`}>
        <Users className="h-4 w-4 shrink-0 text-admin-text-secondary" />
        <span><b>{eligible ?? '...'}</b> customers currently have an open 24-hr window. The window is checked before each step — customers with a closed window are skipped for that step.</span>
      </div>

      <Table columns={columns} data={campaigns} loading={loading} emptyText="No drip campaigns yet" onBulkDelete={async (ids) => { await Promise.all(ids.map((id) => campaignApi.delete(id).catch(() => null))); fetchData(); }} />

      <CampaignReportModal campaignId={reportTarget?.id || null} campaignName={reportTarget?.name} onClose={() => setReportTarget(null)} />

      {showModal && mounted && createPortal(
        <div className={modalOverlayClass}>
          <div className="absolute inset-0 bg-black/45" onClick={closeModal} />
          <div
            className={modalPanelClass}
            role="dialog"
            aria-modal="true"
            aria-label={editId ? 'Edit Drip Campaign' : 'Create Drip Campaign'}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex shrink-0 items-start justify-between gap-3 border-b border-admin-border px-5 py-4 sm:px-6">
              <div className="min-w-0">
                <h3 className="text-[16px] font-semibold tracking-tight text-admin-text">
                  {editId ? 'Edit Drip Campaign' : 'Create Drip Campaign'}
                </h3>
                <p className="mt-0.5 text-[12px] text-admin-text-secondary">
                  Build a timed message series for eligible contacts.
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

            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5 sm:p-6">
              <Input label="Campaign Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className={labelClass}>Steps (message series)</label>
                  <button type="button" onClick={() => setSteps([...steps, emptyStep()])} className="inline-flex items-center gap-1 text-[13px] font-medium text-admin-text hover:text-[#1a1a1a]">
                    <Plus className="h-4 w-4" /> Add Step
                  </button>
                </div>
                {steps.map((st, i) => (
                  <div key={i} className="mb-2 space-y-2 rounded-lg border border-admin-border bg-[#f6f6f7] p-3">
                    <div className="flex items-center gap-2">
                      <span className="whitespace-nowrap rounded border border-admin-border bg-white px-2 py-1 text-[11px] font-semibold text-admin-text">
                        Step {i + 1} {i === 0 ? '(immediately)' : `(after ${delayLabel(st, i).replace('+', '')})`}
                      </span>
                      <select
                        value={st.presetMessage}
                        onChange={(e) => setSteps(steps.map((x, idx) => idx === i ? { ...x, presetMessage: e.target.value } : x))}
                        className={selectClass}
                      >
                        <option value="">Select preset template</option>
                        {presets.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                      </select>
                      {steps.length > 1 && (
                        <button type="button" onClick={() => setSteps(steps.filter((_, idx) => idx !== i))} className="rounded-lg p-1 text-admin-text-subdued hover:bg-red-50 hover:text-red-600">
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="whitespace-nowrap text-[11px] text-admin-text-secondary">Paid template (if 24h window closed):</span>
                      <select
                        value={st.template}
                        onChange={(e) => setSteps(steps.map((x, idx) => idx === i ? { ...x, template: e.target.value } : x))}
                        className={selectClass}
                      >
                        <option value="">None — skip if window closed (free only)</option>
                        {waTemplates.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                      </select>
                    </div>
                    {i > 0 && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="whitespace-nowrap text-xs text-admin-text-secondary">After previous step:</span>
                        <input
                          type="number"
                          min={0}
                          value={st.delayDays}
                          onChange={(e) => setSteps(steps.map((x, idx) => idx === i ? { ...x, delayDays: parseInt(e.target.value) || 0 } : x))}
                          className="w-16 rounded-lg border border-admin-border bg-white px-2 py-1 text-[13px] text-admin-text focus:outline-none focus:ring-2 focus:ring-[#005bd3]/30"
                        />
                        <span className="text-xs text-admin-text-secondary">days</span>
                        <input
                          type="number"
                          min={0}
                          max={23}
                          value={st.delayHours}
                          onChange={(e) => setSteps(steps.map((x, idx) => idx === i ? { ...x, delayHours: parseInt(e.target.value) || 0 } : x))}
                          className="w-16 rounded-lg border border-admin-border bg-white px-2 py-1 text-[13px] text-admin-text focus:outline-none focus:ring-2 focus:ring-[#005bd3]/30"
                        />
                        <span className="text-xs text-admin-text-secondary">hrs</span>
                        <input
                          type="number"
                          min={0}
                          max={59}
                          value={st.delayMinutes}
                          onChange={(e) => setSteps(steps.map((x, idx) => idx === i ? { ...x, delayMinutes: parseInt(e.target.value) || 0 } : x))}
                          className="w-16 rounded-lg border border-admin-border bg-white px-2 py-1 text-[13px] text-admin-text focus:outline-none focus:ring-2 focus:ring-[#005bd3]/30"
                        />
                        <span className="text-xs text-admin-text-secondary">min</span>
                      </div>
                    )}
                  </div>
                ))}
                {presets.length === 0 && <p className="text-xs text-amber-600">Create a template on the Preset Templates page first.</p>}
              </div>

              <Select
                label="Audience"
                value={form.audienceType}
                onChange={(e) => setForm({ ...form, audienceType: e.target.value })}
                options={[{ value: 'all', label: 'All Contacts' }, { value: 'segment', label: 'By Segment' }, { value: 'tag', label: 'By Tag' }, { value: 'numbers', label: 'Numbers List / CSV' }]}
              />
              {form.audienceType === 'numbers' && (
                <div className="space-y-2">
                  <label className={labelClass}>Phone Numbers</label>
                  <textarea
                    rows={5}
                    value={numbersText}
                    onChange={(e) => setNumbersText(e.target.value)}
                    placeholder={'9198765XXXXX\n9198123XXXXX\n(one number per line, or separate with commas)'}
                    className={`${inputClass} resize-y`}
                  />
                  <div className="flex items-center justify-between">
                    <label className="inline-flex cursor-pointer items-center gap-1.5 text-[13px] font-medium text-admin-text hover:text-[#1a1a1a]">
                      <Plus className="h-4 w-4" /> Upload CSV
                      <input type="file" accept=".csv,.txt" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleCsvUpload(f); e.target.value = ''; }} />
                    </label>
                    <span className="text-xs text-admin-text-subdued">{parseNumbers(numbersText).length} valid numbers</span>
                  </div>
                </div>
              )}
              {form.audienceType === 'segment' && (
                <div>
                  <label className={`${labelClass} mb-1`}>Select Segments</label>
                  <div className="flex flex-wrap gap-2">
                    {segments.map(s => (
                      <button
                        type="button"
                        key={s._id}
                        onClick={() => setForm({ ...form, segments: form.segments.includes(s._id) ? form.segments.filter(x => x !== s._id) : [...form.segments, s._id] })}
                        className={`rounded-full border px-3 py-1 text-xs ${form.segments.includes(s._id) ? 'border-admin-border bg-[#f1f1f1] text-admin-text' : 'border-admin-border bg-white text-admin-text'}`}
                      >
                        {s.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {form.audienceType === 'tag' && (
                <div>
                  <label className={`${labelClass} mb-1`}>Select Tags</label>
                  <div className="flex flex-wrap gap-2">
                    {tags.map(t => (
                      <button
                        type="button"
                        key={t._id}
                        onClick={() => setForm({ ...form, tags: form.tags.includes(t._id) ? form.tags.filter(x => x !== t._id) : [...form.tags, t._id] })}
                        className={`rounded-full border px-3 py-1 text-xs ${form.tags.includes(t._id) ? 'border-admin-border bg-[#f1f1f1] text-admin-text' : 'border-admin-border bg-white text-admin-text'}`}
                      >
                        {t.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex shrink-0 items-center justify-end gap-2 border-t border-admin-border bg-[#fafafa] px-5 py-3.5 sm:px-6">
              <button type="button" className={secondaryBtn} onClick={closeModal}>Cancel</button>
              <button type="button" className={primaryBtn} disabled={submitting} onClick={handleCreate}>
                <Send className="h-4 w-4" />
                {submitting ? 'Saving...' : editId ? 'Save Changes' : 'Create Drip Campaign'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
