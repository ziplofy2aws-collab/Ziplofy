'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Edit, Trash2, Workflow, BarChart3, Sparkles, LayoutTemplate } from 'lucide-react';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import Table from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import Select from '@/components/ui/Select';
import { botFlowApi } from '@/lib/api';
import toast from 'react-hot-toast';
import { adminContentColumnClass } from '@/components/layout/dashboard-ui';

const primaryBtn =
  'inline-flex items-center justify-center gap-1.5 rounded-lg bg-admin-text px-3 py-1.5 text-[13px] font-semibold text-white transition-colors hover:bg-[#1a1a1a] disabled:cursor-not-allowed disabled:opacity-50';
const secondaryBtn =
  'inline-flex items-center justify-center gap-1.5 rounded-lg border border-admin-border bg-white px-3 py-1.5 text-[13px] font-medium text-admin-text transition-colors hover:bg-[#f6f6f7]';
const inputClass =
  'w-full rounded-lg border border-admin-border bg-white px-3 py-2 text-[13px] text-admin-text placeholder:text-admin-text-subdued focus:border-[#005bd3] focus:outline-none focus:ring-1 focus:ring-[#005bd3]/30';
const labelClass = 'mb-1 block text-[12px] font-medium text-admin-text-secondary';

interface FlowNode { id: string; name?: string; type?: string; text?: string }
interface BotFlow {
  _id: string; name: string; triggerKeywords: string[]; matchType: string;
  isActive: boolean; nodes: FlowNode[]; updatedAt: string; runs?: number;
  nodeHits?: Record<string, number>; startNode?: string; eventTrigger?: string;
}

