'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Download, Plus, Search, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { clinicApi } from '@/lib/api';
import { adminContentColumnClass, dashboardCardShell } from '@/components/layout/dashboard-ui';

const primaryBtn =
  'inline-flex items-center justify-center gap-1.5 rounded-lg bg-admin-text px-3 py-1.5 text-[13px] font-semibold text-white hover:bg-[#1a1a1a] disabled:opacity-50';
const secondaryBtn =
  'inline-flex items-center justify-center gap-1.5 rounded-lg border border-admin-border bg-white px-3 py-1.5 text-[13px] font-medium text-admin-text hover:bg-[#f6f6f7]';
const inputClass = 'w-full rounded-lg border border-admin-border px-3 py-2 text-[13px] focus:border-[#005bd3] focus:outline-none';

interface Patient {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  medical?: { uhid?: string; gender?: string; bloodGroup?: string } | null;
  lastVisit?: { date?: string; status?: string } | null;
}

export default function ClinicPatientsPage() {
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const limit = 20;

  const load = (q = search, p = page) => {
    setLoading(true);
    clinicApi.patients.list({ search: q, page: p, limit })
      .then((r) => {
        setPatients(r.data.data || []);
        setTotal(r.data.total || 0);
      })
      .catch(() => toast.error('Could not load patients'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(search, page); }, [page]);

  const exportCsv = async () => {
    setExporting(true);
    try {
      const res = await clinicApi.patients.export({ search });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'text/csv;charset=utf-8' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = 'patients.csv';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error('Export failed');
    } finally {
      setExporting(false);
    }
  };

  const pages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className={`${adminContentColumnClass} space-y-4`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-admin-text-secondary" />
            <h1 className="text-[20px] font-semibold text-admin-text">Patients</h1>
          </div>
          <p className="mt-1 text-[13px] text-admin-text-secondary">Search by name, phone, or UHID</p>
        </div>
        <div className="flex gap-2">
          <button type="button" className={secondaryBtn} disabled={exporting} onClick={exportCsv}>
            <Download className="h-4 w-4" /> {exporting ? 'Exporting…' : 'Export'}
          </button>
          <button type="button" className={primaryBtn} onClick={() => router.push('/client/clinic/patients/new')}>
            <Plus className="h-4 w-4" /> Add patient
          </button>
        </div>
      </div>
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-admin-text-subdued" />
        <input
          className={`${inputClass} pl-9`}
          placeholder="Name, phone, or UHID"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { setPage(1); load(search, 1); } }}
        />
      </div>
      <div className={dashboardCardShell + ' overflow-x-auto p-0'}>
        <table className="w-full text-left text-[13px]">
          <thead className="border-b border-admin-border bg-[#f6f6f7] text-admin-text-secondary">
            <tr>
              <th className="px-4 py-2.5 font-medium">UHID</th>
              <th className="px-4 py-2.5 font-medium">Name</th>
              <th className="px-4 py-2.5 font-medium">Phone</th>
              <th className="px-4 py-2.5 font-medium">Last visit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-admin-border">
            {loading && (
              <tr><td colSpan={4} className="px-4 py-6 text-admin-text-secondary">Loading…</td></tr>
            )}
            {!loading && patients.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-6 text-admin-text-secondary">No patients yet.</td></tr>
            )}
            {!loading && patients.map((p) => (
              <tr key={p._id} className="hover:bg-[#fafafa]">
                <td className="px-4 py-3 font-mono text-[12px] text-admin-text-secondary">{p.medical?.uhid || '—'}</td>
                <td className="px-4 py-3">
                  <Link href={`/client/clinic/patients/${p._id}`} className="font-medium text-[#005bd3] hover:underline">
                    {p.name || p.phone}
                  </Link>
                </td>
                <td className="px-4 py-3 text-admin-text-secondary">{p.phone}</td>
                <td className="px-4 py-3 text-admin-text-secondary">
                  {p.lastVisit?.date ? String(p.lastVisit.date).slice(0, 10) : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {pages > 1 && (
        <div className="flex items-center justify-end gap-2 text-[13px]">
          <button type="button" className={secondaryBtn} disabled={page <= 1} onClick={() => setPage((n) => n - 1)}>Previous</button>
          <span className="text-admin-text-secondary">Page {page} of {pages}</span>
          <button type="button" className={secondaryBtn} disabled={page >= pages} onClick={() => setPage((n) => n + 1)}>Next</button>
        </div>
      )}
    </div>
  );
}
