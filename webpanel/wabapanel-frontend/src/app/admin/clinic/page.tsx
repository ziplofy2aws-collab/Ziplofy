'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Stethoscope, Users, ClipboardList } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminApi } from '@/lib/api';

interface ClinicRow {
  vendor: { _id: string; name: string; email: string; companyName?: string; status: string };
  workspaceId: string | null;
  counts: { doctors: number; patients: number; visits: number };
}

export default function AdminClinicListPage() {
  const [rows, setRows] = useState<ClinicRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.clinic.list()
      .then((r) => setRows(r.data.data || []))
      .catch(() => toast.error('Failed to load clinics'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Stethoscope className="w-6 h-6" /> Clinic
        </h1>
        <p className="text-sm text-gray-500 mt-1">Vendors with clinic enabled. Open a clinic to manage doctors and patients.</p>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-500">
            <tr>
              <th className="px-4 py-3 font-medium">Clinic</th>
              <th className="px-4 py-3 font-medium">Owner</th>
              <th className="px-4 py-3 font-medium">Doctors</th>
              <th className="px-4 py-3 font-medium">Patients</th>
              <th className="px-4 py-3 font-medium">Visits</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading && <tr><td colSpan={5} className="px-4 py-8 text-gray-400">Loading…</td></tr>}
            {!loading && rows.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-gray-400">No vendors have clinic turned on.</td></tr>
            )}
            {rows.map((row) => (
              <tr key={row.vendor._id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <Link href={`/admin/clinic/${row.vendor._id}`} className="font-medium text-emerald-700 hover:underline">
                    {row.vendor.companyName || row.vendor.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-gray-500">{row.vendor.email}</td>
                <td className="px-4 py-3">{row.counts.doctors}</td>
                <td className="px-4 py-3">{row.counts.patients}</td>
                <td className="px-4 py-3">{row.counts.visits}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-gray-400 flex items-center gap-3">
        <span className="inline-flex items-center gap-1"><Users className="w-3.5 h-3.5" /> Patients exclude archived charts</span>
        <span className="inline-flex items-center gap-1"><ClipboardList className="w-3.5 h-3.5" /> Enable clinic from Feature Controls or a vendor file</span>
      </p>
    </div>
  );
}
