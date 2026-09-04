'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FileDown } from 'lucide-react';
import { adminContentColumnClass, dashboardCardShell } from '@/components/layout/dashboard-ui';

const primaryBtn =
  'inline-flex items-center justify-center gap-1.5 rounded-lg bg-admin-text px-3 py-1.5 text-[13px] font-semibold text-white transition-colors hover:bg-[#1a1a1a]';

interface ImportLog {
  _id: string;
  fileName: string;
  totalRows: number;
  imported: number;
  failed: number;
  status: string;
  createdAt: string;
}

export default function ImportLogsPage() {
  const [logs, setLogs] = useState<ImportLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.wabapanel.com/api'}/contacts/import-logs`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          const items = Array.isArray(data.data) ? data.data : [];
          setLogs(items.filter((item: Record<string, unknown>) => item.fileName || item.totalRows));
        } else {
          setLogs([]);
        }
      } catch { setLogs([]); } finally { setLoading(false); }
    };
    fetchLogs();
  }, []);

  return (
    <div className={`${adminContentColumnClass} space-y-4`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <FileDown className="h-5 w-5 shrink-0 text-admin-text-secondary" aria-hidden />
            <h1 className="text-[20px] font-semibold tracking-tight text-admin-text">Import Logs</h1>
          </div>
          <p className="mt-1 text-[13px] text-admin-text-secondary">
            View history of contact imports
          </p>
        </div>
        <Link href="/client/contacts" className={primaryBtn}>
          Import Contacts
        </Link>
      </div>

      <div className={`${dashboardCardShell} overflow-hidden p-0`}>
        {loading ? (
          <div className="py-10 text-center text-[13px] text-admin-text-subdued">Loading…</div>
        ) : logs.length === 0 ? (
          <div className="p-10 text-center">
            <FileDown className="mx-auto mb-3 h-10 w-10 text-admin-text-subdued" />
            <h3 className="text-[15px] font-semibold text-admin-text">No Import History</h3>
            <p className="mt-1 mb-4 text-[13px] text-admin-text-secondary">
              Import contacts from the Contacts page to see logs here.
            </p>
            <Link href="/client/contacts" className="text-[13px] font-semibold text-[#005bd3] hover:underline">
              Go to Contacts →
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-admin-border bg-[#f6f6f7]">
                <tr>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-admin-text-subdued">File</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-admin-text-subdued">Total</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-admin-text-subdued">Imported</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-admin-text-subdued">Failed</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-admin-text-subdued">Status</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-admin-text-subdued">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-admin-border">
                {logs.map(log => (
                  <tr key={log._id} className="hover:bg-[#f6f6f7]">
                    <td className="px-4 py-3 text-[13px] font-medium text-admin-text">{log.fileName}</td>
                    <td className="px-4 py-3 text-[13px] tabular-nums text-admin-text">{log.totalRows}</td>
                    <td className="px-4 py-3 text-[13px] tabular-nums text-admin-text">{log.imported}</td>
                    <td className="px-4 py-3 text-[13px] tabular-nums text-red-600">{log.failed}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-md px-2 py-0.5 text-[11px] font-medium ${
                        log.status === 'completed'
                          ? 'bg-[#cdfee1] text-[#0d6b38]'
                          : 'bg-amber-50 text-amber-800'
                      }`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[13px] text-admin-text-secondary">
                      {new Date(log.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
