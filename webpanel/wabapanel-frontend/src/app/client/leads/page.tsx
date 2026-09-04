'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { integrationApi } from '@/lib/api';
import { Search, RefreshCw, Users } from 'lucide-react';
import { adminContentColumnClass, dashboardCardShell, dashboardLinkClass } from '@/components/layout/dashboard-ui';

interface LeadItem { _id: string; name: string; phone: string; email: string; tags: string[]; createdAt: string }

const SOURCE_LABELS: Record<string, string> = {
  indiamart: 'IndiaMART', justdial: 'Justdial', tradeindia: 'TradeIndia', exportersindia: 'ExportersIndia',
  '99acres': '99acres', magicbricks: 'MagicBricks', housing: 'Housing.com', olx: 'OLX', tagmango: 'TagMango',
  'google-lead-forms': 'Google Lead Forms', 'wordpress-forms': 'WordPress Forms', 'google-forms': 'Google Forms',
  typeform: 'Typeform', jotform: 'Jotform', 'landing-pages': 'Landing Page', flexifunnels: 'FlexiFunnels',
  website: 'Website', 'linkedin-ads': 'LinkedIn', 'twitter-ads': 'X Ads', leadsquared: 'LeadSquared',
  gohighlevel: 'GoHighLevel', facebook_lead: 'Facebook Lead Ads', 'facebook-leads': 'Facebook Lead Ads',
};

const secondaryBtn =
  'inline-flex items-center gap-1.5 rounded-lg border border-admin-border bg-white px-3 py-1.5 text-[13px] font-medium text-admin-text transition-colors hover:bg-[#f6f6f7] disabled:cursor-not-allowed disabled:opacity-40';

const fieldClass =
  'rounded-lg border border-admin-border bg-white px-3 py-2 text-[13px] text-admin-text placeholder:text-admin-text-subdued focus:outline-none focus:ring-2 focus:ring-admin-border';

export default function AllLeadsPage() {
  const [items, setItems] = useState<LeadItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState('');
  const [source, setSource] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const r = await integrationApi.allLeads({ page: p, limit: 25, search, source });
      setItems(r.data.data.items || []);
      setTotal(r.data.data.total || 0);
      setPage(r.data.data.page || 1);
      setPages(r.data.data.pages || 1);
    } catch { /* keep old data */ }
    setLoading(false);
  }, [search, source]);

  useEffect(() => { load(1); }, [load]);

  const sourceOf = (tags: string[]) => {
    const t = (tags || []).find(tag => tag !== 'lead' && SOURCE_LABELS[tag]) || (tags || []).find(tag => tag !== 'lead');
    return t ? (SOURCE_LABELS[t] || t) : '-';
  };

  return (
    <div className={`${adminContentColumnClass} space-y-4`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 shrink-0 text-admin-text-secondary" aria-hidden />
            <h1 className="text-[20px] font-semibold tracking-tight text-admin-text">All Leads</h1>
          </div>
          <p className="mt-1 text-[13px] text-admin-text-secondary">
            Leads from every connected source — IndiaMART, Facebook, website, and more ({total} total)
          </p>
        </div>
        <button type="button" onClick={() => load(page)} className={secondaryBtn}>
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative min-w-[220px] max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-admin-text-subdued" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search name, phone, email..."
            className={`${fieldClass} w-full pl-9 pr-3`}
          />
        </div>
        <select
          value={source}
          onChange={e => setSource(e.target.value)}
          className={fieldClass}
        >
          <option value="">All sources</option>
          {Object.entries(SOURCE_LABELS).filter(([k]) => k !== 'facebook-leads').map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>

      <div className={`${dashboardCardShell} overflow-hidden !p-0`}>
        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin text-admin-text-subdued" />
          </div>
        ) : items.length === 0 ? (
          <div className="p-10 text-center text-[13px] text-admin-text-secondary">
            No leads yet. Connect an integration and leads will appear here automatically.
            <div className="mt-3">
              <Link href="/client/integrations" className={dashboardLinkClass}>
                Go to Integrations →
              </Link>
            </div>
          </div>
        ) : (
          <table className="w-full text-[13px]">
            <thead className="border-b border-admin-border bg-[#f6f6f7] text-left text-admin-text-subdued">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Phone</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Source</th>
                <th className="px-4 py-3 font-medium">Received</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-admin-border">
              {items.map(l => (
                <tr key={l._id} className="hover:bg-[#f6f6f7]">
                  <td className="px-4 py-3 font-medium text-admin-text">{l.name || '-'}</td>
                  <td className="px-4 py-3 text-admin-text">{l.phone}</td>
                  <td className="px-4 py-3 text-admin-text-secondary">{l.email || '-'}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/15">
                      {sourceOf(l.tags)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-admin-text-secondary">{new Date(l.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {pages > 1 && (
        <div className="flex items-center justify-end gap-2 text-[13px]">
          <button type="button" disabled={page <= 1} onClick={() => load(page - 1)} className={secondaryBtn}>
            Prev
          </button>
          <span className="text-admin-text-secondary">Page {page} / {pages}</span>
          <button type="button" disabled={page >= pages} onClick={() => load(page + 1)} className={secondaryBtn}>
            Next
          </button>
        </div>
      )}
    </div>
  );
}
