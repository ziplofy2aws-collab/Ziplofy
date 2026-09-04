'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { crmApi } from '@/lib/api';
import {
  Users, CheckCircle2, XCircle, Trophy, IndianRupee, Package,
  MessageCircle, RefreshCw, Milestone, Tags, UserRound, Layers, LayoutDashboard,
} from 'lucide-react';
import {
  adminContentColumnClass,
  dashboardCardShell,
  dashboardStatValueClassFor,
} from '@/components/layout/dashboard-ui';

interface Breakdown { _id: string; name: string; color?: string; count: number }
interface DashboardData {
  totalLeads: number; closedTotal: number; wonCount: number; openLeads: number;
  totalValue: number; totalItems: number; msgIn: number; msgOut: number;
  stageBreakdown: Breakdown[]; labelBreakdown: Breakdown[]; agentBreakdown: Breakdown[];
  unassigned: number; closeReasons: { reason: string; count: number }[];
  series: { date: string; count: number }[];
}

const fmt = (d: Date) => d.toISOString().slice(0, 10);

function presetRange(key: string): { from: string; to: string } {
  const now = new Date();
  const start = new Date(now); start.setHours(0, 0, 0, 0);
  const end = new Date(now); end.setHours(0, 0, 0, 0);
  if (key === 'today') { /* same day */ }
  else if (key === 'yesterday') { start.setDate(start.getDate() - 1); end.setDate(end.getDate() - 1); }
  else if (key === 'tomorrow') { start.setDate(start.getDate() + 1); end.setDate(end.getDate() + 1); }
  else if (key === '7d') { start.setDate(start.getDate() - 6); }
  else if (key === '30d') { start.setDate(start.getDate() - 29); }
  else if (key === '12m') { start.setMonth(start.getMonth() - 12); }
  else if (key === 'all') { return { from: '', to: '' }; }
  return { from: fmt(start), to: fmt(end) };
}

const PRESETS: { k: string; label: string }[] = [
  { k: 'today', label: 'Today' },
  { k: 'yesterday', label: 'Yesterday' },
  { k: 'tomorrow', label: 'Tomorrow' },
  { k: '7d', label: 'Last 7 days' },
  { k: '30d', label: 'Last 30 days' },
  { k: '12m', label: 'Last 12 months' },
  { k: 'all', label: 'All time' },
];

const secondaryBtn =
  'inline-flex items-center gap-1.5 rounded-lg border border-admin-border bg-white px-3 py-1.5 text-[13px] font-medium text-admin-text transition-colors hover:bg-[#f6f6f7] disabled:cursor-not-allowed disabled:opacity-40';

const fieldClass =
  'rounded-lg border border-admin-border bg-white px-3 py-1.5 text-[13px] text-admin-text focus:outline-none focus:ring-2 focus:ring-admin-border';

