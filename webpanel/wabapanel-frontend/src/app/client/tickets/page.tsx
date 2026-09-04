'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { LifeBuoy, CheckCircle, RotateCcw, Trash2 } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { adminContentColumnClass, dashboardCardShell } from '@/components/layout/dashboard-ui';

const primaryBtn =
  'inline-flex items-center justify-center gap-1.5 rounded-lg bg-admin-text px-3 py-1.5 text-[13px] font-semibold text-white transition-colors hover:bg-[#1a1a1a]';
const secondaryBtn =
  'inline-flex items-center justify-center gap-1.5 rounded-lg border border-admin-border bg-white px-3 py-1.5 text-[13px] font-medium text-admin-text transition-colors hover:bg-[#f6f6f7]';

interface Ticket {
  _id: string;
  contact?: { _id: string; name?: string; phone?: string };
  conversation?: string;
  subject: string;
  keyword: string;
  status: 'open' | 'closed';
  createdAt: string;
}

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'open' | 'closed'>('open');

  const load = useCallback(() => {
    api.get('/tickets' + (filter === 'all' ? '' : `?status=${filter}`))
      .then(r => setTickets(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const setStatus = async (id: string, status: 'open' | 'closed') => {
    try { await api.patch(`/tickets/${id}`, { status }); toast.success(status === 'closed' ? 'Ticket closed' : 'Ticket reopened'); load(); }
    catch { toast.error('Failed'); }
  };
  const del = async (id: string) => {
    if (!confirm('Delete this ticket?')) return;
    try { await api.delete(`/tickets/${id}`); load(); } catch { toast.error('Failed'); }
  };

  return (
    <div className={`${adminContentColumnClass} space-y-4`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <LifeBuoy className="h-5 w-5 shrink-0 text-admin-text-secondary" aria-hidden />
            <h1 className="text-[20px] font-semibold tracking-tight text-admin-text">Tickets</h1>
          </div>
          <p className="mt-1 text-[13px] text-admin-text-secondary">
            Track and resolve customer complaints raised automatically or manually
          </p>
        </div>
        <div className="flex gap-1">
          {(['open', 'closed', 'all'] as const).map(f => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`rounded-lg px-3 py-1.5 text-[12px] font-medium capitalize ${
                filter === f ? 'bg-admin-text text-white' : 'border border-admin-border bg-white text-admin-text hover:bg-[#f6f6f7]'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <p className="text-[12px] text-admin-text-subdued">
        When Auto Ticket is enabled, a ticket is created here automatically whenever a message contains a complaint keyword (toggle &amp; keywords in AI Settings → AI Features).
      </p>

      {loading ? (
        <p className="text-[13px] text-admin-text-subdued">Loading…</p>
      ) : tickets.length === 0 ? (
        <div className={`${dashboardCardShell} py-10 text-center text-[13px] text-admin-text-subdued`}>No tickets yet</div>
      ) : (
        <div className={`${dashboardCardShell} divide-y divide-admin-border overflow-hidden p-0`}>
          {tickets.map(t => (
            <div key={t._id} className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-[13px] font-medium text-admin-text">
                  {t.contact?.name || t.contact?.phone || 'Unknown'}
                  <span className={`ml-2 rounded px-1.5 py-0.5 text-[10px] font-medium ${t.status === 'open' ? 'bg-red-100 text-red-700' : 'bg-[#f1f1f1] text-admin-text-subdued'}`}>{t.status}</span>
                  {t.keyword && <span className="ml-1 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700">{t.keyword}</span>}
                </p>
                <p className="mt-0.5 truncate text-[12px] text-admin-text-secondary">{t.subject}</p>
                <p className="mt-0.5 text-[11px] text-admin-text-subdued">
                  {new Date(t.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true })}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {t.conversation && (
                  <a href={`/client/chat?conversation=${t.conversation}`} className="text-[12px] font-semibold text-[#005bd3] hover:underline">
                    Open chat
                  </a>
                )}
                {t.status === 'open' ? (
                  <button type="button" onClick={() => setStatus(t._id, 'closed')} className={primaryBtn}>
                    <CheckCircle className="h-3.5 w-3.5" /> Close
                  </button>
                ) : (
                  <button type="button" onClick={() => setStatus(t._id, 'open')} className={secondaryBtn}>
                    <RotateCcw className="h-3.5 w-3.5" /> Reopen
                  </button>
                )}
                <button type="button" onClick={() => del(t._id)} className="rounded-lg p-1.5 text-admin-text-subdued hover:bg-red-50 hover:text-red-600">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
