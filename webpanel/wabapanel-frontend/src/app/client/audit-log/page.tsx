"use client";
import React, { useState, useEffect } from "react";
import { Shield, User, Clock } from "lucide-react";
import { auditLogApi } from "@/lib/api";
import { adminContentColumnClass, dashboardCardShell } from "@/components/layout/dashboard-ui";

const secondaryBtn =
  "inline-flex items-center justify-center gap-1.5 rounded-lg border border-admin-border bg-white px-3 py-1.5 text-[13px] font-medium text-admin-text transition-colors hover:bg-[#f6f6f7] disabled:cursor-not-allowed disabled:opacity-50";

interface LogEntry { _id: string; action: string; resource: string; resourceId: string; details: string; ip: string; user?: { name: string; email: string }; createdAt: string; }

export default function AuditLogPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    setLoading(true);
    auditLogApi.list({ page, limit: 50 }).then(r => { setLogs(r.data.data || []); setTotal(r.data.total || 0); }).catch(() => {}).finally(() => setLoading(false));
  }, [page]);

  if (loading) {
    return (
      <div className={`${adminContentColumnClass} flex h-64 items-center justify-center`}>
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-admin-text" />
      </div>
    );
  }

  return (
    <div className={`${adminContentColumnClass} space-y-4`}>
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 shrink-0 text-admin-text-secondary" aria-hidden />
          <h1 className="text-[20px] font-semibold tracking-tight text-admin-text">Audit Log</h1>
        </div>
        <p className="mt-1 text-[13px] text-admin-text-secondary">Track all actions performed in your account</p>
      </div>

      {logs.length === 0 ? (
        <div className={`${dashboardCardShell} py-16 text-center`}>
          <Shield className="mx-auto mb-3 h-12 w-12 text-admin-text-subdued" />
          <p className="text-[13px] text-admin-text-secondary">No activity logged yet</p>
        </div>
      ) : (
        <div className="divide-y divide-admin-border overflow-hidden rounded-xl border border-admin-border bg-white shadow-[0_1px_2px_rgba(16,24,40,0.06)]">
          {logs.map(log => (
            <div key={log._id} className="flex items-start gap-3 p-4 hover:bg-[#f6f6f7]">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-admin-border bg-[#f6f6f7]">
                <User className="h-4 w-4 text-admin-text-secondary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[13px]">
                  <span className="font-medium text-admin-text">{log.user?.name || "System"}</span>{" "}
                  <span className="text-admin-text-secondary">{log.action}</span>
                  {log.resource && <span className="text-admin-text-subdued"> on {log.resource}</span>}
                </p>
                {log.details && <p className="mt-0.5 text-[12px] text-admin-text-subdued">{log.details}</p>}
              </div>
              <div className="shrink-0 text-right">
                <p className="flex items-center gap-1 text-[12px] text-admin-text-subdued">
                  <Clock className="h-3 w-3" />
                  {new Date(log.createdAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                </p>
                {log.ip && <p className="text-[10px] text-admin-text-subdued">{log.ip}</p>}
              </div>
            </div>
          ))}
          {total > 50 && (
            <div className="flex items-center justify-center gap-3 p-3">
              <button type="button" disabled={page <= 1} onClick={() => setPage(p => p - 1)} className={secondaryBtn}>Previous</button>
              <span className="text-[13px] text-admin-text-secondary">Page {page}</span>
              <button type="button" disabled={page * 50 >= total} onClick={() => setPage(p => p + 1)} className={secondaryBtn}>Next</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
