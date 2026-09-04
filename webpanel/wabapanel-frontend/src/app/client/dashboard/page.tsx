'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  MessageSquare, Send, CheckCheck, Eye, AlertCircle, Users, WifiOff, Wallet,
  Megaphone, LayoutTemplate, Phone, Calendar, ShoppingBag, Zap, Clock, TrendingUp, BellRing,
} from 'lucide-react';
import Badge from '@/components/ui/Badge';
import { dashboardApi } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { displayPersonName } from '@/lib/brand';
import {
  adminContentColumnClass,
  dashboardChartCardShell,
} from '@/components/layout/dashboard-ui';
import {
  ShopifyPanel,
  ShopifySection,
  ShopifyStatCard,
  StatusBadge,
} from '@/components/dashboard/ShopifyDashboard';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area,
} from 'recharts';

interface DashboardData {
  contacts: number;
  conversations: { total: number; active: number };
  messages: { sent: number; delivered: number; read: number; failed: number; total: number };
  messageChart: Array<{ _id: string; sent: number; received: number; total: number }>;
  recentConversations: Array<{ _id: string; contact: { name: string; phone: string }; lastMessage: { text: string }; updatedAt: string }>;
  walletBalance: number;
  rateCard?: { marketing: number; utility: number; authentication: number; service: number } | null;
  whatsappConnected: boolean;
  campaigns?: { total: number; running: number; scheduled: number; completed: number; draft: number; paused: number; failed: number; sentTotal: number };
  recentCampaigns?: Array<{ _id: string; name: string; type: string; status: string; stats?: { sent?: number; failed?: number }; createdAt: string }>;
  templates?: { total: number; approved: number; pending: number; rejected: number };
  presets?: number;
  aiCalls?: { total: number; completed: number; failed: number; minutes: number };
  appointments?: { total: number; upcoming: number };
  orders?: { total: number; revenue: number };
  keywords?: number;
  unreadCount?: number;
  newContacts?: number;
  contactChart?: Array<{ _id: string; count: number }>;
  spend?: number;
  today?: { sent: number; received: number };
  todayAppointments?: Array<{ _id: string; title: string; contactName: string; contactPhone: string; startTime: string; status: string; date?: string }>;
  dueReminders?: Array<{ _id: string; text: string; remindAt: string; contact?: { name?: string; phone?: string } }>;
  resolvedCount?: number;
  botFlowsActive?: number;
}

const CHART_COLORS = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444'];

const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });

const listRowClass = 'flex items-center justify-between gap-3 border-b border-admin-divider py-2.5 last:border-0';

