'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Search } from 'lucide-react';
import { edtechApi } from '@/lib/api';
import { adminContentColumnClass, dashboardCardShell } from '@/components/layout/dashboard-ui';

const primaryBtn = 'inline-flex items-center gap-1.5 rounded-lg bg-admin-text px-3 py-1.5 text-[13px] font-semibold text-white';
const inputClass = 'w-full rounded-lg border border-admin-border px-3 py-2 text-[13px]';

interface Row {
  _id: string;
  enrollmentNo?: string;
  grade?: string;
  contact?: { _id: string; name?: string; phone?: string } | null;
}

export default function EdtechStudentsPage() {
  const router = useRouter();
  const [rows, setRows] = useState<Row[]>([]);
  const [search, setSearch] = useState('');
  const [canManage, setCanManage] = useState(true);

  const load = (q = search) => {
    edtechApi.students.list({ search: q, limit: 50 }).then((r) => setRows(r.data.data || [])).catch(() => {});
  };
  useEffect(() => {
    load();
    edtechApi.me().then((r) => setCanManage(r.data.data?.staffType !== 'teacher')).catch(() => {});
  }, []);

  return (
    <div className={`${adminContentColumnClass} space-y-4`}>
      <div className="flex items-center justify-between">
        <h1 className="text-[20px] font-semibold text-admin-text">Students</h1>
        {canManage && (
          <button type="button" className={primaryBtn} onClick={() => router.push('/client/edtech/students/new')}>
            <Plus className="h-4 w-4" /> Add student
          </button>
        )}
      </div>
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-admin-text-subdued" />
        <input className={`${inputClass} pl-9`} placeholder="Name, phone, or enrollment no" value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') load(search); }} />
      </div>
      <div className={dashboardCardShell + ' overflow-x-auto p-0'}>
        <table className="w-full text-left text-[13px]">
          <thead className="bg-[#f6f6f7] text-admin-text-secondary"><tr>
            <th className="px-4 py-2">Enrollment</th><th className="px-4 py-2">Name</th><th className="px-4 py-2">Phone</th><th className="px-4 py-2">Grade</th>
          </tr></thead>
          <tbody className="divide-y divide-admin-border">
            {rows.length === 0 && <tr><td colSpan={4} className="px-4 py-6 text-admin-text-secondary">No students yet.</td></tr>}
            {rows.map((s) => (
              <tr key={s._id}>
                <td className="px-4 py-3 font-mono text-[12px]">{s.enrollmentNo || '—'}</td>
                <td className="px-4 py-3">
                  <Link className="font-medium text-[#005bd3]" href={`/client/edtech/students/${s.contact?._id}`}>{s.contact?.name || s.contact?.phone || 'Student'}</Link>
                </td>
                <td className="px-4 py-3">{s.contact?.phone || '—'}</td>
                <td className="px-4 py-3">{s.grade || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
