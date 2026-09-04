'use client';
import React, { useState, useEffect } from 'react';
import { Plus, Phone, Play, Pause, Trash2, RefreshCw, Eye } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import { aiCallingApi, tagApi } from '@/lib/api';
import toast from 'react-hot-toast';
import { adminContentColumnClass, dashboardCardShell } from '@/components/layout/dashboard-ui';

const primaryBtn =
  'inline-flex items-center justify-center gap-1.5 rounded-lg bg-admin-text px-3 py-1.5 text-[13px] font-semibold text-white transition-colors hover:bg-[#1a1a1a] disabled:cursor-not-allowed disabled:opacity-50';
const secondaryBtn =
  'inline-flex items-center justify-center gap-1.5 rounded-lg border border-admin-border bg-white px-3 py-1.5 text-[13px] font-medium text-admin-text transition-colors hover:bg-[#f6f6f7]';
const inputClass =
  'w-full rounded-lg border border-admin-border bg-white px-3 py-2 text-[13px] text-admin-text placeholder:text-admin-text-subdued focus:border-[#005bd3] focus:outline-none focus:ring-1 focus:ring-[#005bd3]/30';
const labelClass = 'mb-1 block text-[12px] font-medium text-admin-text-secondary';

interface CallTarget {
  phone: string;
  name?: string;
  status: string;
  error?: string;
  calledAt?: string;
}

interface CallCampaignItem {
  _id: string;
  name: string;
  status: string;
  agent?: { _id: string; name: string } | null;
  callingHours?: { start: string; end: string };
  dailyLimit: number;
  callsToday: number;
  stats: { total: number; done: number; failed: number; permissionRequested: number };
  createdAt: string;
}

interface AgentItem { _id: string; name: string; status: string }
interface TagItem { _id: string; name: string }

const statusColor = (s: string) =>
  s === 'running' ? 'success' : s === 'completed' ? 'info' : s === 'failed' ? 'danger' : 'default';

