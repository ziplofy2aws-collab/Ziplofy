'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Edit, Milestone } from 'lucide-react';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import { crmApi } from '@/lib/api';
import toast from 'react-hot-toast';
import { adminContentColumnClass, dashboardCardShell } from '@/components/layout/dashboard-ui';

const COLORS = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#14B8A6', '#6366F1'];

const primaryBtn =
  'inline-flex items-center justify-center gap-1.5 rounded-lg bg-admin-text px-3 py-1.5 text-[13px] font-semibold text-white transition-colors hover:bg-[#1a1a1a] disabled:cursor-not-allowed disabled:opacity-50';
const secondaryBtn =
  'inline-flex items-center justify-center gap-1.5 rounded-lg border border-admin-border bg-white px-3 py-1.5 text-[13px] font-medium text-admin-text transition-colors hover:bg-[#f6f6f7]';

interface StageItem { _id: string; name: string; color: string; contactCount?: number }

export default function StagesPage() {
  const router = useRouter();
  const [stages, setStages] = useState<StageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editStage, setEditStage] = useState<StageItem | null>(null);
  const [form, setForm] = useState({ name: '', color: '#8B5CF6' });
  const [submitting, setSubmitting] = useState(false);

  const fetchStages = async () => {
    try { const res = await crmApi.stages(); setStages(res.data.data || []); } catch { /* empty */ }
    setLoading(false);
  };

  useEffect(() => { fetchStages(); }, []);

  const handleSave = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      if (editStage) { await crmApi.updateStage(editStage._id, form); toast.success('Stage updated'); }
      else { await crmApi.createStage(form); toast.success('Stage created'); }
      setShowModal(false); setEditStage(null); setForm({ name: '', color: '#8B5CF6' }); fetchStages();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed');
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (id: string) => {
    if (submitting) return;
    if (!confirm('Delete this stage? Leads using it will show no stage.')) return;
    setSubmitting(true);
    try { await crmApi.deleteStage(id); toast.success('Deleted'); fetchStages(); } catch { toast.error('Failed'); } finally { setSubmitting(false); }
  };

  return (
    <div className={`${adminContentColumnClass} space-y-4`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Milestone className="h-5 w-5 shrink-0 text-admin-text-secondary" aria-hidden />
            <h1 className="text-[20px] font-semibold tracking-tight text-admin-text">Stage/Pipeline</h1>
          </div>
          <p className="mt-1 text-[13px] text-admin-text-secondary">
            Sales stages for your leads — assign from Chat or Calling Center
          </p>
        </div>
        <button
          type="button"
          className={primaryBtn}
          onClick={() => { setEditStage(null); setForm({ name: '', color: '#8B5CF6' }); setShowModal(true); }}
        >
          <Plus className="h-4 w-4" /> Create Stage
        </button>
      </div>

      {!loading && stages.length > 0 && (
        <div className={`${dashboardCardShell} overflow-x-auto`}>
          <p className="mb-3 text-[12px] font-semibold uppercase tracking-wide text-admin-text-subdued">
            Pipeline overview
          </p>
          <div className="flex min-w-max items-stretch pb-1">
            {stages.map((stage, i) => {
              const color = stage.color || '#8B5CF6';
              return (
                <button
                  key={stage._id}
                  type="button"
                  onClick={() => router.push(`/client/call-center?stage=${stage._id}`)}
                  title={`View leads in ${stage.name}`}
                  className="relative min-w-[104px] py-3 text-center text-white transition-transform hover:-translate-y-0.5"
                  style={{
                    backgroundColor: color,
                    clipPath: i === 0
                      ? 'polygon(0 0, calc(100% - 16px) 0, 100% 50%, calc(100% - 16px) 100%, 0 100%)'
                      : 'polygon(0 0, calc(100% - 16px) 0, 100% 50%, calc(100% - 16px) 100%, 0 100%, 16px 50%)',
                    marginLeft: i === 0 ? 0 : -14,
                    paddingLeft: i === 0 ? 20 : 30,
                    paddingRight: 24,
                  }}
                >
                  <div className="text-xl font-bold leading-none">{stage.contactCount || 0}</div>
                  <div className="mt-1 whitespace-nowrap text-[11px] font-medium leading-tight opacity-95">{stage.name}</div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {loading ? (
        <div className="py-10 text-center text-[13px] text-admin-text-subdued">Loading…</div>
      ) : stages.length === 0 ? (
        <div className={`${dashboardCardShell} py-12 text-center`}>
          <Milestone className="mx-auto mb-3 h-10 w-10 text-admin-text-subdued" />
          <p className="text-[13px] text-admin-text-secondary">No stages created yet</p>
          <p className="mt-1 text-[12px] text-admin-text-subdued">e.g. New, Interested, Demo, Negotiation, Won, Lost</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {stages.map((stage) => (
            <div key={stage._id} className={dashboardCardShell}>
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => router.push(`/client/call-center?stage=${stage._id}`)}
                  className="group flex min-w-0 flex-1 items-center gap-3 text-left"
                  title="View leads in this stage"
                >
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                    style={{ backgroundColor: (stage.color || '#8B5CF6') + '20' }}
                  >
                    <Milestone className="h-4 w-4" style={{ color: stage.color || '#8B5CF6' }} />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-semibold text-admin-text group-hover:underline">
                      {stage.name}
                    </p>
                    <p className="text-[12px] text-admin-text-subdued">{stage.contactCount || 0} leads</p>
                  </div>
                </button>
                <div className="flex shrink-0 gap-0.5">
                  <button
                    type="button"
                    onClick={() => { setEditStage(stage); setForm({ name: stage.name, color: stage.color }); setShowModal(true); }}
                    className="rounded-lg p-1.5 text-admin-text-subdued hover:bg-[#f6f6f7] hover:text-admin-text"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(stage._id)}
                    className="rounded-lg p-1.5 text-admin-text-subdued hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editStage ? 'Edit Stage' : 'Create Stage'} size="sm">
        <div className="space-y-4">
          <Input label="Stage Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <div>
            <label className="mb-2 block text-[13px] font-medium text-admin-text">Color</label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setForm({ ...form, color: c })}
                  className={`h-8 w-8 rounded-full border-2 ${form.color === c ? 'scale-110 border-admin-text' : 'border-transparent'}`}
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
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={handleSave} disabled={submitting} className={primaryBtn}>
              {submitting ? 'Saving…' : editStage ? 'Update' : 'Create'}
            </button>
            <button type="button" className={secondaryBtn} onClick={() => setShowModal(false)}>Cancel</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
