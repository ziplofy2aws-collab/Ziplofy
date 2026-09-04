'use client';
import React, { useState, useEffect } from 'react';
import { Bot, Save, Shield, Target, MessageSquare, ToggleLeft, ToggleRight, RefreshCw, Brain, Key, TestTube, Sparkles, Upload, FileText, Trash2 } from 'lucide-react';
import { aiSettingsApi } from '@/lib/api';
import toast from 'react-hot-toast';
import { adminContentColumnClass, dashboardCardShell } from '@/components/layout/dashboard-ui';

const primaryBtn =
  'inline-flex items-center justify-center gap-1.5 rounded-lg bg-admin-text px-3 py-1.5 text-[13px] font-semibold text-white transition-colors hover:bg-[#1a1a1a] disabled:cursor-not-allowed disabled:opacity-50';
const secondaryBtn =
  'inline-flex items-center justify-center gap-1.5 rounded-lg border border-admin-border bg-white px-3 py-1.5 text-[13px] font-medium text-admin-text transition-colors hover:bg-[#f6f6f7] disabled:cursor-not-allowed disabled:opacity-50';
const inputClass =
  'w-full rounded-lg border border-admin-border bg-white px-3 py-2 text-[13px] text-admin-text placeholder:text-admin-text-subdued focus:outline-none focus:ring-2 focus:ring-[#005bd3]/30';
const labelClass = 'mb-1 block text-[12px] font-medium text-admin-text-secondary';
const hintClass = 'mb-2 text-[12px] text-admin-text-subdued';
const cardClass = `${dashboardCardShell} !p-5`;
const chipSelected = 'border-admin-text bg-admin-text text-white';
const chipUnselected = 'border-admin-border bg-white text-admin-text hover:bg-[#f6f6f7]';
const selectChip = (on: boolean) =>
  `rounded-lg border p-3 cursor-pointer transition-colors ${on ? 'border-admin-text bg-[#f6f6f7]' : 'border-admin-border hover:bg-[#fafafa]'}`;

interface AISettings {
  enabled: boolean;
  provider: string;
  apiKey: string;
  model: string;
  azureEndpoint?: string;
  azureDeployment?: string;
  azureApiVersion?: string;
  azureRealtimeEndpoint?: string;
  azureRealtimeKey?: string;
  azureRealtimeDeployment?: string;
  azureRealtimeApiVersion?: string;
  systemPrompt: string;
  knowledgeBase: string;
  temperature: number;
  maxTokens: number;
  language: string;
  tone: string;
  targetingRules: {
    mode: string;
    channels: string[];
    targets: { type: string; value: string }[];
    excludeTags: string[];
    excludeAssigned: boolean;
    excludeActiveConversation: boolean;
  };
  handoffRules: {
    keywords: string[];
    maxUnknownReplies: number;
    detectFrustration: boolean;
    autoHandoffMessage: string;
  };
  features: { voiceToText: boolean; leadScoring: boolean; autoSummary: boolean; sentiment: boolean; autoTranslate: boolean; autoTicket: boolean; ticketKeywords: string[]; voiceReplyVoice?: string };
  stats?: { totalReplies: number; totalHandoffs: number; totalTokensUsed: number };
}

const defaultSettings: AISettings = {
  enabled: false, provider: 'openai', apiKey: '', model: 'gpt-4o',
  azureEndpoint: '', azureDeployment: '', azureApiVersion: '2024-02-15-preview',
  azureRealtimeEndpoint: '', azureRealtimeKey: '', azureRealtimeDeployment: '', azureRealtimeApiVersion: '2024-10-01-preview',
  systemPrompt: 'You are a helpful WhatsApp business assistant. Be concise, friendly, and helpful.',
  knowledgeBase: '', temperature: 0.7, maxTokens: 500, language: 'auto', tone: 'friendly',
  targetingRules: { mode: 'all', channels: [], targets: [], excludeTags: [], excludeAssigned: true, excludeActiveConversation: true },
  handoffRules: { keywords: ['agent', 'human', 'person', 'help'], maxUnknownReplies: 3, detectFrustration: true, autoHandoffMessage: "I'm connecting you with a human agent. Please hold on." },
  features: { voiceToText: false, leadScoring: false, autoSummary: false, sentiment: false, autoTranslate: false, autoTicket: false, ticketKeywords: ['complaint', 'refund', 'problem', 'issue', 'not working'], voiceReplyVoice: 'openai' },
};

