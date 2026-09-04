'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, GripHorizontal, Pencil, Kanban } from 'lucide-react';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import { pipelineApi } from '@/lib/api';
import type { Pipeline, Deal } from '@/types';
import toast from 'react-hot-toast';

const primaryBtn =
  'inline-flex items-center gap-1.5 rounded-lg bg-admin-text px-3 py-1.5 text-[13px] font-semibold text-white transition-colors hover:bg-[#1a1a1a] disabled:opacity-50';
const secondaryBtn =
  'inline-flex items-center gap-1.5 rounded-lg border border-admin-border bg-white px-3 py-1.5 text-[13px] font-medium text-admin-text transition-colors hover:bg-[#f6f6f7] disabled:opacity-50';
const dangerBtn =
  'inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-[13px] font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50';
const fieldClass =
  'w-full rounded-lg border border-admin-border bg-white px-3 py-2 text-[13px] text-admin-text focus:outline-none focus:ring-2 focus:ring-[#005bd3]/30';

const dealContactName = (d: Deal) =>
  d.contactName || (typeof d.contact === 'object' && d.contact ? d.contact.name : '') || '';
const dealContactPhone = (d: Deal) =>
  d.contactPhone || (typeof d.contact === 'object' && d.contact ? (d.contact.phone || '') : '') || '';

