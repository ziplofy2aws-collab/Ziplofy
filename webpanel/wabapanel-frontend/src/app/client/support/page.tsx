'use client';
import React, { useState, useEffect } from 'react';
import { LifeBuoy, Plus, Send, X } from 'lucide-react';
import { platformApi } from '@/lib/api';
import toast from 'react-hot-toast';
import { adminContentColumnClass } from '@/components/layout/dashboard-ui';

interface TMsg { sender: string; senderName: string; text: string; at: string; }
interface Ticket {
  _id: string;
  ticketNumber: string;
  subject: string;
  category: string;
  priority: string;
  status: string;
  messages: TMsg[];
  createdAt: string;
  updatedAt: string;
}

const primaryBtn =
  'inline-flex items-center gap-1.5 rounded-lg bg-admin-text px-3 py-1.5 text-[13px] font-semibold text-white transition-colors hover:bg-[#1a1a1a] disabled:opacity-50';
const secondaryBtn =
  'inline-flex items-center gap-1.5 rounded-lg border border-admin-border bg-white px-3 py-1.5 text-[13px] font-medium text-admin-text transition-colors hover:bg-[#f6f6f7] disabled:opacity-50';
const fieldClass =
  'w-full rounded-lg border border-admin-border bg-white px-3 py-2 text-[13px] text-admin-text placeholder:text-admin-text-subdued focus:outline-none focus:ring-2 focus:ring-[#005bd3]/30';
const labelClass = 'mb-1 block text-[12px] font-medium text-admin-text-secondary';

const statusColor: Record<string, string> = {
  open: 'bg-blue-50 text-blue-700 ring-blue-600/15',
  awaiting_reply: 'bg-amber-50 text-amber-700 ring-amber-600/15',
  answered: 'bg-emerald-50 text-emerald-700 ring-emerald-600/15',
  closed: 'bg-[#f6f6f7] text-admin-text-secondary ring-admin-border',
};
const statusLabel: Record<string, string> = {
  open: 'Open',
  awaiting_reply: 'Awaiting reply',
  answered: 'Answered',
  closed: 'Closed',
};

