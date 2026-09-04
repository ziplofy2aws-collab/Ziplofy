'use client';
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Palette, Save, Copy, Eye, ToggleLeft, ToggleRight, Code, MessageSquare, RefreshCw, X } from 'lucide-react';
import { chatAppearanceApi } from '@/lib/api';
import toast from 'react-hot-toast';
import { adminContentColumnClass, dashboardCardShell } from '@/components/layout/dashboard-ui';

const primaryBtn =
  'inline-flex items-center justify-center gap-1.5 rounded-lg bg-admin-text px-3 py-1.5 text-[13px] font-semibold text-white transition-colors hover:bg-[#1a1a1a] disabled:cursor-not-allowed disabled:opacity-50';
const secondaryBtn =
  'inline-flex items-center justify-center gap-1.5 rounded-lg border border-admin-border bg-white px-3 py-1.5 text-[13px] font-medium text-admin-text transition-colors hover:bg-[#f6f6f7] disabled:cursor-not-allowed disabled:opacity-50';
const inputClass =
  'w-full rounded-lg border border-admin-border bg-white px-3 py-2 text-[13px] text-admin-text placeholder:text-admin-text-subdued focus:outline-none focus:ring-2 focus:ring-[#005bd3]/30';
const labelClass = 'mb-1 block text-[12px] font-medium text-admin-text-secondary';
const cardClass = `${dashboardCardShell} !p-5`;

interface ChatAppearanceSettings {
  enabled: boolean;
  widgetColor: string;
  position: string;
  welcomeMessage: string;
  headerTitle: string;
  headerSubtitle: string;
  avatarUrl: string;
  buttonText: string;
  buttonIcon: string;
  showOnMobile: boolean;
  autoOpen: boolean;
  autoOpenDelay: number;
}

const defaultSettings: ChatAppearanceSettings = {
  enabled: false, widgetColor: '#25D366', position: 'bottom-right',
  welcomeMessage: 'Hi! How can we help you today?', headerTitle: 'Chat with us',
  headerSubtitle: 'We typically reply within minutes', avatarUrl: '',
  buttonText: '', buttonIcon: 'whatsapp', showOnMobile: true, autoOpen: false, autoOpenDelay: 5,
};

