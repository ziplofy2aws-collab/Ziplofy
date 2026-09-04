'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, MessageSquare, Clock, AlertCircle, RefreshCw, Copy, X } from 'lucide-react';
import { followupApi } from '@/lib/api';
import toast from 'react-hot-toast';
import { adminContentColumnClass, dashboardCardShell } from '@/components/layout/dashboard-ui';

const primaryBtn =
  'inline-flex items-center justify-center gap-1.5 rounded-lg bg-admin-text px-3 py-1.5 text-[13px] font-semibold text-white transition-colors hover:bg-[#1a1a1a] disabled:opacity-50';
const secondaryBtn =
  'inline-flex items-center justify-center gap-1.5 rounded-lg border border-admin-border bg-white px-3 py-1.5 text-[13px] font-medium text-admin-text transition-colors hover:bg-[#f6f6f7]';

interface FollowupItem {
  conversationId: string;
  contact: { _id: string; name?: string; phone?: string };
  reason: 'unanswered' | 'window_closing' | 'gone_quiet';
  lastMessage: { text?: string; direction?: string; timestamp?: string };
  ageHrs: number;
  windowOpen: boolean;
  windowLeftHrs: number;
}

const reasonMeta: Record<string, { label: string; cls: string; desc: string }> = {
  unanswered: { label: 'Needs Reply', cls: 'bg-red-100 text-red-700', desc: 'Customer messaged, no reply sent yet' },
  window_closing: { label: 'Window Closing', cls: 'bg-amber-100 text-amber-700', desc: 'Free 24-hr window expires soon' },
  gone_quiet: { label: 'Gone Quiet', cls: 'bg-blue-100 text-blue-700', desc: 'No customer reply for 3+ days' },
};

const ageLabel = (hrs: number) => hrs < 24 ? `${hrs}h ago` : `${Math.round(hrs / 24)}d ago`;

export default function FollowupsPage() {
  const router = useRouter();
  const [items, setItems] = useState<FollowupItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [drafting, setDrafting] = useState<string | null>(null);
  const [draft, setDraft] = useState<{ id: string; text: string } | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const r = await followupApi.list();
      setItems(r.data.data || []);
    } catch { toast.error('Failed to load follow-ups'); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleDraft = async (id: string) => {
    setDrafting(id);
    try {
      const r = await followupApi.draft(id);
      setDraft({ id, text: r.data.data.draft });
    } catch (e) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'AI draft failed');
    }
    setDrafting(null);
  };

  const filtered = filter === 'all' ? items : items.filter(i => i.reason === filter);
  const counts = {
    all: items.length,
    unanswered: items.filter(i => i.reason === 'unanswered').length,
    window_closing: items.filter(i => i.reason === 'window_closing').length,
    gone_quiet: items.filter(i => i.reason === 'gone_quiet').length,
  };

  return (
    <div className={`${adminContentColumnClass} space-y-4`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 shrink-0 text-admin-text-secondary" aria-hidden />
            <h1 className="text-[20px] font-semibold tracking-tight text-admin-text">AI Follow-ups</h1>
          </div>
          <p className="mt-1 text-[13px] text-admin-text-secondary">
            Leads that need a follow-up right now — with AI-drafted messages ready to send
          </p>
        </div>
        <button type="button" onClick={load} className={secondaryBtn}>
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {([['all', 'All'], ['unanswered', 'Needs Reply'], ['window_closing', 'Window Closing'], ['gone_quiet', 'Gone Quiet']] as const).map(([v, l]) => (
          <button
            key={v}
            type="button"
            onClick={() => setFilter(v)}
            className={`rounded-full border px-3 py-1.5 text-[13px] ${
              filter === v
                ? 'border-admin-text bg-admin-text text-white'
                : 'border-admin-border bg-white text-admin-text hover:bg-[#f6f6f7]'
            }`}
          >
            {l} ({counts[v as keyof typeof counts]})
          </button>
        ))}
      </div>

      {loading ? (
        <p className="py-16 text-center text-[13px] text-admin-text-subdued">Loading…</p>
      ) : filtered.length === 0 ? (
        <div className={`${dashboardCardShell} py-16 text-center`}>
          <Sparkles className="mx-auto mb-2 h-10 w-10 text-admin-text-subdued" />
          <p className="text-[13px] text-admin-text-secondary">All caught up — no follow-ups needed right now</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(item => (
            <div key={item.conversationId} className={dashboardCardShell}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-[13px] font-semibold text-admin-text">{item.contact?.name || item.contact?.phone || 'Unknown'}</p>
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${reasonMeta[item.reason].cls}`}>{reasonMeta[item.reason].label}</span>
                    <span className="flex items-center gap-1 text-[12px] text-admin-text-subdued"><Clock className="h-3 w-3" />{ageLabel(item.ageHrs)}</span>
                    {item.reason === 'window_closing' && (
                      <span className="flex items-center gap-1 text-[12px] text-amber-600"><AlertCircle className="h-3 w-3" />{item.windowLeftHrs}h left</span>
                    )}
                  </div>
                  <p className="mt-0.5 text-[12px] text-admin-text-subdued">{reasonMeta[item.reason].desc}</p>
                  <p className="mt-1 max-w-xl truncate text-[13px] text-admin-text-secondary">
                    <span className="text-admin-text-subdued">{item.lastMessage?.direction === 'inbound' ? 'Customer: ' : 'You: '}</span>
                    {item.lastMessage?.text || '[media]'}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    onClick={() => handleDraft(item.conversationId)}
                    disabled={drafting === item.conversationId}
                    className={primaryBtn}
                  >
                    <Sparkles className="h-4 w-4" /> {drafting === item.conversationId ? 'Drafting…' : 'AI Draft'}
                  </button>
                  <button
                    type="button"
                    onClick={() => router.push(`/client/chat?conv=${item.conversationId}`)}
                    className={secondaryBtn}
                  >
                    <MessageSquare className="h-4 w-4" /> Open Chat
                  </button>
                </div>
              </div>
              {draft?.id === item.conversationId && (
                <div className="mt-3 rounded-lg border border-admin-border bg-[#f6f6f7] p-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="flex-1 whitespace-pre-wrap text-[13px] text-admin-text">{draft.text}</p>
                    <button type="button" onClick={() => setDraft(null)} className="rounded-lg p-1 text-admin-text-subdued hover:bg-white">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => { navigator.clipboard.writeText(draft.text); toast.success('Copied'); }}
                      className={secondaryBtn}
                    >
                      <Copy className="h-3 w-3" /> Copy
                    </button>
                    <button
                      type="button"
                      onClick={() => router.push(`/client/chat?conv=${item.conversationId}&draft=${encodeURIComponent(draft.text)}`)}
                      className={primaryBtn}
                    >
                      Use in Chat
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