export default function DashboardPage() {
  const { user, currentWorkspace } = useAuthStore();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await dashboardApi.getClientDashboard();
        setData(res.data.data);
      } catch {
        /* defaults */
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const m = data?.messages;
  const chartData = (data?.messageChart || []).map((d) => ({
    date: fmtDate(d._id),
    sent: d.sent,
    received: d.received,
    total: d.total,
  }));
  const contactData = (data?.contactChart || []).map((d) => ({
    date: fmtDate(d._id),
    contacts: d.count,
  }));

  const pieData = [
    { name: 'Sent', value: m?.sent || 0 },
    { name: 'Delivered', value: m?.delivered || 0 },
    { name: 'Read', value: m?.read || 0 },
    { name: 'Failed', value: m?.failed || 0 },
  ].filter((d) => d.value > 0);

  const whatsappConnected = !!(currentWorkspace?.whatsapp?.isConnected || data?.whatsappConnected);

  if (loading) {
    return (
      <div className={adminContentColumnClass}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="min-h-[120px] animate-pulse rounded-xl border border-admin-border bg-white shadow-sm"
            />
          ))}
        </div>
        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="min-h-[320px] animate-pulse rounded-xl border border-admin-border bg-white shadow-sm" />
          <div className="min-h-[320px] animate-pulse rounded-xl border border-admin-border bg-white shadow-sm" />
        </div>
      </div>
    );
  }

  return (
    <div className={adminContentColumnClass}>
      <div className="flex flex-col gap-8">
        {/* Page header */}
        <div className="relative overflow-hidden rounded-xl border border-emerald-100 bg-white px-5 py-4 shadow-[0_1px_2px_rgba(16,24,40,0.06),0_1px_3px_rgba(16,24,40,0.04)] sm:flex sm:items-center sm:justify-between gap-4">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-emerald-50/80 via-transparent to-teal-50/50" aria-hidden />
          <div className="relative min-w-0 flex-1">
            <h1 className="text-[20px] font-semibold tracking-tight text-admin-text sm:text-2xl">
              Welcome back{displayPersonName(user?.name) ? `, ${displayPersonName(user?.name)}` : ''} 👋
            </h1>
            <p className="mt-1.5 text-[13px] text-admin-text-secondary">
              Here&apos;s what&apos;s happening with your workspace today.
            </p>
          </div>
          <div className="relative shrink-0">
            <StatusBadge
              connected={whatsappConnected}
              connectedLabel="WhatsApp connected ✓"
              disconnectedLabel="WhatsApp disconnected"
            />
          </div>
        </div>

        {/* Today at a glance */}
        <ShopifySection title="Today at a glance" icon={<Clock />} accent="orange">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <ShopifyStatCard title="Today sent" value={data?.today?.sent || 0} icon={<Send />} href="/client/chat" color="emerald" />
            <ShopifyStatCard title="Today received" value={data?.today?.received || 0} icon={<MessageSquare />} href="/client/chat" color="blue" />
            <ShopifyStatCard title="Unread messages" value={data?.unreadCount || 0} icon={<BellRing />} href="/client/chat" color="orange" />
            <ShopifyStatCard title="New contacts (30d)" value={data?.newContacts || 0} icon={<TrendingUp />} href="/client/contacts" color="purple" />
          </div>
        </ShopifySection>

        <ShopifySection title="Action needed today" icon={<BellRing />} accent="red">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <ShopifyPanel title="Upcoming appointments" actionLabel="View all" actionHref="/client/appointments" accent="blue">
              <div className="space-y-0">
                {(data?.todayAppointments || []).length ? (
                  (data?.todayAppointments || []).map((a) => (
                    <div key={a._id} className={listRowClass}>
                      <div className="min-w-0">
                        <p className="truncate text-[13px] font-medium text-admin-text">{a.title}</p>
                        <p className="truncate text-[12px] text-admin-text-subdued">{a.contactName || a.contactPhone}</p>
                      </div>
                      <span className="shrink-0 rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700">
                        {a.date ? `${new Date(a.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} ` : ''}
                        {a.startTime}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="py-2 text-[13px] text-admin-text-subdued">No upcoming appointments</p>
                )}
              </div>
            </ShopifyPanel>

            <ShopifyPanel title="Due reminders" actionLabel="Open inbox" actionHref="/client/chat" accent="red">
              <div className="space-y-0">
                {(data?.dueReminders || []).length ? (
                  (data?.dueReminders || []).map((r) => (
                    <div key={r._id} className={listRowClass}>
                      <div className="min-w-0">
                        <p className="truncate text-[13px] font-medium text-red-600">
                          {r.contact?.name || r.contact?.phone || 'Contact'}
                        </p>
                        <p className="truncate text-[12px] text-admin-text-subdued">{r.text}</p>
                      </div>
                      <span className="shrink-0 text-[11px] text-red-500">
                        {new Date(r.remindAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="py-2 text-[13px] text-admin-text-subdued">No pending reminders</p>
                )}
              </div>
            </ShopifyPanel>

            <div className="grid grid-cols-2 gap-4">
              <ShopifyStatCard title="Active chats" value={data?.conversations?.active || 0} subtitle={`${data?.resolvedCount || 0} resolved`} icon={<MessageSquare />} href="/client/chat" color="blue" />
              <ShopifyStatCard title="Active bot flows" value={data?.botFlowsActive || 0} subtitle="Auto-replying 24×7" icon={<Zap />} href="/client/bot-flows" color="purple" />
              <ShopifyStatCard title="AI follow-ups" value="Review" subtitle="Needs reply / gone quiet" icon={<TrendingUp />} href="/client/followups" color="indigo" />
              <ShopifyStatCard title="Wallet balance" value={`₹${(data?.walletBalance || 0).toFixed(0)}`} subtitle={`₹${(data?.spend || 0).toFixed(0)} spent (30d)`} icon={<Wallet />} href="/client/billing" color="emerald" />
            </div>
          </div>
        </ShopifySection>

        {data?.rateCard && (
          <ShopifyPanel title="Message rate card" accent="purple">
            <p className="mb-3 text-[12px] text-admin-text-subdued">Price per delivered message in INR</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {(
                [
                  { label: 'Marketing', rate: data.rateCard.marketing, box: 'border-emerald-100 bg-emerald-50', text: 'text-emerald-700' },
                  { label: 'Utility', rate: data.rateCard.utility, box: 'border-blue-100 bg-blue-50', text: 'text-blue-700' },
                  { label: 'Authentication', rate: data.rateCard.authentication, box: 'border-purple-100 bg-purple-50', text: 'text-purple-700' },
                  { label: 'Service', rate: data.rateCard.service, box: 'border-orange-100 bg-orange-50', text: 'text-orange-700' },
                ] as const
              ).map(({ label, rate, box, text }) => (
                <div key={label} className={`rounded-lg border px-3 py-2.5 ${box}`}>
                  <p className={`text-[12px] ${text}`}>{label}</p>
                  <p className={`mt-1 text-lg font-semibold tabular-nums ${text}`}>
                    ₹{Number(rate || 0).toFixed(4)}
                  </p>
                </div>
              ))}
            </div>
          </ShopifyPanel>
        )}

        <ShopifySection title="Messaging & contacts" icon={<MessageSquare />} accent="emerald">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <ShopifyStatCard title="Total contacts" value={data?.contacts || 0} icon={<Users />} href="/client/contacts" color="blue" />
            <ShopifyStatCard title="Messages sent (30d)" value={m?.sent || 0} icon={<Send />} href="/client/chat" color="emerald" />
            <ShopifyStatCard title="Delivered" value={m?.delivered || 0} icon={<CheckCheck />} href="/client/chat" color="purple" />
            <ShopifyStatCard title="Read" value={m?.read || 0} icon={<Eye />} href="/client/chat" color="orange" />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <ShopifyStatCard title="Conversations" value={data?.conversations?.total || 0} icon={<MessageSquare />} href="/client/chat" color="blue" />
            <ShopifyStatCard title="Failed" value={m?.failed || 0} icon={<AlertCircle />} href="/client/chat" color="red" />
            <ShopifyStatCard title="Campaigns" value={`${data?.campaigns?.running || 0} running / ${data?.campaigns?.total || 0}`} icon={<Megaphone />} href="/client/broadcasts" color="purple" />
            <ShopifyStatCard title="Wallet balance" value={`₹${(data?.walletBalance || 0).toFixed(2)}`} icon={<Wallet />} href="/client/billing" color="emerald" />
          </div>
        </ShopifySection>

        <ShopifySection title="Business & operations" icon={<Phone />} accent="indigo">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <ShopifyStatCard title="AI calls" value={`${data?.aiCalls?.total || 0} (${data?.aiCalls?.minutes || 0} min)`} icon={<Phone />} href="/client/ai-calling" color="blue" />
            <ShopifyStatCard title="Appointments" value={`${data?.appointments?.upcoming || 0} upcoming / ${data?.appointments?.total || 0}`} icon={<Calendar />} href="/client/appointments" color="orange" />
            <ShopifyStatCard title="Templates" value={`${data?.templates?.approved || 0} approved / ${data?.templates?.total || 0}`} icon={<LayoutTemplate />} href="/client/templates" color="purple" />
            <ShopifyStatCard title="Spend (30d)" value={`₹${(data?.spend || 0).toFixed(2)}`} icon={<Zap />} href="/client/transactions" color="red" />
          </div>
        </ShopifySection>

        <ShopifySection title="Analytics & trends" icon={<TrendingUp />} accent="purple">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className={`${dashboardChartCardShell} lg:col-span-2`}>
              <h3 className="text-[13px] font-semibold text-admin-text">Message analytics (30 days)</h3>
              <p className="mt-0.5 text-[12px] text-admin-text-secondary">Sent vs received messages</p>
              <div className="mt-4 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ebebeb" />
                    <XAxis dataKey="date" fontSize={11} tick={{ fill: '#616161' }} />
                    <YAxis fontSize={11} tick={{ fill: '#616161' }} />
                    <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e3e3e3', fontSize: 12 }} />
                    <Bar dataKey="sent" fill="#10B981" name="Sent" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="received" fill="#3B82F6" name="Received" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className={dashboardChartCardShell}>
              <h3 className="text-[13px] font-semibold text-admin-text">Message status</h3>
              <p className="mt-0.5 text-[12px] text-admin-text-secondary">Delivery breakdown</p>
              <div className="mt-4 h-64">
                {pieData.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={{ fontSize: 11 }}>
                        {pieData.map((_, i) => (
                          <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e3e3e3', fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-[13px] text-admin-text-subdued">
                    No data yet
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className={dashboardChartCardShell}>
              <h3 className="text-[13px] font-semibold text-admin-text">Contact growth (30 days)</h3>
              <div className="mt-4 h-56">
                {contactData.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={contactData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ebebeb" />
                      <XAxis dataKey="date" fontSize={11} tick={{ fill: '#616161' }} />
                      <YAxis fontSize={11} allowDecimals={false} tick={{ fill: '#616161' }} />
                      <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e3e3e3', fontSize: 12 }} />
                      <Area type="monotone" dataKey="contacts" stroke="#8B5CF6" fill="#EDE9FE" name="New contacts" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-[13px] text-admin-text-subdued">
                    No new contacts yet
                  </div>
                )}
              </div>
            </div>

            <ShopifyPanel title="Recent campaigns" actionLabel="View all" actionHref="/client/broadcasts" accent="purple">
              <div className="space-y-0">
                {(data?.recentCampaigns || []).length ? (
                  (data?.recentCampaigns || []).map((c) => (
                    <div key={c._id} className={listRowClass}>
                      <div className="min-w-0">
                        <p className="truncate text-[13px] font-medium text-admin-text">{c.name}</p>
                        <p className="text-[12px] text-admin-text-subdued">
                          {c.type} · sent {c.stats?.sent || 0}
                          {c.stats?.failed ? ` · failed ${c.stats.failed}` : ''}
                        </p>
                      </div>
                      <Badge variant={c.status === 'completed' || c.status === 'running' ? 'success' : c.status === 'failed' ? 'danger' : 'default'}>
                        {c.status}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <p className="py-2 text-[13px] text-admin-text-subdued">No campaigns yet</p>
                )}
              </div>
            </ShopifyPanel>

            <ShopifyPanel title="Recent conversations" actionLabel="Open inbox" actionHref="/client/chat" accent="emerald">
              <div className="space-y-0">
                {(data?.recentConversations || []).length ? (
                  (data?.recentConversations || []).map((c) => (
                    <div key={c._id} className={listRowClass}>
                      <div className="min-w-0">
                        <p className="truncate text-[13px] font-medium text-admin-text">
                          {c.contact?.name || c.contact?.phone}
                        </p>
                        <p className="truncate text-[12px] text-admin-text-subdued">{c.lastMessage?.text || ''}</p>
                      </div>
                      <span className="flex shrink-0 items-center gap-1 text-[11px] text-admin-text-subdued">
                        <Clock className="h-3 w-3" />
                        {new Date(c.updatedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="py-2 text-[13px] text-admin-text-subdued">No conversations yet</p>
                )}
              </div>
            </ShopifyPanel>
          </div>
        </ShopifySection>

        {/* Quick tools */}
        <ShopifySection title="Quick tools" icon={<Zap />} accent="rose">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <ShopifyStatCard title="Preset templates" value={data?.presets || 0} icon={<Zap />} href="/client/save-money/templates" color="emerald" />
            <ShopifyStatCard title="Auto-reply keywords" value={data?.keywords || 0} icon={<Zap />} href="/client/keywords" color="blue" />
            <ShopifyStatCard title="Orders" value={data?.orders?.total || 0} icon={<ShoppingBag />} href="/client/orders" color="purple" />
            <ShopifyStatCard title="Order revenue" value={`₹${(data?.orders?.revenue || 0).toFixed(0)}`} icon={<Wallet />} href="/client/orders" color="orange" />
          </div>
        </ShopifySection>

        {!whatsappConnected && (
          <div className="relative overflow-hidden flex flex-col gap-3 rounded-xl border border-emerald-200 bg-white px-5 py-4 shadow-[0_1px_2px_rgba(16,24,40,0.06),0_1px_3px_rgba(16,24,40,0.04)] sm:flex-row sm:items-center sm:justify-between">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-emerald-50/70 to-teal-50/40" aria-hidden />
            <div className="relative flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100">
                <WifiOff className="h-4 w-4 text-emerald-600" />
              </span>
              <div>
                <p className="text-[13px] font-semibold text-emerald-900">Connect WhatsApp to start messaging</p>
                <p className="mt-0.5 text-[12px] text-emerald-700/80">
                  Link your WhatsApp Business account to send broadcasts and manage inbox conversations.
                </p>
              </div>
            </div>
            <Link
              href="/client/whatsapp"
              className="relative inline-flex shrink-0 items-center justify-center rounded-lg bg-emerald-600 px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-emerald-700"
            >
              Connect WhatsApp
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