const targetOptions = [
  { value: 'all', label: 'All contacts', desc: 'AI replies to messages from all customers' },
  { value: 'new_leads', label: 'New leads only (24h)', desc: 'Only new leads (first 24 hours)' },
  { value: 'unassigned', label: 'Unassigned chats', desc: 'Chats not assigned to any agent' },
  { value: 'no_response', label: 'No response contacts', desc: 'Contacts with no reply sent yet' },
  { value: 'off_hours', label: 'Off-hours only', desc: 'AI replies only outside business hours' },
];

const MODEL_OPTIONS: Record<string, string[]> = {
  openai: ['gpt-4o', 'gpt-4o-mini', 'gpt-4.1', 'gpt-4.1-mini', 'gpt-4.1-nano', 'o4-mini', 'gpt-3.5-turbo'],
  gemini: ['gemini-2.5-pro', 'gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-2.0-flash-lite'],
  anthropic: ['claude-sonnet-4-20250514', 'claude-opus-4-20250514', 'claude-3-7-sonnet-20250219', 'claude-3-5-haiku-20241022'],
  deepseek: ['deepseek-chat', 'deepseek-reasoner'],
  xai: ['grok-3', 'grok-3-mini', 'grok-2-1212'],
  azure: ['gpt-4o', 'gpt-4o-mini', 'gpt-4.1', 'gpt-4', 'gpt-35-turbo'],
};

interface KbDoc { _id: string; filename: string; size: number; chars: number; status: string; note?: string; }

