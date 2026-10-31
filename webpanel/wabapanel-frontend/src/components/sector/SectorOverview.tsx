'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, CalendarCheck, MessageCircle, Send, Store, Users, Zap } from 'lucide-react';
import { sectorApi } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { adminContentColumnClass, dashboardCardShell } from '@/components/layout/dashboard-ui';

interface EntityStat {
  key: string; plural: string; singular: string; total: number;
  statusCounts: Record<string, number>;
}
interface OverviewData {
  entities: Record<string, EntityStat>;
  upcoming: { entity: string; entityLabel: string; record: { _id: string; title: string; startsAt?: string; status?: string } }[];
  recent: { _id: string; title: string; entity: string; status?: string; createdAt?: string }[];
  metrics?: {
    todayBookings?: number;
    revenue?: number;
    collected?: number;
    outstanding?: number;
    followupsDue?: number;
    popularPackages?: { id: string; title: string; count: number }[];
    conversionRate?: number | null;
  };
}

const QUICK_TOOLS = [
  { label: 'WhatsApp Inbox', href: '/client/chat?channel=whatsapp', feature: 'chat', icon: <MessageCircle className="h-5 w-5" /> },
  { label: 'Appointments', href: '/client/appointments', feature: 'appointments', icon: <CalendarCheck className="h-5 w-5" /> },
  { label: 'Contacts', href: '/client/contacts', feature: 'contacts', icon: <Users className="h-5 w-5" /> },
  { label: 'Broadcasts', href: '/client/broadcasts', feature: 'broadcasts', icon: <Send className="h-5 w-5" /> },
  { label: 'Automations', href: '/client/automations', feature: 'automations', icon: <Zap className="h-5 w-5" /> },
  { label: 'Online Store', href: '/client/online-store', feature: 'onlineStore', icon: <Store className="h-5 w-5" /> },
];

const fmtDate = (d?: string) => (d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '');

