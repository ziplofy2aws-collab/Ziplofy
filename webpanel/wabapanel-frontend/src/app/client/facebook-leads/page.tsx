'use client';
import React, { useState, useEffect } from 'react';
import { Share2, RefreshCw, Eye, Download, UserPlus, MessageCircle, CheckCircle } from 'lucide-react';
import Table from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import { useAuthStore } from '@/stores/authStore';
import { facebookLeadApi } from '@/lib/api';
import toast from 'react-hot-toast';
import { adminContentColumnClass, dashboardCardShell } from '@/components/layout/dashboard-ui';

const primaryBtn =
  'inline-flex items-center gap-1.5 rounded-lg bg-admin-text px-3 py-1.5 text-[13px] font-semibold text-white transition-colors hover:bg-[#1a1a1a] disabled:opacity-50';
const secondaryBtn =
  'inline-flex items-center gap-1.5 rounded-lg border border-admin-border bg-white px-3 py-1.5 text-[13px] font-medium text-admin-text transition-colors hover:bg-[#f6f6f7] disabled:opacity-50';

interface Lead {
  _id: string; name: string; email: string; phone: string; adName: string; formName: string;
  status: string; data: Record<string, string>; createdAt: string;
}

export default function FacebookLeadsPage() {
  const { currentWorkspace } = useAuthStore();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Lead | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetch = () => {
    if (!currentWorkspace) return;
    facebookLeadApi.getLeads().then(r => setLeads(r.data.data || [])).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(() => { fetch(); }, [currentWorkspace]);

  const handleSync = async () => {
    if (submitting) return;
    setSubmitting(true);

    setSyncing(true);
    try { await facebookLeadApi.syncLeads(); toast.success('Synced'); fetch(); } catch { toast.error('Failed to sync'); } finally { setSubmitting(false); }
    setSyncing(false);
  };

  const stats = {
    total: leads.length,
    new: leads.filter(l => l.status === 'new').length,
    contacted: leads.filter(l => l.status === 'contacted').length,
    converted: leads.filter(l => l.status === 'converted').length,
  };

  const columns = [
    { key: 'name', title: 'Name', render: (l: Lead) => <span className="text-[13px] font-medium text-admin-text">{l.name}</span> },
    { key: 'email', title: 'Email', render: (l: Lead) => <span className="text-[13px] text-admin-text-secondary">{l.email}</span> },
    { key: 'phone', title: 'Phone', render: (l: Lead) => <span className="text-[13px] text-admin-text">{l.phone}</span> },
    { key: 'adName', title: 'Ad Campaign', render: (l: Lead) => <span className="text-[13px] text-admin-text">{l.adName}</span> },
    { key: 'formName', title: 'Form', render: (l: Lead) => <span className="text-[13px] text-admin-text-secondary">{l.formName}</span> },
    { key: 'status', title: 'Status', render: (l: Lead) => <Badge variant={l.status === 'converted' ? 'success' : l.status === 'contacted' ? 'info' : 'warning'}>{l.status}</Badge> },
    { key: 'date', title: 'Date', render: (l: Lead) => <span className="text-[13px] text-admin-text-secondary">{new Date(l.createdAt).toLocaleDateString()}</span> },
    { key: 'actions', title: '', render: (l: Lead) => (
      <button
        type="button"
        onClick={() => setSelected(l)}
        className="rounded-lg p-1.5 text-admin-text-subdued hover:bg-[#f6f6f7] hover:text-admin-text"
        title="View lead"
      >
        <Eye className="h-4 w-4" />
      </button>
    ) },
  ];

  return (
    <div className={`${adminContentColumnClass} space-y-4`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Share2 className="h-5 w-5 shrink-0 text-admin-text-secondary" aria-hidden />
            <h1 className="text-[20px] font-semibold tracking-tight text-admin-text">Facebook Leads</h1>
          </div>
          <p className="mt-1 text-[13px] text-admin-text-secondary">
            Sync Facebook Lead Ads directly into your contacts
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" className={secondaryBtn} onClick={() => toast.success('Export started')}>
            <Download className="h-4 w-4" />
            Export
          </button>
          <button type="button" className={primaryBtn} disabled={syncing || submitting} onClick={handleSync}>
            <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
            Sync Leads
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: 'Total Leads', value: stats.total, icon: <Share2 className="h-4 w-4 text-blue-700" />, tint: 'bg-blue-50' },
          { label: 'New', value: stats.new, icon: <UserPlus className="h-4 w-4 text-amber-700" />, tint: 'bg-amber-50' },
          { label: 'Contacted', value: stats.contacted, icon: <MessageCircle className="h-4 w-4 text-sky-700" />, tint: 'bg-sky-50' },
          { label: 'Converted', value: stats.converted, icon: <CheckCircle className="h-4 w-4 text-emerald-700" />, tint: 'bg-emerald-50' },
        ].map((stat) => (
          <div key={stat.label} className={`${dashboardCardShell} !p-3.5`}>
            <div className="mb-2 flex items-center gap-2">
              <span className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${stat.tint}`}>{stat.icon}</span>
              <span className="text-[12px] font-medium text-admin-text-secondary">{stat.label}</span>
            </div>
            <p className="text-xl font-bold tabular-nums leading-tight text-admin-text">{stat.value}</p>
          </div>
        ))}
      </div>

      <Table columns={columns} data={leads} loading={loading} />

      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title="Lead Details" size="lg">
        {selected && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-[13px]">
              <div><span className="text-admin-text-secondary">Name:</span> <span className="font-medium text-admin-text">{selected.name}</span></div>
              <div><span className="text-admin-text-secondary">Email:</span> <span className="font-medium text-admin-text">{selected.email}</span></div>
              <div><span className="text-admin-text-secondary">Phone:</span> <span className="font-medium text-admin-text">{selected.phone}</span></div>
              <div><span className="text-admin-text-secondary">Status:</span> <Badge variant={selected.status === 'converted' ? 'success' : 'info'}>{selected.status}</Badge></div>
              <div><span className="text-admin-text-secondary">Ad:</span> <span className="text-admin-text">{selected.adName}</span></div>
              <div><span className="text-admin-text-secondary">Form:</span> <span className="text-admin-text">{selected.formName}</span></div>
            </div>
            {selected.data && Object.keys(selected.data).length > 0 && (
              <div>
                <h4 className="mb-2 text-[13px] font-semibold text-admin-text">Form Data</h4>
                <div className="space-y-1 rounded-lg border border-admin-border bg-[#f6f6f7] p-3">
                  {Object.entries(selected.data).map(([k, v]) => (
                    <div key={k} className="flex justify-between text-[13px]">
                      <span className="text-admin-text-secondary">{k}:</span>
                      <span className="text-admin-text">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="flex justify-end">
              <button type="button" className={secondaryBtn} onClick={() => setSelected(null)}>Close</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
