'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { GraduationCap } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminApi } from '@/lib/api';

interface Row {
  vendor: { _id: string; name: string; email: string; companyName?: string };
  counts: { teachers: number; students: number; batches: number; courses: number };
}

export default function AdminEdtechPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.edtech.list()
      .then((r) => setRows(r.data.data || []))
      .catch(() => toast.error('Failed to load institutes'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><GraduationCap className="w-6 h-6" /> Edtech</h1>
        <p className="text-sm text-gray-500 mt-1">Vendors with the institute module on.</p>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-500">
            <tr>
              <th className="px-4 py-3">Institute</th>
              <th className="px-4 py-3">Owner</th>
              <th className="px-4 py-3">Courses</th>
              <th className="px-4 py-3">Batches</th>
              <th className="px-4 py-3">Students</th>
              <th className="px-4 py-3">Teachers</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading && <tr><td colSpan={6} className="px-4 py-8 text-gray-400">Loading…</td></tr>}
            {!loading && rows.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-gray-400">No education vendors yet.</td></tr>}
            {rows.map((row) => (
              <tr key={row.vendor._id}>
                <td className="px-4 py-3">
                  <Link className="font-medium text-emerald-700" href={`/admin/edtech/${row.vendor._id}`}>
                    {row.vendor.companyName || row.vendor.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-gray-500">{row.vendor.email}</td>
                <td className="px-4 py-3">{row.counts.courses}</td>
                <td className="px-4 py-3">{row.counts.batches}</td>
                <td className="px-4 py-3">{row.counts.students}</td>
                <td className="px-4 py-3">{row.counts.teachers}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