export default function LeadDashboardPage() {
  const router = useRouter();
  const [preset, setPreset] = useState('30d');
  const [from, setFrom] = useState(presetRange('30d').from);
  const [to, setTo] = useState(presetRange('30d').to);
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    crmApi.dashboard({ from: from || undefined, to: to || undefined })
      .then(r => setData(r.data.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [from, to]);

  useEffect(() => { load(); }, [load]);

  const applyPreset = (k: string) => {
    setPreset(k);
    if (k !== 'custom') { const r = presetRange(k); setFrom(r.from); setTo(r.to); }
  };

  // Drill down into Lead Report with the current time window + a dimension filter.
  const drill = (extra: Record<string, string>) => {
    const p = new URLSearchParams();
    if (from) p.set('from', from);
    if (to) p.set('to', to);
    for (const [k, v] of Object.entries(extra)) if (v) p.set(k, v);
    router.push(`/client/call-center?${p.toString()}`);
  };

  const maxSeries = useMemo(() => Math.max(1, ...(data?.series || []).map(s => s.count)), [data]);

  const cards = data ? [
    { label: 'Total Leads', value: data.totalLeads, icon: <Users className="h-4 w-4" />, onClick: () => drill({}) },
    { label: 'Open Leads', value: data.openLeads, icon: <MessageCircle className="h-4 w-4" />, onClick: () => drill({}) },
    { label: 'Closed', value: data.closedTotal, icon: <XCircle className="h-4 w-4" />, onClick: () => drill({}) },
    { label: 'Won', value: data.wonCount, icon: <Trophy className="h-4 w-4" />, onClick: () => drill({}) },
    { label: 'Deal Value', value: `₹${data.totalValue.toLocaleString('en-IN')}`, icon: <IndianRupee className="h-4 w-4" /> },
    { label: 'Items Ordered', value: data.totalItems, icon: <Package className="h-4 w-4" /> },
    { label: 'Messages In', value: data.msgIn, icon: <CheckCircle2 className="h-4 w-4" /> },
    { label: 'Messages Out', value: data.msgOut, icon: <CheckCircle2 className="h-4 w-4" /> },
  ] : [];

  return (
    <div className={`${adminContentColumnClass} space-y-4`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="h-5 w-5 shrink-0 text-admin-text-secondary" aria-hidden />
            <h1 className="text-[20px] font-semibold tracking-tight text-admin-text">Lead Dashboard</h1>
          </div>
          <p className="mt-1 text-[13px] text-admin-text-secondary">
            A manager overview — click any card to drill into the leads
          </p>
        </div>
        <button type="button" onClick={load} disabled={loading} className={secondaryBtn}>
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {PRESETS.map(p => (
          <button
            key={p.k}
            type="button"
            onClick={() => applyPreset(p.k)}
            className={`rounded-lg border px-3 py-1.5 text-[13px] font-medium transition-colors ${
              preset === p.k
                ? 'border-admin-text bg-admin-text text-white'
                : 'border-admin-border bg-white text-admin-text hover:bg-[#f6f6f7]'
            }`}
          >
            {p.label}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-1.5">
          <input
            type="date"
            value={from}
            onChange={e => { setFrom(e.target.value); setPreset('custom'); }}
            className={fieldClass}
          />
          <span className="text-[13px] text-admin-text-subdued">to</span>
          <input
            type="date"
            value={to}
            onChange={e => { setTo(e.target.value); setPreset('custom'); }}
            className={fieldClass}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {cards.map(c => (
          <button
            key={c.label}
            type="button"
            onClick={c.onClick}
            disabled={!c.onClick}
            className={`${dashboardCardShell} text-left ${
              c.onClick ? 'cursor-pointer hover:border-admin-text/20' : 'cursor-default'
            }`}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-admin-border bg-[#f6f6f7] text-admin-text-secondary">
              {c.icon}
            </div>
            <div className={dashboardStatValueClassFor(c.value)}>{c.value}</div>
            <div className="mt-0.5 text-[12px] text-admin-text-secondary">{c.label}</div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <BreakdownCard title="By Stage" icon={<Milestone className="h-4 w-4" />} rows={data?.stageBreakdown || []}
          onRow={(id) => drill({ stage: id })} />
        <BreakdownCard title="By Label / Product / Service" icon={<Tags className="h-4 w-4" />} rows={data?.labelBreakdown || []}
          onRow={(id) => drill({ tag: id })} />
        <BreakdownCard title="By Agent" icon={<UserRound className="h-4 w-4" />}
          rows={[...(data?.agentBreakdown || []), ...(data && data.unassigned ? [{ _id: '__none__', name: 'Unassigned', count: data.unassigned }] : [])]}
          onRow={(id) => drill({ agent: id })} />
        <div className={dashboardCardShell}>
          <div className="mb-3 flex items-center gap-2 border-b border-admin-border bg-[#f6f6f7] -mx-4 -mt-4 rounded-t-xl px-4 py-2.5 text-[13px] font-semibold text-admin-text">
            <Layers className="h-4 w-4 text-admin-text-secondary" /> Close Reasons
          </div>
          {(data?.closeReasons || []).length === 0 ? (
            <div className="text-[13px] text-admin-text-subdued">No closed leads in this range.</div>
          ) : (
            <div className="space-y-2">
              {data!.closeReasons.map(c => (
                <div key={c.reason} className="flex items-center justify-between text-[13px]">
                  <span className="capitalize text-admin-text-secondary">{c.reason.replace(/_/g, ' ')}</span>
                  <span className="font-semibold tabular-nums text-admin-text">{c.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className={dashboardCardShell}>
        <div className="mb-3 border-b border-admin-border bg-[#f6f6f7] -mx-4 -mt-4 rounded-t-xl px-4 py-2.5 text-[13px] font-semibold text-admin-text">
          New leads over time
        </div>
        {(data?.series || []).length === 0 ? (
          <div className="text-[13px] text-admin-text-subdued">No data in this range.</div>
        ) : (
          <div className="flex h-40 items-end gap-1 overflow-x-auto">
            {data!.series.map(s => (
              <div key={s.date} className="flex shrink-0 flex-col items-center justify-end" style={{ width: 22 }} title={`${s.date}: ${s.count}`}>
                <div className="w-4 rounded-t bg-admin-text" style={{ height: `${(s.count / maxSeries) * 100}%` }} />
                <div className="mt-1 origin-left rotate-45 whitespace-nowrap text-[8px] text-admin-text-subdued">{s.date.slice(5)}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function BreakdownCard({ title, icon, rows, onRow }: { title: string; icon: React.ReactNode; rows: Breakdown[]; onRow: (id: string) => void }) {
  const max = Math.max(1, ...rows.map(r => r.count));
  return (
    <div className={dashboardCardShell}>
      <div className="mb-3 flex items-center gap-2 border-b border-admin-border bg-[#f6f6f7] -mx-4 -mt-4 rounded-t-xl px-4 py-2.5 text-[13px] font-semibold text-admin-text">
        <span className="text-admin-text-secondary">{icon}</span> {title}
      </div>
      {rows.length === 0 ? (
        <div className="text-[13px] text-admin-text-subdued">No data in this range.</div>
      ) : (
        <div className="space-y-2">
          {rows.map(r => (
            <button key={r._id} type="button" onClick={() => onRow(r._id)} className="group w-full text-left">
              <div className="mb-0.5 flex items-center justify-between text-[13px]">
                <span className="flex items-center gap-1.5 truncate text-admin-text-secondary group-hover:text-admin-text">
                  {r.color && <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: r.color }} />}
                  <span className="truncate">{r.name}</span>
                </span>
                <span className="ml-2 shrink-0 font-semibold tabular-nums text-admin-text">{r.count}</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-[#f6f6f7]">
                <div className="h-full rounded-full" style={{ width: `${(r.count / max) * 100}%`, background: r.color || '#303030' }} />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
