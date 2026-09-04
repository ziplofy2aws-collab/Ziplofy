"use client";
import React, { useState, useEffect } from "react";
import { FileText, CreditCard, Download, Mail, Trash2 } from "lucide-react";
import { invoiceApi, paymentApi } from "@/lib/api";
import toast from "react-hot-toast";
import { adminContentColumnClass } from "@/components/layout/dashboard-ui";

const primaryBtn =
  "inline-flex items-center justify-center gap-1.5 rounded-lg bg-admin-text px-3 py-1.5 text-[13px] font-semibold text-white transition-colors hover:bg-[#1a1a1a] disabled:cursor-not-allowed disabled:opacity-50";
const dangerBtn =
  "inline-flex items-center justify-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-[13px] font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50";
const linkBtn = "inline-flex items-center gap-1 text-[12px] font-medium text-admin-text-secondary hover:text-admin-text";
const checkClass = "h-4 w-4 rounded border-admin-border text-admin-text focus:ring-admin-border";

interface InvoiceItem { _id: string; invoiceNumber: string; contact?: { name: string; phone: string }; items: { name: string; quantity: number; price: number }[]; total: number; status: string; dueDate: string; createdAt: string; }
interface SubInvoice { _id: string; source?: string; invoiceNumber: string; planName: string; amount: number; currency: string; interval: string; status: string; assignedBy?: string; gateway?: string; startDate?: string; endDate?: string; createdAt: string; }

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [subscriptions, setSubscriptions] = useState<SubInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string[]>([]);
  const [sending, setSending] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [subSelected, setSubSelected] = useState<string[]>([]);
  const [subSending, setSubSending] = useState(false);

  const load = async () => { try { const r = await invoiceApi.list(); setInvoices(r.data.data || []); setSubscriptions(r.data.subscriptions || []); } catch { /* */ } finally { setLoading(false); } };
  useEffect(() => { load(); }, []);

  const toggleOne = (id: string) => setSelected(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  const toggleAll = () => setSelected(p => p.length === invoices.length ? [] : invoices.map(i => i._id));

  const downloadInvoicePdf = async (id: string, num: string) => {
    try {
      const res = await invoiceApi.downloadPdf(id);
      const url = window.URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
      const a = document.createElement("a");
      a.href = url; a.download = `invoice-${num}.pdf`;
      document.body.appendChild(a); a.click(); a.remove();
      window.URL.revokeObjectURL(url);
    } catch { toast.error("Failed to download invoice"); }
  };

  const emailOne = async (id: string) => {
    try { const r = await invoiceApi.email(id); toast.success(r.data.message || "Invoice emailed"); }
    catch (e: unknown) { toast.error((e as { response?: { data?: { message?: string } } })?.response?.data?.message || "Failed to email invoice"); }
  };

  const emailSelected = async () => {
    if (!selected.length) return;
    setSending(true);
    try { const r = await invoiceApi.emailBulk(selected); toast.success(r.data.message || "Invoices emailed"); setSelected([]); }
    catch (e: unknown) { toast.error((e as { response?: { data?: { message?: string } } })?.response?.data?.message || "Failed to email invoices"); }
    finally { setSending(false); }
  };

  const deleteSelected = async () => {
    if (!selected.length) return;
    if (!confirm(`Delete ${selected.length} invoice(s)? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      await Promise.all(selected.map(id => invoiceApi.delete(id).catch(() => null)));
      toast.success("Invoice(s) deleted");
      setSelected([]);
      load();
    } catch { toast.error("Failed to delete invoices"); }
    finally { setDeleting(false); }
  };

  const emailableSubs = subscriptions.filter(s => s.source === "payment" && s.status === "completed");
  const toggleSub = (id: string) => setSubSelected(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  const toggleAllSubs = () => setSubSelected(p => p.length === emailableSubs.length ? [] : emailableSubs.map(s => s._id));

  const emailSubs = async (ids: string[]) => {
    if (!ids.length) return;
    setSubSending(true);
    try { const r = await invoiceApi.emailSubBulk(ids); toast.success(r.data.message || "Invoice emailed"); setSubSelected([]); }
    catch (e: unknown) { toast.error((e as { response?: { data?: { message?: string } } })?.response?.data?.message || "Failed to email invoice"); }
    finally { setSubSending(false); }
  };

  const statusColor = (s: string) => (s === "paid" || s === "active" || s === "completed") ? "bg-emerald-100 text-emerald-700" : (s === "pending") ? "bg-amber-100 text-amber-700" : (s === "expired" || s === "cancelled" || s === "failed") ? "bg-red-100 text-red-700" : "bg-[#f1f1f1] text-admin-text-secondary";

  const markPaid = async (id: string) => { try { await invoiceApi.update(id, { status: "paid" }); toast.success("Marked paid"); load(); } catch { toast.error("Failed"); } };

  const fmtDate = (d?: string) => d ? new Date(d).toLocaleDateString() : "—";

  const downloadSubInvoice = async (id: string) => {
    try {
      const res = await paymentApi.downloadInvoice(id);
      const url = window.URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
      const a = document.createElement("a");
      a.href = url; a.download = `invoice-${id.slice(-8).toUpperCase()}.pdf`;
      document.body.appendChild(a); a.click(); a.remove();
      window.URL.revokeObjectURL(url);
    } catch { toast.error("Invoice available only for completed payments"); }
  };

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
          <FileText className="h-5 w-5 shrink-0 text-admin-text-secondary" aria-hidden />
          <h1 className="text-[20px] font-semibold tracking-tight text-admin-text">Invoices</h1>
        </div>
        <p className="mt-1 text-[13px] text-admin-text-secondary">Your subscription billing and order invoices</p>
      </div>

      <div className="overflow-hidden rounded-xl border border-admin-border bg-white shadow-[0_1px_2px_rgba(16,24,40,0.06)]">
        <div className="flex items-center justify-between gap-2 border-b border-admin-border bg-[#f6f6f7] px-4 py-3">
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-admin-text-secondary" />
            <h2 className="text-[13px] font-semibold text-admin-text">Subscription &amp; Plan</h2>
          </div>
          {subSelected.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-[12px] text-admin-text-subdued">{subSelected.length} selected</span>
              <button type="button" onClick={() => emailSubs(subSelected)} disabled={subSending} className={primaryBtn}>
                <Mail className="h-3.5 w-3.5" /> {subSending ? "Sending..." : "Send Email"}
              </button>
              <button type="button" onClick={() => setSubSelected([])} className="text-[12px] text-admin-text-subdued hover:underline">Clear</button>
            </div>
          )}
        </div>
        {subscriptions.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-[13px] text-admin-text-secondary">No active subscription</p>
            <p className="mt-1 text-[12px] text-admin-text-subdued">Pick a plan on the Subscription &amp; Plans page.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead className="border-b border-admin-border bg-[#f6f6f7]">
                <tr>
                  <th className="w-10 px-4 py-3">{emailableSubs.length > 0 && <input type="checkbox" checked={subSelected.length === emailableSubs.length && emailableSubs.length > 0} onChange={toggleAllSubs} className={checkClass} />}</th>
                  <th className="px-4 py-3 text-left font-medium text-admin-text-secondary">Invoice #</th>
                  <th className="px-4 py-3 text-left font-medium text-admin-text-secondary">Plan</th>
                  <th className="px-4 py-3 text-left font-medium text-admin-text-secondary">Billing</th>
                  <th className="px-4 py-3 text-left font-medium text-admin-text-secondary">Period</th>
                  <th className="px-4 py-3 text-right font-medium text-admin-text-secondary">Amount</th>
                  <th className="px-4 py-3 text-center font-medium text-admin-text-secondary">Status</th>
                  <th className="px-4 py-3 text-right font-medium text-admin-text-secondary">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-admin-border">
                {subscriptions.map(s => {
                  const canInvoice = s.source === "payment" && s.status === "completed";
                  return (
                    <tr key={s._id} className={`hover:bg-[#f6f6f7] ${subSelected.includes(s._id) ? "bg-[#f1f1f1]" : ""}`}>
                      <td className="px-4 py-3">{canInvoice && <input type="checkbox" checked={subSelected.includes(s._id)} onChange={() => toggleSub(s._id)} className={checkClass} />}</td>
                      <td className="px-4 py-3 font-medium text-admin-text">{s.invoiceNumber}</td>
                      <td className="px-4 py-3 text-admin-text">{s.planName}<br /><span className="text-[12px] capitalize text-admin-text-subdued">{s.interval}</span></td>
                      <td className="px-4 py-3 text-[12px] capitalize text-admin-text-secondary">{s.gateway === "manual" ? "Assigned by admin" : (s.gateway || "—")}</td>
                      <td className="px-4 py-3 text-[12px] text-admin-text-secondary">{fmtDate(s.startDate)} {s.endDate ? "– " + fmtDate(s.endDate) : ""}</td>
                      <td className="px-4 py-3 text-right font-semibold text-admin-text">{s.currency === "INR" ? "Rs." : s.currency + " "}{s.amount}</td>
                      <td className="px-4 py-3 text-center"><span className={`rounded-full px-2 py-0.5 text-[12px] font-medium ${statusColor(s.status)}`}>{s.status}</span></td>
                      <td className="whitespace-nowrap px-4 py-3 text-right">
                        {canInvoice ? (
                          <>
                            <button type="button" onClick={() => downloadSubInvoice(s._id)} className={`${linkBtn} mr-3`}><Download className="h-3.5 w-3.5" /> Download</button>
                            <button type="button" onClick={() => emailSubs([s._id])} className={linkBtn}><Mail className="h-3.5 w-3.5" /> Email</button>
                          </>
                        ) : <span className="text-[12px] text-admin-text-subdued">—</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border border-admin-border bg-white shadow-[0_1px_2px_rgba(16,24,40,0.06)]">
        <div className="flex items-center justify-between gap-2 border-b border-admin-border bg-[#f6f6f7] px-4 py-3">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-admin-text-secondary" />
            <h2 className="text-[13px] font-semibold text-admin-text">Order Invoices</h2>
          </div>
          {selected.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-[12px] text-admin-text-subdued">{selected.length} selected</span>
              <button type="button" onClick={emailSelected} disabled={sending} className={primaryBtn}>
                <Mail className="h-3.5 w-3.5" /> {sending ? "Sending..." : "Send Email"}
              </button>
              <button type="button" onClick={deleteSelected} disabled={deleting} className={dangerBtn}>
                <Trash2 className="h-3.5 w-3.5" /> {deleting ? "Deleting..." : "Delete"}
              </button>
              <button type="button" onClick={() => setSelected([])} className="text-[12px] text-admin-text-subdued hover:underline">Clear</button>
            </div>
          )}
        </div>
        {invoices.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-[13px] text-admin-text-secondary">No order invoices yet</p>
            <p className="mt-1 text-[12px] text-admin-text-subdued">Invoices are auto-created from orders. Go to Orders and create one first.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead className="border-b border-admin-border bg-[#f6f6f7]">
                <tr>
                  <th className="w-10 px-4 py-3"><input type="checkbox" checked={selected.length === invoices.length && invoices.length > 0} onChange={toggleAll} className={checkClass} /></th>
                  <th className="px-4 py-3 text-left font-medium text-admin-text-secondary">Invoice #</th>
                  <th className="px-4 py-3 text-left font-medium text-admin-text-secondary">Customer</th>
                  <th className="px-4 py-3 text-left font-medium text-admin-text-secondary">Items</th>
                  <th className="px-4 py-3 text-right font-medium text-admin-text-secondary">Total</th>
                  <th className="px-4 py-3 text-center font-medium text-admin-text-secondary">Status</th>
                  <th className="px-4 py-3 text-right font-medium text-admin-text-secondary">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-admin-border">
                {invoices.map(inv => (
                  <tr key={inv._id} className={`hover:bg-[#f6f6f7] ${selected.includes(inv._id) ? "bg-[#f1f1f1]" : ""}`}>
                    <td className="px-4 py-3"><input type="checkbox" checked={selected.includes(inv._id)} onChange={() => toggleOne(inv._id)} className={checkClass} /></td>
                    <td className="px-4 py-3 font-medium text-admin-text">{inv.invoiceNumber}</td>
                    <td className="px-4 py-3 text-admin-text">{inv.contact?.name || "—"}<br /><span className="text-[12px] text-admin-text-subdued">{inv.contact?.phone || ""}</span></td>
                    <td className="px-4 py-3 text-[12px] text-admin-text-secondary">{inv.items.map(i => i.name).join(", ") || "—"}</td>
                    <td className="px-4 py-3 text-right font-semibold text-admin-text">Rs.{inv.total}</td>
                    <td className="px-4 py-3 text-center"><span className={`rounded-full px-2 py-0.5 text-[12px] font-medium ${statusColor(inv.status)}`}>{inv.status}</span></td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      {inv.status !== "paid" && <button type="button" onClick={() => markPaid(inv._id)} className={`${linkBtn} mr-3`}>Mark Paid</button>}
                      <button type="button" onClick={() => downloadInvoicePdf(inv._id, inv.invoiceNumber)} className={`${linkBtn} mr-3`}><Download className="h-3.5 w-3.5" /> Download</button>
                      <button type="button" onClick={() => emailOne(inv._id)} className={linkBtn}><Mail className="h-3.5 w-3.5" /> Email</button>
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
