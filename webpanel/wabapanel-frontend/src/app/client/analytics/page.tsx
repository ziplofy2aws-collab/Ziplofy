'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Send, CheckCheck, Eye, AlertCircle, MessageSquare, Users, Phone, Megaphone, Wallet,
  TrendingUp, Download, Clock, Timer, BarChart3,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  AreaChart, Area, PieChart, Pie, Cell,
} from 'recharts';
import api from '@/lib/api';
import useBranding from '@/lib/useBranding';
import {
  adminContentColumnClass,
  dashboardChartCardShell,
} from '@/components/layout/dashboard-ui';
import {
  ShopifyPanel,
  ShopifySection,
  ShopifyStatCard,
} from '@/components/dashboard/ShopifyDashboard';

interface DashData {
  contacts: number;
  conversations: { total: number; active: number };
  messages: { sent: number; delivered: number; read: number; failed: number; total: number };
  messageChart: { _id: string; sent: number; received: number; total: number }[];
  campaigns?: { total: number; running: number; scheduled: number; completed: number; draft: number; paused: number; failed: number; sentTotal: number };
  templates?: { total: number; approved: number; pending: number; rejected: number };
  aiCalls?: { total: number; completed: number; failed: number; minutes: number };
  callChart?: { _id: string; count: number; seconds: number }[];
  contactChart?: { _id: string; count: number }[];
  newContacts?: number;
  spend?: number;
  unreadCount?: number;
  walletBalance?: number;
  hourlyActivity?: { hour: number; count: number }[];
  weekdayActivity?: { day: number; count: number }[];
  topCustomers?: { _id: string; name?: string; phone?: string; total: number; inbound: number; outbound: number; lastAt: string }[];
  campaignTable?: { _id: string; name: string; type: string; status: string; createdAt: string; stats?: { sent?: number; delivered?: number; read?: number; failed?: number; skipped?: number } }[];
  typeBreakdown?: { source: string; count: number }[];
  responseTime?: { avgMinutes: number; medianMinutes: number; samples: number };
}

const RANGES = [
  { value: 7, label: '7 Days' },
  { value: 30, label: '30 Days' },
  { value: 90, label: '90 Days' },
];

