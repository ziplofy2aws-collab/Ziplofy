'use client';
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Plus, Phone, PhoneCall, Trash2, Edit, Save, RefreshCw, ToggleLeft, ToggleRight, Star, Download, History, X } from 'lucide-react';
import { aiCallingApi, aiSettingsApi, tagApi } from '@/lib/api';
import { useCall } from '@/contexts/CallProvider';
import toast from 'react-hot-toast';
import { adminContentColumnClass, dashboardCardShell } from '@/components/layout/dashboard-ui';

const primaryBtn =
  'inline-flex items-center justify-center gap-1.5 rounded-lg bg-admin-text px-3 py-1.5 text-[13px] font-semibold text-white transition-colors hover:bg-[#1a1a1a] disabled:cursor-not-allowed disabled:opacity-50';
const secondaryBtn =
  'inline-flex items-center justify-center gap-1.5 rounded-lg border border-admin-border bg-white px-3 py-1.5 text-[13px] font-medium text-admin-text transition-colors hover:bg-[#f6f6f7] disabled:cursor-not-allowed disabled:opacity-50';
const inputClass =
  'w-full rounded-lg border border-admin-border bg-white px-3 py-2 text-[13px] text-admin-text placeholder:text-admin-text-subdued focus:outline-none focus:ring-2 focus:ring-[#005bd3]/30';
const labelClass = 'mb-1 block text-[12px] font-medium text-admin-text-secondary';
const cardClass = `${dashboardCardShell} !p-5`;
const chipSelected = 'border-admin-text bg-admin-text text-white';
const chipUnselected = 'border-admin-border bg-white text-admin-text hover:bg-[#f6f6f7]';
const selectChip = (on: boolean) =>
  `rounded-lg border p-3 cursor-pointer transition-colors ${on ? 'border-admin-text bg-[#f6f6f7]' : 'border-admin-border hover:bg-[#fafafa]'}`;
const modalOverlayClass =
  'fixed inset-0 z-[1300] flex items-center justify-center p-4 sm:p-6';
const modalPanelClass =
  'relative z-10 flex max-h-[min(90vh,880px)] w-full max-w-lg flex-col overflow-hidden rounded-xl border border-admin-border bg-white shadow-[0_16px_48px_rgba(16,24,40,0.18)]';

const OPENAI_VOICES = ['alloy', 'ash', 'ballad', 'coral', 'echo', 'sage', 'shimmer', 'verse', 'marin', 'cedar'];
const REALTIME_MODELS = ['gpt-realtime', 'gpt-4o-realtime-preview', 'gpt-4o-mini-realtime-preview'];
const SARVAM_VOICES = ['priya', 'neha', 'rahul', 'simran', 'kavya', 'aditya', 'ritu', 'ashutosh', 'pooja', 'rohan', 'amit', 'dev'];
// A voice must match its provider — e.g. an OpenAI voice ("marin") is rejected by Sarvam.
// When the provider changes, reset voiceId to a valid default for the new provider.
const defaultVoiceForProvider = (p: string): string =>
  p === 'openai' ? 'alloy'
    : (p === 'sarvam' || p === 'groq_sarvam') ? 'priya'
    : p === 'elevenlabs' ? 'rachel'
    : '';
const ELEVENLABS_VOICES = ['rachel', 'drew', 'clyde', 'paul', 'domi', 'dave', 'fin', 'sarah', 'antoni', 'thomas', 'charlie', 'george', 'emily', 'elli', 'callum', 'patrick', 'harry', 'liam', 'dorothy', 'josh', 'arnold', 'charlotte', 'matilda', 'matthew', 'james', 'joseph', 'jeremy', 'michael', 'ethan', 'gigi', 'freya', 'grace', 'daniel', 'lily', 'serena', 'adam', 'nicole', 'bill', 'jessie', 'sam', 'glinda', 'giovanni', 'mimi'];

interface AIAgent {
  _id: string; name: string; description: string; voiceProvider: string; aiModel: string; groqApiKey?: string;
  voiceId?: string; voiceApiKey?: string; voiceConfig?: { apiKey?: string };
  systemPrompt: string; greeting: string; maxDuration: number; transferNumber: string;
  catalogUrl?: string; followUpMessage?: string;
  status: string; isDefault?: boolean; stats: { totalCalls: number; avgDuration: number };
}

