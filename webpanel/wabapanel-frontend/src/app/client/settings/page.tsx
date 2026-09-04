'use client';
import React, { useState, useEffect } from 'react';
import { Save, User, Key, Globe, Webhook, Plus, Trash2, Wrench } from 'lucide-react';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Tabs from '@/components/ui/Tabs';
import AccountSecurity from '@/components/AccountSecurity';
import { useAuthStore } from '@/stores/authStore';
import { authApi, workspaceApi } from '@/lib/api';
import toast from 'react-hot-toast';
import { adminContentColumnClass, dashboardCardShell } from '@/components/layout/dashboard-ui';

const primaryBtn =
  'inline-flex items-center justify-center gap-1.5 rounded-lg bg-admin-text px-3 py-1.5 text-[13px] font-semibold text-white transition-colors hover:bg-[#1a1a1a] disabled:cursor-not-allowed disabled:opacity-50';
const secondaryBtn =
  'inline-flex items-center justify-center gap-1.5 rounded-lg border border-admin-border bg-white px-3 py-1.5 text-[13px] font-medium text-admin-text transition-colors hover:bg-[#f6f6f7]';

const WEBHOOK_EVENTS: { value: string; label: string }[] = [
  { value: 'message.received', label: 'Incoming messages (real-time)' },
  { value: 'contact.created', label: 'New contact created' },
  { value: 'message.status', label: 'Message delivery status' },
];

interface ApiWebhook { _id: string; url: string; events: string[]; }