const PIE_COLORS = ['#10B981', '#F59E0B', '#3B82F6', '#8B5CF6', '#EF4444', '#6B7280', '#EC4899', '#14B8A6'];
const WEEKDAYS = ['', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const SOURCE_LABELS: Record<string, string> = {
  manual: 'Manual / Chat',
  template: 'Meta Template',
  preset: 'Preset (Inbox)',
  preset_campaign: 'Preset Campaign',
  campaign: 'Broadcast Campaign',
  drip: 'Drip Campaign',
  keyword_auto_reply: 'Keyword Auto-Reply',
  ai_auto_reply: 'AI Auto-Reply',
  ai_call: 'AI Call',
  ai_call_summary: 'AI Call Summary',
  ai_handoff: 'AI Handoff',
  preset_button_value: 'Button Auto-Reply',
  welcome: 'Welcome Message',
  out_of_office: 'Out of Office',
  automation: 'Automation',
};

const sourceLabel = (s: string) =>
  SOURCE_LABELS[s] || (s.startsWith('appointment') ? 'Appointment' : s.replace(/_/g, ' '));

const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
const fmtHour = (h: number) => `${((h % 12) || 12)}${h < 12 ? 'am' : 'pm'}`;
const fmtMins = (m: number) => (m >= 60 ? `${Math.floor(m / 60)}h ${Math.round(m % 60)}m` : `${m} min`);

const tooltipStyle = { borderRadius: 8, border: '1px solid #e3e3e3', fontSize: 12 };
const axisTick = { fill: '#616161' };
const selectClass =
  'rounded-lg border border-admin-border bg-white px-2.5 py-1.5 text-[13px] text-admin-text focus:outline-none focus:ring-1 focus:ring-admin-text-subdued';
const thClass = 'pb-2 text-left text-[11px] font-semibold uppercase tracking-wide text-admin-text-subdued';
const tdClass = 'py-2.5 text-[13px] text-admin-text';

function CampaignStatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    completed: 'bg-emerald-50 text-emerald-700 ring-emerald-600/15',
    running: 'bg-emerald-50 text-emerald-700 ring-emerald-600/15',
    failed: 'bg-red-50 text-red-700 ring-red-600/15',
    paused: 'bg-amber-50 text-amber-700 ring-amber-600/15',
    scheduled: 'bg-blue-50 text-blue-700 ring-blue-600/15',
    draft: 'bg-[#f6f6f7] text-admin-text-secondary ring-admin-border',
  };
  const cls = map[status] || 'bg-[#f6f6f7] text-admin-text-secondary ring-admin-border';
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${cls}`}>
      {status}
    </span>
  );
}

function ChartEmpty({ message }: { message: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center text-center">
      <MessageSquare className="mb-2 h-8 w-8 text-admin-border" />
      <p className="text-[13px] text-admin-text-subdued">{message}</p>
    </div>
  );
}

export default function AnalyticsPage() {
  const router = useRouter();
  const brand = useBranding();
  const [data, setData] = useState<DashData | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);
  const [campStatus, setCampStatus] = useState('all');
  const [campType, setCampType] = useState('all');
  const [showAllCamps, setShowAllCamps] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/dashboard/client?days=${days}`);
      setData(res.data.data);
    } catch { /* empty */ }
    setLoading(false);
  }, [days]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const chartData = (data?.messageChart || []).map((d) => ({
    date: fmtDate(d._id), sent: d.sent, received: d.received, total: d.total,
  }));
  const contactData = (data?.contactChart || []).map((d) => ({ date: fmtDate(d._id), contacts: d.count }));
  const callData = (data?.callChart || []).map((d) => ({
    date: fmtDate(d._id), calls: d.count, minutes: Math.round((d.seconds || 0) / 60),
  }));

  const hourlyData = Array.from({ length: 24 }, (_, h) => ({
    hour: fmtHour(h),
    replies: (data?.hourlyActivity || []).find((x) => x.hour === h)?.count || 0,
  }));
  const weekdayData = [1, 2, 3, 4, 5, 6, 7].map((d) => ({
    day: WEEKDAYS[d],
    replies: (data?.weekdayActivity || []).find((x) => x.day === d)?.count || 0,
  }));
  const bestHour = (data?.hourlyActivity || []).slice().sort((a, b) => b.count - a.count)[0];
  const bestDay = (data?.weekdayActivity || []).slice().sort((a, b) => b.count - a.count)[0];

  const typeData = (data?.typeBreakdown || []).map((t) => ({ name: sourceLabel(t.source), value: t.count }));

  const totalMessages = data?.messages?.total || 0;
  const totalSent = data?.messages?.sent || 0;
  const totalDelivered = data?.messages?.delivered || 0;
  const totalRead = data?.messages?.read || 0;
  const totalFailed = data?.messages?.failed || 0;
  const outbound = totalSent + totalDelivered + totalRead + totalFailed;

  const deliveryRate = outbound > 0 ? (((totalDelivered + totalRead) / outbound) * 100).toFixed(1) : '0';
  const readRate = outbound > 0 ? ((totalRead / outbound) * 100).toFixed(1) : '0';
  const failRate = outbound > 0 ? ((totalFailed / outbound) * 100).toFixed(1) : '0';

  const c = data?.campaigns;
  const campaignPie = [
    { name: 'Completed', value: c?.completed || 0 },
    { name: 'Draft', value: c?.draft || 0 },
    { name: 'Running', value: c?.running || 0 },
    { name: 'Scheduled', value: c?.scheduled || 0 },
    { name: 'Failed', value: c?.failed || 0 },
    { name: 'Paused', value: c?.paused || 0 },
  ].filter((d) => d.value > 0);

  const allCamps = data?.campaignTable || [];
  const campTypes = Array.from(new Set(allCamps.map((cp) => cp.type).filter(Boolean)));
  const campStatuses = Array.from(new Set(allCamps.map((cp) => cp.status).filter(Boolean)));
  const filteredCamps = allCamps.filter(
    (cp) => (campStatus === 'all' || cp.status === campStatus) && (campType === 'all' || cp.type === campType),
  );
  const visibleCamps = showAllCamps ? filteredCamps : filteredCamps.slice(0, 10);

  const exportCSV = () => {
    if (!data) return;
    const lines: string[] = [];
    const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    lines.push(`${brand.name} Analytics Export,Last ${days} days,Generated ${new Date().toLocaleString('en-IN')}`);
    lines.push('');
    lines.push('SUMMARY');
    lines.push(`Total Messages,${totalMessages}`);
    lines.push(`Delivered,${totalDelivered},Delivery Rate,${deliveryRate}%`);
    lines.push(`Read,${totalRead},Read Rate,${readRate}%`);
    lines.push(`Failed,${totalFailed},Fail Rate,${failRate}%`);
    lines.push(`Contacts,${data.contacts},New Contacts,${data.newContacts || 0}`);
    lines.push(`Conversations,${data.conversations?.total || 0},Active,${data.conversations?.active || 0}`);
    lines.push(`AI Calls,${data.aiCalls?.total || 0},Minutes,${data.aiCalls?.minutes || 0}`);
    lines.push(`Spend,₹${(data.spend || 0).toFixed(2)},Wallet Balance,₹${(data.walletBalance || 0).toFixed(2)}`);
    lines.push(`Avg Response Time (min),${data.responseTime?.avgMinutes || 0},Median (min),${data.responseTime?.medianMinutes || 0}`);
    lines.push('');
    lines.push('DAILY MESSAGES');
    lines.push('Date,Sent,Received,Total');
    (data.messageChart || []).forEach((d) => lines.push(`${d._id},${d.sent},${d.received},${d.total}`));
    lines.push('');
    lines.push('MESSAGE TYPES (OUTBOUND)');
    lines.push('Type,Count');
    (data.typeBreakdown || []).forEach((t) => lines.push(`${esc(sourceLabel(t.source))},${t.count}`));
    lines.push('');
    lines.push('TOP CUSTOMERS');
    lines.push('Name,Phone,Total Messages,Received,Sent,Last Activity');
    (data.topCustomers || []).forEach((t) =>
      lines.push(`${esc(t.name)},${esc(t.phone)},${t.total},${t.inbound},${t.outbound},${new Date(t.lastAt).toLocaleString('en-IN')}`),
    );
    lines.push('');
    lines.push('CAMPAIGNS');
    lines.push('Name,Type,Status,Sent,Delivered,Read,Failed,Skipped,Created');
    (data.campaignTable || []).forEach((cp) =>
      lines.push(`${esc(cp.name)},${cp.type},${cp.status},${cp.stats?.sent || 0},${cp.stats?.delivered || 0},${cp.stats?.read || 0},${cp.stats?.failed || 0},${cp.stats?.skipped || 0},${new Date(cp.createdAt).toLocaleDateString('en-IN')}`),
    );
    const blob = new Blob(['\uFEFF' + lines.join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${days}days-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className={`${adminContentColumnClass} space-y-6`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-2">
            <div className="h-6 w-36 animate-pulse rounded bg-[#e8e8e8]" />
            <div className="h-4 w-56 animate-pulse rounded bg-[#f1f1f1]" />
          </div>
          <div className="h-9 w-64 animate-pulse rounded-lg bg-[#f1f1f1]" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="min-h-[108px] animate-pulse rounded-xl border border-admin-border bg-white shadow-sm" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="min-h-[320px] animate-pulse rounded-xl border border-admin-border bg-white shadow-sm" />
          <div className="min-h-[320px] animate-pulse rounded-xl border border-admin-border bg-white shadow-sm" />
        </div>
      </div>
    );
  }

  return (
    <div className={`${adminContentColumnClass} space-y-8`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 shrink-0 text-admin-text-secondary" aria-hidden />
            <h1 className="text-[20px] font-semibold tracking-tight text-admin-text">Analytics</h1>
          </div>
          <p className="mt-1 text-[13px] text-admin-text-secondary">
            Performance overview for the last {days} days
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-lg border border-admin-border bg-[#f1f1f1] p-0.5">
            {RANGES.map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => setDays(r.value)}
                className={`rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors ${
                  days === r.value
                    ? 'bg-white text-admin-text shadow-sm'
                    : 'text-admin-text-secondary hover:text-admin-text'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={exportCSV}
            className="inline-flex items-center gap-1.5 rounded-lg bg-admin-text px-3 py-1.5 text-[13px] font-semibold text-white transition-colors hover:bg-[#1a1a1a]"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-8">
        <ShopifySection title="Message performance" icon={<Send />} accent="emerald">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <ShopifyStatCard title="Total messages" value={totalMessages.toLocaleString()} icon={<Send />} href="/client/chat" subtitle={`Last ${days} days`} color="emerald" />
            <ShopifyStatCard title="Delivery rate" value={`${deliveryRate}%`} icon={<CheckCheck />} href="/client/chat" subtitle={`${(totalDelivered + totalRead).toLocaleString()} delivered`} color="blue" />
            <ShopifyStatCard title="Read rate" value={`${readRate}%`} icon={<Eye />} href="/client/chat" subtitle={`${totalRead.toLocaleString()} read`} color="purple" />
            <ShopifyStatCard title="Fail rate" value={`${failRate}%`} icon={<AlertCircle />} href="/client/chat" subtitle={`${totalFailed.toLocaleString()} failed`} color="red" />
          </div>
        </ShopifySection>

        <ShopifySection title="Business metrics" icon={<Users />} accent="blue">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <ShopifyStatCard title="Contacts" value={(data?.contacts || 0).toLocaleString()} icon={<Users />} href="/client/contacts" subtitle={`+${data?.newContacts || 0} new`} color="blue" />
            <ShopifyStatCard title="Conversations" value={(data?.conversations?.total || 0).toLocaleString()} icon={<MessageSquare />} href="/client/chat" subtitle={`${data?.conversations?.active || 0} active`} color="emerald" />
            <ShopifyStatCard title="AI calls" value={(data?.aiCalls?.total || 0).toLocaleString()} icon={<Phone />} href="/client/ai-calling" subtitle={`${data?.aiCalls?.minutes || 0} minutes`} color="purple" />
            <ShopifyStatCard title="Spend" value={`₹${(data?.spend || 0).toFixed(2)}`} icon={<Wallet />} href="/client/transactions" subtitle={`Last ${days} days`} color="orange" />
          </div>
        </ShopifySection>

        <ShopifySection title="Response & timing" icon={<Timer />} accent="orange">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <ShopifyStatCard title="Avg response time" value={fmtMins(data?.responseTime?.avgMinutes || 0)} icon={<Timer />} href="/client/chat" color="emerald" />
            <ShopifyStatCard title="Median response time" value={fmtMins(data?.responseTime?.medianMinutes || 0)} icon={<Clock />} href="/client/chat" color="blue" />
            <ShopifyStatCard
              title="Best time to send"
              value={bestHour ? `${fmtHour(bestHour.hour)}${bestDay ? ` · ${WEEKDAYS[bestDay.day]}` : ''}` : '—'}
              icon={<TrendingUp />}
              color="purple"
            />
          </div>
        </ShopifySection>

        <ShopifySection title="Message trends" icon={<BarChart3 />} accent="emerald">
          {chartData.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div className={dashboardChartCardShell}>
                <h3 className="text-[13px] font-semibold text-admin-text">Message volume</h3>
                <p className="mt-0.5 text-[12px] text-admin-text-secondary">Sent vs received over time</p>
                <div className="mt-4 h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ebebeb" />
                      <XAxis dataKey="date" fontSize={11} tick={axisTick} />
                      <YAxis fontSize={11} tick={axisTick} />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Area type="monotone" dataKey="sent" stroke="#10B981" fill="url(#colorSent)" name="Sent" />
                      <Area type="monotone" dataKey="received" stroke="#3B82F6" fill="transparent" name="Received" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className={dashboardChartCardShell}>
                <h3 className="text-[13px] font-semibold text-admin-text">Daily breakdown</h3>
                <p className="mt-0.5 text-[12px] text-admin-text-secondary">Sent and received by day</p>
                <div className="mt-4 h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ebebeb" />
                      <XAxis dataKey="date" fontSize={11} tick={axisTick} />
                      <YAxis fontSize={11} tick={axisTick} />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Bar dataKey="sent" fill="#10B981" name="Sent" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="received" fill="#3B82F6" name="Received" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          ) : (
            <div className={dashboardChartCardShell}>
              <ChartEmpty message="No message data in this period." />
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className={dashboardChartCardShell}>
              <h3 className="text-[13px] font-semibold text-admin-text">Customer replies by hour (IST)</h3>
              <p className="mt-0.5 text-[12px] text-admin-text-secondary">Hours with the most replies — best time to send</p>
              <div className="mt-4 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={hourlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ebebeb" />
                    <XAxis dataKey="hour" fontSize={10} interval={1} tick={axisTick} />
                    <YAxis fontSize={11} allowDecimals={false} tick={axisTick} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="replies" fill="#8B5CF6" name="Replies" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className={dashboardChartCardShell}>
              <h3 className="text-[13px] font-semibold text-admin-text">Customer replies by day</h3>
              <p className="mt-0.5 text-[12px] text-admin-text-secondary">Which days customers are most active</p>
              <div className="mt-4 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weekdayData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ebebeb" />
                    <XAxis dataKey="day" fontSize={11} tick={axisTick} />
                    <YAxis fontSize={11} allowDecimals={false} tick={axisTick} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="replies" fill="#10B981" name="Replies" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </ShopifySection>

        <ShopifySection title="Customers & mix" icon={<Users />} accent="purple">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className={dashboardChartCardShell}>
              <h3 className="text-[13px] font-semibold text-admin-text">Outbound message types</h3>
              <div className="mt-4 h-80">
                {typeData.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={typeData} dataKey="value" nameKey="name" cx="50%" cy="45%" outerRadius={90} label>
                        {typeData.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={tooltipStyle} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <ChartEmpty message="No outbound messages yet" />
                )}
              </div>
            </div>
            <ShopifyPanel title="Top customers" actionLabel="Open inbox" actionHref="/client/chat" accent="blue">
              <div className="overflow-hidden rounded-lg border border-admin-border">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-admin-border bg-[#f7f7f7]">
                        <th className={`${thClass} px-3 pt-2.5`}>Customer</th>
                        <th className={`${thClass} px-3 pt-2.5 text-right`}>Total</th>
                        <th className={`${thClass} px-3 pt-2.5 text-right`}>Received</th>
                        <th className={`${thClass} px-3 pt-2.5 text-right`}>Sent</th>
                        <th className={`${thClass} px-3 pt-2.5 text-right`}>Last active</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(data?.topCustomers || []).length ? (
                        (data?.topCustomers || []).map((t) => (
                          <tr
                            key={t._id}
                            onClick={() => router.push('/client/chat')}
                            className="cursor-pointer border-b border-admin-divider last:border-0 hover:bg-[#f6f6f7]"
                          >
                            <td className={`${tdClass} px-3`}>
                              <p className="font-medium">{t.name || t.phone}</p>
                              <p className="text-[12px] text-admin-text-subdued">{t.phone}</p>
                            </td>
                            <td className={`${tdClass} px-3 text-right font-semibold tabular-nums`}>{t.total}</td>
                            <td className={`${tdClass} px-3 text-right tabular-nums text-blue-600`}>{t.inbound}</td>
                            <td className={`${tdClass} px-3 text-right tabular-nums text-admin-text`}>{t.outbound}</td>
                            <td className={`${tdClass} px-3 text-right text-[12px] text-admin-text-subdued`}>{fmtDate(t.lastAt)}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="px-3 py-8 text-center text-[13px] text-admin-text-subdued">No data yet</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </ShopifyPanel>
          </div>
        </ShopifySection>

        <ShopifySection title="Campaigns" icon={<Megaphone />} accent="purple">
          <ShopifyPanel title="Campaign performance" actionLabel="View broadcasts" actionHref="/client/broadcasts" accent="purple">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <select
                value={campStatus}
                onChange={(e) => { setCampStatus(e.target.value); setShowAllCamps(false); }}
                className={selectClass}
              >
                <option value="all">All status</option>
                {campStatuses.map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
              <select
                value={campType}
                onChange={(e) => { setCampType(e.target.value); setShowAllCamps(false); }}
                className={selectClass}
              >
                <option value="all">All types</option>
                {campTypes.map((tp) => (
                  <option key={tp} value={tp}>{tp}</option>
                ))}
              </select>
            </div>
            <div className="overflow-hidden rounded-lg border border-admin-border">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-admin-border bg-[#f7f7f7]">
                      <th className={`${thClass} px-3 pt-2.5`}>Campaign</th>
                      <th className={`${thClass} px-3 pt-2.5`}>Type</th>
                      <th className={`${thClass} px-3 pt-2.5`}>Status</th>
                      <th className={`${thClass} px-3 pt-2.5 text-right`}>Sent</th>
                      <th className={`${thClass} px-3 pt-2.5 text-right`}>Delivered</th>
                      <th className={`${thClass} px-3 pt-2.5 text-right`}>Read</th>
                      <th className={`${thClass} px-3 pt-2.5 text-right`}>Failed</th>
                      <th className={`${thClass} px-3 pt-2.5 text-right`}>Read rate</th>
                      <th className={`${thClass} px-3 pt-2.5 text-right`}>Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleCamps.length ? visibleCamps.map((cp) => {
                      const sent = cp.stats?.sent || 0;
                      const read = cp.stats?.read || 0;
                      const rr = sent > 0 ? `${((read / sent) * 100).toFixed(0)}%` : '—';
                      return (
                        <tr
                          key={cp._id}
                          onClick={() => router.push(cp.type === 'preset' ? '/client/save-money/campaigns' : '/client/broadcasts')}
                          className="cursor-pointer border-b border-admin-divider last:border-0 hover:bg-[#f6f6f7]"
                        >
                          <td className={`${tdClass} px-3 font-medium`}>{cp.name}</td>
                          <td className={`${tdClass} px-3 text-admin-text-secondary`}>{cp.type}</td>
                          <td className={`${tdClass} px-3`}><CampaignStatusPill status={cp.status} /></td>
                          <td className={`${tdClass} px-3 text-right tabular-nums`}>{sent}</td>
                          <td className={`${tdClass} px-3 text-right tabular-nums`}>{cp.stats?.delivered || 0}</td>
                          <td className={`${tdClass} px-3 text-right tabular-nums`}>{read}</td>
                          <td className={`${tdClass} px-3 text-right tabular-nums text-red-500`}>{cp.stats?.failed || 0}</td>
                          <td className={`${tdClass} px-3 text-right tabular-nums`}>{rr}</td>
                          <td className={`${tdClass} px-3 text-right text-[12px] text-admin-text-subdued`}>{fmtDate(cp.createdAt)}</td>
                        </tr>
                      );
                    }) : (
                      <tr>
                        <td colSpan={9} className="px-3 py-8 text-center text-[13px] text-admin-text-subdued">No campaigns found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            {filteredCamps.length > 10 && (
              <div className="mt-3 text-center">
                <button
                  type="button"
                  onClick={() => setShowAllCamps((v) => !v)}
                  className="text-[13px] font-semibold text-[#005bd3] hover:underline"
                >
                  {showAllCamps ? 'Show less' : `Show all (${filteredCamps.length})`}
                </button>
              </div>
            )}
          </ShopifyPanel>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className={dashboardChartCardShell}>
              <h3 className="text-[13px] font-semibold text-admin-text">Contact growth</h3>
              <div className="mt-4 h-64">
                {contactData.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={contactData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ebebeb" />
                      <XAxis dataKey="date" fontSize={11} tick={axisTick} />
                      <YAxis fontSize={11} allowDecimals={false} tick={axisTick} />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Area type="monotone" dataKey="contacts" stroke="#8B5CF6" fill="#EDE9FE" name="New contacts" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <ChartEmpty message="No new contacts in this period" />
                )}
              </div>
            </div>
            <div className={dashboardChartCardShell}>
              <h3 className="text-[13px] font-semibold text-admin-text">AI calls</h3>
              <div className="mt-4 h-64">
                {callData.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={callData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ebebeb" />
                      <XAxis dataKey="date" fontSize={11} tick={axisTick} />
                      <YAxis fontSize={11} allowDecimals={false} tick={axisTick} />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Bar dataKey="calls" fill="#3B82F6" name="Calls" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="minutes" fill="#10B981" name="Minutes" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <ChartEmpty message="No AI calls in this period" />
                )}
              </div>
            </div>
            <div className={dashboardChartCardShell}>
              <h3 className="text-[13px] font-semibold text-admin-text">Campaigns by status</h3>
              <div className="mt-4 h-64">
                {campaignPie.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={campaignPie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} label>
                        {campaignPie.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={tooltipStyle} />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <ChartEmpty message="No campaigns yet" />
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <ShopifyStatCard title="Campaign messages sent" value={c?.sentTotal || 0} icon={<Megaphone />} href="/client/broadcasts" color="purple" />
            <ShopifyStatCard title="Total campaigns" value={c?.total || 0} icon={<TrendingUp />} href="/client/broadcasts" color="emerald" />
            <ShopifyStatCard title="AI calls completed" value={data?.aiCalls?.completed || 0} icon={<Phone />} href="/client/ai-calling" color="blue" />
            <ShopifyStatCard title="Wallet balance" value={`₹${(data?.walletBalance || 0).toFixed(2)}`} icon={<Wallet />} href="/client/wallet" color="orange" />
          </div>
        </ShopifySection>
      </div>
    </div>
  );
}
