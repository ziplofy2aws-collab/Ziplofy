'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { Zap, Plus, Trash2, RefreshCw, Send, AlertTriangle, FileText, BarChart3, Pencil, Upload, Square } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import CampaignReportModal from '@/components/campaigns/CampaignReportModal';
import WaTextarea from '@/components/ui/WaTextarea';
import { smartBroadcastApi, tagApi, segmentApi, mediaApi } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
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
const tableShell = `${dashboardCardShell} overflow-hidden !p-0`;

interface SeedTemplate { key: string; title: string; varCount: number; body: string }
interface TplButton { type: 'quick_reply' | 'url' | 'phone'; text: string; value: string }
interface TplHeader { type: 'none' | 'text' | 'image' | 'video' | 'document'; content?: string; mediaUrl?: string }
interface SmartTemplate {
  _id: string; name: string; body: string; status: string;
  smartVarCount: number; language: string; rejectionReason?: string; createdAt: string;
  header?: TplHeader; footer?: string; buttons?: TplButton[];
}
interface CampaignReport {
  _id: string; name: string; status: string; createdAt: string;
  template?: { name?: string } | null;
  stats: { totalRecipients: number; sent: number; delivered: number; read: number; failed: number };
}
interface ReportTarget {
  id: string; name: string;
}
interface TagItem { _id: string; name: string }
interface SegmentItem { _id: string; name: string }

const statusColor = (s: string) =>
  s === 'approved' || s === 'completed' ? 'success' : s === 'rejected' || s === 'failed' ? 'danger' : 'default';

// Mirrors the backend line-to-variable mapping for the live preview.
// 0-variable templates send the approved body as-is.
const fillBody = (body: string, message: string, varCount: number) => {
  if (!varCount || varCount < 1) return body;
  const lines = message.split('\n');
  let out = body;
  for (let i = 1; i <= varCount; i++) {
    const val = i < varCount ? (lines[i - 1] != null ? lines[i - 1].trim() : '') : lines.slice(varCount - 1).map((l) => l.trim()).join(' ');
    out = out.split(`{{${i}}}`).join(val || ' ');
  }
  return out;
};

const emptyForm = {
  name: '', body: '', footer: '',
  headerType: 'none' as TplHeader['type'], headerText: '', headerMediaUrl: '',
  buttons: [] as TplButton[],
  optOutButton: false, optOutFooter: false,
};

const OPT_OUT_FOOTER = 'Reply STOP to unsubscribe';
const isStopButton = (b: TplButton) => b.type === 'quick_reply' && /^\s*stop\s*$/i.test(b.text || '');

