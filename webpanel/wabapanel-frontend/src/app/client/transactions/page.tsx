"use client";
import React, { useState, useEffect } from "react";
import { Trash2, Receipt } from "lucide-react";
import { paymentApi } from "@/lib/api";
import toast from "react-hot-toast";
import { adminContentColumnClass, dashboardCardShell, dashboardStatValueClass } from "@/components/layout/dashboard-ui";

const dangerBtn =
  "inline-flex items-center justify-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-[13px] font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50";
const checkClass = "h-4 w-4 rounded border-admin-border text-admin-text focus:ring-admin-border";

interface Transaction { _id: string; amount: number; currency: string; gateway: string; status: string; plan: string | { name?: string }; type: string; createdAt: string; }

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string[]>([]);
  const [deleting, setDeleting] = useState(false);

  const fetchTransactions = async () => {
    try {
      const res = await paymentApi.getHistory();
      setTransactions(res.data.data || res.data || []);
    } catch { /* empty */ } finally { setLoading(false); }
  };

  useEffect(() => { fetchTransactions(); }, []);

  const toggleOne = (id: string) => setSelected(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  const allSelected = transactions.length > 0 && selected.length === transactions.length;
  const toggleAll = () => setSelected(allSelected ? [] : transactions.map(t => t._id));

  const deleteSelected = async () => {
    if (!selected.length) return;
    if (!confirm(`Delete ${selected.length} transaction record(s)? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      await Promise.all(selected.map(id => paymentApi.deleteHistory(id).catch(() => null)));
      toast.success("Transaction(s) deleted");
      setSelected([]);
      fetchTransactions();
    } catch { toast.error("Failed to delete transactions"); }
    finally { setDeleting(false); }
  };

  const statusColors: Record<string, string> = {
    completed: "bg-emerald-100 text-emerald-800",
    pending: "bg-amber-100 text-amber-800",
    failed: "bg-red-100 text-red-800",
    refunded: "bg-blue-100 text-blue-800",
  };

  const planLabel = (p: Transaction["plan"]) => (p && typeof p === "object" ? p.name : p) || "-";

  const downloadInvoice = async (id: string) => {
    try {
      const res = await paymentApi.downloadInvoice(id);
      const url = window.URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice-${id.slice(-8).toUpperCase()}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch { /* empty */ }
  };

  const completed = transactions.filter(t => t.status === "completed");
  const pending = transactions.filter(t => t.status === "pending");
  const totalSpent = completed.reduce((s, t) => s + (t.amount || 0), 0);

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
          <Receipt className="h-5 w-5 shrink-0 text-admin-text-secondary" aria-hidden />
          <h1 className="text-[20px] font-semibold tracking-tight text-admin-text">Transactions</h1>
        </div>
        <p className="mt-1 text-[13px] text-admin-text-secondary">View your payment transaction history</p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Transactions", value: String(transactions.length) },
          { label: "Total Spent", value: `₹${totalSpent.toFixed(2)}` },
          { label: "Completed", value: String(completed.length) },
          { label: "Pending", value: String(pending.length) },
        ].map((s) => (
          <div key={s.label} className={dashboardCardShell}>
            <p className="text-[12px] font-medium text-admin-text-secondary">{s.label}</p>
            <p className={dashboardStatValueClass}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-admin-border bg-white shadow-[0_1px_2px_rgba(16,24,40,0.06)]">
        {selected.length > 0 && (
          <div className="flex items-center justify-between border-b border-admin-border bg-red-50 px-4 py-3">
            <span className="text-[13px] font-medium text-red-800">{selected.length} selected</span>
            <div className="flex items-center gap-3">
              <button type="button" onClick={deleteSelected} disabled={deleting} className={dangerBtn}>
                <Trash2 className="h-3.5 w-3.5" /> {deleting ? "Deleting..." : "Delete Selected"}
              </button>
              <button type="button" onClick={() => setSelected([])} className="text-[12px] text-admin-text-subdued hover:underline">Clear</button>
            </div>
          </div>
        )}
        {transactions.length === 0 ? (
          <div className="p-8 text-center text-[13px] text-admin-text-secondary">No transactions yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead className="border-b border-admin-border bg-[#f6f6f7]">
                <tr>
                  <th className="w-10 px-4 py-3"><input type="checkbox" checked={allSelected} onChange={toggleAll} className={checkClass} /></th>
                  <th className="px-4 py-3 text-left text-[12px] font-medium uppercase tracking-wide text-admin-text-subdued">Date</th>
                  <th className="px-4 py-3 text-left text-[12px] font-medium uppercase tracking-wide text-admin-text-subdued">Type</th>
                  <th className="px-4 py-3 text-left text-[12px] font-medium uppercase tracking-wide text-admin-text-subdued">Plan</th>
                  <th className="px-4 py-3 text-left text-[12px] font-medium uppercase tracking-wide text-admin-text-subdued">Gateway</th>
                  <th className="px-4 py-3 text-left text-[12px] font-medium uppercase tracking-wide text-admin-text-subdued">Status</th>
                  <th className="px-4 py-3 text-right text-[12px] font-medium uppercase tracking-wide text-admin-text-subdued">Amount</th>
                  <th className="px-4 py-3 text-right text-[12px] font-medium uppercase tracking-wide text-admin-text-subdued">Invoice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-admin-border">
                {transactions.map(t => (
                  <tr key={t._id} className={`hover:bg-[#f6f6f7] ${selected.includes(t._id) ? "bg-red-50/40" : ""}`}>
                    <td className="px-4 py-3"><input type="checkbox" checked={selected.includes(t._id)} onChange={() => toggleOne(t._id)} className={checkClass} /></td>
                    <td className="px-4 py-3 text-admin-text">{new Date(t.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3 capitalize text-admin-text">{t.type || "subscription"}</td>
                    <td className="px-4 py-3 text-admin-text">{planLabel(t.plan)}</td>
                    <td className="px-4 py-3 capitalize text-admin-text">{t.gateway || "-"}</td>
                    <td className="px-4 py-3"><span className={`rounded-full px-2 py-0.5 text-[12px] font-medium ${statusColors[t.status] || "bg-[#f1f1f1] text-admin-text-secondary"}`}>{t.status}</span></td>
                    <td className="px-4 py-3 text-right font-medium text-admin-text">₹{(t.amount || 0).toFixed(2)}</td>
                    <td className="px-4 py-3 text-right">
                      {t.status === "completed" ? (
                        <button type="button" onClick={() => downloadInvoice(t._id)} className="text-[13px] font-medium text-admin-text hover:underline">Download</button>
                      ) : <span className="text-admin-text-subdued">-</span>}
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
