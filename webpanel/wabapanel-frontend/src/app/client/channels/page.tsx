'use client';
import React, { useState, useEffect } from 'react';
import { MessageSquare, Camera, Users as FbIcon, CheckCircle, XCircle, ExternalLink, Send, Mail, QrCode, ShieldAlert, ShieldCheck } from 'lucide-react';
import Input from '@/components/ui/Input';
import { workspaceApi, waqrApi, tgPersonalApi } from '@/lib/api';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { adminContentColumnClass, dashboardCardShell } from '@/components/layout/dashboard-ui';

const primaryBtn =
  'inline-flex items-center justify-center gap-1.5 rounded-lg bg-admin-text px-3 py-1.5 text-[13px] font-semibold text-white transition-colors hover:bg-[#1a1a1a] disabled:cursor-not-allowed disabled:opacity-50';
const secondaryBtn =
  'inline-flex items-center justify-center gap-1.5 rounded-lg border border-admin-border bg-white px-3 py-1.5 text-[13px] font-medium text-admin-text transition-colors hover:bg-[#f6f6f7] disabled:cursor-not-allowed disabled:opacity-50';
const cardClass = `${dashboardCardShell} space-y-4 !p-5`;
const helpBoxClass = 'space-y-1 rounded-lg border border-admin-border bg-[#f6f6f7] p-3 text-[12px] text-admin-text-secondary';
const codeChip = 'rounded bg-white px-1 font-mono text-[11px] text-admin-text ring-1 ring-inset ring-admin-border';
const enableLabel = 'flex cursor-pointer items-center gap-2 text-[13px] text-admin-text';