export default function SmartBroadcastPage() {
  const [tab, setTab] = useState<'templates' | 'send' | 'reports'>('templates');
  const [catalog, setCatalog] = useState<SeedTemplate[]>([]);
  const [templates, setTemplates] = useState<SmartTemplate[]>([]);
  const [reports, setReports] = useState<CampaignReport[]>([]);
  const [tags, setTags] = useState<TagItem[]>([]);
  const [segments, setSegments] = useState<SegmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [acknowledged, setAcknowledged] = useState(false);

  // create/edit template modal
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState('');
  const [seedKey, setSeedKey] = useState('');
  const [form, setForm] = useState({ ...emptyForm });
  const [savingTpl, setSavingTpl] = useState(false);
  const [uploading, setUploading] = useState(false);

  // send form
  const [sendForm, setSendForm] = useState({
    name: '', templateId: '', message: '', headerMediaUrl: '',
    targetType: 'all', targetTags: [] as string[], targetSegments: [] as string[],
    numbersText: '', senderNumberId: '',
  });
  const [sending, setSending] = useState(false);
  const [reportTarget, setReportTarget] = useState<ReportTarget | null>(null);
  // One value per {{n}} placeholder of the selected template.
  const [varVals, setVarVals] = useState<string[]>([]);

  const { currentWorkspace } = useAuthStore();
  const waNumbers = useMemo(() => {
    const wa = currentWorkspace?.whatsapp;
    if (!wa) return [] as { id: string; label: string }[];
    const list = [{ id: wa.phoneNumberId || '', label: `${wa.displayName || 'Default'} (${wa.phoneNumber || wa.phoneNumberId || ''})` }];
    for (const n of (wa.extraNumbers || [])) {
      list.push({ id: n.phoneNumberId, label: `${n.displayName || 'Number'} (${n.phoneNumber || n.phoneNumberId})` });
    }
    return list.filter((n) => n.id);
  }, [currentWorkspace]);

  const load = async () => {
    setLoading(true);
    try {
      const [tplRes, tagRes, segRes] = await Promise.all([
        smartBroadcastApi.templates(), tagApi.list(), segmentApi.list(),
      ]);
      setCatalog(tplRes.data.data.catalog || []);
      setTemplates(tplRes.data.data.templates || []);
      setTags(tagRes.data.data || []);
      setSegments(segRes.data.data || []);
    } catch { /* */ }
    setLoading(false);
  };

  const loadReports = async () => {
    try { const r = await smartBroadcastApi.reports(); setReports(r.data.data || []); } catch { /* */ }
  };

  useEffect(() => { load(); }, []);
  useEffect(() => { if (tab === 'reports') loadReports(); }, [tab]);
  // Auto-refresh reports while a campaign is running.
  useEffect(() => {
    if (tab !== 'reports' || !reports.some((c) => c.status === 'running')) return;
    const t = setInterval(loadReports, 5000);
    return () => clearInterval(t);
  }, [tab, reports]);

  const stopCampaign = async (id: string) => {
    try { await smartBroadcastApi.stopCampaign(id); toast.success('Campaign stopped'); loadReports(); }
    catch { toast.error('Stop failed'); }
  };

  const approvedTemplates = templates.filter((t) => t.status === 'approved');
  const selectedTemplate = templates.find((t) => t._id === sendForm.templateId);

  // The body line that contains {{n}}, shown as context next to each input.
  const varContext = (body: string, n: number) =>
    (String(body || '').split('\n').find((l) => l.includes(`{{${n}}}`)) || '').trim();

  // Keep sendForm.message as the newline-joined values so the existing backend
  // line-to-variable mapping ({{1}}=line 1, {{2}}=line 2, …) works unchanged.
  const setVar = (idx: number, val: string) => {
    const next = [...varVals];
    next[idx] = val.replace(/[\n\r]+/g, ' ');
    setVarVals(next);
    setSendForm((f) => ({ ...f, message: next.join('\n') }));
  };

  const selectTemplate = (id: string) => {
    const t = templates.find((x) => x._id === id);
    setVarVals(Array((t?.smartVarCount ?? 0)).fill(''));
    setSendForm((f) => ({ ...f, templateId: id, headerMediaUrl: '', message: '' }));
  };

  const openCreate = () => {
    setEditingId(''); setSeedKey(''); setForm({ ...emptyForm }); setShowCreate(true);
  };

  const openEdit = (t: SmartTemplate) => {
    setEditingId(t._id); setSeedKey('');
    setForm({
      name: t.name, body: t.body, footer: t.footer || '',
      headerType: t.header?.type || 'none', headerText: t.header?.content || '', headerMediaUrl: t.header?.mediaUrl || '',
      buttons: (t.buttons || []).map((b) => ({ type: b.type, text: b.text, value: b.value })),
      optOutButton: false, optOutFooter: false,
    });
    setShowCreate(true);
  };

  const pickSeed = (key: string) => {
    setSeedKey(key);
    const seed = catalog.find((c) => c.key === key);
    if (seed) setForm((f) => ({ ...f, name: f.name || `sb_${seed.key}_${Date.now().toString(36)}`, body: seed.body }));
  };

  const uploadMedia = async (e: React.ChangeEvent<HTMLInputElement>, target: 'template' | 'send') => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('folder', 'smart-broadcast');
      const res = await mediaApi.upload(fd);
      const url = res.data?.data?.url || res.data?.url || '';
      if (target === 'template') setForm((f) => ({ ...f, headerMediaUrl: url }));
      else setSendForm((f) => ({ ...f, headerMediaUrl: url }));
      toast.success('Uploaded');
    } catch { toast.error('Upload failed'); }
    setUploading(false);
    e.target.value = '';
  };

  const setButton = (i: number, patch: Partial<TplButton>) =>
    setForm((f) => ({ ...f, buttons: f.buttons.map((b, j) => (j === i ? { ...b, ...patch } : b)) }));

  const saveTemplate = async () => {
    if (!form.name || !form.body) { toast.error('Name and body are required'); return; }
    if (['image', 'video', 'document'].includes(form.headerType) && !form.headerMediaUrl) {
      toast.error('Upload the header media or paste its URL'); return;
    }
    let buttons = form.buttons.filter((b) => b.text);
    // Opt-out “Stop” quick-reply button: add if requested and not already present.
    if (form.optOutButton && !buttons.some(isStopButton)) {
      if (buttons.length >= 3) { toast.error('Remove a button first — max 3 buttons (opt-out Stop needs one slot)'); return; }
      buttons = [...buttons, { type: 'quick_reply', text: 'Stop', value: '' }];
    }
    // Opt-out footer line (Meta footer max 60 chars).
    let footer = form.footer || '';
    if (form.optOutFooter && !footer.toLowerCase().includes('stop')) {
      footer = footer ? `${footer} · ${OPT_OUT_FOOTER}`.slice(0, 60) : OPT_OUT_FOOTER;
    }
    setSavingTpl(true);
    try {
      const payload = {
        name: form.name,
        body: form.body,
        footer,
        header: form.headerType === 'none' ? { type: 'none' }
          : form.headerType === 'text' ? { type: 'text', content: form.headerText }
          : { type: form.headerType, mediaUrl: form.headerMediaUrl },
        buttons,
      };
      if (editingId) await smartBroadcastApi.updateTemplate(editingId, payload);
      else await smartBroadcastApi.createTemplate(payload);
      toast.success('Submitted to Meta — approval pending');
      setShowCreate(false);
      load();
    } catch (e) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to submit';
      toast.error(msg);
      load();
    }
    setSavingTpl(false);
  };

  const deleteTemplate = async (id: string) => {
    if (!confirm('Delete this smart template?')) return;
    try { await smartBroadcastApi.deleteTemplate(id); toast.success('Deleted'); load(); }
    catch { toast.error('Delete failed'); }
  };

  const send = async () => {
    if (!sendForm.templateId) { toast.error('Select an approved template'); return; }
    if ((selectedTemplate?.smartVarCount ?? 0) > 0 && !sendForm.message.trim()) { toast.error('Write your message'); return; }
    const numbers = sendForm.numbersText.split(/[\s,;|]+/).map((n) => n.replace(/\D/g, '')).filter((n) => n.length >= 10);
    setSending(true);
    try {
      await smartBroadcastApi.send({
        name: sendForm.name || undefined,
        templateId: sendForm.templateId,
        message: sendForm.message,
        headerMediaUrl: sendForm.headerMediaUrl || undefined,
        targetType: sendForm.targetType,
        targetTags: sendForm.targetType === 'tag' ? sendForm.targetTags : [],
        targetSegments: sendForm.targetType === 'segment' ? sendForm.targetSegments : [],
        targetNumbers: sendForm.targetType === 'numbers' ? numbers : [],
        senderNumberId: sendForm.senderNumberId || '',
      });
      toast.success('Smart broadcast started');
      setVarVals(Array((selectedTemplate?.smartVarCount ?? 0)).fill(''));
      setSendForm({ ...sendForm, name: '', message: '', numbersText: '', headerMediaUrl: '' });
      setTab('reports');
    } catch (e) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Send failed';
      toast.error(msg);
    }
    setSending(false);
  };

  const TabBtn = ({ id, label, icon }: { id: typeof tab; label: string; icon: React.ReactNode }) => (
    <button
      type="button"
      onClick={() => setTab(id)}
      className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-[13px] font-medium transition-colors ${
        tab === id
          ? 'bg-admin-text text-white'
          : 'border border-admin-border bg-white text-admin-text-secondary hover:bg-[#f6f6f7]'
      }`}
    >{icon}{label}</button>
  );

  const previewMediaUrl = sendForm.headerMediaUrl || selectedTemplate?.header?.mediaUrl || '';
  const filledLength = selectedTemplate ? fillBody(selectedTemplate.body, sendForm.message, selectedTemplate.smartVarCount).length : 0;

  return (
    <div className={`${adminContentColumnClass} space-y-4`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 shrink-0 text-admin-text-secondary" aria-hidden />
            <h1 className="text-[20px] font-semibold tracking-tight text-admin-text">Smart Broadcast</h1>
          </div>
          <p className="mt-1 text-[13px] text-admin-text-secondary">
            Send using approved utility templates — you write the message, the panel fills the template variables at send time.
          </p>
        </div>
        <button type="button" className={secondaryBtn} onClick={load} title="Refresh">
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-[13px] text-amber-900">
        <div className="flex items-start gap-2">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <b>Advanced feature — use responsibly.</b> Meta may re-categorize, pause or restrict a template/number if content does not match the utility category. The sending WhatsApp number carries this risk. Send slowly, keep opt-outs, and stop if a template is paused.
            {!acknowledged && (
              <label className="mt-2 flex cursor-pointer items-center gap-2 font-medium">
                <input type="checkbox" checked={acknowledged} onChange={(e) => setAcknowledged(e.target.checked)} />
                I understand the risk and take responsibility for my messages.
              </label>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <TabBtn id="templates" label="Utility Templates" icon={<FileText className="h-4 w-4" />} />
        <TabBtn id="send" label="New Campaign" icon={<Send className="h-4 w-4" />} />
        <TabBtn id="reports" label="Reports" icon={<BarChart3 className="h-4 w-4" />} />
      </div>

      {tab === 'templates' && (
        <div className="space-y-3">
          <div className="flex justify-end">
            <button type="button" className={primaryBtn} onClick={openCreate} disabled={!acknowledged}>
              <Plus className="h-4 w-4" /> New Utility Template
            </button>
          </div>
          <div className={tableShell}>
            <table className="w-full text-[13px]">
              <thead className="bg-[#f6f6f7] text-left text-admin-text-secondary">
                <tr>
                  <th className="p-3 font-medium">Name</th>
                  <th className="p-3 font-medium">Variables</th>
                  <th className="p-3 font-medium">Header</th>
                  <th className="p-3 font-medium">Status</th>
                  <th className="p-3 font-medium">Reason</th>
                  <th className="p-3 font-medium" />
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="p-6 text-center text-admin-text-subdued">Loading…</td></tr>
                ) : templates.length === 0 ? (
                  <tr><td colSpan={6} className="p-6 text-center text-admin-text-subdued">No smart templates yet. Create one and submit to Meta.</td></tr>
                ) : templates.map((t) => (
                  <tr key={t._id} className="border-t border-admin-border">
                    <td className="p-3 font-medium text-admin-text">{t.name}</td>
                    <td className="p-3 text-admin-text">{t.smartVarCount}</td>
                    <td className="p-3 text-[12px] text-admin-text-secondary">{t.header?.type && t.header.type !== 'none' ? t.header.type : '—'}</td>
                    <td className="p-3"><Badge variant={statusColor(t.status)}>{t.status}</Badge></td>
                    <td className="max-w-xs truncate p-3 text-[12px] text-admin-text-secondary">{t.rejectionReason || '—'}</td>
                    <td className="whitespace-nowrap p-3 text-right">
                      <button type="button" onClick={() => openEdit(t)} disabled={!acknowledged} className="mr-1 rounded-lg p-1.5 text-admin-text-subdued hover:bg-[#f6f6f7] hover:text-admin-text disabled:opacity-50" title="Edit & resubmit"><Pencil className="h-4 w-4" /></button>
                      <button type="button" onClick={() => deleteTemplate(t._id)} className="rounded-lg p-1.5 text-admin-text-subdued hover:bg-red-50 hover:text-red-600" title="Delete"><Trash2 className="h-4 w-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'send' && (
        <div className="grid items-start gap-4 lg:grid-cols-2">
          <div className={cardClass}>
            {approvedTemplates.length === 0 ? (
              <p className="text-[13px] text-admin-text-secondary">No approved utility templates yet. Create one in the <b>Utility Templates</b> tab and wait for Meta approval.</p>
            ) : (
              <div className="space-y-4">
                <input className={inputClass} placeholder="Campaign name (optional)"
                  value={sendForm.name} onChange={(e) => setSendForm({ ...sendForm, name: e.target.value })} />
                <div>
                  <label className={labelClass}>Approved Template</label>
                  <select className={inputClass} value={sendForm.templateId} onChange={(e) => selectTemplate(e.target.value)}>
                    <option value="">Select template…</option>
                    {approvedTemplates.map((t) => <option key={t._id} value={t._id}>{t.name} ({t.smartVarCount} fields)</option>)}
                  </select>
                </div>
                {selectedTemplate && !['image', 'video', 'document'].includes(selectedTemplate.header?.type || '') && (
                  <p className="text-[12px] text-admin-text-subdued">This template was approved without a media header, so media cannot be attached at send time. To send media, create/edit a template with an Image/Video/Document header.</p>
                )}
                {selectedTemplate && ['image', 'video', 'document'].includes(selectedTemplate.header?.type || '') && (
                  <div>
                    <label className={labelClass}>Header {selectedTemplate.header?.type} (this send)</label>
                    <div className="flex items-center gap-2">
                      <input className={`flex-1 ${inputClass}`} placeholder="Media URL (default: template media)"
                        value={sendForm.headerMediaUrl} onChange={(e) => setSendForm({ ...sendForm, headerMediaUrl: e.target.value })} />
                      <label className={`${secondaryBtn} cursor-pointer`}>
                        <Upload className="h-4 w-4" /> {uploading ? '…' : 'Upload'}
                        <input type="file" className="hidden" accept={selectedTemplate.header?.type === 'image' ? 'image/*' : selectedTemplate.header?.type === 'video' ? 'video/*' : '*'} onChange={(e) => uploadMedia(e, 'send')} />
                      </label>
                    </div>
                  </div>
                )}
                {!selectedTemplate && (
                  <p className="text-[12px] text-admin-text-subdued">Select an approved template above to fill its variables.</p>
                )}
                {selectedTemplate && (selectedTemplate.smartVarCount ?? 0) < 1 && (
                  <div>
                    <label className={labelClass}>Message</label>
                    <p className="rounded-lg border border-admin-border bg-[#f6f6f7] px-3 py-2 text-[12px] text-admin-text-secondary">This template has no variables — its approved formatted text is sent exactly as-is. Nothing to fill.</p>
                  </div>
                )}
                {selectedTemplate && (selectedTemplate.smartVarCount ?? 0) > 0 && (
                  <div className="space-y-3">
                    <label className="block text-[12px] font-medium text-admin-text-secondary">Fill template variables</label>
                    {Array.from({ length: selectedTemplate.smartVarCount }, (_, i) => {
                      const n = i + 1;
                      const ctx = varContext(selectedTemplate.body, n);
                      return (
                        <div key={n}>
                          <label className="mb-1 block text-[12px] font-medium text-admin-text-secondary">Variable {`{{${n}}}`}{ctx ? <span className="font-normal text-admin-text-subdued"> — “{ctx}”</span> : null}</label>
                          <input className={inputClass} placeholder={`Value for {{${n}}}`}
                            value={varVals[i] || ''} onChange={(e) => setVar(i, e.target.value)} />
                        </div>
                      );
                    })}
                    <p className="text-[12px] text-admin-text-subdued">Each value fills the matching placeholder in the approved template. Values must be single-line (Meta strips line breaks inside a variable).</p>
                    <p className={`text-[12px] font-medium ${filledLength > 1024 ? 'text-red-600' : 'text-admin-text-subdued'}`}>
                      {filledLength} / 1024 characters (template + values){filledLength > 1024 ? ` — too long, shorten by ${filledLength - 1024}` : ''}
                    </p>
                  </div>
                )}
                <div>
                  <label className={labelClass}>Audience</label>
                  <select className={inputClass} value={sendForm.targetType} onChange={(e) => setSendForm({ ...sendForm, targetType: e.target.value })}>
                    <option value="all">All contacts</option>
                    <option value="tag">By tag</option>
                    <option value="segment">By segment</option>
                    <option value="numbers">Manual numbers</option>
                  </select>
                </div>
                {sendForm.targetType === 'tag' && (
                  <select multiple className={`${inputClass} h-28`}
                    value={sendForm.targetTags} onChange={(e) => setSendForm({ ...sendForm, targetTags: Array.from(e.target.selectedOptions, (o) => o.value) })}>
                    {tags.map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}
                  </select>
                )}
                {sendForm.targetType === 'segment' && (
                  <select multiple className={`${inputClass} h-28`}
                    value={sendForm.targetSegments} onChange={(e) => setSendForm({ ...sendForm, targetSegments: Array.from(e.target.selectedOptions, (o) => o.value) })}>
                    {segments.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
                  </select>
                )}
                {sendForm.targetType === 'numbers' && (
                  <textarea rows={4} className={inputClass} placeholder="One number per line"
                    value={sendForm.numbersText} onChange={(e) => setSendForm({ ...sendForm, numbersText: e.target.value })} />
                )}
                {waNumbers.length > 1 && (
                  <div>
                    <label className={labelClass}>Send From Number</label>
                    <select className={inputClass} value={sendForm.senderNumberId} onChange={(e) => setSendForm({ ...sendForm, senderNumberId: e.target.value })}>
                      <option value="">Default number</option>
                      {waNumbers.map((n) => <option key={n.id} value={n.id}>{n.label}</option>)}
                    </select>
                  </div>
                )}
                <button type="button" className={primaryBtn} onClick={send} disabled={sending || !acknowledged || filledLength > 1024}>
                  <Send className="h-4 w-4" /> {sending ? 'Sending…' : 'Send Smart Broadcast'}
                </button>
              </div>
            )}
          </div>

          {selectedTemplate && (
            <div className={cardClass}>
              <p className="mb-2 text-[13px] font-semibold text-admin-text">Preview — how it will look</p>
              <div className="rounded-xl p-4" style={{ background: '#e5ddd5' }}>
                <div className="max-w-sm space-y-2 rounded-lg bg-white p-2 text-[13px] shadow-sm">
                  {['image', 'video', 'document'].includes(selectedTemplate.header?.type || '') && (
                    previewMediaUrl ? (
                      selectedTemplate.header?.type === 'image'
                        ? <img src={previewMediaUrl} alt="header" className="max-h-44 w-full rounded-md bg-[#f6f6f7] object-cover" />
                        : selectedTemplate.header?.type === 'video'
                          ? <video src={previewMediaUrl} className="max-h-44 w-full rounded-md bg-[#f6f6f7]" muted controls />
                          : <div className="rounded-md bg-[#f6f6f7] p-3 text-[12px] text-admin-text-secondary">📄 Document attached</div>
                    ) : <div className="rounded-md bg-[#f6f6f7] p-6 text-center text-[12px] text-admin-text-subdued">{selectedTemplate.header?.type} header</div>
                  )}
                  {selectedTemplate.header?.type === 'text' && selectedTemplate.header.content && (
                    <p className="font-semibold text-admin-text">{selectedTemplate.header.content}</p>
                  )}
                  <p className="whitespace-pre-wrap text-admin-text">{fillBody(selectedTemplate.body, sendForm.message, selectedTemplate.smartVarCount)}</p>
                  {selectedTemplate.footer && <p className="text-[12px] text-admin-text-subdued">{selectedTemplate.footer}</p>}
                  {(selectedTemplate.buttons || []).length > 0 && (
                    <div className="space-y-1 border-t border-admin-border pt-1">
                      {(selectedTemplate.buttons || []).map((b, i) => (
                        <div key={i} className="rounded-md border border-admin-border py-1 text-center text-[13px] text-[#005bd3]">{b.text}</div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <p className="mt-2 text-[12px] text-admin-text-subdued">Your message lines fill the {'{{n}}'} fields of the approved template.</p>
            </div>
          )}
        </div>
      )}

      {tab === 'reports' && (
        <div className={tableShell}>
          <table className="w-full text-[13px]">
            <thead className="bg-[#f6f6f7] text-left text-admin-text-secondary">
              <tr>
                <th className="p-3 font-medium">Campaign</th>
                <th className="p-3 font-medium">Template</th>
                <th className="p-3 font-medium">Status</th>
                <th className="p-3 font-medium">Recipients</th>
                <th className="p-3 font-medium">Sent</th>
                <th className="p-3 font-medium">Delivered</th>
                <th className="p-3 font-medium">Read</th>
                <th className="p-3 font-medium">Failed</th>
                <th className="p-3 font-medium">Date</th>
                <th className="p-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {reports.length === 0 ? (
                <tr><td colSpan={10} className="p-6 text-center text-admin-text-subdued">No smart broadcasts sent yet.</td></tr>
              ) : reports.map((c) => (
                <tr key={c._id} className="border-t border-admin-border">
                  <td className="p-3 font-medium text-admin-text">{c.name}</td>
                  <td className="p-3 text-admin-text">{c.template?.name || '—'}</td>
                  <td className="p-3"><Badge variant={statusColor(c.status)}>{c.status}</Badge></td>
                  <td className="p-3 text-admin-text">{c.stats?.totalRecipients ?? 0}</td>
                  <td className="p-3 text-[#005bd3]">{c.stats?.sent ?? 0}</td>
                  <td className="p-3 text-green-700">{c.stats?.delivered ?? 0}</td>
                  <td className="p-3 text-admin-text-secondary">{c.stats?.read ?? 0}</td>
                  <td className="p-3 text-red-600">{c.stats?.failed ?? 0}</td>
                  <td className="p-3 text-[12px] text-admin-text-secondary">{new Date(c.createdAt).toLocaleString()}</td>
                  <td className="whitespace-nowrap p-3 text-right">
                    {['running', 'completed', 'paused', 'failed'].includes(c.status) && (
                      <button type="button" title="Report" onClick={() => setReportTarget({ id: c._id, name: c.name })} className="mr-1 rounded-lg p-1.5 text-admin-text-subdued hover:bg-[#f6f6f7] hover:text-admin-text"><BarChart3 className="h-4 w-4" /></button>
                    )}
                    {c.status === 'running' && (
                      <button type="button" onClick={() => stopCampaign(c._id)} className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-2 py-1 text-[12px] font-medium text-red-600 hover:bg-red-50"><Square className="h-3 w-3" /> Stop</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <CampaignReportModal campaignId={reportTarget?.id || null} campaignName={reportTarget?.name} onClose={() => setReportTarget(null)} />

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title={editingId ? 'Edit Utility Template' : 'New Utility Template'} size="lg">
        <div className="max-h-[70vh] space-y-4 overflow-y-auto pr-1">
          {!editingId && (
            <div>
              <label className={labelClass}>Pick a ready template</label>
              <select className={inputClass} value={seedKey} onChange={(e) => pickSeed(e.target.value)}>
                <option value="">— Custom (write my own) —</option>
                {catalog.map((c) => <option key={c.key} value={c.key}>{c.title}</option>)}
              </select>
            </div>
          )}
          <input className={inputClass} placeholder="Template name (a-z, 0-9, _)"
            value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <WaTextarea rows={8} className={inputClass} placeholder="Body text. Use {{1}}, {{2}} … for dynamic parts, or leave without variables to send a fixed formatted message as-is."
            value={form.body} onChange={(v) => setForm({ ...form, body: v })} />
          <p className="-mt-2 text-[12px] text-admin-text-subdued">Tip: for a fixed formatted message (with line breaks), paste the whole text here <b>without</b> {'{{ }}'} variables — formatting stays exactly as approved. Variables must be single-line (Meta strips line breaks inside a variable).</p>

          <div>
            <label className={labelClass}>Header (optional)</label>
            <select className={inputClass} value={form.headerType}
              onChange={(e) => setForm({ ...form, headerType: e.target.value as TplHeader['type'] })}>
              <option value="none">None</option>
              <option value="text">Text</option>
              <option value="image">Image</option>
              <option value="video">Video</option>
              <option value="document">Document</option>
            </select>
          </div>
          {form.headerType === 'text' && (
            <input className={inputClass} placeholder="Header text"
              value={form.headerText} onChange={(e) => setForm({ ...form, headerText: e.target.value })} />
          )}
          {['image', 'video', 'document'].includes(form.headerType) && (
            <div className="flex items-center gap-2">
              <input className={`flex-1 ${inputClass}`} placeholder="Media URL (or click Upload)"
                value={form.headerMediaUrl} onChange={(e) => setForm({ ...form, headerMediaUrl: e.target.value })} />
              <label className={`${secondaryBtn} cursor-pointer`}>
                <Upload className="h-4 w-4" /> {uploading ? '…' : 'Upload'}
                <input type="file" className="hidden" accept={form.headerType === 'image' ? 'image/*' : form.headerType === 'video' ? 'video/*' : '*'} onChange={(e) => uploadMedia(e, 'template')} />
              </label>
            </div>
          )}

          <input className={inputClass} placeholder="Footer (optional)"
            value={form.footer} onChange={(e) => setForm({ ...form, footer: e.target.value })} />

          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="text-[12px] font-medium text-admin-text-secondary">Buttons (optional, max 3)</label>
              {form.buttons.length < 3 && (
                <button type="button" className="text-[12px] font-semibold text-[#005bd3] hover:underline" onClick={() => setForm({ ...form, buttons: [...form.buttons, { type: 'quick_reply', text: '', value: '' }] })}>+ Add button</button>
              )}
            </div>
            {form.buttons.map((b, i) => (
              <div key={i} className="mb-2 flex gap-2">
                <select className="rounded-lg border border-admin-border bg-white px-2 py-1.5 text-[13px] text-admin-text" value={b.type} onChange={(e) => setButton(i, { type: e.target.value as TplButton['type'], value: '' })}>
                  <option value="quick_reply">Quick reply</option>
                  <option value="url">URL</option>
                  <option value="phone">Phone</option>
                </select>
                <input className={`flex-1 ${inputClass} !py-1.5`} placeholder="Button text" value={b.text} onChange={(e) => setButton(i, { text: e.target.value })} />
                {b.type !== 'quick_reply' && (
                  <input className={`flex-1 ${inputClass} !py-1.5`} placeholder={b.type === 'url' ? 'https://…' : '+91…'} value={b.value} onChange={(e) => setButton(i, { value: e.target.value })} />
                )}
                <button type="button" className="rounded-lg p-1.5 text-admin-text-subdued hover:bg-red-50 hover:text-red-600" onClick={() => setForm({ ...form, buttons: form.buttons.filter((_, j) => j !== i) })}><Trash2 className="h-4 w-4" /></button>
              </div>
            ))}
          </div>

          <div className="space-y-2 rounded-xl border border-admin-border bg-[#f6f6f7] p-3">
            <p className="text-[13px] font-medium text-admin-text">Opt-out / Unsubscribe (recommended for broadcasts)</p>
            <label className="flex items-start gap-2 text-[13px] text-admin-text-secondary">
              <input type="checkbox" className="mt-0.5" checked={form.optOutButton} onChange={(e) => setForm({ ...form, optOutButton: e.target.checked })} />
              <span>Add a <b>“Stop”</b> quick-reply button — customer taps it to unsubscribe (uses one of the 3 button slots).</span>
            </label>
            <label className="flex items-start gap-2 text-[13px] text-admin-text-secondary">
              <input type="checkbox" className="mt-0.5" checked={form.optOutFooter} onChange={(e) => setForm({ ...form, optOutFooter: e.target.checked })} />
              <span>Add footer line <b>“{OPT_OUT_FOOTER}”</b> — so the customer knows they can reply STOP.</span>
            </label>
            <p className="text-[12px] text-admin-text-subdued">Either way, when a customer replies STOP (or taps the button) the panel auto-unsubscribes them and skips them in every broadcast. Adding opt-out to a Utility template may make Meta re-categorise it as Marketing.</p>
          </div>

          {editingId && <p className="text-[12px] text-amber-700">Saving will delete the old version on Meta and resubmit this one for fresh approval (name can be changed).</p>}

          <div className="flex justify-end gap-2 border-t border-admin-border pt-3">
            <button type="button" className={secondaryBtn} onClick={() => setShowCreate(false)}>Cancel</button>
            <button type="button" className={primaryBtn} onClick={saveTemplate} disabled={savingTpl || uploading}>{savingTpl ? 'Submitting…' : 'Submit to Meta'}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