function EventWebhooks({ workspaceId }: { workspaceId?: string }) {
  const [hooks, setHooks] = useState<ApiWebhook[]>([]);
  const [url, setUrl] = useState('');
  const [events, setEvents] = useState<string[]>(['message.received']);
  const [busy, setBusy] = useState(false);

  const load = () => {
    if (!workspaceId) return;
    workspaceApi.listApiWebhooks(workspaceId).then((r) => setHooks(r.data.data || [])).catch(() => {});
  };
  useEffect(load, [workspaceId]);

  const toggleEvent = (ev: string) =>
    setEvents((prev) => (prev.includes(ev) ? prev.filter((e) => e !== ev) : [...prev, ev]));

  const add = async () => {
    if (!workspaceId) return;
    if (!/^https?:\/\//.test(url.trim())) { toast.error('Enter a valid http(s) URL'); return; }
    if (!events.length) { toast.error('Select at least one event'); return; }
    setBusy(true);
    try {
      await workspaceApi.addApiWebhook(workspaceId, { url: url.trim(), events });
      toast.success('Webhook added');
      setUrl(''); setEvents(['message.received']); load();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(e.response?.data?.message || 'Failed');
    }
    setBusy(false);
  };

  const remove = async (hookId: string) => {
    if (!workspaceId) return;
    try { await workspaceApi.deleteApiWebhook(workspaceId, hookId); load(); }
    catch { toast.error('Failed'); }
  };

  return (
    <div className="space-y-3 border-t border-admin-border pt-4">
      <h3 className="flex items-center gap-2 text-[14px] font-semibold text-admin-text"><Webhook className="h-4 w-4" /> Event Webhooks</h3>
      <p className="text-[12px] text-admin-text-subdued">Send events to your CRM / external system in real-time. We POST JSON <code>{'{ event, timestamp, data }'}</code> to your URL.</p>

      {hooks.length > 0 && (
        <div className="space-y-2">
          {hooks.map((h) => (
            <div key={h._id} className="flex items-start justify-between gap-3 rounded-lg border border-admin-border bg-[#f6f6f7] p-3">
              <div className="min-w-0">
                <code className="break-all font-mono text-[12px] text-admin-text">{h.url}</code>
                <div className="mt-1 flex flex-wrap gap-1">
                  {(h.events || []).map((e) => (
                    <span key={e} className="rounded border border-admin-border bg-white px-1.5 py-0.5 text-[10px] text-admin-text-secondary">{e}</span>
                  ))}
                </div>
              </div>
              <button type="button" onClick={() => remove(h._id)} className="shrink-0 rounded-lg p-1.5 text-admin-text-subdued hover:bg-red-50 hover:text-red-600" title="Delete">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <Input label="Webhook URL" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://your-crm.com/webhook" />
      <div className="space-y-1.5">
        <p className="text-[12px] font-medium text-admin-text-secondary">Events to send</p>
        {WEBHOOK_EVENTS.map((ev) => (
          <label key={ev.value} className="flex items-center gap-2 text-[13px] text-admin-text">
            <input type="checkbox" checked={events.includes(ev.value)} onChange={() => toggleEvent(ev.value)} className="h-4 w-4 rounded border-admin-border text-admin-text focus:ring-admin-border" />
            {ev.label} <code className="text-[10px] text-admin-text-subdued">{ev.value}</code>
          </label>
        ))}
      </div>
      <button type="button" onClick={add} disabled={busy} className={primaryBtn}>
        <Plus className="h-4 w-4" /> {busy ? 'Adding…' : 'Add Webhook'}
      </button>

      <details className="text-[12px] text-admin-text-subdued">
        <summary className="cursor-pointer hover:text-admin-text">Payload example</summary>
        <pre className="mt-1 overflow-x-auto rounded-lg bg-[#1a1a1a] p-3 text-gray-100">{`POST <your url>
{
  "event": "message.received",
  "timestamp": "2026-07-19T08:30:00Z",
  "data": {
    "phone": "9199XXXXXXXX",
    "type": "text",
    "text": "customer message",
    "contact_id": "...",
    "conversation_id": "..."
  }
}`}</pre>
      </details>
    </div>
  );
}

export default function SettingsPage() {
  const { user, currentWorkspace, updateUser } = useAuthStore();
  const [profile, setProfile] = useState({ name: user?.name || '', email: user?.email || '', phone: user?.phone || '' });
  const [wsSettings, setWsSettings] = useState({
    name: currentWorkspace?.name || '', timezone: currentWorkspace?.timezone || 'Asia/Kolkata',
    apiKey: currentWorkspace?.apiKey || '', webhookUrl: currentWorkspace?.webhookUrl || '',
  });
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleProfileSave = async () => {
    if (submitting) return;
    setSaving(true);
    setSubmitting(true);
    try {
      const res = await authApi.updateProfile(profile);
      updateUser(res.data.data);
      toast.success('Profile updated');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed');
    } finally {
      setSubmitting(false);
    }
    setSaving(false);
  };

  const handleWorkspaceSave = async () => {
    if (submitting) return;
    if (!currentWorkspace) return;
    setSaving(true);
    setSubmitting(true);
    try {
      await workspaceApi.update(currentWorkspace._id, wsSettings);
      toast.success('Business settings updated');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed');
    } finally {
      setSubmitting(false);
    }
    setSaving(false);
  };

  return (
    <div className={`${adminContentColumnClass} space-y-4`}>
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <Wrench className="h-5 w-5 shrink-0 text-admin-text-secondary" aria-hidden />
          <h1 className="text-[20px] font-semibold tracking-tight text-admin-text">Business Settings</h1>
        </div>
        <p className="mt-1 text-[13px] text-admin-text-secondary">Manage your account and business</p>
      </div>

      <Tabs tabs={[
        { key: 'profile', label: 'Profile', content: (
          <div className={dashboardCardShell}>
            <div className="max-w-lg space-y-4">
              <div className="mb-2 flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full border border-admin-border bg-[#f6f6f7] text-xl font-bold text-admin-text">
                  {user?.name?.charAt(0)}
                </div>
                <div>
                  <h3 className="font-semibold text-admin-text">{user?.name}</h3>
                  <p className="text-[13px] text-admin-text-secondary">{user?.email}</p>
                </div>
              </div>
              <Input label="Name" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} icon={<User className="h-4 w-4" />} />
              <Input label="Email" type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
              <Input label="Phone" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
              <button type="button" onClick={handleProfileSave} disabled={saving} className={primaryBtn}>
                <Save className="h-4 w-4" /> {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </div>
        )},
        { key: 'security', label: 'Security', content: (
          <div className={dashboardCardShell}>
            <AccountSecurity />
          </div>
        )},
        { key: 'workspace', label: 'Business', content: (
          <div className={dashboardCardShell}>
            <div className="max-w-lg space-y-4">
              <h3 className="flex items-center gap-2 text-[14px] font-semibold text-admin-text"><Globe className="h-4 w-4" /> Business Settings</h3>
              <Input label="Business Name" value={wsSettings.name} onChange={(e) => setWsSettings({ ...wsSettings, name: e.target.value })} />
              <Select label="Timezone" value={wsSettings.timezone} onChange={(e) => setWsSettings({ ...wsSettings, timezone: e.target.value })}
                options={[
                  { value: 'Asia/Kolkata', label: 'Asia/Kolkata (IST)' },
                  { value: 'UTC', label: 'UTC' },
                  { value: 'America/New_York', label: 'America/New_York (EST)' },
                  { value: 'Europe/London', label: 'Europe/London (GMT)' },
                ]} />
              <button type="button" onClick={handleWorkspaceSave} disabled={saving} className={primaryBtn}>
                <Save className="h-4 w-4" /> {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        )},
        { key: 'api', label: 'API & Webhooks', content: (
          <div className={dashboardCardShell}>
            <div className="max-w-lg space-y-4">
              <h3 className="flex items-center gap-2 text-[14px] font-semibold text-admin-text"><Key className="h-4 w-4" /> API Configuration</h3>
              <div className="rounded-lg border border-admin-border bg-[#f6f6f7] p-4">
                <p className="mb-1 text-[12px] text-admin-text-secondary">API Key</p>
                <code className="break-all font-mono text-[13px] text-admin-text">{wsSettings.apiKey || 'No API key generated'}</code>
              </div>
              <button
                type="button"
                className={secondaryBtn}
                onClick={async () => {
                  if (!currentWorkspace) return;
                  try {
                    const res = await workspaceApi.generateApiKey(currentWorkspace._id);
                    setWsSettings({ ...wsSettings, apiKey: res.data.data.apiKey });
                    toast.success('API key generated');
                  } catch { toast.error('Failed'); } finally { setSubmitting(false); }
                }}
              >
                Generate New API Key
              </button>
              <h3 className="flex items-center gap-2 pt-2 text-[14px] font-semibold text-admin-text"><Webhook className="h-4 w-4" /> Webhook URL</h3>
              <Input label="Webhook Endpoint" value={wsSettings.webhookUrl} onChange={(e) => setWsSettings({ ...wsSettings, webhookUrl: e.target.value })} placeholder="https://your-domain.com/webhook" />
              <button type="button" onClick={handleWorkspaceSave} disabled={saving} className={primaryBtn}>
                <Save className="h-4 w-4" /> {saving ? 'Saving…' : 'Save'}
              </button>

              <EventWebhooks workspaceId={currentWorkspace?._id} />
            </div>
          </div>
        )},
      ]} />
    </div>
  );
}