export default function SectorOverview({
  featureKey,
  industry,
  title,
  description,
  basePath,
}: {
  featureKey: string;
  industry?: string;
  title: string;
  description: string;
  basePath?: string;
}) {
  const { features, user } = useAuthStore();
  const [data, setData] = useState<OverviewData | null>(null);
  const [err, setErr] = useState('');
  const selectedModules = (user as unknown as { featureOverrides?: { selectedModules?: string[] } })
    ?.featureOverrides?.selectedModules;
  const enabled = features[featureKey] === true ||
    (Array.isArray(selectedModules) && selectedModules.includes(featureKey));

  useEffect(() => {
    if (!industry || !enabled) return;
    sectorApi.overview(industry)
      .then((r) => setData(r.data.data || null))
      .catch(() => setErr('Could not load workspace data'));
  }, [industry, enabled]);

  const entityStats = data ? Object.values(data.entities) : [];
  const tools = QUICK_TOOLS.filter((t) => features[t.feature] === true);
  const base = basePath || '';
  const metrics = data?.metrics || {};
  // entity key → route segment (kebab-case) — camelCase keys map to their route
  const routeFor = (key: string) => key.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();

  return (
    <div className={`${adminContentColumnClass} space-y-4`}>
      <div>
        <h1 className="text-[20px] font-semibold text-admin-text">{title}</h1>
        <p className="mt-1 text-[13px] text-admin-text-secondary">{description}</p>
      </div>

      {!enabled ? (
        <div className={dashboardCardShell}>
          <p className="text-[13px] text-admin-text-secondary">
            The {title} workspace isn&apos;t enabled for this account. Turn it on from{' '}
            <Link href="/client/choose-services" className="font-medium text-[#005bd3]">Choose your services</Link>.
          </p>
        </div>
      ) : (
        <>
          {err && <div className={dashboardCardShell}><p className="text-[13px] text-red-600">{err}</p></div>}

          {/* Quick actions — each opens the create form on that entity page */}
          {entityStats.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {entityStats.map((e) => (
                <Link key={e.key} href={`${base}/${routeFor(e.key)}?new=1`}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-admin-border px-3 py-1.5 text-[13px] font-medium text-admin-text hover:bg-[#f6f6f7]">
                  + New {e.singular.toLowerCase()}
                </Link>
              ))}
            </div>
          )}

          {/* Entity stat cards */}
          {entityStats.length > 0 && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {entityStats.map((e) => {
                const topStatuses = Object.entries(e.statusCounts).slice(0, 2);
                return (
                  <Link key={e.key} href={`${base}/${routeFor(e.key)}`} className={dashboardCardShell}>
                    <p className="text-[11px] font-semibold uppercase text-admin-text-subdued">{e.plural}</p>
                    <p className="mt-1 text-[20px] font-semibold text-admin-text">{e.total}</p>
                    <p className="text-[11px] text-admin-text-secondary">
                      {topStatuses.length ? topStatuses.map(([s, c]) => `${c} ${s.replace(/_/g, ' ')}`).join(' · ') : 'No records'}
                    </p>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Travel metrics row */}
          {Object.keys(metrics).length > 0 && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              <div className={dashboardCardShell}>
                <p className="text-[11px] font-semibold uppercase text-admin-text-subdued">Today's bookings</p>
                <p className="mt-1 text-[20px] font-semibold text-admin-text">{metrics.todayBookings ?? 0}</p>
              </div>
              <div className={dashboardCardShell}>
                <p className="text-[11px] font-semibold uppercase text-admin-text-subdued">Booking value</p>
                <p className="mt-1 text-[20px] font-semibold text-admin-text">₹{Number(metrics.revenue || 0).toLocaleString('en-IN')}</p>
                <p className="text-[11px] text-admin-text-secondary">all non-cancelled bookings</p>
              </div>
              <div className={dashboardCardShell}>
                <p className="text-[11px] font-semibold uppercase text-admin-text-subdued">Collected</p>
                <p className="mt-1 text-[20px] font-semibold text-emerald-700">₹{Number(metrics.collected || 0).toLocaleString('en-IN')}</p>
                <p className="text-[11px] text-admin-text-secondary">₹{Number(metrics.outstanding || 0).toLocaleString('en-IN')} outstanding</p>
              </div>
              <div className={dashboardCardShell}>
                <p className="text-[11px] font-semibold uppercase text-admin-text-subdued">Follow-ups due</p>
                <p className="mt-1 text-[20px] font-semibold text-amber-600">{metrics.followupsDue ?? 0}</p>
                <p className="text-[11px] text-admin-text-secondary">enquiries past follow-up date</p>
              </div>
              <div className={dashboardCardShell}>
                <p className="text-[11px] font-semibold uppercase text-admin-text-subdued">Conversion</p>
                <p className="mt-1 text-[20px] font-semibold text-admin-text">
                  {metrics.conversionRate === null || metrics.conversionRate === undefined ? '—' : `${metrics.conversionRate}%`}
                </p>
                <p className="text-[11px] text-admin-text-secondary">enquiries → bookings</p>
              </div>
            </div>
          )}

          {/* Popular packages */}
          {(metrics.popularPackages || []).length > 0 && (
            <div className={dashboardCardShell + ' p-0'}>
              <p className="border-b border-admin-border px-4 py-2.5 text-[13px] font-semibold">Most popular packages</p>
              {metrics.popularPackages!.map((p) => (
                <div key={p.id} className="flex items-center justify-between border-b border-admin-border px-4 py-2.5 last:border-0">
                  <p className="text-[13px] font-medium">{p.title}</p>
                  <span className="text-[12px] text-admin-text-secondary">{p.count} booking{p.count === 1 ? '' : 's'}</span>
                </div>
              ))}
            </div>
          )}

          {entityStats.length > 0 && entityStats.every((e) => e.total === 0) && (
            <div className={dashboardCardShell}>
              <p className="text-[13px] font-semibold text-admin-text">Set up your {title} workspace</p>
              <p className="mt-1 text-[13px] text-admin-text-secondary">
                Start with a tour package, then take an enquiry and convert it into your first booking.
              </p>
            </div>
          )}

          <div className="grid gap-3 lg:grid-cols-2">
            {/* Upcoming dated items */}
            {data && data.upcoming.length > 0 && (
              <div className={dashboardCardShell + ' p-0'}>
                <p className="border-b border-admin-border px-4 py-2.5 text-[13px] font-semibold">Upcoming</p>
                {data.upcoming.slice(0, 6).map((u) => (
                  <div key={u.record._id} className="flex items-center justify-between border-b border-admin-border px-4 py-2.5 last:border-0">
                    <div>
                      <p className="text-[13px] font-medium">{u.record.title || u.entityLabel}</p>
                      <p className="text-[11px] text-admin-text-subdued">{u.entityLabel}</p>
                    </div>
                    <span className="text-[12px] text-admin-text-secondary">{fmtDate(u.record.startsAt)}</span>
                  </div>
                ))}
              </div>
            )}
            {/* Recent activity */}
            {data && data.recent.length > 0 && (
              <div className={dashboardCardShell + ' p-0'}>
                <p className="border-b border-admin-border px-4 py-2.5 text-[13px] font-semibold">Recent records</p>
                {data.recent.slice(0, 6).map((r) => (
                  <div key={r._id} className="flex items-center justify-between border-b border-admin-border px-4 py-2.5 last:border-0">
                    <p className="text-[13px] font-medium">{r.title || 'Untitled'}</p>
                    <span className="text-[11px] text-admin-text-subdued">{r.entity} · {fmtDate(r.createdAt)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Shared tools */}
          {tools.length > 0 && (
            <div>
              <p className="mb-2 text-[12px] font-semibold uppercase text-admin-text-subdued">Shared tools</p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {tools.map((tool) => (
                  <Link key={tool.label} href={tool.href} className={`${dashboardCardShell} group`}>
                    <div className="flex items-center justify-between">
                      <span className="text-admin-text-secondary">{tool.icon}</span>
                      <ArrowRight className="h-4 w-4 text-admin-text-subdued transition-transform group-hover:translate-x-0.5" />
                    </div>
                    <p className="mt-2 text-[14px] font-semibold text-admin-text">{tool.label}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