function Spinner() {
  return (
    <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" aria-hidden>
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

function StatusPill({ ok, label }: { ok: boolean; label: string }) {
  return ok ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/15">
      <CheckCircle className="h-3.5 w-3.5" /> {label}
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-medium text-red-700 ring-1 ring-inset ring-red-600/15">
      <XCircle className="h-3.5 w-3.5" /> {label}
    </span>
  );
}

export default function ChannelsPage() {
  const { currentWorkspace } = useAuthStore();
  const [waConnected, setWaConnected] = useState(false);
  const [waPhone, setWaPhone] = useState('');
  const [metaChat, setMetaChat] = useState({ pageId: '', pageAccessToken: '', igAccountId: '', fbEnabled: false, igEnabled: false });
  const [telegram, setTelegram] = useState({ botToken: '', botUsername: '', enabled: false });
  const [emailCh, setEmailCh] = useState({ enabled: false, imapHost: '', imapPort: 993, smtpHost: '', smtpPort: 587, user: '', pass: '', fromName: '' });
  const [saving, setSaving] = useState(false);
  const [qr, setQr] = useState<{ status: string; phone: string; qr: string | null; todayCap?: number; sentToday?: number; warmupDay?: number; warmupTotalDays?: number; customLimit?: number }>({ status: 'disconnected', phone: '', qr: null });
  const [tgp, setTgp] = useState<{ status: string; phone: string; username?: string; error?: string; qr?: string }>({ status: 'disconnected', phone: '' });
  const [tgpPhone, setTgpPhone] = useState('');
  const [tgpMode, setTgpMode] = useState<'qr' | 'phone'>('qr');
  const [tgpCode, setTgpCode] = useState('');
  const [tgpPassword, setTgpPassword] = useState('');
  const [tgpBusy, setTgpBusy] = useState(false);
  const [qrLimitInput, setQrLimitInput] = useState('');
  const [qrLimitSaving, setQrLimitSaving] = useState(false);
  const [qrBusy, setQrBusy] = useState(false);
  const [fbCfg, setFbCfg] = useState<{ appId?: string; configId?: string; oneClick?: boolean; connected?: boolean; pageName?: string } | null>(null);
  const [fbBusy, setFbBusy] = useState(false);
  const [fbPages, setFbPages] = useState<{ id: string; name: string }[]>([]);
  const [fbCode, setFbCode] = useState('');

  useEffect(() => {
    if (!currentWorkspace) return;
    let stop = false;
    const poll = async () => {
      try {
        const res = await waqrApi.status();
        if (!stop) setQr(res.data.data);
      } catch { /* */ }
    };
    poll();
    const t = setInterval(() => {
      if (['qr', 'connecting', 'reconnecting'].includes(qr.status)) poll();
    }, 3000);
    return () => { stop = true; clearInterval(t); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentWorkspace, qr.status]);

  useEffect(() => {
    if (!currentWorkspace) return;
    let stop = false;
    const poll = async () => {
      try {
        const res = await tgPersonalApi.status();
        if (!stop) setTgp(res.data.data);
      } catch { /* */ }
    };
    poll();
    const t = setInterval(() => {
      if (['qr', 'connecting', 'verifying', 'awaiting_code', 'awaiting_password'].includes(tgp.status)) poll();
    }, 2500);
    return () => { stop = true; clearInterval(t); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentWorkspace, tgp.status]);

  useEffect(() => {
    if (!currentWorkspace) return;
    api.get('/facebook-connect/config')
      .then(r => setFbCfg(r.data.data))
      .catch(() => {});
  }, [currentWorkspace]);

  type FbWindow = Window & {
    FB?: { init: (o: Record<string, unknown>) => void; login: (cb: (r: { authResponse?: { code?: string } }) => void, o: Record<string, unknown>) => void };
    fbAsyncInit?: () => void;
  };

  const loadFbSdk = (appId: string) => new Promise<void>((resolve) => {
    const w = window as FbWindow;
    if (w.FB) return resolve();
    w.fbAsyncInit = () => { w.FB!.init({ appId, cookie: true, xfbml: false, version: 'v21.0' }); resolve(); };
    const s = document.createElement('script');
    s.src = 'https://connect.facebook.net/en_US/sdk.js';
    s.async = true; s.defer = true; document.body.appendChild(s);
  });

  const submitFbCode = (code: string, pageId?: string) => {
    setFbBusy(true);
    const redirectUri = window.location.origin + window.location.pathname;
    api.post('/facebook-connect/one-click', pageId ? { code, pageId, redirectUri } : { code, redirectUri })
      .then(r => {
        const d = r.data.data;
        if (d?.needsPageChoice) { setFbPages(d.pages || []); setFbCode(code); toast('Select the Page you want to connect'); return; }
        setFbPages([]); setFbCode('');
        toast.success('Facebook Page connected');
        api.get('/facebook-connect/config').then(res => setFbCfg(res.data.data)).catch(() => {});
        if (d?.pageId) setMetaChat(m => ({ ...m, pageId: String(d.pageId), fbEnabled: true }));
      })
      .catch(err => toast.error(err.response?.data?.message || 'Connect failed'))
      .finally(() => setFbBusy(false));
  };

  const chooseFbPage = (pageId: string) => submitFbCode(fbCode, pageId);

  const connectFbOneClick = async () => {
    if (!fbCfg?.appId) { toast.error('Facebook app is not configured by the admin.'); return; }
    setFbBusy(true);
    try {
      await loadFbSdk(fbCfg.appId);
      const opts: Record<string, unknown> = { response_type: 'code', override_default_response_type: true };
      if (fbCfg.configId) opts.config_id = fbCfg.configId;
      else opts.scope = 'pages_show_list,pages_messaging,pages_manage_metadata,pages_read_engagement';
      (window as FbWindow).FB!.login((resp) => {
        const code = resp?.authResponse?.code;
        if (!code) { setFbBusy(false); toast.error('Facebook login cancelled'); return; }
        submitFbCode(code);
      }, opts);
    } catch { setFbBusy(false); toast.error('Facebook SDK failed to load'); }
  };

  const connectTgpQr = async () => {
    setTgpBusy(true);
    try {
      const res = await tgPersonalApi.connectQr();
      setTgp(res.data.data);
      if (res.data.data?.status === 'error') toast.error(res.data.data.error || 'Failed to generate QR');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(e.response?.data?.message || 'Failed to generate QR');
    }
    setTgpBusy(false);
  };

  const connectTgp = async () => {
    if (!tgpPhone.trim()) { toast.error('Enter your phone number with country code'); return; }
    setTgpBusy(true);
    try {
      const res = await tgPersonalApi.connect(tgpPhone.trim());
      setTgp(res.data.data);
      if (res.data.data?.status === 'awaiting_code') toast.success('Code sent — check your Telegram app');
      if (res.data.data?.status === 'error') toast.error(res.data.data.error || 'Login failed');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(e.response?.data?.message || 'Failed to start login');
    }
    setTgpBusy(false);
  };

  const connectQr = async () => {
    setQrBusy(true);
    try {
      const res = await waqrApi.connect();
      setQr(res.data.data);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(e.response?.data?.message || 'Failed to start QR session');
    }
    setQrBusy(false);
  };

  const disconnectQr = async () => {
    if (!confirm('Disconnect this WhatsApp number?')) return;
    setQrBusy(true);
    try { await waqrApi.disconnect(); setQr({ status: 'disconnected', phone: '', qr: null }); toast.success('Disconnected'); } catch { toast.error('Failed'); }
    setQrBusy(false);
  };

  useEffect(() => {
    if (!currentWorkspace) return;
    workspaceApi.get(currentWorkspace._id).then(res => {
      const w = res.data.data;
      setWaConnected(!!w?.whatsapp?.isConnected);
      setWaPhone(w?.whatsapp?.phoneNumber || w?.whatsapp?.displayPhoneNumber || '');
      const mc = w?.metaChat;
      if (mc) setMetaChat({ pageId: mc.pageId || '', pageAccessToken: mc.pageAccessToken || '', igAccountId: mc.igAccountId || '', fbEnabled: !!mc.fbEnabled, igEnabled: !!mc.igEnabled });
      const tg = w?.telegram;
      if (tg) setTelegram({ botToken: tg.botToken || '', botUsername: tg.botUsername || '', enabled: !!tg.enabled });
      const ec = w?.emailChannel;
      if (ec) setEmailCh({ enabled: !!ec.enabled, imapHost: ec.imapHost || '', imapPort: ec.imapPort || 993, smtpHost: ec.smtpHost || '', smtpPort: ec.smtpPort || 587, user: ec.user || '', pass: ec.pass || '', fromName: ec.fromName || '' });
    }).catch(() => {});
  }, [currentWorkspace]);

  const handleSave = async () => {
    if (!currentWorkspace) return;
    setSaving(true);
    try {
      await workspaceApi.update(currentWorkspace._id, { metaChat, telegram, emailChannel: emailCh });
      toast.success('Channel configuration saved');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to save');
    }
    setSaving(false);
  };

  return (
    <div className={`${adminContentColumnClass} space-y-4`}>
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 shrink-0 text-admin-text-secondary" aria-hidden />
          <h1 className="text-[20px] font-semibold tracking-tight text-admin-text">Channel configuration</h1>
        </div>
        <p className="mt-1 text-[13px] text-admin-text-secondary">
          WhatsApp, Facebook Messenger, Instagram DM, Telegram, and email — configure every channel in one place
        </p>
      </div>

      {/* WhatsApp */}
      <div className={cardClass}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50">
              <MessageSquare className="h-5 w-5 text-emerald-700" />
            </div>
            <div>
              <h2 className="text-[14px] font-semibold text-admin-text">WhatsApp Business</h2>
              <p className="text-[12px] text-admin-text-secondary">{waConnected ? `Connected${waPhone ? ' — ' + waPhone : ''}` : 'Not connected'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <StatusPill ok={waConnected} label={waConnected ? 'Connected' : 'Not connected'} />
            <Link href="/client/whatsapp" className="inline-flex items-center gap-1 text-[13px] font-semibold text-[#005bd3] hover:underline">
              Configure <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* WhatsApp by QR */}
      <div className={cardClass}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50">
              <QrCode className="h-5 w-5 text-green-700" />
            </div>
            <div>
              <h2 className="text-[14px] font-semibold text-admin-text">WhatsApp by QR</h2>
              <p className="text-[12px] text-admin-text-secondary">
                {qr.status === 'connected' ? `Connected — +${qr.phone}` : 'Connect a normal WhatsApp number by scanning a QR code (no API needed)'}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {qr.status === 'connected' ? (
              <>
                <StatusPill ok label="Connected" />
                <button
                  type="button"
                  className={secondaryBtn}
                  disabled={qrBusy}
                  onClick={async () => {
                    setQrBusy(true);
                    try { await waqrApi.sync(); toast.success('Syncing messages...'); } catch { toast.error('Sync failed'); }
                    setQrBusy(false);
                  }}
                >
                  {qrBusy ? <Spinner /> : null} Sync messages
                </button>
                <button type="button" className={secondaryBtn} disabled={qrBusy} onClick={disconnectQr}>
                  {qrBusy ? <Spinner /> : null} Disconnect
                </button>
              </>
            ) : (
              <button type="button" className={primaryBtn} disabled={qrBusy} onClick={connectQr}>
                {qrBusy ? <Spinner /> : null} {qr.status === 'qr' ? 'Refresh' : 'Connect'}
              </button>
            )}
          </div>
        </div>

        {qr.status === 'qr' && qr.qr && (
          <div className="flex flex-col items-center gap-2 py-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qr.qr} alt="WhatsApp QR code" className="h-56 w-56 rounded-lg border border-admin-border" />
            <p className="text-center text-[12px] text-admin-text-secondary">
              Open WhatsApp on your phone → <b>Settings → Linked Devices → Link a Device</b> → scan this code
            </p>
          </div>
        )}
        {['connecting', 'reconnecting'].includes(qr.status) && (
          <p className="text-[12px] text-admin-text-subdued">Connecting... QR code will appear here in a few seconds.</p>
        )}
        {qr.status === 'connected' && (
          <div className="space-y-3 rounded-lg border border-emerald-200 bg-emerald-50/60 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="flex items-center gap-1.5 text-[12px] font-semibold text-emerald-900">
                <ShieldCheck className="h-4 w-4" /> Number warmer &amp; anti-ban protection — active
              </p>
              <span className="rounded-full bg-admin-text px-2 py-0.5 text-[10px] font-medium text-white">
                Warm-up day {qr.warmupDay || 1} / {qr.warmupTotalDays || 14}
              </span>
            </div>
            <div>
              <div className="mb-1 flex justify-between text-[11px] text-emerald-900">
                <span>Today&apos;s safe sending limit</span>
                <span className="font-semibold">{qr.sentToday || 0} / {qr.todayCap || 25} messages</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-emerald-100">
                <div className="h-full rounded-full bg-emerald-600 transition-all" style={{ width: `${Math.min(100, ((qr.sentToday || 0) / (qr.todayCap || 25)) * 100)}%` }} />
              </div>
            </div>
            <ul className="grid grid-cols-1 gap-x-4 gap-y-1 text-[11px] text-emerald-900 sm:grid-cols-2">
              <li className="flex items-center gap-1"><CheckCircle className="h-3 w-3 shrink-0" /> Gradual daily limit warm-up (14 days)</li>
              <li className="flex items-center gap-1"><CheckCircle className="h-3 w-3 shrink-0" /> Human-like random delays (5–15s)</li>
              <li className="flex items-center gap-1"><CheckCircle className="h-3 w-3 shrink-0" /> Typing indicator before every send</li>
              <li className="flex items-center gap-1"><CheckCircle className="h-3 w-3 shrink-0" /> Auto-pause on ban / logout detection</li>
              <li className="flex items-center gap-1"><CheckCircle className="h-3 w-3 shrink-0" /> Sends blocked once daily cap is hit</li>
              <li className="flex items-center gap-1"><CheckCircle className="h-3 w-3 shrink-0" /> Daily counter resets at midnight</li>
            </ul>
            <p className="text-[11px] text-emerald-800">
              Chats appear in the <b>WhatsApp QR Inbox</b>. The limit grows automatically every day as your number warms up.
            </p>
            <div className="space-y-1.5 border-t border-emerald-200 pt-2">
              <p className="text-[11px] font-semibold text-emerald-900">Custom daily limit (at your own risk)</p>
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="number"
                  min={0}
                  max={2000}
                  placeholder={qr.customLimit ? String(qr.customLimit) : 'Auto (warm-up)'}
                  value={qrLimitInput}
                  onChange={(e) => setQrLimitInput(e.target.value)}
                  className="w-36 rounded-lg border border-admin-border bg-white px-2 py-1.5 text-[12px] text-admin-text focus:outline-none focus:ring-2 focus:ring-[#005bd3]/30"
                />
                <button
                  type="button"
                  className={secondaryBtn}
                  disabled={qrLimitSaving}
                  onClick={async () => {
                    setQrLimitSaving(true);
                    try {
                      const v = parseInt(qrLimitInput, 10) || 0;
                      await waqrApi.settings(v);
                      setQr({ ...qr, customLimit: v, todayCap: v > 0 ? v : qr.todayCap });
                      toast.success(v > 0 ? `Daily limit set to ${v}` : 'Back to automatic warm-up limit');
                    } catch { toast.error('Failed to save limit'); }
                    setQrLimitSaving(false);
                  }}
                >
                  {qrLimitSaving ? <Spinner /> : null} Save
                </button>
                {(qr.customLimit || 0) > 0 && (
                  <button
                    type="button"
                    className="text-[11px] font-medium text-[#005bd3] hover:underline"
                    onClick={async () => {
                      try {
                        await waqrApi.settings(0);
                        setQr({ ...qr, customLimit: 0 });
                        setQrLimitInput('');
                        toast.success('Back to automatic warm-up limit');
                      } catch { toast.error('Failed'); }
                    }}
                  >
                    Reset to auto
                  </button>
                )}
              </div>
              <p className="text-[10px] text-emerald-800">
                Overrides the automatic warm-up schedule. Setting a high limit on a fresh number greatly increases the ban risk. Set 0 or Reset to return to auto.
              </p>
            </div>
          </div>
        )}

        <div className="space-y-2 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <p className="flex items-center gap-1.5 text-[12px] font-semibold text-amber-900">
            <ShieldAlert className="h-4 w-4" /> Stay safe — read before connecting
          </p>
          <ul className="list-disc space-y-1 pl-4 text-[12px] text-amber-900">
            <li>This uses WhatsApp Web (not the official API). It is against WhatsApp&apos;s Terms of Service and carries a <b>risk of your number being banned</b>. Use a secondary number, not your main personal/business number.</li>
            <li>Our safety engine protects you automatically: new numbers start with a small daily limit that grows over 2 weeks (number warm-up), messages are sent with human-like random delays and typing indicators.</li>
            <li>Only message people who know you or have contacted you first. Never send bulk promotions to unknown numbers — that is the fastest way to get banned.</li>
            <li>Avoid sending the same text repeatedly. Personalize messages and keep a healthy reply rate (if nobody replies, slow down).</li>
            <li>Keep your phone connected to the internet. If the number gets banned or logged out, the channel pauses automatically and you will see it here.</li>
            <li>For bulk campaigns, official templates and green-tick verification, use the official <b>WhatsApp Business API</b> channel above.</li>
          </ul>
        </div>
      </div>

      {/* Facebook */}
      <div className={cardClass}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
              <FbIcon className="h-5 w-5 text-blue-700" />
            </div>
            <div>
              <h2 className="text-[14px] font-semibold text-admin-text">Facebook Messenger</h2>
              <p className="text-[12px] text-admin-text-secondary">Page messages go straight to your Facebook Inbox</p>
            </div>
          </div>
          <label className={enableLabel}>
            <input type="checkbox" checked={metaChat.fbEnabled} onChange={(e) => setMetaChat({ ...metaChat, fbEnabled: e.target.checked })} className="h-4 w-4 accent-admin-text" />
            Enable
          </label>
        </div>
        {fbCfg?.oneClick && (
          <div className="space-y-2 rounded-lg border border-blue-200 bg-blue-50 p-3">
            {fbCfg.connected ? (
              <p className="text-[13px] text-blue-900">Connected{fbCfg.pageName ? `: ${fbCfg.pageName}` : ''} — messages of this Page arrive in your Inbox.</p>
            ) : (
              <p className="text-[13px] text-blue-900">Connect your Facebook Page in one click — no Page ID or token needed.</p>
            )}
            <button type="button" className={primaryBtn} disabled={fbBusy} onClick={connectFbOneClick}>
              {fbBusy ? <Spinner /> : null} {fbCfg.connected ? 'Reconnect with Facebook' : 'Connect with Facebook'}
            </button>
            {fbPages.length > 0 && (
              <div className="space-y-1">
                <p className="text-[12px] text-admin-text-secondary">Choose the Page to connect:</p>
                {fbPages.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => chooseFbPage(p.id)}
                    className="block w-full rounded-lg border border-admin-border bg-white px-3 py-2 text-left text-[13px] text-admin-text hover:bg-[#f6f6f7]"
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        <Input label="Facebook Page ID" value={metaChat.pageId} onChange={(e) => setMetaChat({ ...metaChat, pageId: e.target.value })} placeholder="e.g. 1234567890" />
        <Input label="Page Access Token" type="password" value={metaChat.pageAccessToken} onChange={(e) => setMetaChat({ ...metaChat, pageAccessToken: e.target.value })} placeholder="EAAB..." />
        <div className={helpBoxClass}>
          <p className="font-semibold text-admin-text">How to get these (step by step):</p>
          <ol className="list-decimal space-y-1 pl-4">
            <li>Go to <b>developers.facebook.com</b> → open your App → <b>Add Product</b> → <b>Messenger</b> → <b>Set Up</b>.</li>
            <li>Open <b>Messenger → Settings</b> → find the <b>Access Tokens</b> section.</li>
            <li>Click <b>Add or Remove Pages</b> → select your Facebook Page → allow all permissions.</li>
            <li>Next to the added Page, click <b>Generate Token</b>, copy the <code className={codeChip}>EAAB...</code> token and paste it in <b>Page Access Token</b> above.</li>
            <li>Get your <b>Page ID</b>: open your Facebook Page → <b>About / Settings → Page transparency</b> → copy the <b>Page ID</b> into the field above.</li>
            <li>Make sure the <code className={codeChip}>pages_messaging</code> permission is enabled (added automatically by Messenger setup).</li>
          </ol>
        </div>
      </div>

      {/* Instagram */}
      <div className={cardClass}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-pink-50">
              <Camera className="h-5 w-5 text-pink-700" />
            </div>
            <div>
              <h2 className="text-[14px] font-semibold text-admin-text">Instagram DM</h2>
              <p className="text-[12px] text-admin-text-secondary">Instagram direct messages in your Inbox (uses the same Page token)</p>
            </div>
          </div>
          <label className={enableLabel}>
            <input type="checkbox" checked={metaChat.igEnabled} onChange={(e) => setMetaChat({ ...metaChat, igEnabled: e.target.checked })} className="h-4 w-4 accent-admin-text" />
            Enable
          </label>
        </div>
        <Input label="Instagram Account ID" value={metaChat.igAccountId} onChange={(e) => setMetaChat({ ...metaChat, igAccountId: e.target.value })} placeholder="e.g. 17841400000000000" />
        <div className={helpBoxClass}>
          <p className="font-semibold text-admin-text">How to get the Instagram Account ID (step by step):</p>
          <ol className="list-decimal space-y-1 pl-4">
            <li>In the Instagram app: <b>Settings → Account → Switch to Professional (Business)</b> account.</li>
            <li>Link that Instagram account to your Facebook Page (Page Settings → Linked accounts → Instagram).</li>
            <li>Open <b>developers.facebook.com/tools/explorer</b> (Graph API Explorer) and run:<br /><code className={codeChip}>GET /&#123;page-id&#125;?fields=instagram_business_account</code></li>
            <li>Copy the returned <code className={codeChip}>id</code> (starts with <b>17841...</b>) into <b>Instagram Account ID</b> above.</li>
            <li>No separate token needed — the Page Access Token above is reused. Just make sure the <code className={codeChip}>instagram_manage_messages</code> permission is enabled.</li>
          </ol>
        </div>
      </div>

      {/* Telegram */}
      <div className={cardClass}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-50">
              <Send className="h-5 w-5 text-sky-700" />
            </div>
            <div>
              <h2 className="text-[14px] font-semibold text-admin-text">Telegram</h2>
              <p className="text-[12px] text-admin-text-secondary">
                {telegram.botUsername ? `Connected as @${telegram.botUsername}` : 'Receive and reply to Telegram messages in your Inbox'}
              </p>
            </div>
          </div>
          <label className={enableLabel}>
            <input type="checkbox" checked={telegram.enabled} onChange={(e) => setTelegram({ ...telegram, enabled: e.target.checked })} className="h-4 w-4 accent-admin-text" />
            Enable
          </label>
        </div>
        <Input label="Bot Token" type="password" value={telegram.botToken} onChange={(e) => setTelegram({ ...telegram, botToken: e.target.value })} placeholder="123456789:AAF..." />
        <div className={helpBoxClass}>
          <p className="font-semibold text-admin-text">How to get the Bot Token (step by step):</p>
          <ol className="list-decimal space-y-1 pl-4">
            <li>Open Telegram and search for <b>@BotFather</b> → open the chat.</li>
            <li>Send <code className={codeChip}>/newbot</code>.</li>
            <li>Enter a <b>name</b> for your bot, then a <b>username</b> (must end with <code className={codeChip}>_bot</code>).</li>
            <li>BotFather replies with a token like <code className={codeChip}>123456789:AAF...</code> — copy it into <b>Bot Token</b> above.</li>
            <li>Click <b>Save</b>. The webhook is registered automatically. Anyone who messages your bot will now appear in your Inbox.</li>
          </ol>
        </div>
      </div>

      {/* Personal Telegram */}
      <div className={cardClass}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-50">
              <Send className="h-5 w-5 text-sky-700" />
            </div>
            <div>
              <h2 className="text-[14px] font-semibold text-admin-text">Personal Telegram</h2>
              <p className="text-[12px] text-admin-text-secondary">
                {tgp.status === 'connected'
                  ? `Connected — +${tgp.phone}${tgp.username ? ' (@' + tgp.username + ')' : ''}`
                  : 'Connect your own Telegram account by QR scan (like Telegram Desktop) — official Telegram API, no ban risk'}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {tgp.status === 'connected' ? (
              <>
                <StatusPill ok label="Connected" />
                <button
                  type="button"
                  className={secondaryBtn}
                  disabled={tgpBusy}
                  onClick={async () => {
                    if (!confirm('Disconnect this Telegram account?')) return;
                    setTgpBusy(true);
                    try { await tgPersonalApi.disconnect(); setTgp({ status: 'disconnected', phone: '' }); toast.success('Disconnected'); } catch { toast.error('Failed'); }
                    setTgpBusy(false);
                  }}
                >
                  {tgpBusy ? <Spinner /> : null} Disconnect
                </button>
              </>
            ) : (
              <StatusPill ok={false} label="Not connected" />
            )}
          </div>
        </div>

        {tgp.status !== 'connected' && (
          <>
            {!['awaiting_code', 'awaiting_password', 'verifying'].includes(tgp.status) && (
              <div className="space-y-3">
                {tgpMode === 'qr' ? (
                  <>
                    {tgp.status === 'qr' && tgp.qr ? (
                      <div className="flex flex-col items-center gap-3 py-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={tgp.qr} alt="Telegram login QR" className="h-56 w-56 rounded-lg border border-admin-border" />
                        <p className="text-center text-[12px] text-admin-text-secondary">
                          Open Telegram on your phone → <b>Settings → Devices → Link Desktop Device</b> → scan this QR. The code refreshes automatically.
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-wrap items-center gap-3">
                        <button type="button" className={primaryBtn} disabled={tgpBusy || tgp.status === 'connecting'} onClick={connectTgpQr}>
                          {(tgpBusy || tgp.status === 'connecting') ? <Spinner /> : null} Connect with QR
                        </button>
                        {tgp.status === 'error' && <span className="text-[12px] text-red-600">{tgp.error || 'Login failed'}</span>}
                      </div>
                    )}
                    <button type="button" className="text-[12px] font-medium text-[#005bd3] hover:underline" onClick={() => setTgpMode('phone')}>
                      Login with phone number + code instead
                    </button>
                  </>
                ) : (
                  <>
                    <Input label="Phone Number (with country code)" value={tgpPhone} onChange={(e) => setTgpPhone(e.target.value)} placeholder="+919876543210" />
                    <div className="flex flex-wrap items-center gap-3">
                      <button type="button" className={primaryBtn} disabled={tgpBusy || tgp.status === 'connecting'} onClick={connectTgp}>
                        {(tgpBusy || tgp.status === 'connecting') ? <Spinner /> : null} Send login code
                      </button>
                      {tgp.status === 'error' && <span className="text-[12px] text-red-600">{tgp.error || 'Login failed'}</span>}
                    </div>
                    <button type="button" className="text-[12px] font-medium text-[#005bd3] hover:underline" onClick={() => setTgpMode('qr')}>
                      Login with QR scan instead
                    </button>
                  </>
                )}
              </div>
            )}
            {tgp.status === 'awaiting_code' && (
              <div className="flex flex-wrap items-end gap-3">
                <div className="min-w-[200px] flex-1">
                  <Input label="Login Code (sent to your Telegram app)" value={tgpCode} onChange={(e) => setTgpCode(e.target.value)} placeholder="12345" />
                </div>
                <button
                  type="button"
                  className={primaryBtn}
                  disabled={tgpBusy}
                  onClick={async () => {
                    if (!tgpCode.trim()) return;
                    setTgpBusy(true);
                    try { await tgPersonalApi.code(tgpCode.trim()); setTgp({ ...tgp, status: 'verifying' }); setTgpCode(''); }
                    catch (err: unknown) { const e = err as { response?: { data?: { message?: string } } }; toast.error(e.response?.data?.message || 'Failed'); }
                    setTgpBusy(false);
                  }}
                >
                  {tgpBusy ? <Spinner /> : null} Verify code
                </button>
              </div>
            )}
            {tgp.status === 'awaiting_password' && (
              <div className="flex flex-wrap items-end gap-3">
                <div className="min-w-[200px] flex-1">
                  <Input label="Two-Step Verification Password" type="password" value={tgpPassword} onChange={(e) => setTgpPassword(e.target.value)} />
                </div>
                <button
                  type="button"
                  className={primaryBtn}
                  disabled={tgpBusy}
                  onClick={async () => {
                    if (!tgpPassword) return;
                    setTgpBusy(true);
                    try { await tgPersonalApi.password(tgpPassword); setTgp({ ...tgp, status: 'verifying' }); setTgpPassword(''); }
                    catch (err: unknown) { const e = err as { response?: { data?: { message?: string } } }; toast.error(e.response?.data?.message || 'Failed'); }
                    setTgpBusy(false);
                  }}
                >
                  {tgpBusy ? <Spinner /> : null} Verify password
                </button>
              </div>
            )}
            {tgp.status === 'verifying' && <p className="text-[12px] text-admin-text-subdued">Verifying...</p>}
          </>
        )}
        {tgp.status === 'connected' && (
          <p className="text-[12px] text-admin-text-secondary">
            Chats appear in the <b>Personal Telegram Inbox</b>. You can message anyone in your Telegram contacts/chats, and flows, keywords and AI auto-reply all work on this channel. This uses Telegram&apos;s official API — there is no ban risk.
          </p>
        )}
      </div>

      {/* Email */}
      <div className={cardClass}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50">
              <Mail className="h-5 w-5 text-orange-700" />
            </div>
            <div>
              <h2 className="text-[14px] font-semibold text-admin-text">Email Inbox</h2>
              <p className="text-[12px] text-admin-text-secondary">Emails sent to your support address appear in your Inbox and replies are sent from it</p>
            </div>
          </div>
          <label className={enableLabel}>
            <input type="checkbox" checked={emailCh.enabled} onChange={(e) => setEmailCh({ ...emailCh, enabled: e.target.checked })} className="h-4 w-4 accent-admin-text" />
            Enable
          </label>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Input label="IMAP Host (incoming)" value={emailCh.imapHost} onChange={(e) => setEmailCh({ ...emailCh, imapHost: e.target.value })} placeholder="imap.gmail.com" />
          <Input label="IMAP Port" type="number" value={String(emailCh.imapPort)} onChange={(e) => setEmailCh({ ...emailCh, imapPort: parseInt(e.target.value) || 993 })} />
          <Input label="SMTP Host (outgoing)" value={emailCh.smtpHost} onChange={(e) => setEmailCh({ ...emailCh, smtpHost: e.target.value })} placeholder="smtp.gmail.com" />
          <Input label="SMTP Port" type="number" value={String(emailCh.smtpPort)} onChange={(e) => setEmailCh({ ...emailCh, smtpPort: parseInt(e.target.value) || 587 })} />
          <Input label="Email Address" value={emailCh.user} onChange={(e) => setEmailCh({ ...emailCh, user: e.target.value })} placeholder="support@yourbusiness.com" />
          <Input label="Password / App Password" type="password" value={emailCh.pass} onChange={(e) => setEmailCh({ ...emailCh, pass: e.target.value })} />
        </div>
        <Input label="From Name (optional)" value={emailCh.fromName} onChange={(e) => setEmailCh({ ...emailCh, fromName: e.target.value })} placeholder="Your Business Support" />
        <div className={helpBoxClass}>
          <p className="font-semibold text-admin-text">How to connect Gmail (step by step):</p>
          <ol className="list-decimal space-y-1 pl-4">
            <li>In your Google Account → <b>Security</b>, turn on <b>2-Step Verification</b>.</li>
            <li>Go to <b>Google Account → Security → App passwords</b> and create a new app password (name it &quot;Codiic Panel&quot;). You get a 16-character password.</li>
            <li>Fill the fields above — IMAP: <code className={codeChip}>imap.gmail.com</code> port <b>993</b>; SMTP: <code className={codeChip}>smtp.gmail.com</code> port <b>587</b>.</li>
            <li>Enter your Gmail address, and in <b>Password / App Password</b> paste the <b>16-character App Password</b> (not your normal Gmail password).</li>
            <li>Click <b>Save configuration</b>. New emails are checked every 2 minutes and appear in your Inbox.</li>
          </ol>
        </div>
      </div>

      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-[12px] text-amber-900">
        <b>Webhook setup (one-time, in Meta App Dashboard):</b> Callback URL:{' '}
        <code className={codeChip}>{(typeof window !== 'undefined' ? window.location.origin : '')}/api/webhook/whatsapp</code>
        {' '}— Verify token is the same as your WhatsApp webhook. Subscribe to the &quot;messages&quot; field in both the Page and Instagram products.
      </div>

      <div className="flex justify-end">
        <button type="button" className={primaryBtn} disabled={saving} onClick={handleSave}>
          {saving ? <Spinner /> : null} Save configuration
        </button>
      </div>
    </div>
  );
}