export default function BotFlowsPage() {
  const router = useRouter();
  const [flows, setFlows] = useState<BotFlow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', keywords: '', matchType: 'exact', eventTrigger: '' });
  const [statsFlow, setStatsFlow] = useState<BotFlow | null>(null);
  const [showPreset, setShowPreset] = useState(false);
  const [importing, setImporting] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiForm, setAiForm] = useState({ name: '', business: '', goal: '' });
  const [generating, setGenerating] = useState(false);

  const load = () => {
    botFlowApi.list().then(r => setFlows(r.data.data || [])).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    if (!form.name) { toast.error('Name is required'); return; }
    const payload = {
      name: form.name,
      triggerKeywords: form.keywords.split(',').map(k => k.trim()).filter(Boolean),
      matchType: form.matchType,
      eventTrigger: form.eventTrigger,
    };
    try {
      if (editId) {
        await botFlowApi.update(editId, payload);
        toast.success('Flow updated');
      } else {
        const res = await botFlowApi.create(payload);
        toast.success('Flow created — opening builder');
        router.push(`/client/bot-flows/${res.data.data._id}`);
        return;
      }
      setShowModal(false); load();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(e.response?.data?.message || 'Failed');
    }
  };

  const toggleActive = async (f: BotFlow) => {
    try {
      await botFlowApi.update(f._id, { isActive: !f.isActive });
      setFlows(prev => prev.map(x => x._id === f._id ? { ...x, isActive: !f.isActive } : x));
    } catch { toast.error('Failed'); }
  };

  const handleGenerate = async () => {
    if (!aiForm.business.trim() || !aiForm.goal.trim()) { toast.error('Business details and flow goal are required'); return; }
    setGenerating(true);
    try {
      const res = await botFlowApi.generate(aiForm);
      toast.success('Flow generated — opening builder');
      router.push(`/client/bot-flows/${res.data.data._id}`);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(e.response?.data?.message || 'AI generation failed');
    }
    setGenerating(false);
  };

  const importPreset = async (preset: string) => {
    setImporting(true);
    try {
      const res = await botFlowApi.preset(preset);
      toast.success('Preset imported — review it, then turn it Active');
      router.push(`/client/bot-flows/${res.data.data._id}`);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(e.response?.data?.message || 'Failed to import preset');
      setImporting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this bot flow?')) return;
    try { await botFlowApi.delete(id); toast.success('Deleted'); load(); } catch { toast.error('Failed'); }
  };

  const columns = [
    { key: 'name', title: 'Title', render: (f: BotFlow) => <span className="text-[13px] font-medium text-admin-text">{f.name}</span> },
    { key: 'trigger', title: 'Start Trigger Keywords', render: (f: BotFlow) => (
      <div className="flex flex-wrap gap-1">
        {(f.triggerKeywords || []).length ? f.triggerKeywords.map((k, i) => <Badge key={i} variant="info">{k}</Badge>) : <span className="text-[12px] text-admin-text-subdued">—</span>}
      </div>
    )},
    { key: 'steps', title: 'Replies', render: (f: BotFlow) => <span className="text-admin-text-secondary">{(f.nodes || []).length}</span> },
    { key: 'runs', title: 'Runs', render: (f: BotFlow) => <span className="text-[13px] font-semibold text-admin-text">{f.runs || 0}</span> },
    { key: 'status', title: 'Status', render: (f: BotFlow) => (
      <button type="button" onClick={() => toggleActive(f)}>
        {f.isActive ? (
          <span className="inline-flex rounded-full bg-[#cdfee1] px-2 py-0.5 text-[12px] font-medium text-[#0d6b38]">Active</span>
        ) : (
          <Badge variant="default">Inactive</Badge>
        )}
      </button>
    )},
    { key: 'actions', title: 'Action', render: (f: BotFlow) => (
      <div className="flex gap-1">
        <button type="button" className={secondaryBtn} onClick={() => router.push(`/client/bot-flows/${f._id}`)}>
          <Workflow className="h-3.5 w-3.5" /> Flow Builder
        </button>
        <button type="button" onClick={() => setStatsFlow(f)} className="rounded-lg p-1.5 text-admin-text-subdued hover:bg-[#f6f6f7] hover:text-admin-text" title="Analytics — see where customers drop off">
          <BarChart3 className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => { setEditId(f._id); setForm({ name: f.name, keywords: (f.triggerKeywords || []).join(', '), matchType: f.matchType || 'exact', eventTrigger: f.eventTrigger || '' }); setShowModal(true); }}
          className="rounded-lg p-1.5 text-admin-text-subdued hover:bg-[#f6f6f7] hover:text-admin-text"
          title="Edit"
        >
          <Edit className="h-4 w-4" />
        </button>
        <button type="button" onClick={() => handleDelete(f._id)} className="rounded-lg p-1.5 text-admin-text-subdued hover:bg-red-50 hover:text-red-600" title="Delete">
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
            <Workflow className="h-5 w-5 shrink-0 text-admin-text-secondary" aria-hidden />
            <h1 className="text-[20px] font-semibold tracking-tight text-admin-text">Bot Flows</h1>
          </div>
          <p className="mt-1 text-[13px] text-admin-text-secondary">
            Build multi-step chatbot conversations triggered by keywords — with buttons, lists, media and templates
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className={secondaryBtn} onClick={() => setShowPreset(true)}>
            <LayoutTemplate className="h-4 w-4" /> Ready-made Templates
          </button>
          <button type="button" className={secondaryBtn} onClick={() => setShowAiModal(true)}>
            <Sparkles className="h-4 w-4" /> Generate with AI
          </button>
          <button
            type="button"
            className={primaryBtn}
            onClick={() => { setEditId(null); setForm({ name: '', keywords: '', matchType: 'exact', eventTrigger: '' }); setShowModal(true); }}
          >
            <Plus className="h-4 w-4" /> Add New Bot Flow
          </button>
        </div>
      </div>

      <Table columns={columns} data={flows} loading={loading} emptyText="No bot flows yet — create one to get started" onBulkDelete={async (ids) => { await Promise.all(ids.map((id) => botFlowApi.delete(id).catch(() => null))); load(); }} />

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editId ? 'Edit Bot Flow' : 'Add New Bot Flow'}>
        <div className="space-y-4">
          <Input label="Title" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Welcome flow" required />
          <Input label="Start Trigger Keywords (comma separated)" value={form.keywords} onChange={e => setForm({ ...form, keywords: e.target.value })} placeholder="hello, hi, menu" />
          <Select label="Keyword Match" value={form.matchType} onChange={e => setForm({ ...form, matchType: e.target.value })}
            options={[{ value: 'exact', label: 'Exact match' }, { value: 'contains', label: 'Message contains keyword' }]} />
          <Select label="Auto-start on event (optional)" value={form.eventTrigger} onChange={e => setForm({ ...form, eventTrigger: e.target.value })}
            options={[{ value: '', label: 'None (keyword only)' }, { value: 'new_lead', label: 'New lead created' }, { value: 'dnp', label: 'Call marked Did-Not-Pick / no answer' }]} />
          <p className="text-[12px] text-admin-text-secondary">When a customer sends a matching message, the flow starts automatically (skipped when Chat AI is ON for that conversation). An event trigger also starts it automatically — e.g. after a call is logged as &quot;Did Not Pick&quot;.</p>
          <div className="flex justify-end gap-2">
            <button type="button" className={secondaryBtn} onClick={() => setShowModal(false)}>Cancel</button>
            <button type="button" className={primaryBtn} onClick={handleSave}>{editId ? 'Save' : 'Create & Open Builder'}</button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showPreset} onClose={() => !importing && setShowPreset(false)} title="Ready-made Flow Templates" size="lg">
        <div className="space-y-3">
          <p className="text-[13px] text-admin-text-secondary">Import a fully-built flow and edit it in the builder. Imported as <b>Inactive</b> — review the messages, then turn it Active.</p>
          <div className="rounded-lg border border-admin-border p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold text-admin-text">Lead Nurturing</h3>
                <p className="mt-1 text-[13px] text-admin-text-secondary">Greets a new lead, asks what they need, and sends day-wise bump-up reminders (Day 1 / 2 / 3) if they don&apos;t reply — then tags cold leads. Auto-starts on new lead.</p>
              </div>
              <button type="button" className={primaryBtn} disabled={importing} onClick={() => importPreset('lead_nurturing')}>Import</button>
            </div>
          </div>
          <div className="rounded-lg border border-admin-border p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold text-admin-text">DNP Recovery</h3>
                <p className="mt-1 text-[13px] text-admin-text-secondary">Auto-starts when a call is logged as &quot;Did Not Pick&quot; / no answer. Sends a missed-call message, asks for a good time, and follows up over the next days before tagging the lead as lost.</p>
              </div>
              <button type="button" className={primaryBtn} disabled={importing} onClick={() => importPreset('dnp_recovery')}>Import</button>
            </div>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showAiModal} onClose={() => !generating && setShowAiModal(false)} title="Generate Bot Flow with AI" size="lg">
        <div className="space-y-4">
          <p className="text-[13px] text-admin-text-secondary">Describe your business and what the flow should do — AI (using your API key from AI Settings) will build the complete flow with menus, buttons and messages. You can edit everything in the builder afterwards.</p>
          <Input label="Flow name (optional)" value={aiForm.name} onChange={e => setAiForm({ ...aiForm, name: e.target.value })} placeholder="e.g. Customer support flow" />
          <div>
            <label className={labelClass}>Your business details <span className="text-red-500">*</span></label>
            <textarea
              value={aiForm.business}
              onChange={e => setAiForm({ ...aiForm, business: e.target.value })}
              rows={5}
              placeholder="e.g. Codiic Panel — WhatsApp Business Platform for inbox, AI chatbot, broadcasts and CRM. Support hours 10am-7pm. Features: AI chatbot, broadcasts, CRM..."
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>What should the flow do? <span className="text-red-500">*</span></label>
            <textarea
              value={aiForm.goal}
              onChange={e => setAiForm({ ...aiForm, goal: e.target.value })}
              rows={3}
              placeholder="e.g. Greet the customer, show a menu (pricing / demo / talk to human), answer questions and collect their name & email"
              className={inputClass}
            />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" className={secondaryBtn} onClick={() => setShowAiModal(false)} disabled={generating}>Cancel</button>
            <button type="button" className={primaryBtn} onClick={handleGenerate} disabled={generating}>
              <Sparkles className="h-4 w-4" />
              {generating ? 'Generating…' : 'Generate Flow'}
            </button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={!!statsFlow} onClose={() => setStatsFlow(null)} title={`Flow Analytics — ${statsFlow?.name || ''}`} size="lg">
        {statsFlow && (() => {
          const hits = statsFlow.nodeHits || {};
          const runs = statsFlow.runs || 0;
          const nodes = statsFlow.nodes || [];
          return (
            <div className="space-y-4">
              <p className="text-[13px] text-admin-text-secondary">This flow started <b>{runs}</b> {runs === 1 ? 'time' : 'times'}. The bars below show how many customers reached each step — a big drop between steps means customers are abandoning the flow there.</p>
              {nodes.length === 0 ? (
                <p className="text-[13px] text-admin-text-subdued">This flow has no steps yet.</p>
              ) : (
                <div className="space-y-2">
                  {nodes.map((n, i) => {
                    const count = hits[n.id] || 0;
                    const pct = runs > 0 ? Math.round((count / runs) * 100) : 0;
                    const prevCount = i === 0 ? runs : (hits[nodes[i - 1].id] || 0);
                    const dropOff = prevCount > 0 ? Math.max(0, Math.round(((prevCount - count) / prevCount) * 100)) : 0;
                    return (
                      <div key={n.id} className="rounded-lg border border-admin-border p-3">
                        <div className="mb-1 flex items-center justify-between text-[13px]">
                          <span className="font-medium text-admin-text">Step {i + 1}: {n.name || n.text?.slice(0, 40) || n.type || n.id}</span>
                          <span className="text-admin-text-secondary">{count} reached ({pct}%)</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-[#f6f6f7]">
                          <div className="h-full rounded-full bg-admin-text" style={{ width: `${Math.min(100, pct)}%` }} />
                        </div>
                        {i > 0 && dropOff > 0 && <p className="mt-1 text-[12px] text-red-500">{dropOff}% dropped off before this step</p>}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })()}
      </Modal>
    </div>
  );
}
