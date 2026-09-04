'use client';
import React, { useState, useEffect } from 'react';
import WaTextarea from '@/components/ui/WaTextarea';
import { Plus, RefreshCw, Search, Eye, Trash2, Clock, CheckCircle, XCircle, Image as ImageIcon, Video, File, Phone, ExternalLink, X, ChevronDown, LayoutTemplate } from 'lucide-react';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Modal from '@/components/ui/Modal';
import Table from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import WhatsAppPhonePreview from '@/components/WhatsAppPhonePreview';
import { templateApi, mediaApi } from "@/lib/api";
import type { Template } from '@/types';
import toast from 'react-hot-toast';
import { adminContentColumnClass, dashboardCardShell } from '@/components/layout/dashboard-ui';

const secondaryBtn =
  'inline-flex items-center gap-1.5 rounded-lg border border-admin-border bg-white px-3 py-1.5 text-[13px] font-medium text-admin-text transition-colors hover:bg-[#f6f6f7] disabled:cursor-not-allowed disabled:opacity-40';

const primaryBtn =
  'inline-flex items-center gap-1.5 rounded-lg bg-admin-text px-3 py-1.5 text-[13px] font-semibold text-white transition-colors hover:bg-[#1a1a1a] disabled:cursor-not-allowed disabled:opacity-40';

const fieldClass =
  'w-full rounded-lg border border-admin-border bg-white px-3 py-2 text-[13px] text-admin-text placeholder:text-admin-text-subdued focus:outline-none focus:ring-2 focus:ring-admin-border';

const chipSelected = 'bg-admin-text border-admin-text text-white';
const chipUnselected = 'bg-white border-admin-border text-admin-text hover:bg-[#f6f6f7]';

interface TemplateButton {
  type: 'QUICK_REPLY' | 'URL' | 'PHONE_NUMBER' | 'CATALOG';
  text: string;
  url?: string;
  urlType?: 'static' | 'dynamic';
  urlExample?: string;
  phoneNumber?: string;
}

interface CarouselCard {
  mediaUrl: string;
  mediaType: 'image' | 'video';
  body: string;
  buttons: TemplateButton[];
}

const emptyCard = (): CarouselCard => ({ mediaUrl: '', mediaType: 'image', body: '', buttons: [{ type: 'QUICK_REPLY', text: '', url: '', phoneNumber: '' }] });


