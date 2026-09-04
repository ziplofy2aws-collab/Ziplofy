'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Play, Pause, Trash2, Send, Clock, CheckCircle, AlertCircle, QrCode, ShieldAlert, Edit, CalendarClock, BarChart3 } from 'lucide-react';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Modal from '@/components/ui/Modal';
import Table from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import CampaignReportModal from '@/components/campaigns/CampaignReportModal';
import { campaignApi, presetMessageApi, segmentApi, tagApi, pipelineApi } from '@/lib/api';
import type { Campaign, Segment, Tag } from '@/types';
import toast from 'react-hot-toast';
import { adminContentColumnClass, dashboardCardShell } from '@/components/layout/dashboard-ui';

const primaryBtn =
  'inline-flex items-center justify-center gap-1.5 rounded-lg bg-admin-text px-3 py-1.5 text-[13px] font-semibold text-white transition-colors hover:bg-[#1a1a1a] disabled:cursor-not-allowed disabled:opacity-50';
const secondaryBtn =
  'inline-flex items-center justify-center gap-1.5 rounded-lg border border-admin-border bg-white px-3 py-1.5 text-[13px] font-medium text-admin-text transition-colors hover:bg-[#f6f6f7] disabled:cursor-not-allowed disabled:opacity-50';
const fieldClass =
  'w-full rounded-lg border border-admin-border bg-white px-3 py-2 text-[13px] text-admin-text placeholder:text-admin-text-subdued focus:outline-none focus:ring-2 focus:ring-[#005bd3]/30';

interface Preset { _id: string; name: string; body: string; }