export default function PipelinesPage() {
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [selectedPipeline, setSelectedPipeline] = useState<Pipeline | null>(null);
  const [deals, setDeals] = useState<Record<string, Deal[]>>({});
  const [loading, setLoading] = useState(true);
  const [showPipelineModal, setShowPipelineModal] = useState(false);
  const [showDealModal, setShowDealModal] = useState(false);
  const [pipelineForm, setPipelineForm] = useState({ name: '', stages: ['Lead', 'Qualified', 'Proposal', 'Won', 'Lost'] });
  const [dealForm, setDealForm] = useState({ title: '', value: '', stage: '', contactName: '', contactPhone: '' });
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
  const [newStage, setNewStage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [dragDealId, setDragDealId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);
  const [selectedDeals, setSelectedDeals] = useState<Set<string>>(new Set());

  const groupDeals = useCallback((pipeline: Pipeline, allDeals: Deal[]) => {
    const grouped: Record<string, Deal[]> = {};
    (pipeline.stages || []).forEach(s => { grouped[s.name] = []; });
    allDeals.forEach((d: Deal) => { if (grouped[d.stage]) grouped[d.stage].push(d); else grouped[d.stage] = [d]; });
    return grouped;
  }, []);

  const loadDeals = useCallback((pipeline: Pipeline) => {
    return pipelineApi.get(pipeline._id).then(r => {
      const pd = r.data.data;
      const allDeals: Deal[] = Array.isArray(pd) ? pd : (pd?.deals || []);
      setDeals(groupDeals(pipeline, allDeals));
    }).catch(() => {});
  }, [groupDeals]);

  useEffect(() => {
    pipelineApi.list().then(r => {
      const pipes = r.data.data || [];
      setPipelines(pipes);
      if (pipes.length > 0) setSelectedPipeline(pipes[0]);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (selectedPipeline) loadDeals(selectedPipeline);
    setSelectedDeals(new Set());
  }, [selectedPipeline, loadDeals]);

  const toggleSelectDeal = (dealId: string) => {
    setSelectedDeals(cur => {
      const next = new Set(cur);
      if (next.has(dealId)) next.delete(dealId); else next.add(dealId);
      return next;
    });
  };

  const allDealIds = Object.values(deals).flat().map(d => d._id);
  const allSelected = allDealIds.length > 0 && selectedDeals.size === allDealIds.length;
  const toggleSelectAll = () => {
    setSelectedDeals(allSelected ? new Set() : new Set(allDealIds));
  };

  const handleBulkDelete = async () => {
    if (submitting || !selectedPipeline || selectedDeals.size === 0) return;
    if (!confirm(`Delete ${selectedDeals.size} selected deal(s)? This cannot be undone.`)) return;
    setSubmitting(true);
    const ids = Array.from(selectedDeals);
    let failed = 0;
    for (const id of ids) {
      try { await pipelineApi.deleteDeal(selectedPipeline._id, id); }
      catch { failed++; }
    }
    if (failed) toast.error(`${failed} deal(s) could not be deleted`);
    else toast.success(`${ids.length} deal(s) deleted`);
    setSelectedDeals(new Set());
    await loadDeals(selectedPipeline);
    setSubmitting(false);
  };

  const handleCreatePipeline = async () => {
    if (submitting) return;
    if (!pipelineForm.name.trim()) { toast.error('Pipeline name required'); return; }
    setSubmitting(true);
    try {
      const stages = pipelineForm.stages.map((s, i) => ({
        id: s.toLowerCase().replace(/[^a-z0-9]/g, '_'),
        name: s,
        color: ['#3B82F6', '#F59E0B', '#8B5CF6', '#EC4899', '#10B981', '#EF4444'][i % 6],
        order: i,
      }));
      await pipelineApi.create({ name: pipelineForm.name, stages });
      toast.success('Pipeline created');
      setShowPipelineModal(false);
      setPipelineForm({ name: '', stages: ['Lead', 'Qualified', 'Proposal', 'Won', 'Lost'] });
      pipelineApi.list().then(r => { const pipes = r.data.data || []; setPipelines(pipes); if (pipes.length) setSelectedPipeline(pipes[pipes.length - 1]); });
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed');
    } finally {
      setSubmitting(false);
    }
  };

  const openNewDeal = () => {
    if (!selectedPipeline) return;
    setEditingDeal(null);
    setDealForm({ title: '', value: '', stage: selectedPipeline.stages?.[0]?.name || 'Lead', contactName: '', contactPhone: '' });
    setShowDealModal(true);
  };

  const openEditDeal = (deal: Deal) => {
    setEditingDeal(deal);
    setDealForm({
      title: deal.title || '',
      value: String(deal.value ?? ''),
      stage: deal.stage,
      contactName: dealContactName(deal),
      contactPhone: dealContactPhone(deal),
    });
    setShowDealModal(true);
  };

  const handleSaveDeal = async () => {
    if (submitting || !selectedPipeline) return;
    if (!dealForm.title.trim()) { toast.error('Deal title required'); return; }
    setSubmitting(true);
    try {
      const payload = { ...dealForm, value: parseFloat(dealForm.value) || 0 };
      if (editingDeal) {
        await pipelineApi.updateDeal(selectedPipeline._id, editingDeal._id, payload);
        toast.success('Deal updated');
      } else {
        await pipelineApi.addDeal(selectedPipeline._id, payload);
        toast.success('Deal created');
      }
      setShowDealModal(false);
      setEditingDeal(null);
      await loadDeals(selectedPipeline);
    } catch { toast.error('Failed'); } finally { setSubmitting(false); }
  };

  const handleDeleteDeal = async () => {
    if (submitting || !selectedPipeline || !editingDeal) return;
    if (!confirm(`Delete deal "${editingDeal.title}"?`)) return;
    setSubmitting(true);
    try {
      await pipelineApi.deleteDeal(selectedPipeline._id, editingDeal._id);
      toast.success('Deal deleted');
      setShowDealModal(false);
      setEditingDeal(null);
      await loadDeals(selectedPipeline);
    } catch { toast.error('Failed'); } finally { setSubmitting(false); }
  };

  const moveDeal = async (dealId: string, fromStage: string, toStage: string) => {
    if (!selectedPipeline || fromStage === toStage) return;
    const prev = deals;
    setDeals(cur => {
      const moving = (cur[fromStage] || []).find(d => d._id === dealId);
      if (!moving) return cur;
      return {
        ...cur,
        [fromStage]: (cur[fromStage] || []).filter(d => d._id !== dealId),
        [toStage]: [...(cur[toStage] || []), { ...moving, stage: toStage }],
      };
    });
    try {
      await pipelineApi.updateDeal(selectedPipeline._id, dealId, { stage: toStage });
    } catch {
      setDeals(prev);
      toast.error('Could not move deal');
    }
  };

  const handleDeletePipeline = async (p: Pipeline) => {
    if (!p?._id) return;
    if (!confirm(`Delete pipeline "${p.name}"? This removes its stages and deals.`)) return;
    try {
      await pipelineApi.delete(p._id);
      toast.success('Pipeline deleted');
      const r = await pipelineApi.list();
      const pipes = r.data.data || [];
      setPipelines(pipes);
      setSelectedPipeline(prev => (prev?._id === p._id ? (pipes[0] || null) : prev));
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to delete pipeline');
    }
  };

  const addStage = () => { if (newStage && !pipelineForm.stages.includes(newStage)) { setPipelineForm({ ...pipelineForm, stages: [...pipelineForm.stages, newStage] }); setNewStage(''); } };
  const removeStage = (idx: number) => setPipelineForm({ ...pipelineForm, stages: pipelineForm.stages.filter((_, i) => i !== idx) });

  const stageAccent = ['#3B82F6', '#F59E0B', '#8B5CF6', '#10B981', '#EF4444', '#F97316'];
  const stageTotal = (name: string) => (deals[name] || []).reduce((sum, d) => sum + (d.value || 0), 0);

  return (
    <div className="mx-auto w-full max-w-[1400px] space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Kanban className="h-5 w-5 shrink-0 text-admin-text-secondary" aria-hidden />
            <h1 className="text-[20px] font-semibold tracking-tight text-admin-text">Pipeline board</h1>
          </div>
          <p className="mt-1 text-[13px] text-admin-text-secondary">
            Manage your sales funnel — drag a deal to move it between stages
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {selectedPipeline && (
            <button type="button" className={secondaryBtn} onClick={openNewDeal}>
              <Plus className="h-4 w-4" /> Add deal
            </button>
          )}
          <button type="button" className={primaryBtn} onClick={() => setShowPipelineModal(true)}>
            <Plus className="h-4 w-4" /> New pipeline
          </button>
        </div>
      </div>

      {pipelines.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {pipelines.map(p => {
            const active = selectedPipeline?._id === p._id;
            return (
              <div
                key={p._id}
                className={`inline-flex items-center overflow-hidden rounded-lg border text-[13px] font-medium ${
                  active
                    ? 'border-admin-text bg-admin-text text-white'
                    : 'border-admin-border bg-white text-admin-text-secondary'
                }`}
              >
                <button type="button" onClick={() => setSelectedPipeline(p)} className="px-3 py-1.5">
                  {p.name}
                </button>
                <button
                  type="button"
                  onClick={() => handleDeletePipeline(p)}
                  title="Delete pipeline"
                  className={`border-l px-2 py-1.5 ${
                    active
                      ? 'border-white/20 text-white/80 hover:bg-[#1a1a1a] hover:text-white'
                      : 'border-admin-border text-admin-text-subdued hover:bg-red-50 hover:text-red-600'
                  }`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {selectedPipeline && allDealIds.length > 0 && (
        <div
          className={`flex flex-wrap items-center justify-between gap-2 rounded-xl border px-3 py-2.5 ${
            selectedDeals.size > 0
              ? 'border-red-200 bg-red-50'
              : 'border-admin-border bg-white shadow-[0_1px_2px_rgba(16,24,40,0.06)]'
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
            {selectedDeals.size > 0 && (
              <span className="text-red-700"> · {selectedDeals.size} selected</span>
            )}
          </label>
          {selectedDeals.size > 0 && (
            <div className="flex gap-2">
              <button type="button" className={secondaryBtn} onClick={() => setSelectedDeals(new Set())}>
                Clear
              </button>
              <button type="button" className={dangerBtn} onClick={handleBulkDelete} disabled={submitting}>
                <Trash2 className="h-4 w-4" /> Delete selected
              </button>
            </div>
          )}
        </div>
      )}

      {loading ? (
        <div className="flex gap-4 overflow-x-auto pb-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="min-h-[280px] min-w-[280px] animate-pulse rounded-xl border border-admin-border bg-white" />
          ))}
        </div>
      ) : selectedPipeline ? (
        <div className="flex gap-3 overflow-x-auto pb-4">
          {(selectedPipeline.stages || []).map((stage, idx) => {
            const isOver = dragOverStage === stage.name;
            const accent = stage.color || stageAccent[idx % stageAccent.length];
            return (
              <div
                key={stage._id || stage.name}
                onDragOver={(e) => { e.preventDefault(); if (dragOverStage !== stage.name) setDragOverStage(stage.name); }}
                onDragLeave={() => setDragOverStage(cur => (cur === stage.name ? null : cur))}
                onDrop={(e) => {
                  e.preventDefault();
                  const dealId = e.dataTransfer.getData('text/plain') || dragDealId;
                  const from = e.dataTransfer.getData('from-stage');
                  setDragOverStage(null);
                  setDragDealId(null);
                  if (dealId && from) moveDeal(dealId, from, stage.name);
                }}
                className={`flex min-w-[280px] flex-col rounded-xl border border-admin-border bg-[#f6f6f7] p-3 transition-shadow ${
                  isOver ? 'ring-2 ring-[#005bd3]/40 shadow-md' : 'shadow-[0_1px_2px_rgba(16,24,40,0.04)]'
                }`}
              >
                <div className="mb-1 flex items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: accent }} />
                    <h3 className="truncate text-[13px] font-semibold text-admin-text">{stage.name}</h3>
                  </div>
                  <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold tabular-nums text-admin-text-secondary ring-1 ring-inset ring-admin-border">
                    {(deals[stage.name] || []).length}
                  </span>
                </div>
                {stageTotal(stage.name) > 0 && (
                  <p className="mb-2 text-[12px] text-admin-text-subdued">
                    Total: ₹{stageTotal(stage.name).toLocaleString()}
                  </p>
                )}
                <div className="min-h-[48px] space-y-2">
                  {(deals[stage.name] || []).map(deal => (
                    <div
                      key={deal._id}
                      draggable
                      onDragStart={(e) => {
                        setDragDealId(deal._id);
                        e.dataTransfer.effectAllowed = 'move';
                        e.dataTransfer.setData('text/plain', deal._id);
                        e.dataTransfer.setData('from-stage', deal.stage);
                      }}
                      onDragEnd={() => { setDragDealId(null); setDragOverStage(null); }}
                      onClick={() => openEditDeal(deal)}
                      className={`cursor-move rounded-lg border bg-white p-3 shadow-sm transition-shadow hover:shadow ${
                        selectedDeals.has(deal._id)
                          ? 'border-red-300 ring-1 ring-red-200'
                          : 'border-admin-border hover:border-admin-text-subdued'
                      } ${dragDealId === deal._id ? 'opacity-50' : ''}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex min-w-0 items-start gap-2">
                          <input
                            type="checkbox"
                            checked={selectedDeals.has(deal._id)}
                            onClick={(e) => e.stopPropagation()}
                            onChange={() => toggleSelectDeal(deal._id)}
                            className="mt-0.5 h-4 w-4 shrink-0 rounded border-admin-border"
                          />
                          <h4 className="truncate text-[13px] font-medium text-admin-text">{deal.title}</h4>
                        </div>
                        <Pencil className="mt-0.5 h-3.5 w-3.5 shrink-0 text-admin-text-subdued" />
                      </div>
                      {deal.value > 0 && (
                        <p className="mt-1 text-[13px] font-semibold tabular-nums text-admin-text">
                          ₹{deal.value.toLocaleString()}
                        </p>
                      )}
                      {dealContactName(deal) && (
                        <p className="mt-1 text-[12px] text-admin-text-secondary">{dealContactName(deal)}</p>
                      )}
                      {dealContactPhone(deal) && (
                        <p className="text-[12px] text-admin-text-subdued">{dealContactPhone(deal)}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-xl border border-admin-border bg-white px-6 py-12 text-center shadow-[0_1px_2px_rgba(16,24,40,0.06)]">
          <Kanban className="mx-auto mb-3 h-10 w-10 text-admin-border" />
          <p className="text-[13px] text-admin-text-secondary">No pipelines yet. Create one to get started.</p>
          <button type="button" className={`${primaryBtn} mt-4`} onClick={() => setShowPipelineModal(true)}>
            <Plus className="h-4 w-4" /> New pipeline
          </button>
        </div>
      )}

      <Modal isOpen={showPipelineModal} onClose={() => setShowPipelineModal(false)} title="Create pipeline">
        <div className="space-y-4">
          <Input label="Pipeline name" value={pipelineForm.name} onChange={(e) => setPipelineForm({ ...pipelineForm, name: e.target.value })} required />
          <div>
            <label className="mb-2 block text-[13px] font-medium text-admin-text">Stages</label>
            {pipelineForm.stages.map((s, i) => (
              <div key={i} className="mb-2 flex items-center gap-2">
                <GripHorizontal className="h-4 w-4 text-admin-text-subdued" />
                <span className="flex-1 rounded-lg border border-admin-border bg-[#f6f6f7] px-3 py-1.5 text-[13px] text-admin-text">{s}</span>
                <button type="button" onClick={() => removeStage(i)} className="text-admin-text-subdued hover:text-red-600">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
            <div className="mt-2 flex gap-2">
              <Input value={newStage} onChange={(e) => setNewStage(e.target.value)} placeholder="New stage name" className="!flex-1" />
              <button type="button" className={secondaryBtn} onClick={addStage}>Add</button>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className={secondaryBtn} onClick={() => setShowPipelineModal(false)}>Cancel</button>
            <button type="button" className={primaryBtn} onClick={handleCreatePipeline} disabled={submitting}>Create</button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showDealModal} onClose={() => { setShowDealModal(false); setEditingDeal(null); }} title={editingDeal ? 'Edit deal' : 'Add deal'}>
        <div className="space-y-4">
          <Input label="Title" value={dealForm.title} onChange={(e) => setDealForm({ ...dealForm, title: e.target.value })} required />
          <Input label="Value (₹)" type="number" value={dealForm.value} onChange={(e) => setDealForm({ ...dealForm, value: e.target.value })} />
          <div>
            <label className="mb-1 block text-[13px] font-medium text-admin-text">Stage</label>
            <select
              value={dealForm.stage}
              onChange={(e) => setDealForm({ ...dealForm, stage: e.target.value })}
              className={fieldClass}
            >
              {(selectedPipeline?.stages || []).map(s => (
                <option key={s._id || s.name} value={s.name}>{s.name}</option>
              ))}
            </select>
          </div>
          <Input label="Contact name" value={dealForm.contactName} onChange={(e) => setDealForm({ ...dealForm, contactName: e.target.value })} />
          <Input label="Contact phone" value={dealForm.contactPhone} onChange={(e) => setDealForm({ ...dealForm, contactPhone: e.target.value })} />
          <div className="flex justify-between gap-2 pt-2">
            <div>
              {editingDeal && (
                <button type="button" className={dangerBtn} onClick={handleDeleteDeal} disabled={submitting}>
                  <Trash2 className="h-4 w-4" /> Delete
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <button type="button" className={secondaryBtn} onClick={() => { setShowDealModal(false); setEditingDeal(null); }}>Cancel</button>
              <button type="button" className={primaryBtn} onClick={handleSaveDeal} disabled={submitting}>
                {editingDeal ? 'Save' : 'Add deal'}
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