interface CallHistoryItem {
  _id: string; callId: string; to?: string; from?: string; direction: string;
  status: string; duration: number; agentName: string; recordingUrl: string; createdAt: string;
}

const FILE_BASE = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/api$/, '');

export default function AICallingPage() {
  const [agents, setAgents] = useState<AIAgent[]>([]);
  const [aiCallingEnabled, setAiCallingEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editAgent, setEditAgent] = useState<AIAgent | null>(null);
  const [callPhone, setCallPhone] = useState('');
  const { startCall, active: calling } = useCall();
  const [form, setForm] = useState({
    name: '', description: '', voiceProvider: 'openai', aiModel: 'gpt-realtime', voiceId: 'alloy', voiceApiKey: '', groqApiKey: '',
    systemPrompt: 'You are a helpful assistant for our business. Be friendly and professional on calls.',
    greeting: 'Hello! How can I help you today?', maxDuration: 300, transferNumber: '',
    catalogUrl: '', followUpMessage: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [history, setHistory] = useState<CallHistoryItem[]>([]);
  const [showAllHistory, setShowAllHistory] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const modalOpen = showCreate || !!editAgent;
  useEffect(() => {
    if (modalOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [modalOpen]);

  const closeModal = () => { setShowCreate(false); setEditAgent(null); };

  const fetchHistory = () => {
    aiCallingApi.getCallHistory().then(r => setHistory(r.data.data || [])).catch(() => {});
  };
  useEffect(() => { fetchHistory(); }, []);

  const [ct, setCt] = useState<{ mode: string; tags: string[]; excludeTags: string[] }>({ mode: 'manual', tags: [], excludeTags: [] });
  const [allTags, setAllTags] = useState<{ _id: string; name: string; color?: string }[]>([]);
  const [ctSaving, setCtSaving] = useState(false);

  useEffect(() => {
    aiSettingsApi.get().then(r => {
      const t = r.data.data?.callTargeting;
      if (t) setCt({ mode: t.mode || 'manual', tags: t.tags || [], excludeTags: t.excludeTags || [] });
      const rc = r.data.data?.callRecording;
      if (rc) setRec({ enabled: rc.enabled !== false, autoDeleteDays: rc.autoDeleteDays || 0 });
    }).catch(() => {});
    tagApi.list().then(r => setAllTags(r.data.data || [])).catch(() => {});
  }, []);

  const [rec, setRec] = useState<{ enabled: boolean; autoDeleteDays: number }>({ enabled: true, autoDeleteDays: 0 });
  const [recSaving, setRecSaving] = useState(false);
  const saveRec = async () => {
    setRecSaving(true);
    try { await aiSettingsApi.update({ callRecording: rec }); toast.success('Recording settings saved'); }
    catch { toast.error('Failed to save'); }
    setRecSaving(false);
  };

  const saveCt = async () => {
    setCtSaving(true);
    try { await aiSettingsApi.update({ callTargeting: ct }); toast.success('Call targeting saved'); }
    catch { toast.error('Failed to save'); }
    setCtSaving(false);
  };

  const toggleCtTag = (id: string, key: 'tags' | 'excludeTags') => {
    setCt(prev => ({ ...prev, [key]: prev[key].includes(id) ? prev[key].filter(t => t !== id) : [...prev[key], id] }));
  };

  const fetchAiCallingStatus = async () => {
    try {
      const res = await aiSettingsApi.get();
      setAiCallingEnabled(res.data?.data?.callTargeting?.mode === 'all');
    } catch {}
  };
  const toggleAiCalling = async () => {
    try {
      const newMode = aiCallingEnabled ? 'none' : 'all';
      await aiSettingsApi.update({ callTargeting: { mode: newMode } });
      setAiCallingEnabled(!aiCallingEnabled);
      toast.success(aiCallingEnabled ? 'AI Calling OFF' : 'AI Calling ON');
    } catch { toast.error('Failed to toggle'); }
  };
  const fetchAgents = () => {
    aiCallingApi.getAgents().then(r => setAgents(r.data.data || []))
      .catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(() => { fetchAgents(); fetchAiCallingStatus(); }, []);

  const handleCreate = async () => {
    if (submitting) return;
    setSubmitting(true);

    try {
      await aiCallingApi.createAgent({ ...form, voiceConfig: { apiKey: form.voiceApiKey }, voiceApiKey: form.voiceApiKey });
      toast.success('AI Agent created');
      setShowCreate(false);
      setForm({ name: '', description: '', voiceProvider: 'openai', aiModel: 'gpt-realtime', voiceId: 'alloy', voiceApiKey: '', groqApiKey: '', systemPrompt: form.systemPrompt, greeting: form.greeting, maxDuration: 300, transferNumber: '', catalogUrl: '', followUpMessage: '' });
      fetchAgents();
    } catch { toast.error('Failed to create agent'); } finally { setSubmitting(false); }
  };

  const handleUpdate = async () => {
    if (submitting) return;
    setSubmitting(true);

    if (!editAgent) return;
    try {
      await aiCallingApi.updateAgent(editAgent._id, editAgent);
      toast.success('Agent updated');
      setEditAgent(null);
      fetchAgents();
    } catch { toast.error('Failed to update'); } finally { setSubmitting(false); }
  };

  const handleDelete = async (id: string) => {
    if (submitting) return;
    setSubmitting(true);

    if (!confirm('Delete this AI agent?')) return;
    try {
      await aiCallingApi.deleteAgent(id);
      toast.success('Deleted');
      fetchAgents();
    } catch { toast.error('Failed'); } finally { setSubmitting(false); }
  };

  const handleToggleStatus = async (agent: AIAgent) => {
    try {
      await aiCallingApi.updateAgent(agent._id, { status: agent.status === 'active' ? 'inactive' : 'active' });
      fetchAgents();
    } catch { toast.error('Failed'); } finally { setSubmitting(false); }
  };

  const handleSetDefault = async (agentId: string, enabled: boolean) => {
    try {
      await aiCallingApi.setDefaultAgent({ agentId, enabled });
      toast.success(enabled ? 'Default AI agent set for incoming calls' : 'Default AI agent removed');
      fetchAgents();
    } catch { toast.error('Failed'); } finally { setSubmitting(false); }
  };

  const handleCall = (agentId?: string) => {
    if (!callPhone) { toast.error('Enter phone number'); return; }
    startCall(callPhone, callPhone, agentId);
  };

  if (loading) {
    return (
      <div className={`${adminContentColumnClass} flex h-64 items-center justify-center`}>
        <RefreshCw className="h-6 w-6 animate-spin text-admin-text" />
      </div>
    );
  }

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const allSelected = agents.length > 0 && selectedIds.length === agents.length;
  const toggleSelectAll = () => setSelectedIds(allSelected ? [] : agents.map(a => a._id));

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm('Delete ' + selectedIds.length + ' selected items?')) return;
    if (submitting) return;
    setSubmitting(true);
    try {
      await Promise.all(selectedIds.map(id => aiCallingApi.deleteAgent(id)));
      toast.success(selectedIds.length + ' items deleted');
      setSelectedIds([]);
      fetchAgents();
    } catch { toast.error('Failed to delete some items'); } finally { setSubmitting(false); }
  };

  return (
    <div className={`${adminContentColumnClass} space-y-4`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <PhoneCall className="h-5 w-5 shrink-0 text-admin-text-secondary" aria-hidden />
            <h1 className="text-[20px] font-semibold tracking-tight text-admin-text">AI Calling Settings</h1>
          </div>
          <p className="mt-1 text-[13px] text-admin-text-secondary">Create AI agents to handle incoming & outgoing WhatsApp calls</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={toggleAiCalling}
            className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-[13px] font-medium transition-colors ${
              aiCallingEnabled ? chipSelected : chipUnselected
            }`}
          >
            {aiCallingEnabled ? <ToggleRight className="h-5 w-5" /> : <ToggleLeft className="h-5 w-5" />}
            AI Calling {aiCallingEnabled ? 'ON' : 'OFF'}
          </button>
          <button type="button" onClick={() => setShowCreate(true)} className={primaryBtn}>
            <Plus className="h-4 w-4" /> New AI Agent
          </button>
        </div>
      </div>

      {/* Call Targeting */}
      <div className={cardClass}>
        <div className="mb-1 flex items-center justify-between gap-2">
          <h3 className="text-[13px] font-semibold text-admin-text">Incoming Call Targeting — kaun si calls AI uthaye?</h3>
          <button type="button" onClick={saveCt} disabled={ctSaving} className={primaryBtn}>
            {ctSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
        <p className="mb-3 text-[12px] text-admin-text-subdued">If a customer&apos;s AI Call toggle is ON in chat, AI will always answer their calls (this setting does not override that).</p>
        <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { v: 'manual', l: 'Manual only', d: 'Only customers with AI:ON in chat' },
            { v: 'all', l: 'All contacts', d: 'Sab incoming calls AI uthaye' },
            { v: 'saved', l: 'Saved contacts', d: 'Only calls from saved contacts' },
            { v: 'tags', l: 'Selected tags', d: 'Only contacts with selected tags' },
          ].map(o => (
            <label key={o.v} className={selectChip(ct.mode === o.v)}>
              <input type="radio" name="ctmode" className="hidden" checked={ct.mode === o.v} onChange={() => setCt(prev => ({ ...prev, mode: o.v }))} />
              <p className="text-[13px] font-medium text-admin-text">{o.l}</p>
              <p className="text-[12px] text-admin-text-secondary">{o.d}</p>
            </label>
          ))}
        </div>
        {ct.mode === 'tags' && (
          <div className="mb-3">
            <p className="mb-1 text-[12px] font-medium text-admin-text-secondary">AI will answer calls from contacts with these tags:</p>
            <div className="flex flex-wrap gap-2">
              {allTags.length ? allTags.map(t => (
                <button
                  key={t._id}
                  type="button"
                  onClick={() => toggleCtTag(t._id, 'tags')}
                  className={`rounded-lg border px-2.5 py-1 text-[12px] font-medium transition-colors ${
                    ct.tags.includes(t._id) ? chipSelected : chipUnselected
                  }`}
                >
                  {t.name}
                </button>
              )) : <span className="text-[12px] text-admin-text-subdued">No tags yet — create tags under Contacts &gt; Tags first</span>}
            </div>
          </div>
        )}
        {ct.mode !== 'manual' && allTags.length > 0 && (
          <div>
            <p className="mb-1 text-[12px] font-medium text-admin-text-secondary">Exclude tags (AI will never answer calls from contacts with these tags):</p>
            <div className="flex flex-wrap gap-2">
              {allTags.map(t => (
                <button
                  key={t._id}
                  type="button"
                  onClick={() => toggleCtTag(t._id, 'excludeTags')}
                  className={`rounded-lg border px-2.5 py-1 text-[12px] font-medium transition-colors ${
                    ct.excludeTags.includes(t._id)
                      ? 'border-red-600 bg-red-600 text-white'
                      : chipUnselected
                  }`}
                >
                  {t.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Call Recording settings */}
      <div className={cardClass}>
        <div className="mb-1 flex items-center justify-between gap-2">
          <h3 className="text-[13px] font-semibold text-admin-text">Call Recording</h3>
          <button type="button" onClick={saveRec} disabled={recSaving} className={primaryBtn}>
            {recSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-6">
          <label className="flex cursor-pointer items-center gap-2">
            <input type="checkbox" checked={rec.enabled} onChange={e => setRec(prev => ({ ...prev, enabled: e.target.checked }))} className="h-4 w-4 rounded border-admin-border accent-admin-text" />
            <span className="text-[13px] text-admin-text">Record calls (AI + manual)</span>
          </label>
          <div className="flex items-center gap-2">
            <span className="text-[13px] text-admin-text">Auto-delete after</span>
            <input type="number" min={0} value={rec.autoDeleteDays} onChange={e => setRec(prev => ({ ...prev, autoDeleteDays: Math.max(0, Number(e.target.value) || 0) }))}
              className={`${inputClass} w-20`} />
            <span className="text-[13px] text-admin-text-secondary">days (0 = keep forever)</span>
          </div>
        </div>
      </div>

      {/* Quick Call */}
      <div className={cardClass}>
        <h3 className="mb-2 text-[13px] font-semibold text-admin-text">Quick Outgoing Call</h3>
        <div className="flex gap-2">
          <input type="text" value={callPhone} onChange={e => setCallPhone(e.target.value)}
            className={`flex-1 ${inputClass}`} placeholder="Phone number (e.g. +919876543210)" />
          <button type="button" onClick={() => handleCall()} disabled={calling} className={primaryBtn}>
            <Phone className="h-4 w-4" /> {calling ? 'Calling...' : 'Call Now'}
          </button>
        </div>
      </div>

      {/* Agent Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className={dashboardCardShell}>
          <p className="text-[12px] text-admin-text-secondary">Total Agents</p>
          <p className="mt-1 text-xl font-semibold tabular-nums text-admin-text">{agents.length}</p>
        </div>
        <div className={dashboardCardShell}>
          <p className="text-[12px] text-admin-text-secondary">Active Agents</p>
          <p className="mt-1 text-xl font-semibold tabular-nums text-admin-text">{agents.filter(a => a.status === 'active').length}</p>
        </div>
        <div className={dashboardCardShell}>
          <p className="text-[12px] text-admin-text-secondary">Total Calls</p>
          <p className="mt-1 text-xl font-semibold tabular-nums text-admin-text">{agents.reduce((s, a) => s + (a.stats?.totalCalls || 0), 0)}</p>
        </div>
      </div>

      {/* Agent List */}
      {agents.length > 0 && (
        <div className={`flex items-center justify-between rounded-xl border px-4 py-2.5 ${
          selectedIds.length ? 'border-red-200 bg-red-50' : 'border-admin-border bg-white'
        }`}>
          <label className="flex cursor-pointer items-center gap-2 text-[13px] font-medium text-admin-text">
            <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} className="h-4 w-4 cursor-pointer accent-red-500" />
            Select all{selectedIds.length > 0 && <span className="text-red-700"> · {selectedIds.length} selected</span>}
          </label>
          {selectedIds.length > 0 && (
            <div className="flex gap-2">
              <button type="button" onClick={() => setSelectedIds([])} className={secondaryBtn}>Clear</button>
              <button type="button" onClick={handleBulkDelete} disabled={submitting} className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-[13px] font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-50">
                Delete selected
              </button>
            </div>
          )}
        </div>
      )}
      <div className="space-y-3">
        {agents.length === 0 ? (
          <div className={`${cardClass} py-12 text-center`}>
            <PhoneCall className="mx-auto mb-3 h-10 w-10 text-admin-text-subdued" />
            <p className="text-[13px] text-admin-text-secondary">No AI agents yet</p>
            <p className="mt-1 text-[12px] text-admin-text-subdued">Create an AI agent to handle WhatsApp calls</p>
          </div>
        ) : agents.map(agent => (
          <div key={agent._id} className={cardClass}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <input type="checkbox" checked={selectedIds.includes(agent._id)} onChange={() => toggleSelect(agent._id)} className="h-4 w-4 shrink-0 cursor-pointer accent-red-500" />
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${agent.status === 'active' ? 'bg-emerald-50' : 'bg-[#f6f6f7]'}`}>
                  <Phone className={`h-5 w-5 ${agent.status === 'active' ? 'text-emerald-700' : 'text-admin-text-subdued'}`} />
                </div>
                <div>
                  <h3 className="flex items-center gap-2 text-[14px] font-semibold text-admin-text">
                    {agent.name}
                    {agent.isDefault && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-700">
                        <Star className="h-3 w-3" /> Default
                      </span>
                    )}
                  </h3>
                  <p className="text-[13px] text-admin-text-secondary">{agent.description || 'No description'}</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSetDefault(agent._id, !agent.isDefault)}
                  className={`rounded-lg border px-3 py-1.5 text-[12px] font-medium transition-colors ${
                    agent.isDefault ? 'border-amber-200 bg-amber-50 text-amber-700' : secondaryBtn
                  }`}
                >
                  {agent.isDefault ? 'Remove Default' : 'Set as Default'}
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleStatus(agent)}
                  className={`inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-[12px] font-medium transition-colors ${
                    agent.status === 'active' ? chipSelected : chipUnselected
                  }`}
                >
                  {agent.status === 'active' ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                  {agent.status === 'active' ? 'Active' : 'Inactive'}
                </button>
                <button type="button" onClick={() => setEditAgent({ ...agent })} className="rounded-lg p-1.5 hover:bg-[#f6f6f7]">
                  <Edit className="h-4 w-4 text-admin-text-subdued" />
                </button>
                <button type="button" onClick={() => handleDelete(agent._id)} className="rounded-lg p-1.5 hover:bg-red-50">
                  <Trash2 className="h-4 w-4 text-red-400" />
                </button>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3 text-[12px] text-admin-text-secondary sm:grid-cols-4">
              <div>Model: <span className="text-admin-text">{agent.aiModel}</span></div>
              <div>Provider: <span className="text-admin-text">{agent.voiceProvider}</span></div>
              <div>Calls: <span className="text-admin-text">{agent.stats?.totalCalls || 0}</span></div>
              <div>Max Duration: <span className="text-admin-text">{agent.maxDuration}s</span></div>
            </div>
            {agent.greeting && <p className="mt-2 text-[12px] italic text-admin-text-subdued">&quot;{agent.greeting}&quot;</p>}
          </div>
        ))}
      </div>

      {/* Call History */}
      <div className={cardClass}>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-[13px] font-semibold text-admin-text">
            <History className="h-4 w-4 text-admin-text-subdued" /> Call History
          </h3>
          <button type="button" onClick={fetchHistory} className="rounded-lg p-1.5 hover:bg-[#f6f6f7]" title="Refresh">
            <RefreshCw className="h-4 w-4 text-admin-text-subdued" />
          </button>
        </div>
        {history.length === 0 ? (
          <p className="py-6 text-center text-[13px] text-admin-text-subdued">No calls yet</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-admin-border text-left text-[12px] text-admin-text-subdued">
                    <th className="py-2 pr-3 font-medium">Date</th>
                    <th className="py-2 pr-3 font-medium">Number</th>
                    <th className="py-2 pr-3 font-medium">Direction</th>
                    <th className="py-2 pr-3 font-medium">Agent</th>
                    <th className="py-2 pr-3 font-medium">Status</th>
                    <th className="py-2 pr-3 font-medium">Recording</th>
                  </tr>
                </thead>
                <tbody>
                  {(showAllHistory ? history : history.slice(0, 10)).map(h => (
                    <tr key={h._id} className="border-b border-admin-border last:border-0">
                      <td className="whitespace-nowrap py-2 pr-3 text-admin-text-secondary">{new Date(h.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</td>
                      <td className="py-2 pr-3 text-admin-text">{h.direction === 'USER_INITIATED' ? (h.from || '-') : (h.to || '-')}</td>
                      <td className="py-2 pr-3 text-admin-text-secondary">{h.direction === 'USER_INITIATED' ? 'Incoming' : 'Outgoing'}</td>
                      <td className="py-2 pr-3 text-admin-text-secondary">{h.agentName || '-'}</td>
                      <td className="py-2 pr-3">
                        <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                          ['completed', 'terminated', 'accepted'].includes(h.status)
                            ? 'bg-emerald-100 text-emerald-700'
                            : ['failed', 'rejected'].includes(h.status)
                              ? 'bg-red-100 text-red-600'
                              : 'bg-[#f6f6f7] text-admin-text-secondary'
                        }`}>{h.status}</span>
                      </td>
                      <td className="py-2 pr-3">
                        {h.recordingUrl ? (
                          <div className="flex items-center gap-2">
                            <audio controls preload="none" className="h-8 max-w-[220px]" src={FILE_BASE + h.recordingUrl} />
                            <a href={FILE_BASE + h.recordingUrl} download className="rounded-lg p-1.5 hover:bg-[#f6f6f7]" title="Download">
                              <Download className="h-4 w-4 text-admin-text-subdued" />
                            </a>
                          </div>
                        ) : <span className="text-[12px] text-admin-text-subdued">—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {history.length > 10 && (
              <button type="button" onClick={() => setShowAllHistory(v => !v)} className="mt-2 text-[12px] font-semibold text-[#005bd3] hover:underline">
                {showAllHistory ? 'Show less' : `Show all (${history.length})`}
              </button>
            )}
          </>
        )}
      </div>

      {/* Create/Edit Modal */}
      {modalOpen && mounted && createPortal(
        <div className={modalOverlayClass} onClick={closeModal}>
          <div className="absolute inset-0 bg-black/40" aria-hidden />
          <div className={modalPanelClass} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-admin-border px-4 py-3">
              <h3 className="text-[15px] font-semibold text-admin-text">{editAgent ? 'Edit AI Agent' : 'Create AI Agent'}</h3>
              <button type="button" onClick={closeModal} className="rounded-lg p-1.5 hover:bg-[#f6f6f7]" aria-label="Close">
                <X className="h-4 w-4 text-admin-text-subdued" />
              </button>
            </div>
            <div className="flex-1 space-y-4 overflow-y-auto p-4">
              <div>
                <label className={labelClass}>Agent Name</label>
                <input type="text" value={editAgent?.name || form.name} onChange={e => editAgent ? setEditAgent({ ...editAgent, name: e.target.value }) : setForm({ ...form, name: e.target.value })}
                  className={inputClass} placeholder="e.g. Sales Assistant" />
              </div>
              <div>
                <label className={labelClass}>Description</label>
                <input type="text" value={editAgent?.description || form.description} onChange={e => editAgent ? setEditAgent({ ...editAgent, description: e.target.value }) : setForm({ ...form, description: e.target.value })}
                  className={inputClass} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Voice Provider</label>
                  <select value={editAgent?.voiceProvider || form.voiceProvider} onChange={e => { const v = e.target.value; if (editAgent) { setEditAgent({ ...editAgent, voiceProvider: v, voiceId: defaultVoiceForProvider(v), ...(v === 'openai' ? { voiceApiKey: '', voiceConfig: { ...editAgent.voiceConfig, apiKey: '' } } : {}) }); } else { setForm({ ...form, voiceProvider: v, voiceId: defaultVoiceForProvider(v), ...(v === 'openai' ? { voiceApiKey: '' } : {}) }); } }}
                    className={inputClass}>
                    <option value="openai">OpenAI Realtime</option><option value="groq_sarvam">Groq + Sarvam (Budget ₹1/min)</option><option value="elevenlabs">ElevenLabs</option><option value="sarvam">Sarvam AI</option><option value="cartesia">Cartesia</option><option value="google">Google</option><option value="azure">Azure</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>AI Model</label>
                  <select value={editAgent?.aiModel || form.aiModel} onChange={e => editAgent ? setEditAgent({ ...editAgent, aiModel: e.target.value }) : setForm({ ...form, aiModel: e.target.value })}
                    className={inputClass}>
                    {REALTIME_MODELS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              </div>
              {(editAgent?.voiceProvider || form.voiceProvider) === 'openai' ? (
                <div>
                  <label className={labelClass}>Voice</label>
                  <select value={editAgent ? (editAgent.voiceId || 'alloy') : form.voiceId}
                    onChange={e => editAgent ? setEditAgent({ ...editAgent, voiceId: e.target.value }) : setForm({ ...form, voiceId: e.target.value })}
                    className={inputClass}>
                    {OPENAI_VOICES.map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>Voice</label>
                    {(['sarvam', 'groq_sarvam'].includes(editAgent?.voiceProvider || form.voiceProvider)) ? (
                      <select value={editAgent ? (SARVAM_VOICES.includes(editAgent.voiceId || '') ? editAgent.voiceId : 'priya') : form.voiceId}
                        onChange={e => editAgent ? setEditAgent({ ...editAgent, voiceId: e.target.value }) : setForm({ ...form, voiceId: e.target.value })}
                        className={inputClass}>
                        {SARVAM_VOICES.map(v => <option key={v} value={v}>{v}</option>)}
                      </select>
                    ) : (editAgent?.voiceProvider || form.voiceProvider) === 'elevenlabs' ? (
                      <select value={editAgent ? (editAgent.voiceId || 'rachel') : form.voiceId}
                        onChange={e => editAgent ? setEditAgent({ ...editAgent, voiceId: e.target.value }) : setForm({ ...form, voiceId: e.target.value })}
                        className={inputClass}>
                        {ELEVENLABS_VOICES.map(v => <option key={v} value={v}>{v}</option>)}
                      </select>
                    ) : (
                      <input type="text" value={editAgent ? (editAgent.voiceId || '') : form.voiceId}
                        onChange={e => editAgent ? setEditAgent({ ...editAgent, voiceId: e.target.value }) : setForm({ ...form, voiceId: e.target.value })}
                        className={inputClass} placeholder="Provider voice ID" />
                    )}
                  </div>
                  <div>
                    <label className={labelClass}>Voice Provider API Key <span className="text-[11px] text-admin-text-subdued">(Sarvam/ElevenLabs/Cartesia key)</span></label>
                    <input type="password" value={editAgent ? (editAgent.voiceApiKey || editAgent.voiceConfig?.apiKey || '') : form.voiceApiKey}
                      onChange={e => editAgent ? setEditAgent({ ...editAgent, voiceApiKey: e.target.value, voiceConfig: { ...editAgent.voiceConfig, apiKey: e.target.value } }) : setForm({ ...form, voiceApiKey: e.target.value })}
                      className={inputClass} placeholder="API key for selected voice provider" />
                  </div>
                </div>
              )}
              {(['groq_sarvam'].includes(editAgent?.voiceProvider || form.voiceProvider)) && (
                <div>
                  <label className={labelClass}>Groq API Key <span className="text-[11px] text-admin-text-subdued">(Free: console.groq.com)</span></label>
                  <input type="password" value={editAgent ? (editAgent.groqApiKey || '') : form.groqApiKey}
                    onChange={e => editAgent ? setEditAgent({ ...editAgent, groqApiKey: e.target.value }) : setForm({ ...form, groqApiKey: e.target.value })}
                    className={inputClass} placeholder="gsk_..." />
                </div>
              )}
              <div>
                <label className={labelClass}>System Prompt (Training)</label>
                <textarea value={editAgent?.systemPrompt || form.systemPrompt} onChange={e => editAgent ? setEditAgent({ ...editAgent, systemPrompt: e.target.value }) : setForm({ ...form, systemPrompt: e.target.value })}
                  className={`${inputClass} h-24 resize-y`} placeholder="Tell the AI how to behave on calls..." />
              </div>
              <div>
                <label className={labelClass}>Greeting Message</label>
                <input type="text" value={editAgent?.greeting || form.greeting} onChange={e => editAgent ? setEditAgent({ ...editAgent, greeting: e.target.value }) : setForm({ ...form, greeting: e.target.value })}
                  className={inputClass} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Max Duration (seconds)</label>
                  <input type="number" value={editAgent?.maxDuration || form.maxDuration} onChange={e => editAgent ? setEditAgent({ ...editAgent, maxDuration: parseInt(e.target.value) }) : setForm({ ...form, maxDuration: parseInt(e.target.value) })}
                    className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Transfer Number</label>
                  <input type="text" value={editAgent?.transferNumber || form.transferNumber} onChange={e => editAgent ? setEditAgent({ ...editAgent, transferNumber: e.target.value }) : setForm({ ...form, transferNumber: e.target.value })}
                    className={inputClass} placeholder="Fallback number for transfer" />
                </div>
              </div>
              <div>
                <label className={labelClass}>Catalog / Price List URL</label>
                <input type="text" value={editAgent ? (editAgent.catalogUrl || '') : form.catalogUrl} onChange={e => editAgent ? setEditAgent({ ...editAgent, catalogUrl: e.target.value }) : setForm({ ...form, catalogUrl: e.target.value })}
                  className={inputClass} placeholder="https://... (PDF/image) — AI sends this on WhatsApp when caller asks for catalog" />
              </div>
              <div>
                <label className={labelClass}>Follow-up Message (after call)</label>
                <textarea value={editAgent ? (editAgent.followUpMessage || '') : form.followUpMessage} onChange={e => editAgent ? setEditAgent({ ...editAgent, followUpMessage: e.target.value }) : setForm({ ...form, followUpMessage: e.target.value })}
                  className={`${inputClass} h-16 resize-y`} placeholder="Optional message sent on WhatsApp automatically after every AI call" />
              </div>
            </div>
            <div className="flex gap-2 border-t border-admin-border p-4">
              <button type="button" onClick={closeModal} className={`flex-1 ${secondaryBtn}`}>Cancel</button>
              <button type="button" onClick={editAgent ? handleUpdate : handleCreate} className={`flex-1 ${primaryBtn}`}>
                <Save className="h-4 w-4" /> {editAgent ? 'Update' : 'Create Agent'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