export default function QrCampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [presets, setPresets] = useState<Preset[]>([]);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [pipelines, setPipelines] = useState<{ _id: string; name: string; stages?: { name: string }[] }[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', preset: '', audienceType: 'all', segments: [] as string[], tags: [] as string[], pipeline: '', stage: '', minInterval: 5, maxInterval: 15 });
  const [numbersText, setNumbersText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [reportTarget, setReportTarget] = useState<{ id: string; name: string } | null>(null);

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

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [campRes, presetRes, segRes, tagRes, pipeRes] = await Promise.allSettled([
        campaignApi.list({ type: 'preset', sendChannel: 'whatsapp_qr' }),
        presetMessageApi.list(),
        segmentApi.list(),
        tagApi.list(),
        pipelineApi.list(),
      ]);
      if (campRes.status === 'fulfilled') setCampaigns(campRes.value.data.data || []);
      if (presetRes.status === 'fulfilled') setPresets(presetRes.value.data.data || []);
      if (segRes.status === 'fulfilled') setSegments(segRes.value.data.data || []);
      if (tagRes.status === 'fulfilled') setTags(tagRes.value.data.data || []);
      if (pipeRes.status === 'fulfilled') setPipelines(pipeRes.value.data.data || []);
    } catch { /* empty */ }
    setLoading(false);
  }, []);
  useEffect(() => { fetchData(); }, [fetchData]);

  const handleCreate = async () => {
    if (submitting) return;
    if (!form.name || !form.preset) { toast.error('Name and preset template required'); return; }
    setSubmitting(true);
    const numbers = form.audienceType === 'numbers' ? parseNumbers(numbersText) : [];
    if (form.audienceType === 'numbers' && !numbers.length) { toast.error('Enter at least one valid number'); setSubmitting(false); return; }
    if (form.audienceType === 'pipeline' && !form.pipeline) { toast.error('Select a pipeline'); setSubmitting(false); return; }
    try {
      const minSec = Math.max(0, Number(form.minInterval) || 0);
      const maxSec = Math.max(minSec, Number(form.maxInterval) || 0);
      const payload = {
        name: form.name, type: 'preset', presetMessage: form.preset, sendChannel: 'whatsapp_qr',
        sendInterval: { minSec, maxSec },
        audience: { type: form.audienceType, segments: form.segments, tags: form.tags, numbers, pipeline: form.pipeline || undefined, stage: form.stage || undefined },
      };
      if (editId) {
        await campaignApi.update(editId, payload);
        if (createSchedAt) await campaignApi.schedule(editId, { scheduledAt: new Date(createSchedAt).toISOString(), recurrence: createSchedRec });
      } else {
        const created = await campaignApi.create(payload);
        const newId = created.data.data?._id;
        if (createSchedAt && newId) await campaignApi.schedule(newId, { scheduledAt: new Date(createSchedAt).toISOString(), recurrence: createSchedRec });
      }
      toast.success(editId ? 'Web WhatsApp campaign updated' : 'Web WhatsApp campaign created');
      setShowModal(false); setEditId(null);
      setCreateSchedAt(''); setCreateSchedRec('none');
      setForm({ name: '', preset: '', audienceType: 'all', segments: [], tags: [], pipeline: '', stage: '', minInterval: 5, maxInterval: 15 });
      fetchData();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed');
    }
    setSubmitting(false);
  };

  const handleEdit = (c: Campaign & { targetType?: string; targetSegments?: string[]; targetTags?: string[]; targetNumbers?: string[]; targetPipeline?: string; targetStage?: string; presetMessage?: { _id?: string } | string }) => {
    setEditId(c._id);
    setForm({
      name: c.name, preset: typeof c.presetMessage === 'string' ? c.presetMessage : (c.presetMessage?._id || ''),
      audienceType: c.targetType || 'all',
      segments: (c.targetSegments || []).map(String), tags: (c.targetTags || []).map(String),
      pipeline: c.targetPipeline ? String(c.targetPipeline) : '', stage: c.targetStage || '',
      minInterval: (c as { sendInterval?: { minSec?: number } }).sendInterval?.minSec ?? 5,
      maxInterval: (c as { sendInterval?: { maxSec?: number } }).sendInterval?.maxSec ?? 15,
    });
    setNumbersText((c.targetNumbers || []).join(String.fromCharCode(10)));
    setShowModal(true);
  };

  const [createSchedAt, setCreateSchedAt] = useState('');
  const [createSchedRec, setCreateSchedRec] = useState('none');
  const [schedId, setSchedId] = useState<string | null>(null);
  const [schedAt, setSchedAt] = useState('');
  const [schedRec, setSchedRec] = useState('none');

  const handleSchedule = async () => {
    if (!schedId || !schedAt) { toast.error('Pick a date & time'); return; }
    try {
      await campaignApi.schedule(schedId, { scheduledAt: new Date(schedAt).toISOString(), recurrence: schedRec });
      toast.success('Campaign scheduled');
      setSchedId(null); setSchedAt(''); setSchedRec('none');
      fetchData();
    } catch (e) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Schedule failed');
    }
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

  const getStatusBadge = (c: Campaign) => {
    const map: Record<string, { variant: 'success' | 'warning' | 'danger' | 'info' | 'default'; icon: React.ReactNode }> = {
      draft: { variant: 'default', icon: <Clock className="w-3 h-3" /> },
      scheduled: { variant: 'info', icon: <Clock className="w-3 h-3" /> },
      running: { variant: 'success', icon: <Play className="w-3 h-3" /> },
      completed: { variant: 'success', icon: <CheckCircle className="w-3 h-3" /> },
      paused: { variant: 'warning', icon: <Pause className="w-3 h-3" /> },
      failed: { variant: 'danger', icon: <AlertCircle className="w-3 h-3" /> },
    };
    const s = map[c.status] || map.draft;
    const autoPaused = c.status === 'paused' && (c as { variables?: { qrAutoPaused?: boolean } }).variables?.qrAutoPaused;
    return <Badge variant={s.variant}>{s.icon} {autoPaused ? 'paused (daily limit — auto-resumes)' : c.status}</Badge>;
  };

  const columns = [
    { key: 'name', title: 'Campaign', render: (c: Campaign) => <span className="font-medium text-admin-text">{c.name}</span> },
    { key: 'status', title: 'Status', render: (c: Campaign) => getStatusBadge(c) },
    { key: 'sent', title: 'Sent', render: (c: Campaign) => c.stats?.sent || 0 },
    { key: 'failed', title: 'Failed', render: (c: Campaign) => c.stats?.failed || 0 },
    { key: 'date', title: 'Created', render: (c: Campaign) => new Date(c.createdAt).toLocaleDateString() },
    { key: 'actions', title: '', render: (c: Campaign) => (
      <div className="flex gap-1">
        {c.status === 'draft' && <button type="button" onClick={() => handleAction(c._id, 'start')} className="rounded-lg p-1.5 text-admin-text-subdued hover:bg-[#f6f6f7] hover:text-admin-text"><Play className="h-4 w-4" /></button>}
        {(c.status === 'draft' || c.status === 'scheduled') && <button type="button" title="Schedule" onClick={() => { setSchedId(c._id); setSchedAt(''); setSchedRec('none'); }} className="rounded-lg p-1.5 text-admin-text-subdued hover:bg-amber-50 hover:text-amber-600"><CalendarClock className="h-4 w-4" /></button>}
        {(c.status === 'draft' || c.status === 'paused') && <button type="button" onClick={() => handleEdit(c)} className="rounded-lg p-1.5 text-admin-text-subdued hover:bg-[#f6f6f7] hover:text-admin-text"><Edit className="h-4 w-4" /></button>}
        {c.status === 'running' && <button type="button" onClick={() => handleAction(c._id, 'pause')} className="rounded-lg p-1.5 text-admin-text-subdued hover:bg-yellow-50 hover:text-yellow-600"><Pause className="h-4 w-4" /></button>}
        {['running', 'completed', 'paused'].includes(c.status) && <button type="button" title="Report" onClick={() => setReportTarget({ id: c._id, name: c.name })} className="rounded-lg p-1.5 text-admin-text-subdued hover:bg-[#f6f6f7] hover:text-admin-text"><BarChart3 className="h-4 w-4" /></button>}
        <button type="button" onClick={() => handleAction(c._id, 'delete')} className="rounded-lg p-1.5 text-admin-text-subdued hover:bg-red-50 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
      </div>
    )},
  ];

  return (
    <div className={`${adminContentColumnClass} space-y-4`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <QrCode className="h-5 w-5 shrink-0 text-admin-text-secondary" aria-hidden />
            <h1 className="text-[20px] font-semibold tracking-tight text-admin-text">Web WhatsApp Campaigns</h1>
          </div>
          <p className="mt-1 text-[13px] text-admin-text-secondary">Bulk send preset templates via your Web WhatsApp (QR) number — no template charge, no 24-hr window needed</p>
        </div>
        <button type="button" onClick={() => setShowModal(true)} className={primaryBtn}>
          <Plus className="h-4 w-4" /> New Web WhatsApp Campaign
        </button>
      </div>

      <div className={`${dashboardCardShell} flex items-start gap-2 border-amber-200 bg-amber-50 text-[13px] text-amber-800`}>
        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
        <span>Messages go from your <b>Web WhatsApp (QR)</b> number with human-like delays and a daily safety limit (warm-up). If the limit is reached, the campaign pauses and <b>auto-resumes the next day</b>. Bulk sending via Web WhatsApp always carries some ban risk — keep content non-spammy.</span>
      </div>

      <Table columns={columns} data={campaigns} loading={loading} emptyText="No Web WhatsApp campaigns yet" onBulkDelete={async (ids) => { await Promise.all(ids.map((id) => campaignApi.delete(id).catch(() => null))); fetchData(); }} />

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditId(null); }} title={editId ? 'Edit Web WhatsApp Campaign' : 'Create Web WhatsApp Campaign'} size="lg">
        <div className="space-y-4">
          <Input label="Campaign Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Select label="Preset Template" value={form.preset} onChange={(e) => setForm({ ...form, preset: e.target.value })}
            options={[{ value: '', label: 'Select preset template' }, ...presets.map(p => ({ value: p._id, label: p.name }))]} />
          {presets.length === 0 && <p className="text-xs text-amber-600">Create a template on the Preset Templates page first.</p>}
          <Select label="Audience" value={form.audienceType} onChange={(e) => setForm({ ...form, audienceType: e.target.value })}
            options={[{ value: 'all', label: 'All Contacts' }, { value: 'segment', label: 'By Segment' }, { value: 'tag', label: 'By Tag' }, { value: 'pipeline', label: 'By Pipeline Stage' }, { value: 'numbers', label: 'Numbers List / CSV (bina contact save kiye)' }]} />
          {form.audienceType === 'pipeline' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Select label="Pipeline" value={form.pipeline} onChange={(e) => setForm({ ...form, pipeline: e.target.value, stage: '' })}
                options={[{ value: '', label: 'Select pipeline' }, ...pipelines.map(p => ({ value: p._id, label: p.name }))]} />
              <Select label="Stage" value={form.stage} onChange={(e) => setForm({ ...form, stage: e.target.value })}
                options={[{ value: '', label: 'All stages' }, ...((pipelines.find(p => p._id === form.pipeline)?.stages || []).map(s => ({ value: s.name, label: s.name })))]} />
            </div>
          )}
          {form.audienceType === 'numbers' && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-admin-text">Phone Numbers</label>
              <textarea rows={5} value={numbersText} onChange={(e) => setNumbersText(e.target.value)}
                placeholder={'9198765XXXXX\n9198123XXXXX\n(one number per line, or separate with commas)'}
                className={fieldClass} />
              <div className="flex items-center justify-between">
                <label className="inline-flex items-center gap-1.5 cursor-pointer text-sm font-medium text-admin-text hover:text-[#1a1a1a]">
                  <Plus className="w-4 h-4" /> Upload CSV
                  <input type="file" accept=".csv,.txt" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleCsvUpload(f); e.target.value = ''; }} />
                </label>
                <span className="text-xs text-admin-text-subdued">{parseNumbers(numbersText).length} valid numbers</span>
              </div>
              <p className="text-xs text-admin-text-subdued">New numbers are saved as contacts automatically and messaged via the QR channel.</p>
            </div>
          )}
          {form.audienceType === 'segment' && (
            <div>
              <label className="block text-sm font-medium text-admin-text mb-1">Select Segments</label>
              <div className="flex flex-wrap gap-2">
                {segments.map(s => (
                  <button key={s._id} onClick={() => setForm({ ...form, segments: form.segments.includes(s._id) ? form.segments.filter(x => x !== s._id) : [...form.segments, s._id] })}
                    className={`px-3 py-1 text-xs rounded-full border ${form.segments.includes(s._id) ? 'border-admin-border bg-[#f1f1f1] text-admin-text' : 'border-admin-border bg-white text-admin-text'}`}>
                    {s.name}
                  </button>
                ))}
              </div>
            </div>
          )}
          {form.audienceType === 'tag' && (
            <div>
              <label className="block text-sm font-medium text-admin-text mb-1">Select Tags</label>
              <div className="flex flex-wrap gap-2">
                {tags.map(t => (
                  <button key={t._id} onClick={() => setForm({ ...form, tags: form.tags.includes(t._id) ? form.tags.filter(x => x !== t._id) : [...form.tags, t._id] })}
                    className={`px-3 py-1 text-xs rounded-full border ${form.tags.includes(t._id) ? 'border-admin-border bg-[#f1f1f1] text-admin-text' : 'border-admin-border bg-white text-admin-text'}`}>
                    {t.name}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="border rounded-lg p-3 bg-[#f6f6f7] border-admin-border space-y-2">
            <p className="text-xs font-medium text-admin-text">Sending speed — delay between each message (anti-ban)</p>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Min seconds" type="number" min={0} value={form.minInterval}
                onChange={(e) => setForm({ ...form, minInterval: Number(e.target.value) })} />
              <Input label="Max seconds" type="number" min={0} value={form.maxInterval}
                onChange={(e) => setForm({ ...form, maxInterval: Number(e.target.value) })} />
            </div>
            <p className="text-[11px] text-admin-text-subdued">Har message ke beech {form.minInterval}-{form.maxInterval}s ka random gap. 0 = no delay (fastest, higher ban risk).</p>
          </div>

          <div className="space-y-2 rounded-lg border border-amber-100 bg-amber-50/40 p-3">
            <p className="text-xs font-medium text-admin-text">Schedule (optional) — leave empty to keep as draft and start manually</p>
            <div className="flex gap-2">
              <input type="datetime-local" value={createSchedAt} onChange={(e) => setCreateSchedAt(e.target.value)}
                className={`${fieldClass} flex-1`} />
              <select value={createSchedRec} onChange={(e) => setCreateSchedRec(e.target.value)} className={fieldClass}>
                <option value="none">Once (no repeat)</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            {createSchedAt && <p className="text-[11px] text-amber-700">Campaign will run automatically at the selected time{createSchedRec !== 'none' ? ` and repeat ${createSchedRec}` : ''}.</p>}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button type="button" onClick={() => setShowModal(false)} className={secondaryBtn}>Cancel</button>
            <button type="button" onClick={handleCreate} disabled={submitting} className={primaryBtn}><Send className="h-4 w-4" /> Create Campaign</button>
          </div>
        </div>
      </Modal>

      <CampaignReportModal campaignId={reportTarget?.id || null} campaignName={reportTarget?.name} onClose={() => setReportTarget(null)} />

      <Modal isOpen={!!schedId} onClose={() => setSchedId(null)} title="Schedule Campaign" size="sm">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-admin-text mb-1">Date & Time</label>
            <input type="datetime-local" value={schedAt} onChange={e => setSchedAt(e.target.value)}
              className={fieldClass} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-admin-text">Repeat</label>
            <select value={schedRec} onChange={e => setSchedRec(e.target.value)} className={fieldClass}>
              <option value="none">Once (no repeat)</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          <button type="button" onClick={handleSchedule} className={`${primaryBtn} w-full`}>Schedule</button>
        </div>
      </Modal>
    </div>
  );
}
