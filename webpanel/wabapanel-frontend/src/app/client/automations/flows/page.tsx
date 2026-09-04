'use client';
import React, { useState, useEffect } from 'react';
import { Plus, Zap, Trash2, Edit, Play, Pause, Save, ArrowLeft, Clock, MessageSquare, GitBranch, Tag, Users, Send } from 'lucide-react';
import { automationApi } from '@/lib/api';
import toast from 'react-hot-toast';
import { adminContentColumnClass, dashboardCardShell } from '@/components/layout/dashboard-ui';

const primaryBtn = 'inline-flex items-center justify-center gap-1.5 rounded-lg bg-admin-text px-3 py-1.5 text-[13px] font-semibold text-white transition-colors hover:bg-[#1a1a1a] disabled:cursor-not-allowed disabled:opacity-50';
const secondaryBtn = 'inline-flex items-center justify-center gap-1.5 rounded-lg border border-admin-border bg-white px-3 py-1.5 text-[13px] font-medium text-admin-text transition-colors hover:bg-[#f6f6f7]';
const focusInput = 'w-full rounded-lg border border-admin-border bg-white px-3 py-2 text-[13px] text-admin-text placeholder:text-admin-text-subdued focus:outline-none focus:border-[#005bd3] focus:ring-2 focus:ring-[#005bd3]/30';

interface AutoStep {
  id: string;
  type: string;
  data: Record<string, string>;
}

interface Automation {
  _id: string;
  name: string;
  description: string;
  triggerType: string;
  triggerConfig: { keywords?: string[]; matchType?: string; event?: string; schedule?: string };
  nodes: Array<{ id: string; type: string; position: { x: number; y: number }; data: Record<string, string> }>;
  edges: Array<{ id: string; source: string; target: string }>;
  status: string;
  stats: { triggered: number; completed: number; failed: number };
  createdAt: string;
}

const stepTypes = [
  { type: 'message', label: 'Send Message', icon: MessageSquare, color: 'blue', desc: 'Send a text message' },
  { type: 'delay', label: 'Wait / Delay', icon: Clock, color: 'yellow', desc: 'Wait before next step' },
  { type: 'condition', label: 'Condition', icon: GitBranch, color: 'neutral', desc: 'Branch based on condition' },
  { type: 'tag', label: 'Add Tag', icon: Tag, color: 'emerald', desc: 'Add tag to contact' },
  { type: 'assign', label: 'Assign Agent', icon: Users, color: 'orange', desc: 'Assign to team member' },
  { type: 'template', label: 'Send Template', icon: Send, color: 'teal', desc: 'Send WhatsApp template' },
];