function StatusPill({ status }: { status: string }) {
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${statusColor[status] || statusColor.closed}`}>
      {statusLabel[status] || status}
    </span>
  );
}

export default function SupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<Ticket | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ subject: '', category: 'other', priority: 'medium', message: '' });
  const [reply, setReply] = useState('');
  const [busy, setBusy] = useState(false);

  const load = () => platformApi.myTickets().then(r => {
    const data = r.data.data || [];
    setTickets(data);
    setActive(a => (a ? data.find((t: Ticket) => t._id === a._id) || null : null));
  }).catch(() => {}).finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!form.subject.trim() || !form.message.trim()) {
      toast.error('Subject and message are required');
      return;
    }
    setBusy(true);
    try {
      const r = await platformApi.createTicket(form);
      toast.success(r.data.message || 'Ticket created');
      setShowForm(false);
      setForm({ subject: '', category: 'other', priority: 'medium', message: '' });
      load();
      setActive(r.data.data);
    } catch (e: unknown) {
      toast.error((e as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed');
    } finally {
      setBusy(false);
    }
  };

  const sendReply = async () => {
    if (!active || !reply.trim()) return;
    setBusy(true);
    try {
      const r = await platformApi.replyTicket(active._id, reply.trim());
      setActive(r.data.data);
      setReply('');
      load();
    } catch {
      toast.error('Failed to send reply');
    } finally {
      setBusy(false);
    }
  };

  const closeTicket = async () => {
    if (!active) return;
    try {
      const r = await platformApi.closeTicket(active._id);
      setActive(r.data.data);
      load();
      toast.success('Ticket closed');
    } catch {
      toast.error('Failed');
    }
  };

  const reopenTicket = async () => {
    if (!active) return;
    try {
      const r = await platformApi.reopenTicket(active._id);
      setActive(r.data.data);
      load();
      toast.success('Ticket reopened');
    } catch {
      toast.error('Failed');
    }
  };

  return (
    <div className={`${adminContentColumnClass} space-y-4`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <LifeBuoy className="h-5 w-5 shrink-0 text-admin-text-secondary" aria-hidden />
            <h1 className="text-[20px] font-semibold tracking-tight text-admin-text">Support</h1>
          </div>
          <p className="mt-1 text-[13px] text-admin-text-secondary">
            Raise a ticket and our team will reply here
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className={primaryBtn}
        >
          <Plus className="h-4 w-4" /> New ticket
        </button>
      </div>

      {showForm && (
        <div className="rounded-xl border border-admin-border bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.06),0_1px_3px_rgba(16,24,40,0.04)] sm:p-5">
          <div className="mb-4 flex items-center justify-between gap-2">
            <h2 className="text-[15px] font-semibold text-admin-text">Create support ticket</h2>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-lg p-1.5 text-admin-text-subdued hover:bg-[#f6f6f7] hover:text-admin-text"
              aria-label="Close form"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="md:col-span-1">
              <label className={labelClass}>Subject *</label>
              <input
                value={form.subject}
                onChange={e => setForm({ ...form, subject: e.target.value })}
                placeholder="Brief summary of your issue"
                className={fieldClass}
              />
            </div>
            <div>
              <label className={labelClass}>Category</label>
              <select
                value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })}
                className={fieldClass}
              >
                <option value="billing">Billing</option>
                <option value="technical">Technical</option>
                <option value="feature_request">Feature request</option>
                <option value="account">Account</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Priority</label>
              <select
                value={form.priority}
                onChange={e => setForm({ ...form, priority: e.target.value })}
                className={fieldClass}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
          <div className="mt-4">
            <label className={labelClass}>Message *</label>
            <textarea
              value={form.message}
              onChange={e => setForm({ ...form, message: e.target.value })}
              rows={4}
              placeholder="Describe your issue in detail..."
              className={`${fieldClass} resize-y`}
            />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" onClick={create} disabled={busy} className={primaryBtn}>
              {busy ? 'Creating…' : 'Submit ticket'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className={secondaryBtn}>
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="max-h-[65vh] overflow-hidden overflow-y-auto rounded-xl border border-admin-border bg-white shadow-[0_1px_2px_rgba(16,24,40,0.06)] lg:col-span-1">
          {loading ? (
            <div className="px-4 py-10 text-center text-[13px] text-admin-text-subdued">Loading…</div>
          ) : tickets.length === 0 ? (
            <div className="px-4 py-10 text-center">
              <LifeBuoy className="mx-auto mb-2 h-8 w-8 text-admin-border" />
              <p className="text-[13px] text-admin-text-secondary">No tickets yet</p>
              <button type="button" className={`${primaryBtn} mt-3`} onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4" /> New ticket
              </button>
            </div>
          ) : (
            tickets.map(t => (
              <button
                key={t._id}
                type="button"
                onClick={() => setActive(t)}
                className={`w-full border-b border-admin-divider p-3 text-left transition-colors last:border-0 hover:bg-[#f6f6f7] ${
                  active?._id === t._id ? 'bg-[#f1f1f1]' : ''
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[11px] text-admin-text-subdued">{t.ticketNumber}</span>
                  <StatusPill status={t.status} />
                </div>
                <p className="mt-1 truncate text-[13px] font-medium text-admin-text">{t.subject}</p>
                <p className="mt-0.5 text-[12px] text-admin-text-subdued">
                  {new Date(t.updatedAt).toLocaleString()}
                </p>
              </button>
            ))
          )}
        </div>

        <div className="flex max-h-[65vh] flex-col overflow-hidden rounded-xl border border-admin-border bg-white shadow-[0_1px_2px_rgba(16,24,40,0.06)] lg:col-span-2">
          {!active ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 py-16 text-center">
              <LifeBuoy className="h-9 w-9 text-admin-border" />
              <p className="text-[13px] text-admin-text-secondary">Select a ticket to view the conversation</p>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-admin-border px-4 py-3">
                <div className="min-w-0">
                  <h2 className="truncate text-[14px] font-semibold text-admin-text">{active.subject}</h2>
                  <p className="text-[12px] text-admin-text-secondary">
                    {active.ticketNumber} · {active.category.replace(/_/g, ' ')} · {active.priority}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusPill status={active.status} />
                  {active.status !== 'closed' && (
                    <button type="button" onClick={closeTicket} className={secondaryBtn}>
                      Close ticket
                    </button>
                  )}
                  {active.status === 'closed' && (
                    <button type="button" onClick={reopenTicket} className={primaryBtn}>
                      Reopen ticket
                    </button>
                  )}
                </div>
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto bg-[#f1f1f1] p-4">
                {active.messages.map((m, i) => (
                  <div
                    key={i}
                    className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-[13px] shadow-sm ${
                      m.sender === 'user'
                        ? 'ml-auto rounded-br-sm bg-admin-text text-white'
                        : 'rounded-bl-sm border border-admin-border bg-white text-admin-text'
                    }`}
                  >
                    <p className="whitespace-pre-wrap leading-relaxed">{m.text}</p>
                    <p
                      className={`mt-1 text-[10px] ${
                        m.sender === 'user' ? 'text-white/70' : 'text-admin-text-subdued'
                      }`}
                    >
                      {m.sender === 'admin' ? 'Support team' : m.senderName} ·{' '}
                      {new Date(m.at).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>

              {active.status !== 'closed' && (
                <div className="flex gap-2 border-t border-admin-border bg-white p-3">
                  <textarea
                    value={reply}
                    onChange={e => setReply(e.target.value)}
                    rows={2}
                    placeholder="Type your reply…"
                    className={`${fieldClass} flex-1 resize-none`}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendReply();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={sendReply}
                    disabled={busy || !reply.trim()}
                    className={`${primaryBtn} self-end !px-3 !py-2.5`}
                    title="Send reply"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