export default function BulkCallsPage() {
  const [campaigns, setCampaigns] = useState<CallCampaignItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [agents, setAgents] = useState<AgentItem[]>([]);
  const [tags, setTags] = useState<TagItem[]>([]);
  const [detail, setDetail] = useState<(CallCampaignItem & { targets: CallTarget[] }) | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    agentId: '',
    tagId: '',
    phonesText: '',
    startHour: '10:00',
    endHour: '19:00',
    dailyLimit: 50,
  });

  const load = async () => {
    try {
      const res = await aiCallingApi.getCallCampaigns();
      setCampaigns(res.data.data || []);
    } catch { /* */ }
    setLoading(false);
  };

  useEffect(() => {
    load();
    aiCallingApi.getAgents().then(r => setAgents((r.data.data || []).filter((a: AgentItem) => a.status === 'active'))).catch(() => {});
    tagApi.list().then(r => setTags(r.data.data || [])).catch(() => {});
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, []);

  const create = async () => {
    if (!form.name.trim()) { toast.error('Name is required'); return; }
    const phones = form.phonesText.split(/[\n,;]+/).map(p => p.trim()).filter(Boolean);
    if (!phones.length && !form.tagId) { toast.error('Add phone numbers or select a tag'); return; }
    setSaving(true);
    try {
      await aiCallingApi.createCallCampaign({
        name: form.name,
        agentId: form.agentId || undefined,
        tagId: form.tagId || undefined,
        phones,
        callingHours: { start: form.startHour, end: form.endHour },
        dailyLimit: form.dailyLimit,
      });
      toast.success('Campaign created');
      setShowModal(false);
      setForm({ name: '', agentId: '', tagId: '', phonesText: '', startHour: '10:00', endHour: '19:00', dailyLimit: 50 });
      load();
    } catch (e) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to create campaign');
    }
    setSaving(false);
  };

  const doAction = async (id: string, action: 'start' | 'pause' | 'delete') => {
    try {
      if (action === 'start') await aiCallingApi.startCallCampaign(id);
      if (action === 'pause') await aiCallingApi.pauseCallCampaign(id);
      if (action === 'delete') {
        if (!confirm('Delete this campaign?')) return;
        await aiCallingApi.deleteCallCampaign(id);
      }
      load();
    } catch (e) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  const openDetail = async (id: string) => {
    try {
      const res = await aiCallingApi.getCallCampaign(id);
      setDetail(res.data.data);
    } catch { toast.error('Failed to load campaign'); }
  };

  return (
    <div className={`${adminContentColumnClass} space-y-4`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Phone className="h-5 w-5 shrink-0 text-admin-text-secondary" aria-hidden />
            <h1 className="text-[20px] font-semibold tracking-tight text-admin-text">Bulk AI Calls</h1>
          </div>
          <p className="mt-1 text-[13px] text-admin-text-secondary">
            AI agent calls your contact list automatically — 1 call per minute, within calling hours and daily limit.
          </p>
        </div>
        <div className="flex gap-2">
          <button type="button" className={secondaryBtn} onClick={load} aria-label="Refresh">
            <RefreshCw className="h-4 w-4" />
          </button>
          <button type="button" className={primaryBtn} onClick={() => setShowModal(true)}>
            <Plus className="h-4 w-4" /> New Campaign
          </button>
        </div>
      </div>

      <div className={`${dashboardCardShell} overflow-hidden !p-0`}>
        <table className="w-full text-[13px]">
          <thead className="bg-[#f6f6f7] text-left text-admin-text-secondary">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Agent</th>
              <th className="px-4 py-3 font-medium">Progress</th>
              <th className="px-4 py-3 font-medium">Hours</th>
              <th className="px-4 py-3 font-medium">Today</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-admin-text-subdued">Loading...</td>
              </tr>
            )}
            {!loading && campaigns.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-admin-text-subdued">
                  No call campaigns yet. Create one to start bulk AI calling.
                </td>
              </tr>
            )}
            {campaigns.map(c => (
              <tr key={c._id} className="border-t border-admin-border">
                <td className="px-4 py-3 font-medium text-admin-text">{c.name}</td>
                <td className="px-4 py-3 text-admin-text-secondary">{c.agent?.name || 'Default agent'}</td>
                <td className="px-4 py-3 text-admin-text-secondary">
                  {c.stats.done + c.stats.failed + c.stats.permissionRequested}/{c.stats.total}
                  <span className="ml-1 text-[12px] text-admin-text-subdued">
                    ({c.stats.done} ok, {c.stats.failed} failed, {c.stats.permissionRequested} perm.)
                  </span>
                </td>
                <td className="px-4 py-3 text-admin-text-secondary">{c.callingHours?.start}–{c.callingHours?.end}</td>
                <td className="px-4 py-3 text-admin-text-secondary">{c.callsToday}/{c.dailyLimit}</td>
                <td className="px-4 py-3"><Badge variant={statusColor(c.status)}>{c.status}</Badge></td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <button type="button" onClick={() => openDetail(c._id)} className="rounded-lg p-1.5 text-admin-text-subdued hover:bg-[#f6f6f7] hover:text-admin-text" title="View">
                      <Eye className="h-4 w-4" />
                    </button>
                    {(c.status === 'draft' || c.status === 'paused') && (
                      <button type="button" onClick={() => doAction(c._id, 'start')} className="rounded-lg p-1.5 text-[#0d6b38] hover:bg-[#f1f8f5]" title="Start">
                        <Play className="h-4 w-4" />
                      </button>
                    )}
                    {c.status === 'running' && (
                      <button type="button" onClick={() => doAction(c._id, 'pause')} className="rounded-lg p-1.5 text-amber-600 hover:bg-amber-50" title="Pause">
                        <Pause className="h-4 w-4" />
                      </button>
                    )}
                    <button type="button" onClick={() => doAction(c._id, 'delete')} className="rounded-lg p-1.5 text-admin-text-subdued hover:bg-red-50 hover:text-red-600" title="Delete">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="New Bulk Call Campaign">
        <div className="space-y-3">
          <div>
            <label className={labelClass}>Campaign Name</label>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
              className={inputClass} placeholder="e.g. July follow-up calls" />
          </div>
          <div>
            <label className={labelClass}>AI Agent</label>
            <select value={form.agentId} onChange={e => setForm({ ...form, agentId: e.target.value })}
              className={inputClass}>
              <option value="">Default agent</option>
              {agents.map(a => <option key={a._id} value={a._id}>{a.name}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Contacts by Tag (optional)</label>
            <select value={form.tagId} onChange={e => setForm({ ...form, tagId: e.target.value })}
              className={inputClass}>
              <option value="">— None —</option>
              {tags.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Phone Numbers (one per line, optional)</label>
            <textarea value={form.phonesText} onChange={e => setForm({ ...form, phonesText: e.target.value })}
              rows={4} className={inputClass} placeholder={'919876543210\n919812345678'} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={labelClass}>Start Time</label>
              <input type="time" value={form.startHour} onChange={e => setForm({ ...form, startHour: e.target.value })}
                className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>End Time</label>
              <input type="time" value={form.endHour} onChange={e => setForm({ ...form, endHour: e.target.value })}
                className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Daily Limit</label>
              <input type="number" min={1} max={1000} value={form.dailyLimit}
                onChange={e => setForm({ ...form, dailyLimit: Number(e.target.value) })}
                className={inputClass} />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className={secondaryBtn} onClick={() => setShowModal(false)}>Cancel</button>
            <button type="button" className={primaryBtn} onClick={create} disabled={saving}>
              {saving ? 'Creating...' : 'Create Campaign'}
            </button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={!!detail} onClose={() => setDetail(null)} title={detail?.name || 'Campaign'}>
        {detail && (
          <div className="max-h-[60vh] overflow-y-auto">
            <p className="mb-3 text-[13px] text-admin-text-secondary">
              {detail.stats.done} done · {detail.stats.failed} failed · {detail.stats.permissionRequested} permission requested · {detail.stats.total} total
            </p>
            <table className="w-full text-[13px]">
              <thead className="bg-[#f6f6f7] text-left text-admin-text-secondary">
                <tr>
                  <th className="px-2 py-2 font-medium">Phone</th>
                  <th className="px-2 py-2 font-medium">Name</th>
                  <th className="px-2 py-2 font-medium">Status</th>
                  <th className="px-2 py-2 font-medium">Note</th>
                </tr>
              </thead>
              <tbody>
                {detail.targets.map((t, i) => (
                  <tr key={i} className="border-t border-admin-border">
                    <td className="px-2 py-1.5 text-admin-text">{t.phone}</td>
                    <td className="px-2 py-1.5 text-admin-text-secondary">{t.name || '-'}</td>
                    <td className="px-2 py-1.5">
                      <Badge variant={t.status === 'done' ? 'success' : t.status === 'failed' ? 'danger' : 'default'}>{t.status}</Badge>
                    </td>
                    <td className="px-2 py-1.5 text-[12px] text-admin-text-subdued">{t.error || ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Modal>
    </div>
  );
}