const genId = () => `step_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

export default function AutomationsPage() {
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBuilder, setShowBuilder] = useState(false);
  const [editAuto, setEditAuto] = useState<Automation | null>(null);
  const [form, setForm] = useState({
    name: '', description: '', triggerType: 'keyword',
    keywords: '', matchType: 'contains', event: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [steps, setSteps] = useState<AutoStep[]>([]);

  const fetchAutomations = async () => {
    try { const res = await automationApi.list(); setAutomations(res.data.data || []); } catch { /* empty */ }
    setLoading(false);
  };

  useEffect(() => { fetchAutomations(); }, []);

  const openBuilder = (auto?: Automation) => {
    if (auto) {
      setEditAuto(auto);
      setForm({
        name: auto.name, description: auto.description || '',
        triggerType: auto.triggerType || 'keyword',
        keywords: (auto.triggerConfig?.keywords || []).join(', '),
        matchType: auto.triggerConfig?.matchType || 'contains',
        event: auto.triggerConfig?.event || '',
      });
      const autoSteps = (auto.nodes || [])
        .filter(n => n.type !== 'trigger')
        .map(n => ({ id: n.id, type: n.type, data: n.data || {} }));
      setSteps(autoSteps.length > 0 ? autoSteps : []);
    } else {
      setEditAuto(null);
      setForm({ name: '', description: '', triggerType: 'keyword', keywords: '', matchType: 'contains', event: '' });
      setSteps([]);
    }
    setShowBuilder(true);
  };

  const addStep = (type: string) => {
    const defaultData: Record<string, string> = {};
    if (type === 'message') defaultData.message = '';
    if (type === 'delay') { defaultData.delay = '5'; defaultData.unit = 'minutes'; }
    if (type === 'condition') defaultData.condition = '';
    if (type === 'tag') defaultData.tag = '';
    if (type === 'assign') defaultData.agent = '';
    if (type === 'template') defaultData.template = '';
    setSteps([...steps, { id: genId(), type, data: defaultData }]);
  };

  const updateStep = (idx: number, data: Record<string, string>) => {
    const newSteps = [...steps];
    newSteps[idx] = { ...newSteps[idx], data: { ...newSteps[idx].data, ...data } };
    setSteps(newSteps);
  };

  const removeStep = (idx: number) => {
    setSteps(steps.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    if (submitting) return;
    if (!form.name.trim()) { toast.error('Automation name is required'); return; }
    if (form.triggerType === 'keyword' && !form.keywords.trim()) { toast.error('Keywords are required'); return; }

    const triggerNode = {
      id: 'trigger_1', type: 'trigger',
      position: { x: 250, y: 50 },
      data: { label: 'Trigger', keywords: form.keywords.split(',').map(k => k.trim()).filter(Boolean) },
    };

    const actionNodes = steps.map((s, i) => ({
      id: s.id, type: s.type,
      position: { x: 250, y: 180 + i * 120 },
      data: s.data,
    }));

    const allNodes = [triggerNode, ...actionNodes];
    const allEdges = allNodes.slice(0, -1).map((n, i) => ({
      id: `edge_${i}`, source: n.id, target: allNodes[i + 1].id,
      type: 'smoothstep',
    }));

    const payload = {
      name: form.name, description: form.description,
      triggerType: form.triggerType,
      triggerConfig: {
        keywords: form.keywords.split(',').map(k => k.trim()).filter(Boolean),
        matchType: form.matchType,
        event: form.event,
      },
      nodes: allNodes, edges: allEdges,
    };

    setSubmitting(true);
    try {
      if (editAuto) {
        await automationApi.update(editAuto._id, payload);
        toast.success('Automation updated');
      } else {
        await automationApi.create(payload);
        toast.success('Automation created');
      }
      setShowBuilder(false);
      fetchAutomations();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to save');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (id: string) => {
    if (submitting) return;
    setSubmitting(true);

    try { await automationApi.toggle(id); toast.success('Status toggled'); fetchAutomations(); }
    catch { toast.error('Failed'); } finally { setSubmitting(false); }
  };

  const handleDelete = async (id: string) => {
    if (submitting) return;
    if (!confirm('Delete this automation?')) return;
    setSubmitting(true);
    try { await automationApi.delete(id); toast.success('Deleted'); fetchAutomations(); }
    catch { toast.error('Failed'); } finally { setSubmitting(false); }
  };

  const renderStepInput = (step: AutoStep, idx: number) => {
    switch (step.type) {
      case 'message':
        return (
          <textarea value={step.data.message || ''} onChange={(e) => updateStep(idx, { message: e.target.value })}
            placeholder="Type the message to send..." rows={2}
            className={`${focusInput} resize-none`} />
        );
      case 'delay':
        return (
          <div className="flex gap-2">
            <input type="number" value={step.data.delay || '5'} onChange={(e) => updateStep(idx, { delay: e.target.value })}
              className="w-24 rounded-lg border border-admin-border bg-white px-3 py-2 text-[13px] text-admin-text focus:outline-none focus:border-[#005bd3] focus:ring-2 focus:ring-[#005bd3]/30" min="1" />
            <select value={step.data.unit || 'minutes'} onChange={(e) => updateStep(idx, { unit: e.target.value })}
              className="rounded-lg border border-admin-border bg-white px-3 py-2 text-[13px] text-admin-text focus:outline-none focus:border-[#005bd3] focus:ring-2 focus:ring-[#005bd3]/30">
              <option value="seconds">Seconds</option>
              <option value="minutes">Minutes</option>
              <option value="hours">Hours</option>
              <option value="days">Days</option>
            </select>
          </div>
        );
      case 'condition':
        return (
          <input type="text" value={step.data.condition || ''} onChange={(e) => updateStep(idx, { condition: e.target.value })}
            placeholder="e.g., contact.tag == 'VIP'" className={focusInput} />
        );
      case 'tag':
        return (
          <input type="text" value={step.data.tag || ''} onChange={(e) => updateStep(idx, { tag: e.target.value })}
            placeholder="Tag name to add" className={focusInput} />
        );
      case 'assign':
        return (
          <input type="text" value={step.data.agent || ''} onChange={(e) => updateStep(idx, { agent: e.target.value })}
            placeholder="Agent name or email" className={focusInput} />
        );
      case 'template':
        return (
          <input type="text" value={step.data.template || ''} onChange={(e) => updateStep(idx, { template: e.target.value })}
            placeholder="Template name" className={focusInput} />
        );
      default:
        return null;
    }
  };

  // Builder view
  if (showBuilder) {
    return (
      <div className={`${adminContentColumnClass} space-y-4`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <button type="button" onClick={() => setShowBuilder(false)} className="rounded-lg p-2 text-admin-text hover:bg-[#f6f6f7]">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-[20px] font-semibold tracking-tight text-admin-text">
              {editAuto ? 'Edit Automation' : 'Create Automation'}
            </h1>
          </div>
          <button type="button" onClick={handleSave} disabled={submitting} className={primaryBtn}>
            <Save className="h-4 w-4" /> {submitting ? 'Saving…' : 'Save Automation'}
          </button>
        </div>

        {/* Automation Settings */}
        <div className={`${dashboardCardShell} !p-5 space-y-4`}>
          <h2 className="text-[13px] font-semibold text-admin-text">Automation Details</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-[12px] font-medium text-admin-text-secondary">Name *</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={focusInput} placeholder="Welcome Message Flow" />
            </div>
            <div>
              <label className="mb-1 block text-[12px] font-medium text-admin-text-secondary">Trigger Type</label>
              <select value={form.triggerType} onChange={(e) => setForm({ ...form, triggerType: e.target.value })}
                className={focusInput}>
                <option value="keyword">Keyword</option>
                <option value="event">Event</option>
                <option value="contact_created">Contact Created</option>
                <option value="message_received">Message Received</option>
                <option value="schedule">Schedule</option>
                <option value="webhook">Webhook</option>
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-[12px] font-medium text-admin-text-secondary">Description</label>
            <input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              className={focusInput} placeholder="Optional description" />
          </div>
          {form.triggerType === 'keyword' && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-[12px] font-medium text-admin-text-secondary">Keywords * (comma separated)</label>
                <input type="text" value={form.keywords} onChange={(e) => setForm({ ...form, keywords: e.target.value })}
                  className={focusInput} placeholder="hello, hi, start, help" />
              </div>
              <div>
                <label className="mb-1 block text-[12px] font-medium text-admin-text-secondary">Match Type</label>
                <select value={form.matchType} onChange={(e) => setForm({ ...form, matchType: e.target.value })}
                  className={focusInput}>
                  <option value="contains">Contains</option>
                  <option value="exact">Exact Match</option>
                  <option value="starts_with">Starts With</option>
                </select>
              </div>
            </div>
          )}
          {form.triggerType === 'event' && (
            <div>
              <label className="mb-1 block text-[12px] font-medium text-admin-text-secondary">Event Name</label>
              <input type="text" value={form.event} onChange={(e) => setForm({ ...form, event: e.target.value })}
                className={focusInput} placeholder="contact_created, payment_received, etc." />
            </div>
          )}
        </div>

        {/* Trigger display */}
        <div className="flex flex-col items-center">
          <div className="w-64 rounded-xl bg-admin-text px-6 py-3 text-center text-white shadow-sm">
            <div className="mb-1 flex items-center justify-center gap-2">
              <Zap className="h-4 w-4" />
              <span className="text-[11px] font-semibold uppercase tracking-wide">Trigger</span>
            </div>
            <p className="text-[13px] font-medium">{form.triggerType === 'keyword' ? `Keywords: ${form.keywords || '(none)'}` : form.triggerType}</p>
          </div>
          {steps.length > 0 && <div className="h-8 w-0.5 bg-admin-border" />}
        </div>

        {/* Steps */}
        {steps.map((step, idx) => {
          const stepDef = stepTypes.find(s => s.type === step.type);
          const Icon = stepDef?.icon || MessageSquare;
          const colorMap: Record<string, string> = {
            blue: 'border-blue-300 bg-blue-50/60',
            yellow: 'border-amber-300 bg-amber-50/60',
            neutral: 'border-admin-border bg-[#f6f6f7]',
            emerald: 'border-emerald-300 bg-emerald-50/60',
            orange: 'border-orange-300 bg-orange-50/60',
            teal: 'border-teal-300 bg-teal-50/60',
          };
          return (
            <div key={step.id} className="flex flex-col items-center">
              <div className={`w-full max-w-lg rounded-xl border p-4 shadow-sm ${colorMap[stepDef?.color || 'blue'] || 'border-admin-border bg-[#f6f6f7]'}`}>
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-admin-text-secondary" />
                    <span className="text-[13px] font-semibold text-admin-text">{stepDef?.label || step.type}</span>
                    <span className="text-[12px] text-admin-text-subdued">Step {idx + 1}</span>
                  </div>
                  <button type="button" onClick={() => removeStep(idx)} className="rounded-lg p-1 text-red-500 hover:bg-red-50">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                {renderStepInput(step, idx)}
              </div>
              {idx < steps.length - 1 && <div className="h-8 w-0.5 bg-admin-border" />}
            </div>
          );
        })}

        {/* Add Step */}
        <div className="flex flex-col items-center">
          {steps.length > 0 && <div className="mb-2 h-8 w-0.5 bg-admin-border" />}
          <div className="w-full max-w-lg rounded-xl border border-dashed border-admin-border bg-white p-4">
            <p className="mb-3 text-center text-[13px] font-semibold text-admin-text-secondary">Add Step</p>
            <div className="grid grid-cols-3 gap-2">
              {stepTypes.map(({ type, label, icon: SIcon }) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => addStep(type)}
                  className="flex flex-col items-center gap-1 rounded-lg border border-admin-border p-3 text-center transition-colors hover:bg-[#f6f6f7]"
                >
                  <SIcon className="h-5 w-5 text-admin-text-secondary" />
                  <span className="text-[12px] font-medium text-admin-text">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // List view
  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const allSelected = automations.length > 0 && selectedIds.length === automations.length;
  const toggleSelectAll = () => setSelectedIds(allSelected ? [] : automations.map(a => a._id));

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm('Delete ' + selectedIds.length + ' selected items?')) return;
    if (submitting) return;
    setSubmitting(true);
    try {
      await Promise.all(selectedIds.map(id => automationApi.delete(id)));
      toast.success(selectedIds.length + ' items deleted');
      setSelectedIds([]);
      fetchAutomations();
    } catch { toast.error('Failed to delete some items'); } finally { setSubmitting(false); }
  };

  return (
    <div className={`${adminContentColumnClass} space-y-4`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 shrink-0 text-admin-text-secondary" aria-hidden />
            <h1 className="text-[20px] font-semibold tracking-tight text-admin-text">Automations</h1>
          </div>
          <p className="mt-1 text-[13px] text-admin-text-secondary">
            Build automated workflows triggered by keywords, events, or schedules
          </p>
        </div>
        <button type="button" onClick={() => openBuilder()} className={primaryBtn}>
          <Plus className="h-4 w-4" /> New Automation
        </button>
      </div>

      {!loading && automations.length > 0 && (
        <div className={`flex items-center justify-between rounded-lg border px-4 py-2.5 ${selectedIds.length ? 'border-red-200 bg-red-50' : 'border-admin-border bg-white'}`}>
          <label className="flex cursor-pointer items-center gap-2 text-[13px] font-medium text-admin-text">
            <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} className="h-4 w-4 cursor-pointer accent-red-500" />
            Select all{selectedIds.length > 0 && <span className="text-red-700"> · {selectedIds.length} selected</span>}
          </label>
          {selectedIds.length > 0 && (
            <div className="flex gap-2">
              <button type="button" onClick={() => setSelectedIds([])} className={secondaryBtn}>Clear</button>
              <button type="button" onClick={handleBulkDelete} disabled={submitting} className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-[13px] font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50">
                Delete selected
              </button>
            </div>
          )}
        </div>
      )}

      {loading ? (
        <p className="py-16 text-center text-[13px] text-admin-text-subdued">Loading…</p>
      ) : automations.length === 0 ? (
        <div className={`${dashboardCardShell} py-12 text-center`}>
          <Zap className="mx-auto mb-4 h-12 w-12 text-admin-text-subdued" />
          <h3 className="text-[15px] font-medium text-admin-text-secondary">No automations yet</h3>
          <p className="mt-1 text-[13px] text-admin-text-subdued">Create keyword-triggered flows to auto-respond</p>
          <button type="button" onClick={() => openBuilder()} className={`${primaryBtn} mt-4`}>
            <Plus className="h-4 w-4" /> Create Automation
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {automations.map((auto) => (
            <div key={auto._id} className={dashboardCardShell}>
              <div className="mb-3 flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(auto._id)}
                  onChange={() => toggleSelect(auto._id)}
                  className="mt-1 h-4 w-4 flex-shrink-0 cursor-pointer rounded border-admin-border"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-[13px] font-semibold text-admin-text">{auto.name}</h3>
                      <p className="mt-0.5 text-[12px] text-admin-text-secondary">{auto.description || `Trigger: ${auto.triggerType}`}</p>
                    </div>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                      auto.status === 'active'
                        ? 'bg-[#cdfee1] text-[#0d6b38]'
                        : auto.status === 'draft'
                          ? 'bg-[#e0f0ff] text-[#005bd3]'
                          : 'bg-[#f1f1f1] text-admin-text-secondary'
                    }`}>
                      {auto.status}
                    </span>
                  </div>
                </div>
              </div>
              {auto.triggerConfig?.keywords && auto.triggerConfig.keywords.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-1">
                  {auto.triggerConfig.keywords.map((kw: string, i: number) => (
                    <span key={i} className="rounded bg-[#f1f1f1] px-2 py-0.5 text-[11px] text-admin-text-secondary">{kw}</span>
                  ))}
                </div>
              )}
              <div className="mb-3 flex items-center gap-4 text-[12px] text-admin-text-subdued">
                <span>Triggered: {auto.stats?.triggered || 0}</span>
                <span>Completed: {auto.stats?.completed || 0}</span>
                <span>{Math.max(0, (auto.nodes || []).length - 1)} steps</span>
              </div>
              <div className="flex gap-2 border-t border-admin-border pt-2">
                <button type="button" onClick={() => handleToggle(auto._id)} className="rounded-lg p-1.5 hover:bg-[#f6f6f7]" title={auto.status === 'active' ? 'Pause' : 'Activate'}>
                  {auto.status === 'active' ? <Pause className="h-4 w-4 text-amber-500" /> : <Play className="h-4 w-4 text-admin-text-secondary" />}
                </button>
                <button type="button" onClick={() => openBuilder(auto)} className="rounded-lg p-1.5 hover:bg-[#f6f6f7]">
                  <Edit className="h-4 w-4 text-admin-text-secondary" />
                </button>
                <button type="button" onClick={() => handleDelete(auto._id)} className="rounded-lg p-1.5 hover:bg-red-50">
                  <Trash2 className="h-4 w-4 text-red-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