export default function ChatAppearancePage() {
  const [settings, setSettings] = useState<ChatAppearanceSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [embedCode, setEmbedCode] = useState('');
  const [showEmbed, setShowEmbed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    chatAppearanceApi.get()
      .then(r => { if (r.data.data) setSettings({ ...defaultSettings, ...r.data.data }); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (submitting) return;
    setSubmitting(true);

    setSaving(true);
    try {
      await chatAppearanceApi.update(settings);
      toast.success('Widget settings saved!');
    } catch { toast.error('Failed to save'); } finally { setSubmitting(false); }
    setSaving(false);
  };

  const handleGetEmbed = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const r = await chatAppearanceApi.getEmbedCode();
      setEmbedCode(r.data.data?.embedCode || '');
      setShowEmbed(true);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Enable widget first');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className={`${adminContentColumnClass} flex h-64 items-center justify-center`}>
        <RefreshCw className="h-6 w-6 animate-spin text-admin-text-subdued" />
      </div>
    );
  }

  return (
    <div className={`${adminContentColumnClass} space-y-4`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Palette className="h-5 w-5 shrink-0 text-admin-text-secondary" aria-hidden />
            <h1 className="text-[20px] font-semibold tracking-tight text-admin-text">Chat Widget</h1>
          </div>
          <p className="mt-1 text-[13px] text-admin-text-secondary">
            Customize the WhatsApp chat widget for your website
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setSettings({ ...settings, enabled: !settings.enabled })}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] font-semibold transition-colors ${
              settings.enabled
                ? 'bg-admin-text text-white'
                : 'bg-[#f6f6f7] text-admin-text-secondary'
            }`}
          >
            {settings.enabled ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
            {settings.enabled ? 'Widget ON' : 'Widget OFF'}
          </button>
          <button type="button" onClick={handleGetEmbed} className={secondaryBtn}>
            <Code className="h-4 w-4" /> Get Embed Code
          </button>
          <button type="button" onClick={handleSave} disabled={saving} className={primaryBtn}>
            <Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Settings */}
        <div className={`${cardClass} space-y-4`}>
          <h3 className="text-[13px] font-semibold text-admin-text">Widget Settings</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Widget Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={settings.widgetColor}
                  onChange={e => setSettings({ ...settings, widgetColor: e.target.value })}
                  className="h-10 w-10 cursor-pointer rounded-lg border border-admin-border"
                />
                <input
                  type="text"
                  value={settings.widgetColor}
                  onChange={e => setSettings({ ...settings, widgetColor: e.target.value })}
                  className={inputClass}
                />
              </div>
            </div>
            <div>
              <label className={labelClass}>Position</label>
              <select
                value={settings.position}
                onChange={e => setSettings({ ...settings, position: e.target.value })}
                className={inputClass}
              >
                <option value="bottom-right">Bottom Right</option>
                <option value="bottom-left">Bottom Left</option>
              </select>
            </div>
          </div>
          <div>
            <label className={labelClass}>Header Title</label>
            <input
              type="text"
              value={settings.headerTitle}
              onChange={e => setSettings({ ...settings, headerTitle: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Header Subtitle</label>
            <input
              type="text"
              value={settings.headerSubtitle}
              onChange={e => setSettings({ ...settings, headerSubtitle: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Welcome Message</label>
            <textarea
              value={settings.welcomeMessage}
              onChange={e => setSettings({ ...settings, welcomeMessage: e.target.value })}
              className={`${inputClass} h-20 resize-y`}
            />
          </div>
          <div>
            <label className={labelClass}>Button Text (optional)</label>
            <input
              type="text"
              value={settings.buttonText}
              onChange={e => setSettings({ ...settings, buttonText: e.target.value })}
              className={inputClass}
              placeholder="Chat with us"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Button Icon</label>
              <select
                value={settings.buttonIcon}
                onChange={e => setSettings({ ...settings, buttonIcon: e.target.value })}
                className={inputClass}
              >
                <option value="whatsapp">WhatsApp</option>
                <option value="chat">Chat Bubble</option>
                <option value="message">Message</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Auto-open Delay (sec)</label>
              <input
                type="number"
                value={settings.autoOpenDelay}
                onChange={e => setSettings({ ...settings, autoOpenDelay: parseInt(e.target.value) })}
                className={inputClass}
                min="1"
                max="60"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-admin-border p-3 hover:bg-[#f6f6f7]">
              <input
                type="checkbox"
                checked={settings.showOnMobile}
                onChange={e => setSettings({ ...settings, showOnMobile: e.target.checked })}
                className="h-4 w-4 rounded border-admin-border accent-admin-text"
              />
              <span className="text-[13px] text-admin-text">Show on mobile devices</span>
            </label>
            <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-admin-border p-3 hover:bg-[#f6f6f7]">
              <input
                type="checkbox"
                checked={settings.autoOpen}
                onChange={e => setSettings({ ...settings, autoOpen: e.target.checked })}
                className="h-4 w-4 rounded border-admin-border accent-admin-text"
              />
              <span className="text-[13px] text-admin-text">Auto-open widget after delay</span>
            </label>
          </div>
        </div>

        {/* Preview */}
        <div className={cardClass}>
          <h3 className="mb-4 flex items-center gap-2 text-[13px] font-semibold text-admin-text">
            <Eye className="h-4 w-4 text-admin-text-secondary" /> Live Preview
          </h3>
          <div className="relative h-[500px] overflow-hidden rounded-xl border border-admin-border bg-[#f6f6f7]">
            <div className="p-6 text-center text-[13px] text-admin-text-subdued">Your website content here</div>
            <div className={`absolute bottom-4 ${settings.position === 'bottom-right' ? 'right-4' : 'left-4'}`}>
              <div className="mb-3 w-72 overflow-hidden rounded-2xl border border-admin-border bg-white shadow-[0_8px_24px_rgba(16,24,40,0.12)]">
                <div className="p-4 text-white" style={{ backgroundColor: settings.widgetColor }}>
                  <h4 className="text-sm font-semibold">{settings.headerTitle}</h4>
                  <p className="text-xs opacity-80">{settings.headerSubtitle}</p>
                </div>
                <div className="p-4">
                  <div className="rounded-xl bg-[#f6f6f7] p-3 text-[13px] text-admin-text">{settings.welcomeMessage}</div>
                  <div className="mt-3 flex gap-2">
                    <input
                      type="text"
                      placeholder="Type a message..."
                      className="flex-1 rounded-full border border-admin-border px-3 py-2 text-xs"
                      disabled
                    />
                    <button
                      type="button"
                      className="flex h-8 w-8 items-center justify-center rounded-full text-white"
                      style={{ backgroundColor: settings.widgetColor }}
                    >
                      <MessageSquare className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg"
                style={{ backgroundColor: settings.widgetColor }}
              >
                <MessageSquare className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Embed Code Modal */}
      {showEmbed && mounted && createPortal(
        <div className="fixed inset-0 z-[1300] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-black/45" onClick={() => setShowEmbed(false)} />
          <div
            className="relative z-10 w-full max-w-lg overflow-hidden rounded-xl border border-admin-border bg-white shadow-[0_16px_48px_rgba(16,24,40,0.18)]"
            role="dialog"
            aria-modal="true"
            aria-label="Embed code"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-admin-border px-5 py-4">
              <h3 className="text-[16px] font-semibold tracking-tight text-admin-text">Embed Code</h3>
              <button
                type="button"
                onClick={() => setShowEmbed(false)}
                className="rounded-lg p-1.5 text-admin-text-subdued hover:bg-[#f6f6f7] hover:text-admin-text"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-5">
              <p className="mb-3 text-[13px] text-admin-text-secondary">
                Copy this code and paste it before the closing{' '}
                <code className="rounded bg-[#f6f6f7] px-1 text-admin-text">&lt;/body&gt;</code> tag of your website.
              </p>
              <div className="relative rounded-lg bg-[#1a1a1a] p-4">
                <pre className="overflow-x-auto whitespace-pre-wrap text-xs text-emerald-400">{embedCode}</pre>
                <button
                  type="button"
                  onClick={() => { navigator.clipboard.writeText(embedCode); toast.success('Embed code copied!'); }}
                  className="absolute right-2 top-2 rounded-lg bg-white/10 p-2 hover:bg-white/20"
                >
                  <Copy className="h-4 w-4 text-white" />
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