function CarouselStrip({ cards }: { cards: Array<{ mediaUrl?: string; mediaType?: string; body?: string; buttons?: Array<{ text: string }> }> }) {
  return (
    <div className="w-full max-w-md">
      <p className="mb-2 text-[12px] font-semibold text-admin-text-secondary">Carousel cards (swipe) preview</p>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {cards.map((c, i) => (
          <div key={i} className="w-44 flex-shrink-0 overflow-hidden rounded-xl border border-admin-border bg-white shadow-sm">
            {c.mediaUrl ? (
              c.mediaType === 'video'
                ? <video src={c.mediaUrl} className="h-28 w-full object-cover bg-[#f6f6f7]" muted />
                : /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={c.mediaUrl} alt={'card ' + (i + 1)} className="h-28 w-full object-cover bg-[#f6f6f7]" />
            ) : (
              <div className="flex h-28 w-full items-center justify-center bg-[#f6f6f7] text-[12px] text-admin-text-subdued">No media</div>
            )}
            <div className="p-2">
              <p className="whitespace-pre-wrap break-words text-[12px] text-admin-text">{c.body || <span className="text-admin-text-subdued">Card text...</span>}</p>
              {(c.buttons || []).filter(b => b.text).map((b, bi) => (
                <div key={bi} className="mt-1.5 border-t border-admin-border pt-1.5 text-center text-[11px] font-medium text-[#005bd3]">{b.text}</div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const templateToPreview = (t: Template) => {
  const raw = t as unknown as Record<string, unknown>;
  const header = raw.header as Record<string, string> | undefined;
  const buttons = raw.buttons as Array<{ text: string; type?: string }> | undefined;
  return {
    headerType: header?.type,
    headerText: header?.content,
    headerMediaUrl: header?.mediaUrl,
    body: t.body,
    footer: t.footer,
    buttons: buttons || [],
  };
};

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [view, setView] = useState<'list' | 'create'>('list');
  const [showPreview, setShowPreview] = useState<Template | null>(null);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [showBtnMenu, setShowBtnMenu] = useState(false);
  const [form, setForm] = useState({
    name: '', category: 'MARKETING', language: 'en',
    headerType: 'none' as 'none' | 'text' | 'image' | 'video' | 'document',
    headerText: '', headerMediaUrl: '',
    bodyText: '', footerText: '',
    buttons: [] as TemplateButton[],
    isCarousel: false,
    cards: [] as CarouselCard[],
    authButtonText: 'Copy Code',
    authCodeExpiry: 10,
    authSecurityRec: true,
  });
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "templates");
      const res = await mediaApi.upload(formData);
      const url = res.data?.data?.url || res.data?.url || "";
      setForm(f => ({ ...f, headerMediaUrl: url }));
      toast.success("File uploaded!");
    } catch { toast.error("Upload failed"); }
    setUploading(false);
  };

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const res = await templateApi.list({ status: filter === 'all' ? undefined : filter, search });
      setTemplates(res.data.data || []);
    } catch { /* empty */ }
    setLoading(false);
  };

  useEffect(() => { fetchTemplates(); }, [filter, search]);

  const handleSync = async () => {
    setSyncing(true);
    try {
      await templateApi.syncFromWhatsApp();
      toast.success('Templates synced from WhatsApp');
      fetchTemplates();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Sync failed - check WhatsApp connection');
    }
    setSyncing(false);
  };

  const handleCreate = async () => {
    if (submitting) return;
    if (!form.name || (form.category !== 'AUTHENTICATION' && !form.bodyText)) {
      toast.error('Template name and body are required');
      return;
    }
    setSubmitting(true);
    try {
      if (form.category === 'AUTHENTICATION') {
        await templateApi.create({
          name: form.name, category: form.category, language: form.language,
          components: [{ type: 'BODY', text: '{{1}} is your verification code.' }],
          authentication: {
            otpType: 'COPY_CODE',
            buttonText: form.authButtonText || 'Copy Code',
            codeExpirationMinutes: form.authCodeExpiry || 0,
            addSecurityRecommendation: form.authSecurityRec,
          },
        });
        toast.success('Template submitted for approval');
        setView('list'); resetForm(); fetchTemplates(); setSubmitting(false);
        return;
      }
      const components: Array<Record<string, unknown>> = [];
      if (form.isCarousel) {
        // Carousel: no top-level header — cards have their own
      } else if (form.headerType === 'text' && form.headerText) {
        components.push({ type: 'HEADER', format: 'TEXT', text: form.headerText });
      } else if (form.headerType === 'image') {
        components.push({ type: 'HEADER', format: 'IMAGE', example: { header_handle: [form.headerMediaUrl] } });
      } else if (form.headerType === 'video') {
        components.push({ type: 'HEADER', format: 'VIDEO', example: { header_handle: [form.headerMediaUrl] } });
      } else if (form.headerType === 'document') {
        components.push({ type: 'HEADER', format: 'DOCUMENT', example: { header_handle: [form.headerMediaUrl] } });
      }
      components.push({ type: 'BODY', text: form.bodyText });
      if (!form.isCarousel && form.footerText) {
        components.push({ type: 'FOOTER', text: form.footerText });
      }
      if (!form.isCarousel && form.buttons.length > 0) {
        const buttonComponents = form.buttons.map(btn => {
          if (btn.type === 'QUICK_REPLY') return { type: 'QUICK_REPLY', text: btn.text };
          if (btn.type === 'URL') return { type: 'URL', text: btn.text, url: btn.url, ...(btn.urlType === 'dynamic' && btn.urlExample ? { example: [btn.urlExample] } : {}) };
          if (btn.type === 'PHONE_NUMBER') return { type: 'PHONE_NUMBER', text: btn.text, phone_number: btn.phoneNumber };
          if (btn.type === 'CATALOG') return { type: 'CATALOG', text: btn.text || 'View catalog' };
          return { type: btn.type, text: btn.text };
        });
        components.push({ type: 'BUTTONS', buttons: buttonComponents });
      }
      if (form.isCarousel) {
        if (form.cards.length < 2) { toast.error('Carousel needs at least 2 cards'); setSubmitting(false); return; }
        if (form.cards.some(c => !c.mediaUrl)) { toast.error('Every card needs an image/video URL'); setSubmitting(false); return; }
        if (form.cards.some(c => c.buttons.length === 0 || c.buttons.some(b => !b.text))) { toast.error('Every card needs at least 1 button with text'); setSubmitting(false); return; }
      }
      await templateApi.create({
        name: form.name, category: form.category, language: form.language, components,
        carousel: form.isCarousel ? { cards: form.cards.map(c => ({
          mediaUrl: c.mediaUrl, mediaType: c.mediaType, body: c.body,
          buttons: c.buttons.map(b => ({ type: b.type === 'QUICK_REPLY' ? 'quick_reply' : b.type === 'PHONE_NUMBER' ? 'phone' : 'url', text: b.text, value: b.url || b.phoneNumber || '' })),
        })) } : undefined,
      });
      toast.success('Template submitted for approval');
      setView('list');
      resetForm();
      fetchTemplates();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to create template');
    }
    setSubmitting(false);
  };

  const resetForm = () => {
    setForm({ name: '', category: 'MARKETING', language: 'en', headerType: 'none', headerText: '', headerMediaUrl: '', bodyText: '', footerText: '', buttons: [], isCarousel: false, cards: [], authButtonText: 'Copy Code', authCodeExpiry: 10, authSecurityRec: true });
  };

  const addButton = (type: 'QUICK_REPLY' | 'URL' | 'PHONE_NUMBER' | 'CATALOG') => {
    if (form.buttons.length >= 3) { toast.error('Maximum 3 buttons allowed'); return; }
    if (type === 'CATALOG' && form.buttons.some(b => b.type === 'CATALOG')) { toast.error('Only 1 Catalog button is allowed'); return; }
    setForm({ ...form, buttons: [...form.buttons, { type, text: '', url: '', phoneNumber: '' }] });
    setShowBtnMenu(false);
  };

  const updateButton = (index: number, field: string, value: string) => {
    const updated = [...form.buttons];
    (updated[index] as unknown as Record<string, string>)[field] = value;
    setForm({ ...form, buttons: updated });
  };

  const removeButton = (index: number) => {
    setForm({ ...form, buttons: form.buttons.filter((_, i) => i !== index) });
  };

  const addOptOut = () => {
    setForm(f => {
      const footer = (f.footerText && f.footerText.trim()) ? f.footerText : 'Reply STOP to unsubscribe';
      const hasStop = f.buttons.some(b => b.type === 'QUICK_REPLY' && /stop|unsub/i.test(b.text || ''));
      const buttons = (!hasStop && f.buttons.length < 3)
        ? [...f.buttons, { type: 'QUICK_REPLY' as const, text: 'Stop promotions', url: '', phoneNumber: '' }]
        : f.buttons;
      return { ...f, footerText: footer.slice(0, 60), buttons };
    });
    toast.success('Opt-out added (footer + Stop button)');
  };

  const updateCard = (i: number, cardPatch: Partial<CarouselCard>) => {
    setForm(f => ({ ...f, cards: f.cards.map((c, j) => j === i ? { ...c, ...cardPatch } : c) }));
  };

  const updateCardButton = (ci: number, bi: number, btnPatch: Partial<TemplateButton>) => {
    setForm(f => ({ ...f, cards: f.cards.map((c, j) => j === ci ? { ...c, buttons: c.buttons.map((b, k) => k === bi ? { ...b, ...btnPatch } : b) } : c) }));
  };

  const handleCardMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>, ci: number) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'templates');
      const res = await mediaApi.upload(formData);
      const url = res.data?.data?.url || res.data?.url || '';
      updateCard(ci, { mediaUrl: url });
      toast.success('Uploaded');
    } catch { toast.error('Upload failed'); }
    setUploading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this template?')) return;
    try { await templateApi.delete(id); toast.success('Deleted'); fetchTemplates(); } catch { toast.error('Failed'); }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved': return <Badge variant="success"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'rejected': return <Badge variant="danger"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default: return <Badge variant="warning"><Clock className="w-3 h-3 mr-1" />In Review</Badge>;
    }
  };

  const columns = [
    { key: 'sr', title: 'Sr', render: (t: Template) => <span className="text-admin-text-secondary">{templates.indexOf(t) + 1}</span> },
    { key: 'channel', title: 'Channel', render: () => (
      <span className="inline-flex items-center gap-1.5 text-admin-text"><span className="h-2 w-2 rounded-full bg-admin-text" />WhatsApp</span>
    )},
    { key: 'createdAt', title: 'Created Date', render: (t: Template) => (
      <span className="text-[13px] text-admin-text-secondary">{(t as unknown as { createdAt?: string }).createdAt ? new Date((t as unknown as { createdAt: string }).createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</span>
    )},
    { key: 'category', title: 'Category', render: (t: Template) => <Badge variant="info">{t.category || ((t as unknown as Record<string, string>).waCategory) || ''}</Badge> },
    { key: 'name', title: 'Template Name', render: (t: Template) => <span className="font-medium text-admin-text">{t.name}</span> },
    { key: 'preview', title: 'Preview', render: (t: Template) => (
      <button type="button" onClick={() => setShowPreview(t)} className="rounded-lg p-1.5 hover:bg-[#f6f6f7]" title="Preview"><Eye className="h-4 w-4 text-admin-text-secondary" /></button>
    )},
    { key: 'language', title: 'Language' },
    { key: 'status', title: 'Status', render: (t: Template) => (
      <div>
        {getStatusBadge(t.status)}
        {t.status === 'rejected' && (t as unknown as { rejectionReason?: string }).rejectionReason && (
          <p className="mt-1 max-w-[220px] text-[12px] text-red-500" title={(t as unknown as { rejectionReason?: string }).rejectionReason}>{(t as unknown as { rejectionReason?: string }).rejectionReason}</p>
        )}
      </div>
    ) },
    { key: 'actions', title: 'Action', render: (t: Template) => (
      <button type="button" onClick={() => handleDelete(t._id)} className="rounded-lg p-1.5 hover:bg-red-50"><Trash2 className="h-4 w-4 text-red-400" /></button>
    )},
  ];

  if (view === 'create') {
    return (
      <div className={`${adminContentColumnClass} space-y-4`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <LayoutTemplate className="h-5 w-5 shrink-0 text-admin-text-secondary" aria-hidden />
              <h1 className="text-[20px] font-semibold tracking-tight text-admin-text">Create Template</h1>
            </div>
            <p className="mt-1 text-[13px] text-admin-text-secondary">Design your WhatsApp template with live preview</p>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => { setView('list'); resetForm(); }} className={secondaryBtn}>Cancel</button>
            <button type="button" onClick={handleCreate} disabled={submitting} className={primaryBtn}>
              {submitting ? 'Submitting…' : 'Submit'}
            </button>
          </div>
        </div>

        <div className="flex flex-col items-start gap-6 lg:flex-row">
          <div className="w-full flex-1 space-y-4">
            <div className={`${dashboardCardShell} grid grid-cols-1 gap-4 sm:grid-cols-3`}>
              <Input label="Template Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_') })} placeholder="template_name" required />
              <Select label="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                options={[{ value: 'MARKETING', label: 'Marketing' }, { value: 'UTILITY', label: 'Utility' }, { value: 'AUTHENTICATION', label: 'Authentication' }]} />
              <Select label="Language" value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })}
                options={[{ value: 'en', label: 'English' }, { value: 'en_US', label: 'English (US)' }, { value: 'hi', label: 'Hindi' }, { value: 'mr', label: 'Marathi' }, { value: 'ta', label: 'Tamil' }, { value: 'te', label: 'Telugu' }, { value: 'gu', label: 'Gujarati' }, { value: 'bn', label: 'Bengali' }]} />
            </div>

            {form.category === 'AUTHENTICATION' ? (
            <div className={`${dashboardCardShell} space-y-4`}>
              <div>
                <label className="text-[13px] font-semibold text-admin-text">Authentication (OTP) template</label>
                <p className="mt-1 text-[12px] text-admin-text-subdued">Meta auto-generates the code message body. You only configure the copy-code button and expiry below.</p>
              </div>
              <div>
                <label className="mb-1 block text-[13px] font-medium text-admin-text">Copy-code button text</label>
                <input value={form.authButtonText} onChange={(e) => setForm({ ...form, authButtonText: e.target.value })} maxLength={25} placeholder="Copy Code"
                  className={fieldClass} />
              </div>
              <div>
                <label className="mb-1 block text-[13px] font-medium text-admin-text">Code expiry (minutes, 0 = none)</label>
                <input type="number" min={0} max={90} value={form.authCodeExpiry} onChange={(e) => setForm({ ...form, authCodeExpiry: parseInt(e.target.value || '0', 10) })}
                  className={fieldClass} />
              </div>
              <label className="flex cursor-pointer items-center gap-2">
                <input type="checkbox" checked={form.authSecurityRec} onChange={(e) => setForm({ ...form, authSecurityRec: e.target.checked })} className="h-4 w-4 rounded border-admin-border text-admin-text focus:ring-admin-border" />
                <span className="text-[13px] text-admin-text">Add security recommendation (“For your security, do not share this code.”)</span>
              </label>
            </div>
            ) : (<>
            <div className={dashboardCardShell}>
              <label className="block text-[13px] font-semibold text-admin-text">Header <span className="font-normal text-admin-text-subdued">(optional)</span></label>
              <p className="mb-3 text-[12px] text-admin-text-subdued">Add a title or choose which type of media you&apos;ll use for this header.</p>
              <div className="mb-3 flex flex-wrap gap-2">
                {[
                  { value: 'none', label: 'None', icon: null },
                  { value: 'text', label: 'Text', icon: null },
                  { value: 'image', label: 'Image', icon: <ImageIcon className="h-4 w-4" /> },
                  { value: 'video', label: 'Video', icon: <Video className="h-4 w-4" /> },
                  { value: 'document', label: 'Document', icon: <File className="h-4 w-4" /> },
                ].map((opt) => (
                  <button type="button" key={opt.value} onClick={() => setForm({ ...form, headerType: opt.value as typeof form.headerType })}
                    className={`flex items-center gap-1.5 rounded-lg border px-4 py-2 text-[13px] font-medium ${form.headerType === opt.value ? chipSelected : chipUnselected}`}>
                    {opt.icon} {opt.label}
                  </button>
                ))}
              </div>
              {form.headerType === 'text' && (
                <Input label="" value={form.headerText} onChange={(e) => setForm({ ...form, headerText: e.target.value })} placeholder="Header text (max 60 chars)" />
              )}
              {['image', 'video', 'document'].includes(form.headerType) && (
                <div className="mt-2">
                  {form.headerMediaUrl ? (
                    <div className="flex items-center gap-2 rounded-lg border border-admin-border bg-[#f6f6f7] p-3">
                      <CheckCircle className="h-4 w-4 text-admin-text" />
                      <span className="flex-1 truncate text-[13px] text-admin-text">{form.headerMediaUrl.split('/').pop()}</span>
                      <button type="button" onClick={() => setForm({...form, headerMediaUrl: ''})} className="text-red-500 hover:text-red-700"><X className="h-4 w-4" /></button>
                    </div>
                  ) : (
                    <label className="flex h-24 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-admin-border transition-colors hover:border-admin-text hover:bg-[#f6f6f7]">
                      <div className="flex flex-col items-center">
                        {uploading ? (
                          <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-admin-text"></div>
                        ) : (
                          <>
                            <Plus className="mb-1 h-6 w-6 text-admin-text-subdued" />
                            <span className="text-[13px] text-admin-text-secondary">Click to upload {form.headerType}</span>
                            <span className="mt-0.5 text-[12px] text-admin-text-subdued">{form.headerType === 'image' ? 'JPG, PNG (max 5MB)' : form.headerType === 'video' ? 'MP4 (max 16MB)' : 'PDF (max 100MB)'}</span>
                          </>
                        )}
                      </div>
                      <input type="file" className="hidden" accept={form.headerType === 'image' ? 'image/*' : form.headerType === 'video' ? 'video/*' : '.pdf,.doc,.docx'} onChange={handleMediaUpload} disabled={uploading} />
                    </label>
                  )}
                  <input className={`mt-2 ${fieldClass}`} value={form.headerMediaUrl} onChange={(e) => setForm({...form, headerMediaUrl: e.target.value})} placeholder="Or paste URL directly" />
                </div>
              )}
            </div>

            <div className={dashboardCardShell}>
              <div className="mb-1 flex items-center justify-between">
                <label className="text-[13px] font-semibold text-admin-text">Body <span className="text-red-500">*</span></label>
                <span className="text-[12px] text-admin-text-subdued">{form.bodyText.length} / 1024</span>
              </div>
              <WaTextarea value={form.bodyText} onChange={(v) => setForm({ ...form, bodyText: v })} maxLength={1024}
                placeholder="Message body. Use {{1}}, {{2}} for variables" rows={5}
                className={fieldClass} />
              <p className="mt-1 text-[12px] text-admin-text-subdued">Variables: {'{{1}}'} = Customer Name, {'{{2}}'} = Order ID, etc.</p>
              <div className="mt-4">
                <div className="mb-1 flex items-center justify-between">
                  <label className="text-[13px] font-semibold text-admin-text">Footer <span className="font-normal text-admin-text-subdued">(optional)</span></label>
                  <span className="text-[12px] text-admin-text-subdued">{form.footerText.length} / 60</span>
                </div>
                <input value={form.footerText} onChange={(e) => setForm({ ...form, footerText: e.target.value })} maxLength={60}
                  placeholder="Add a short line of text to the bottom of your message template."
                  className={fieldClass} />
                {form.category === 'MARKETING' && (
                  <button type="button" onClick={addOptOut}
                    className="mt-2 text-[12px] font-medium text-[#005bd3] hover:underline">
                    + Add opt-out (footer &ldquo;Reply STOP to unsubscribe&rdquo; + a &ldquo;Stop promotions&rdquo; button)
                  </button>
                )}
              </div>
            </div>

            <div className={dashboardCardShell}>
              <label className="flex cursor-pointer items-center gap-2">
                <input type="checkbox" checked={form.isCarousel}
                  onChange={e => setForm({ ...form, isCarousel: e.target.checked, cards: e.target.checked && form.cards.length === 0 ? [emptyCard(), emptyCard()] : form.cards })}
                  className="h-4 w-4 rounded border-admin-border text-admin-text focus:ring-admin-border" />
                <span className="text-[13px] font-semibold text-admin-text">Carousel Template <span className="font-normal text-admin-text-subdued">(2-10 swipe cards, har card me image + buttons)</span></span>
              </label>
              {form.isCarousel && (
                <div className="mt-3 space-y-4">
                  <p className="text-[12px] text-amber-600">For carousels, the Header above and Buttons below are ignored — each card has its own image/video + 1-2 buttons. Meta rule: all cards must have the same number and type of buttons.</p>
                  {form.cards.map((card, ci) => (
                    <div key={ci} className="space-y-2 rounded-lg border border-admin-border bg-[#f6f6f7] p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[12px] font-bold text-admin-text">Card {ci + 1}</span>
                        {form.cards.length > 2 && <button type="button" onClick={() => setForm({ ...form, cards: form.cards.filter((_, j) => j !== ci) })}><X className="h-4 w-4 text-red-400" /></button>}
                      </div>
                      <div className="flex gap-2">
                        <select value={card.mediaType} onChange={e => updateCard(ci, { mediaType: e.target.value as 'image' | 'video' })} className="rounded-lg border border-admin-border bg-white px-2 py-1.5 text-[13px] text-admin-text">
                          <option value="image">Image</option>
                          <option value="video">Video</option>
                        </select>
                        <input value={card.mediaUrl} onChange={e => updateCard(ci, { mediaUrl: e.target.value })} placeholder="Media URL (or click Upload)" className="flex-1 rounded-lg border border-admin-border bg-white px-2 py-1.5 text-[13px] text-admin-text" />
                        <label className="flex cursor-pointer items-center rounded-lg bg-admin-text px-3 py-1.5 text-[12px] font-medium text-white hover:bg-[#1a1a1a]">
                          {uploading ? '...' : 'Upload'}
                          <input type="file" className="hidden" accept={card.mediaType === 'image' ? 'image/*' : 'video/*'} onChange={e => handleCardMediaUpload(e, ci)} disabled={uploading} />
                        </label>
                      </div>
                      <textarea value={card.body} onChange={e => updateCard(ci, { body: e.target.value })} placeholder="Card text (optional, max 160 chars)" maxLength={160} rows={2} className="w-full rounded-lg border border-admin-border bg-white px-2 py-1.5 text-[13px] text-admin-text" />
                      {card.buttons.map((b, bi) => (
                        <div key={bi} className="flex items-center gap-2">
                          <select value={b.type} onChange={e => updateCardButton(ci, bi, { type: e.target.value as TemplateButton['type'] })} className="rounded-lg border border-admin-border bg-white px-2 py-1.5 text-[12px] text-admin-text">
                            <option value="QUICK_REPLY">Quick Reply</option>
                            <option value="URL">URL</option>
                          </select>
                          <input value={b.text} onChange={e => updateCardButton(ci, bi, { text: e.target.value })} placeholder="Button text" maxLength={25} className="flex-1 rounded-lg border border-admin-border bg-white px-2 py-1.5 text-[12px] text-admin-text" />
                          {b.type === 'URL' && <input value={b.url || ''} onChange={e => updateCardButton(ci, bi, { url: e.target.value })} placeholder="https://..." className="flex-1 rounded-lg border border-admin-border bg-white px-2 py-1.5 text-[12px] text-admin-text" />}
                          {card.buttons.length > 1 && <button type="button" onClick={() => updateCard(ci, { buttons: card.buttons.filter((_, j) => j !== bi) })}><X className="h-3.5 w-3.5 text-red-400" /></button>}
                        </div>
                      ))}
                      {card.buttons.length < 2 && <button type="button" onClick={() => updateCard(ci, { buttons: [...card.buttons, { type: 'QUICK_REPLY', text: '', url: '', phoneNumber: '' }] })} className="text-[12px] text-[#005bd3] hover:underline">+ Button</button>}
                    </div>
                  ))}
                  {form.cards.length < 10 && (
                    <button type="button" onClick={() => setForm({ ...form, cards: [...form.cards, emptyCard()] })} className="text-[13px] font-medium text-[#005bd3] hover:underline">+ Add Card</button>
                  )}
                </div>
              )}
            </div>

            {!form.isCarousel && <div className={dashboardCardShell}>
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <label className="text-[13px] font-semibold text-admin-text">Buttons <span className="font-normal text-admin-text-subdued">(optional)</span></label>
                  <p className="text-[12px] text-admin-text-subdued">Create buttons that let customers respond to your message or take action.</p>
                </div>
                <div className="relative">
                  <button type="button" onClick={() => setShowBtnMenu(!showBtnMenu)}
                    className="flex items-center gap-1.5 rounded-lg border border-admin-border bg-white px-4 py-2 text-[13px] font-medium text-admin-text hover:bg-[#f6f6f7]">
                    Add Buttons <ChevronDown className="h-4 w-4" />
                  </button>
                  {showBtnMenu && (
                    <div className="absolute right-0 z-10 mt-1 w-44 overflow-hidden rounded-lg border border-admin-border bg-white shadow-lg">
                      <button type="button" onClick={() => addButton('QUICK_REPLY')} className="w-full px-3 py-2 text-left text-[13px] text-admin-text hover:bg-[#f6f6f7]">Quick Reply</button>
                      <button type="button" onClick={() => addButton('URL')} className="flex w-full items-center gap-2 px-3 py-2 text-left text-[13px] text-admin-text hover:bg-[#f6f6f7]"><ExternalLink className="h-3.5 w-3.5" /> Visit Website</button>
                      <button type="button" onClick={() => addButton('PHONE_NUMBER')} className="flex w-full items-center gap-2 px-3 py-2 text-left text-[13px] text-admin-text hover:bg-[#f6f6f7]"><Phone className="h-3.5 w-3.5" /> Call Phone</button>
                      <button type="button" onClick={() => addButton('CATALOG')} className="w-full px-3 py-2 text-left text-[13px] text-admin-text hover:bg-[#f6f6f7]">🛒 View Catalog</button>
                    </div>
                  )}
                </div>
              </div>
              {form.buttons.map((btn, i) => (
                <div key={i} className="mb-2 flex items-start gap-2 rounded-lg bg-[#f6f6f7] p-3">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="w-24 text-[12px] font-medium text-admin-text-secondary">
                        {btn.type === 'QUICK_REPLY' ? 'Quick Reply' : btn.type === 'URL' ? 'URL Button' : btn.type === 'CATALOG' ? 'Catalog' : 'Call Button'}
                      </span>
                      <input value={btn.text} onChange={(e) => updateButton(i, 'text', e.target.value)} placeholder="Button text" maxLength={25}
                        className="flex-1 rounded-lg border border-admin-border bg-white px-3 py-1.5 text-[13px] text-admin-text focus:outline-none focus:ring-1 focus:ring-admin-border" />
                    </div>
                    {btn.type === 'URL' && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="w-16 text-[11px] text-admin-text-secondary">URL type</span>
                          <select value={btn.urlType || 'static'} onChange={(e) => updateButton(i, 'urlType', e.target.value)}
                            className="rounded-lg border border-admin-border bg-white px-2 py-1.5 text-[13px] text-admin-text focus:outline-none focus:ring-1 focus:ring-admin-border">
                            <option value="static">Static</option>
                            <option value="dynamic">Dynamic</option>
                          </select>
                        </div>
                        <input value={btn.url || ''} onChange={(e) => updateButton(i, 'url', e.target.value)}
                          placeholder={btn.urlType === 'dynamic' ? 'https://example.com/{{1}}' : 'https://example.com'}
                          className="w-full rounded-lg border border-admin-border bg-white px-3 py-1.5 text-[13px] text-admin-text focus:outline-none focus:ring-1 focus:ring-admin-border" />
                        {btn.urlType === 'dynamic' && (
                          <>
                            <input value={btn.urlExample || ''} onChange={(e) => updateButton(i, 'urlExample', e.target.value)}
                              placeholder="Sample full URL (for review), e.g. https://example.com/1234"
                              className="w-full rounded-lg border border-admin-border bg-white px-3 py-1.5 text-[13px] text-admin-text focus:outline-none focus:ring-1 focus:ring-admin-border" />
                            <p className="text-[11px] text-admin-text-subdued">Dynamic: URL must end with a variable like <code>{'{{1}}'}</code>. Give one sample URL so Meta can review it.</p>
                          </>
                        )}
                      </div>
                    )}
                    {btn.type === 'PHONE_NUMBER' && (
                      <input value={btn.phoneNumber || ''} onChange={(e) => updateButton(i, 'phoneNumber', e.target.value)} placeholder="+919876543210"
                        className="w-full rounded-lg border border-admin-border bg-white px-3 py-1.5 text-[13px] text-admin-text focus:outline-none focus:ring-1 focus:ring-admin-border" />
                    )}
                    {btn.type === 'CATALOG' && (
                      <p className="text-[11px] text-admin-text-subdued">Opens your WhatsApp catalog — a catalog must be connected to your WABA in Meta Commerce Manager.</p>
                    )}
                  </div>
                  <button type="button" onClick={() => removeButton(i)} className="rounded p-1 hover:bg-red-50"><X className="h-4 w-4 text-red-400" /></button>
                </div>
              ))}
            </div>}
            </>)}
          </div>

          <div className="mx-auto flex flex-col items-center gap-4 lg:sticky lg:top-6">
            <WhatsAppPhonePreview data={{ headerType: form.headerType, headerText: form.headerText, headerMediaUrl: form.headerMediaUrl, body: form.bodyText, footer: form.footerText, buttons: form.buttons }} />
            {form.isCarousel && form.cards.length > 0 && <CarouselStrip cards={form.cards} />}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${adminContentColumnClass} space-y-4`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <LayoutTemplate className="h-5 w-5 shrink-0 text-admin-text-secondary" aria-hidden />
            <h1 className="text-[20px] font-semibold tracking-tight text-admin-text">Templates</h1>
          </div>
          <p className="mt-1 text-[13px] text-admin-text-secondary">Manage WhatsApp message templates</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={handleSync} disabled={syncing} className={secondaryBtn}>
            <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
            Synchronize with WhatsApp
          </button>
          <button type="button" onClick={() => { resetForm(); setView('create'); }} className={primaryBtn}>
            <Plus className="h-4 w-4" />
            Add Template Message
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-admin-text-subdued" />
          <input type="text" placeholder="Search Template Name..." value={search} onChange={(e) => setSearch(e.target.value)}
            className={`${fieldClass} pl-10 pr-4`} />
        </div>
        <div className="flex flex-wrap gap-2">
          {['all', 'approved', 'pending', 'rejected'].map((f) => (
            <button type="button" key={f} onClick={() => setFilter(f)}
              className={`rounded-lg border px-3 py-1.5 text-[13px] font-medium ${filter === f ? chipSelected : chipUnselected}`}>
              {f === 'pending' ? 'In Review' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className={`${dashboardCardShell} !p-0 overflow-hidden`}>
        <Table columns={columns} data={templates} loading={loading} onBulkDelete={async (ids) => { await Promise.all(ids.map((id) => templateApi.delete(id).catch(() => null))); fetchTemplates(); }} />
      </div>

      <Modal isOpen={!!showPreview} onClose={() => setShowPreview(null)} title={showPreview?.name || 'Template Preview'} size="md">
        {showPreview && (
          <div className="flex flex-col items-center gap-4">
            <WhatsAppPhonePreview data={templateToPreview(showPreview)} />
            {(() => { const cc = (showPreview as unknown as { carousel?: { cards?: Array<{ mediaUrl?: string; mediaType?: string; body?: string; buttons?: Array<{ text: string }> }> } }).carousel?.cards; return cc && cc.length > 0 ? <CarouselStrip cards={cc} /> : null; })()}
            <div className="flex gap-4 text-[13px] text-admin-text-secondary">
              <span><strong className="text-admin-text">Status:</strong> {showPreview.status}</span>
              <span><strong className="text-admin-text">Category:</strong> {showPreview.category}</span>
              <span><strong className="text-admin-text">Language:</strong> {showPreview.language}</span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