export default function AISettingsPage() {
  const [settings, setSettings] = useState<AISettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [submitting, setSubmitting] = useState(false);
  const [kbDocs, setKbDocs] = useState<KbDoc[]>([]);
  const [uploadingKb, setUploadingKb] = useState(false);

  const loadKbDocs = () => {
    aiSettingsApi.listKnowledgeDocs().then(r => setKbDocs(r.data.data || [])).catch(() => {});
  };
  useEffect(() => { loadKbDocs(); }, []);

  const handleKbUpload = async (files: FileList | null) => {
    if (!files || !files.length) return;
    setUploadingKb(true);
    try {
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append('file', file);
        const r = await aiSettingsApi.uploadKnowledgeDoc(fd);
        const d = r.data.data;
        if (d.status === 'no_text') toast('Uploaded ' + d.filename + ' \u2014 image/video saved, but no text could be read', { icon: '\u26A0\uFE0F' });
        else if (d.status === 'error') toast.error('Could not read ' + d.filename);
        else toast.success(d.filename + ' added (' + d.chars + ' chars)');
      }
      loadKbDocs();
    } catch (e) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || 'Upload failed');
    } finally {
      setUploadingKb(false);
    }
  };

  const handleKbDelete = async (id: string) => {
    try { await aiSettingsApi.deleteKnowledgeDoc(id); setKbDocs(docs => docs.filter(d => d._id !== id)); toast.success('Removed'); }
    catch { toast.error('Delete failed'); }
  };

  useEffect(() => {
    aiSettingsApi.get()
      .then(r => { if (r.data.data) setSettings({ ...defaultSettings, ...r.data.data, features: { ...defaultSettings.features, ...(r.data.data.features || {}) } }); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (submitting) return;
    setSubmitting(true);

    setSaving(true);
    try {
      await aiSettingsApi.update(settings);
      toast.success('AI Settings saved!');
    } catch { toast.error('Failed to save'); } finally { setSubmitting(false); }
    setSaving(false);
  };

  const handleTest = async () => {
    if (submitting) return;
    setTesting(true);
    setSubmitting(true);
    try {
      const r = await aiSettingsApi.test();
      toast.success('Connection successful! Response: ' + (r.data.data?.response || 'OK'));
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Connection failed');
    } finally {
      setSubmitting(false);
    }
    setTesting(false);
  };

  const toggleTarget = (type: string) => {
    const targets = settings.targetingRules.targets || [];
    const exists = targets.find(t => t.type === type);
    const newTargets = exists ? targets.filter(t => t.type !== type) : [...targets, { type, value: '' }];
    setSettings({ ...settings, targetingRules: { ...settings.targetingRules, targets: newTargets } });
  };

  const channelOptions = [
    { value: 'whatsapp', label: 'WhatsApp (Official API)' },
    { value: 'whatsapp_qr', label: 'WhatsApp by QR' },
    { value: 'telegram', label: 'Telegram Bot' },
    { value: 'telegram_personal', label: 'Personal Telegram' },
    { value: 'facebook', label: 'Facebook Messenger' },
    { value: 'instagram', label: 'Instagram DM' },
  ];

  const toggleChannel = (value: string) => {
    const channels = settings.targetingRules.channels || [];
    const newChannels = channels.includes(value) ? channels.filter(c => c !== value) : [...channels, value];
    setSettings({ ...settings, targetingRules: { ...settings.targetingRules, channels: newChannels } });
  };

  if (loading) {
    return (
      <div className={`${adminContentColumnClass} flex h-64 items-center justify-center`}>
        <RefreshCw className="h-6 w-6 animate-spin text-admin-text" />
      </div>
    );
  }

  const tabs = [
    { id: 'general', label: 'General', icon: <Brain className="h-4 w-4" /> },
    { id: 'prompt', label: 'Prompt & Knowledge', icon: <MessageSquare className="h-4 w-4" /> },
    { id: 'targeting', label: 'Targeting Rules', icon: <Target className="h-4 w-4" /> },
    { id: 'handoff', label: 'Handoff Rules', icon: <Shield className="h-4 w-4" /> },
    { id: 'features', label: 'AI Features', icon: <Sparkles className="h-4 w-4" /> },
  ];

  return (
    <div className={`${adminContentColumnClass} space-y-4`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 shrink-0 text-admin-text-secondary" aria-hidden />
            <h1 className="text-[20px] font-semibold tracking-tight text-admin-text">AI Chatbot Settings</h1>
          </div>
          <p className="mt-1 text-[13px] text-admin-text-secondary">Configure AI auto-reply for incoming WhatsApp messages</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setSettings({ ...settings, enabled: !settings.enabled })}
            className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-[13px] font-medium transition-colors ${
              settings.enabled ? chipSelected : `${chipUnselected}`
            }`}
          >
            {settings.enabled ? <ToggleRight className="h-5 w-5" /> : <ToggleLeft className="h-5 w-5" />}
            {settings.enabled ? 'AI Active' : 'AI Inactive'}
          </button>
          <button type="button" onClick={handleSave} disabled={saving} className={primaryBtn}>
            <Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>

      {settings.stats && (
        <div className="grid grid-cols-3 gap-3">
          <div className={dashboardCardShell}>
            <p className="text-[12px] text-admin-text-secondary">AI Replies</p>
            <p className="mt-1 text-xl font-semibold tabular-nums text-admin-text">{settings.stats.totalReplies}</p>
          </div>
          <div className={dashboardCardShell}>
            <p className="text-[12px] text-admin-text-secondary">Handoffs to Human</p>
            <p className="mt-1 text-xl font-semibold tabular-nums text-admin-text">{settings.stats.totalHandoffs}</p>
          </div>
          <div className={dashboardCardShell}>
            <p className="text-[12px] text-admin-text-secondary">Tokens Used</p>
            <p className="mt-1 text-xl font-semibold tabular-nums text-admin-text">{settings.stats.totalTokensUsed?.toLocaleString()}</p>
          </div>
        </div>
      )}

      <div className="flex gap-1 overflow-x-auto border-b border-admin-border">
        {tabs.map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex shrink-0 items-center gap-2 border-b-2 px-3 py-2.5 text-[13px] font-medium transition-colors ${
              activeTab === tab.id
                ? 'border-admin-text text-admin-text'
                : 'border-transparent text-admin-text-secondary hover:text-admin-text'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      <div className={cardClass}>
        {activeTab === 'general' && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>AI Provider</label>
                <select value={settings.provider} onChange={e => setSettings({ ...settings, provider: e.target.value })}
                  className={inputClass}>
                  <option value="openai">OpenAI (ChatGPT)</option>
                  <option value="gemini">Google Gemini</option>
                  <option value="anthropic">Anthropic (Claude)</option>
                  <option value="deepseek">DeepSeek</option>
                  <option value="xai">xAI (Grok)</option>
                  <option value="azure">Azure OpenAI</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Model</label>
                <select value={MODEL_OPTIONS[settings.provider]?.includes(settings.model) ? settings.model : 'custom'}
                  onChange={e => { if (e.target.value !== 'custom') setSettings({ ...settings, model: e.target.value }); else setSettings({ ...settings, model: '' }); }}
                  className={inputClass}>
                  {(MODEL_OPTIONS[settings.provider] || []).map(m => <option key={m} value={m}>{m}</option>)}
                  <option value="custom">Custom model...</option>
                </select>
                {!MODEL_OPTIONS[settings.provider]?.includes(settings.model) && (
                  <input type="text" value={settings.model} onChange={e => setSettings({ ...settings, model: e.target.value })}
                    className={`${inputClass} mt-2`} placeholder="Enter model name (e.g. gpt-4o)" />
                )}
              </div>
            </div>
            {settings.provider === 'azure' && (
              <div className="grid grid-cols-1 gap-4 rounded-lg border border-admin-border bg-[#fafafa] p-4">
                <p className="text-[13px] font-semibold text-admin-text">Chat AI — WhatsApp text auto-reply</p>
                <p className="text-[12px] text-admin-text-secondary">These settings are for <b>chat / text replies</b> (answering WhatsApp messages). Azure OpenAI uses your resource Endpoint plus the Deployment name you created in Azure (not the plain model name). Find these in Azure Portal → your resource → Keys and Endpoint / Deployments. Enter its key in the <b>Chat API Key</b> field below.</p>
                <div>
                  <label className={labelClass}>Azure Endpoint</label>
                  <input type="text" value={settings.azureEndpoint || ''} onChange={e => setSettings({ ...settings, azureEndpoint: e.target.value })}
                    className={inputClass} placeholder="https://your-resource.openai.azure.com" />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelClass}>Deployment Name</label>
                    <input type="text" value={settings.azureDeployment || ''} onChange={e => setSettings({ ...settings, azureDeployment: e.target.value })}
                      className={inputClass} placeholder="e.g. gpt-4o" />
                  </div>
                  <div>
                    <label className={labelClass}>API Version</label>
                    <input type="text" value={settings.azureApiVersion || ''} onChange={e => setSettings({ ...settings, azureApiVersion: e.target.value })}
                      className={inputClass} placeholder="2024-02-15-preview" />
                  </div>
                </div>
                <div>
                  <label className={`${labelClass} flex items-center gap-2`}><Key className="h-3.5 w-3.5" /> Chat API Key</label>
                  <div className="flex gap-2">
                    <input type="password" value={settings.apiKey} onChange={e => setSettings({ ...settings, apiKey: e.target.value })}
                      className={`flex-1 ${inputClass}`} placeholder="Azure resource key (for chat)" />
                    <button type="button" onClick={handleTest} disabled={testing} className={secondaryBtn}>
                      <TestTube className="h-4 w-4" /> {testing ? 'Testing...' : 'Test'}
                    </button>
                  </div>
                </div>
              </div>
            )}
            {settings.provider === 'azure' && (
              <div className="grid grid-cols-1 gap-4 rounded-lg border border-admin-border bg-[#fafafa] p-4">
                <p className="text-[13px] font-semibold text-admin-text">AI Calling — voice (phone calls)</p>
                <p className="text-[12px] text-admin-text-secondary">These settings are only for <b>voice / calling</b> (separate from chat). A realtime voice model usually lives in its own Azure resource, so its Endpoint &amp; Key can differ from the chat ones above. Leave Endpoint/Key blank to reuse the chat ones. <b>Fill in the Deployment Name to enable Azure calling.</b> (The voice is chosen on the AI Calling Settings page — use <b>marin/cedar</b> for the most human-sounding voice.)</p>
                <div>
                  <label className={labelClass}>Realtime Endpoint (optional)</label>
                  <input type="text" value={settings.azureRealtimeEndpoint || ''} onChange={e => setSettings({ ...settings, azureRealtimeEndpoint: e.target.value })}
                    className={inputClass} placeholder="https://your-realtime-resource.cognitiveservices.azure.com" />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelClass}>Realtime Deployment Name</label>
                    <input type="text" value={settings.azureRealtimeDeployment || ''} onChange={e => setSettings({ ...settings, azureRealtimeDeployment: e.target.value })}
                      className={inputClass} placeholder="e.g. gpt-realtime-2.1" />
                  </div>
                  <div>
                    <label className={labelClass}>Realtime API Version</label>
                    <input type="text" value={settings.azureRealtimeApiVersion || ''} onChange={e => setSettings({ ...settings, azureRealtimeApiVersion: e.target.value })}
                      className={inputClass} placeholder="2024-10-01-preview" />
                  </div>
                </div>
                <div>
                  <label className={`${labelClass} flex items-center gap-2`}><Key className="h-3.5 w-3.5" /> Realtime API Key (optional)</label>
                  <input type="password" value={settings.azureRealtimeKey || ''} onChange={e => setSettings({ ...settings, azureRealtimeKey: e.target.value })}
                    className={inputClass} placeholder="leave blank to reuse chat key" />
                </div>
              </div>
            )}
            {settings.provider !== 'azure' && (
              <div>
                <label className={`${labelClass} flex items-center gap-2`}><Key className="h-3.5 w-3.5" /> API Key</label>
                <div className="flex gap-2">
                  <input type="password" value={settings.apiKey} onChange={e => setSettings({ ...settings, apiKey: e.target.value })}
                    className={`flex-1 ${inputClass}`} placeholder="sk-..." />
                  <button type="button" onClick={handleTest} disabled={testing} className={secondaryBtn}>
                    <TestTube className="h-4 w-4" /> {testing ? 'Testing...' : 'Test'}
                  </button>
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className={labelClass}>Temperature ({settings.temperature})</label>
                <input type="range" min="0" max="2" step="0.1" value={settings.temperature}
                  onChange={e => setSettings({ ...settings, temperature: parseFloat(e.target.value) })}
                  className="w-full accent-admin-text" />
              </div>
              <div>
                <label className={labelClass}>Max Tokens</label>
                <input type="number" value={settings.maxTokens} onChange={e => setSettings({ ...settings, maxTokens: parseInt(e.target.value) })}
                  className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Tone</label>
                <select value={settings.tone} onChange={e => setSettings({ ...settings, tone: e.target.value })}
                  className={inputClass}>
                  <option value="friendly">Friendly</option>
                  <option value="professional">Professional</option>
                  <option value="formal">Formal</option>
                  <option value="casual">Casual</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'prompt' && (
          <div className="space-y-5">
            <div>
              <label className={labelClass}>System Prompt</label>
              <p className={hintClass}>Tell the AI who it is, how to behave, and what your business does</p>
              <textarea value={settings.systemPrompt} onChange={e => setSettings({ ...settings, systemPrompt: e.target.value })}
                className={`${inputClass} h-32 resize-y`} placeholder="You are a helpful assistant for [Your Business]..." />
            </div>
            <div>
              <label className={labelClass}>Knowledge Base</label>
              <p className={hintClass}>Add your FAQ, product info, pricing, policies — AI will use this to answer questions</p>
              <textarea value={settings.knowledgeBase} onChange={e => setSettings({ ...settings, knowledgeBase: e.target.value })}
                className={`${inputClass} h-48 resize-y`} placeholder="Products: &#10;- Product A: ₹999, features...&#10;- Product B: ₹1999, features...&#10;&#10;FAQ:&#10;Q: What are your working hours?&#10;A: Mon-Sat, 10AM-7PM IST" />
            </div>
            <div>
              <label className={labelClass}>Knowledge Files</label>
              <p className={hintClass}>Upload PDF, Word, Excel, CSV or text files (product lists, catalogs, price sheets). The AI reads their text and uses it to answer. Images and videos are stored for reference, but their text cannot be read.</p>
              <label className={`flex cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed py-6 transition-colors ${
                uploadingKb
                  ? 'border-admin-border bg-[#fafafa] text-admin-text-subdued'
                  : 'border-admin-border bg-white text-admin-text hover:bg-[#f6f6f7]'
              }`}>
                <Upload className="h-5 w-5" />
                <span className="text-[13px] font-medium">{uploadingKb ? 'Uploading…' : 'Click to upload files'}</span>
                <span className="text-[11px] text-admin-text-subdued">PDF, DOCX, XLSX, CSV, TXT, images (max 50MB each)</span>
                <input type="file" multiple className="hidden" disabled={uploadingKb}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,image/*,video/mp4"
                  onChange={e => { handleKbUpload(e.target.files); e.currentTarget.value=''; }} />
              </label>
              {kbDocs.length > 0 && (
                <div className="mt-3 space-y-2">
                  {kbDocs.map(d => (
                    <div key={d._id} className="flex items-center gap-3 rounded-lg border border-admin-border bg-white px-3 py-2">
                      <FileText className="h-4 w-4 shrink-0 text-admin-text-subdued" />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-[13px] text-admin-text">{d.filename}</div>
                        <div className="text-[11px] text-admin-text-subdued">
                          {(d.size/1024).toFixed(0)} KB
                          {d.status === 'ready' && d.chars ? ` · ${d.chars} chars read` : ''}
                          {d.status === 'no_text' ? ' · no text (stored for reference)' : ''}
                          {d.status === 'error' ? ' · could not read' : ''}
                        </div>
                      </div>
                      {d.status === 'ready' && (
                        <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-700">Ready</span>
                      )}
                      <button type="button" onClick={() => handleKbDelete(d._id)} className="shrink-0 text-admin-text-subdued hover:text-red-500" title="Remove"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'targeting' && (
          <div className="space-y-5">
            <div>
              <label className={labelClass}>Which channels should AI reply on?</label>
              <p className={hintClass}>Pick the channels where the AI auto-reply is active. Leave all unchecked to enable AI on every channel.</p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {channelOptions.map(opt => {
                  const on = settings.targetingRules.channels?.includes(opt.value) || false;
                  return (
                    <label key={opt.value} className={selectChip(on)}>
                      <input type="checkbox" className="hidden" checked={on} onChange={() => toggleChannel(opt.value)} />
                      <p className="text-[13px] font-medium text-admin-text">{opt.label}</p>
                    </label>
                  );
                })}
              </div>
            </div>
            <div className="border-t border-admin-border pt-4">
              <label className={labelClass}>Who should AI reply to?</label>
              <p className={hintClass}>Pick one or more categories — AI will auto-reply to messages from the selected ones</p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {targetOptions.map(opt => {
                  const on = settings.targetingRules.targets?.some(t => t.type === opt.value) || false;
                  return (
                    <label key={opt.value} className={selectChip(on)}>
                      <input type="checkbox" className="hidden" checked={on} onChange={() => toggleTarget(opt.value)} />
                      <p className="text-[13px] font-medium text-admin-text">{opt.label}</p>
                      <p className="text-[12px] text-admin-text-secondary">{opt.desc}</p>
                    </label>
                  );
                })}
              </div>
            </div>
            <div className="space-y-3 border-t border-admin-border pt-4">
              <h4 className="text-[13px] font-medium text-admin-text">Exclude from AI replies:</h4>
              <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-admin-border p-3 hover:bg-[#fafafa]">
                <input type="checkbox" checked={settings.targetingRules.excludeAssigned}
                  onChange={e => setSettings({ ...settings, targetingRules: { ...settings.targetingRules, excludeAssigned: e.target.checked } })}
                  className="h-4 w-4 rounded border-admin-border accent-admin-text" />
                <span className="text-[13px] text-admin-text">Exclude chats assigned to an agent (agent handles, not AI)</span>
              </label>
              <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-admin-border p-3 hover:bg-[#fafafa]">
                <input type="checkbox" checked={settings.targetingRules.excludeActiveConversation}
                  onChange={e => setSettings({ ...settings, targetingRules: { ...settings.targetingRules, excludeActiveConversation: e.target.checked } })}
                  className="h-4 w-4 rounded border-admin-border accent-admin-text" />
                <span className="text-[13px] text-admin-text">Exclude active human conversations (if agent replied in last 30 min)</span>
              </label>
            </div>
          </div>
        )}

        {activeTab === 'features' && (
          <div className="space-y-3">
            <p className="text-[12px] text-admin-text-subdued">Each feature has its own on/off toggle. The AI API key is set in the General tab — if the key is missing or a feature is off, that feature is silently skipped and the panel works normally.</p>
            {([
              ['voiceToText', 'Voice Message → Text', 'Automatically converts customer voice notes to text (requires OpenAI provider) — AI replies also work on voice messages'],
              ['leadScoring', 'AI Lead Scoring', 'Automatic 🔥 Hot / Warm / Cold badge on every lead (shown in the chat list)'],
              ['autoSummary', 'Conversation Auto Summary', '✨ Summary button in the chat header — AI summary of the whole conversation'],
              ['sentiment', 'Sentiment Analysis', '😟 flag in the chat list for unhappy customers'],
              ['autoTranslate', 'Auto Translation', 'Shows an English translation below messages written in other languages'],
              ['autoTicket', 'Auto Ticket Creation', 'Automatically creates a ticket when a message contains complaint keywords'],
            ] as [string, string, string][]).map(([key, label, desc]) => {
              const feats = settings.features as unknown as Record<string, boolean>;
              return (
                <div key={key} className="flex items-center justify-between rounded-lg border border-admin-border p-3">
                  <div className="pr-3">
                    <p className="text-[13px] font-medium text-admin-text">{label}</p>
                    <p className="text-[12px] text-admin-text-subdued">{desc}</p>
                  </div>
                  <button type="button" onClick={() => setSettings({ ...settings, features: { ...settings.features, [key]: !feats[key] } })}>
                    {feats[key]
                      ? <ToggleRight className="h-9 w-9 text-admin-text" />
                      : <ToggleLeft className="h-9 w-9 text-admin-text-subdued" />}
                  </button>
                </div>
              );
            })}
            {settings.features.voiceToText && (
              <div className="rounded-lg border border-admin-border bg-[#fafafa] p-3">
                <label className={labelClass}>Which voice should voice replies use?</label>
                <select value={settings.features.voiceReplyVoice || 'openai'}
                  onChange={e => setSettings({ ...settings, features: { ...settings.features, voiceReplyVoice: e.target.value } })}
                  className={inputClass}>
                  <option value="openai">Standard AI (OpenAI TTS) — uses the OpenAI key from the General tab</option>
                  <option value="calling_agent">Calling Agent voice — the ElevenLabs / Sarvam / Cartesia voice from your AI Calling agent</option>
                </select>
                <p className="mt-1.5 text-[12px] text-admin-text-subdued">When Calling Agent is selected: your agent under AI Calling must have a voice provider, its API key, and a voice ID configured — the same voice (best for Hindi) will also speak in chat voice replies. If the agent voice fails, it falls back to OpenAI.</p>
              </div>
            )}
            {settings.features.autoTicket && (
              <div>
                <label className={labelClass}>Ticket Keywords (comma separated)</label>
                <input value={settings.features.ticketKeywords.join(', ')}
                  onChange={e => setSettings({ ...settings, features: { ...settings.features, ticketKeywords: e.target.value.split(',').map(s => s.trim()).filter(Boolean) } })}
                  className={inputClass} placeholder="complaint, refund, problem" />
              </div>
            )}
          </div>
        )}

        {activeTab === 'handoff' && (
          <div className="space-y-5">
            <div>
              <label className={labelClass}>Handoff Keywords</label>
              <p className={hintClass}>When customer types these words, AI transfers to human agent</p>
              <input type="text" value={settings.handoffRules.keywords?.join(', ')}
                onChange={e => setSettings({ ...settings, handoffRules: { ...settings.handoffRules, keywords: e.target.value.split(',').map(k => k.trim()).filter(k => k) } })}
                className={inputClass} placeholder="agent, human, person, help, complaint" />
            </div>
            <div>
              <label className={labelClass}>Max Unknown Replies Before Handoff</label>
              <input type="number" value={settings.handoffRules.maxUnknownReplies}
                onChange={e => setSettings({ ...settings, handoffRules: { ...settings.handoffRules, maxUnknownReplies: parseInt(e.target.value) } })}
                className={inputClass} min="1" max="10" />
            </div>
            <div>
              <label className={labelClass}>Handoff Message</label>
              <textarea value={settings.handoffRules.autoHandoffMessage}
                onChange={e => setSettings({ ...settings, handoffRules: { ...settings.handoffRules, autoHandoffMessage: e.target.value } })}
                className={`${inputClass} h-20 resize-y`} />
            </div>
            <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-admin-border p-3 hover:bg-[#fafafa]">
              <input type="checkbox" checked={settings.handoffRules.detectFrustration}
                onChange={e => setSettings({ ...settings, handoffRules: { ...settings.handoffRules, detectFrustration: e.target.checked } })}
                className="h-4 w-4 rounded border-admin-border accent-admin-text" />
              <div>
                <span className="text-[13px] font-medium text-admin-text">Detect frustration</span>
                <p className="text-[12px] text-admin-text-subdued">Auto-handoff when customer seems frustrated or angry</p>
              </div>
            </label>
          </div>
        )}
      </div>
    </div>
  );
}
