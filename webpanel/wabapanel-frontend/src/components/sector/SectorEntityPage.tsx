'use client';
import React, { Suspense, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useSearchParams } from 'next/navigation';
import { Plus, Search, X, Printer, Copy, ArrowRightLeft, CheckCircle2, ImagePlus, Loader2 } from 'lucide-react';
import { mediaApi, sectorApi } from '@/lib/api';
import { adminContentColumnClass, dashboardCardShell } from '@/components/layout/dashboard-ui';

export interface SectorField {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'money' | 'date' | 'time' | 'select' | 'link' | 'multilink' | 'multiselect' | 'list' | 'repeater' | 'toggle' | 'image' | 'imagelist';
  options?: string[];
  linkTo?: string;
  allowOther?: boolean;
  required?: boolean;
  readonly?: boolean;
  titleField?: boolean;
  listField?: boolean;
  linkContact?: boolean;
  placeholder?: string;
  section?: string;
  subFields?: SectorField[];
}
export interface SectorEntityDef {
  key: string;
  singular: string;
  plural: string;
  statuses: { id: string; label: string }[];
  defaultStatus: string;
  fields: SectorField[];
  dateField?: string;
  singleton?: boolean;
  subTitleField?: string | null;
  autoRef?: { field: string; prefix: string } | null;
}
export interface RecordDoc {
  _id: string;
  title: string;
  status: string;
  startsAt?: string | null;
  data?: Record<string, unknown>;
  linkRefs?: Record<string, string | string[]>;
  createdAt?: string;
  updatedAt?: string;
}
interface LinkOpt { _id: string; title: string; sub?: string }

const primaryBtn =
  'inline-flex items-center justify-center gap-1.5 rounded-lg bg-admin-text px-3 py-1.5 text-[13px] font-semibold text-white hover:bg-[#1a1a1a] disabled:opacity-50';
const secondaryBtn =
  'inline-flex items-center justify-center gap-1.5 rounded-lg border border-admin-border px-3 py-1.5 text-[13px] font-medium text-admin-text hover:bg-[#f6f6f7] disabled:opacity-50';
const dangerBtn =
  'inline-flex items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-[13px] font-medium text-red-700 hover:bg-red-100 disabled:opacity-50';
const inputClass = 'w-full rounded-lg border border-admin-border px-3 py-2 text-[13px] focus:border-[#005bd3] focus:outline-none';
const labelClass = 'block text-[12px] font-medium text-admin-text-secondary mb-1';

const STATUS_CLS: Record<string, string> = {
  active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  confirmed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  completed: 'bg-blue-50 text-blue-700 border-blue-200',
  converted: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  closed: 'bg-blue-50 text-blue-700 border-blue-200',
  won: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  draft: 'bg-gray-100 text-gray-600 border-gray-200',
  inactive: 'bg-gray-100 text-gray-500 border-gray-200',
  sold_out: 'bg-amber-50 text-amber-700 border-amber-200',
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  new: 'bg-blue-50 text-blue-700 border-blue-200',
  contacted: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  qualified: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  quotation_sent: 'bg-purple-50 text-purple-700 border-purple-200',
  followup_required: 'bg-amber-50 text-amber-700 border-amber-200',
  scheduled: 'bg-blue-50 text-blue-700 border-blue-200',
  rescheduled: 'bg-amber-50 text-amber-700 border-amber-200',
  cancelled: 'bg-red-50 text-red-600 border-red-200',
  lost: 'bg-red-50 text-red-600 border-red-200',
  no_show: 'bg-red-50 text-red-600 border-red-200',
  checked_in: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  checked_out: 'bg-blue-50 text-blue-700 border-blue-200',
};
const statusCls = (s: string) => STATUS_CLS[s] || 'bg-gray-100 text-gray-500 border-gray-200';

const fmtVal = (f: SectorField | undefined, v: unknown) => {
  if (v === null || v === undefined || v === '' || (Array.isArray(v) && !v.length)) return '—';
  if (f?.type === 'money') return `₹${Number(v).toLocaleString('en-IN')}`;
  if (f?.type === 'date') return String(v).slice(0, 10);
  if (f?.type === 'toggle') return v === true ? 'Yes' : 'No';
  if (f?.type === 'repeater') return `${(v as unknown[]).length} item${(v as unknown[]).length === 1 ? '' : 's'}`;
  if (Array.isArray(v)) return v.join(', ').replace(/_/g, ' ');
  if (typeof v === 'object') return '—';
  return String(v).replace(/_/g, ' ');
};

// ── Field inputs ────────────────────────────────────────────────

export function MultiSelect({ options, allowOther, value, onChange }: {
  options: string[]; allowOther: boolean; value: string[]; onChange: (v: string[]) => void;
}) {
  const [otherText, setOtherText] = useState('');
  const customs = value.filter((v) => !options.includes(v));
  const toggle = (opt: string) =>
    onChange(value.includes(opt) ? value.filter((v) => v !== opt) : [...value, opt]);
  const addOther = () => {
    const t = otherText.trim();
    if (!t) return;
    if (!value.includes(t)) onChange([...value, t]);
    setOtherText('');
  };
  return (
    <div className="space-y-1.5">
      <div className="grid grid-cols-2 gap-1 rounded-lg border border-admin-border p-2">
        {options.map((o) => (
          <label key={o} className="flex items-center gap-1.5 text-[12px] text-admin-text">
            <input type="checkbox" checked={value.includes(o)} onChange={() => toggle(o)} />
            {o.replace(/_/g, ' ')}
          </label>
        ))}
      </div>
      {allowOther && (
        <div className="flex items-center gap-1.5">
          <input className={inputClass} placeholder="Other — type and press Add"
            value={otherText} onChange={(e) => setOtherText(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addOther(); } }} />
          <button type="button" className={secondaryBtn} onClick={addOther}>Add</button>
        </div>
      )}
      {customs.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {customs.map((c) => (
            <span key={c} className="inline-flex items-center gap-1 rounded-full border border-admin-border bg-[#f6f6f7] px-2 py-0.5 text-[11px]">
              {c}
              <button type="button" className="text-admin-text-subdued hover:text-red-600" onClick={() => onChange(value.filter((v) => v !== c))}>×</button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// Free-form string list (destinations, tags, inclusions…)
export function ListInput({ value, onChange, placeholder }: {
  value: string[]; onChange: (v: string[]) => void; placeholder?: string;
}) {
  const [text, setText] = useState('');
  const add = () => {
    const t = text.trim();
    if (!t) return;
    if (!value.includes(t)) onChange([...value, t]);
    setText('');
  };
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        <input className={inputClass} placeholder={placeholder || 'Type and press Enter'}
          value={text} onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
          onBlur={add} />
        <button type="button" className={secondaryBtn} onClick={add}>Add</button>
      </div>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map((v) => (
            <span key={v} className="inline-flex items-center gap-1 rounded-full border border-admin-border bg-[#f6f6f7] px-2 py-0.5 text-[11px]">
              {v}
              <button type="button" className="text-admin-text-subdued hover:text-red-600" onClick={() => onChange(value.filter((x) => x !== v))}>×</button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// Image upload via media library — stores the returned URL string
function useImageUpload(onUrl: (url: string) => void) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const pick = async (file: File | null | undefined) => {
    if (!file || !file.type.startsWith('image/')) {
      if (file) toast.error('Please drop an image file');
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('folder', 'travel');
      const res = await mediaApi.upload(fd);
      const url = res.data?.data?.url;
      if (url) onUrl(url);
      else toast.error('Upload failed');
    } catch {
      toast.error('Image upload failed');
    } finally {
      setUploading(false);
    }
  };
  const dropProps = {
    onDragOver: (e: React.DragEvent) => { e.preventDefault(); setDragOver(true); },
    onDragLeave: () => setDragOver(false),
    onDrop: (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      void pick(e.dataTransfer?.files?.[0]);
    },
  };
  return { uploading, dragOver, pick, dropProps };
}

export function ImageInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const ref = React.useRef<HTMLInputElement>(null);
  const { uploading, dragOver, pick, dropProps } = useImageUpload(onChange);
  return (
    <div className="space-y-1.5">
      {value ? (
        <div className="relative inline-block">
          <img src={value} alt="" className="h-20 w-32 rounded-lg border border-admin-border object-cover" />
          <button type="button" onClick={() => onChange('')}
            className="absolute -right-1.5 -top-1.5 rounded-full border border-admin-border bg-white p-0.5 text-admin-text-subdued shadow-sm hover:text-red-600">
            <X className="h-3 w-3" />
          </button>
        </div>
      ) : (
        <button type="button" disabled={uploading} onClick={() => ref.current?.click()} {...dropProps}
          className={`flex h-24 w-full flex-col items-center justify-center gap-1 rounded-lg border border-dashed text-[11px] transition-colors disabled:opacity-50 ${dragOver ? 'border-[#005bd3] bg-[#005bd3]/5 text-[#005bd3]' : 'border-admin-border text-admin-text-subdued hover:bg-[#f6f6f7]'}`}>
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
          {uploading ? 'Uploading…' : dragOver ? 'Drop image here' : 'Drop image, or click to upload'}
        </button>
      )}
      <input ref={ref} type="file" accept="image/*" className="hidden"
        onChange={(e) => { void pick(e.target.files?.[0]); e.target.value = ''; }} />
      <input className={inputClass} placeholder="…or paste image URL"
        value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

export function ImageListInput({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const ref = React.useRef<HTMLInputElement>(null);
  const { uploading, dragOver, pick, dropProps } = useImageUpload((url) => onChange([...value, url]));
  return (
    <div className="space-y-1.5" {...dropProps}>
      <div className={`flex flex-wrap gap-2 rounded-lg p-1 transition-colors ${dragOver ? 'bg-[#005bd3]/5 ring-1 ring-dashed ring-[#005bd3]' : ''}`}>
        {value.map((url) => (
          <div key={url} className="relative">
            <img src={url} alt="" className="h-16 w-24 rounded-lg border border-admin-border object-cover" />
            <button type="button" onClick={() => onChange(value.filter((v) => v !== url))}
              className="absolute -right-1.5 -top-1.5 rounded-full border border-admin-border bg-white p-0.5 text-admin-text-subdued shadow-sm hover:text-red-600">
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
        <button type="button" disabled={uploading} onClick={() => ref.current?.click()}
          className={`flex h-16 w-28 flex-col items-center justify-center gap-1 rounded-lg border border-dashed text-[11px] transition-colors disabled:opacity-50 ${dragOver ? 'border-[#005bd3] text-[#005bd3]' : 'border-admin-border text-admin-text-subdued hover:bg-[#f6f6f7]'}`}>
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
          {uploading ? 'Uploading…' : dragOver ? 'Drop here' : 'Drop / click'}
        </button>
      </div>
      <input ref={ref} type="file" accept="image/*" className="hidden"
        onChange={(e) => { void pick(e.target.files?.[0]); e.target.value = ''; }} />
      <ListInput value={value} placeholder="…or paste image URL, press Enter" onChange={onChange} />
    </div>
  );
}

// Repeater: editable rows of subFields (itinerary days, payments, add-ons…)
function RepeaterInput({ field, value, onChange }: {
  field: SectorField; value: Record<string, unknown>[]; onChange: (v: Record<string, unknown>[]) => void;
}) {
  const rows = Array.isArray(value) ? value : [];
  const setRow = (i: number, patch: Record<string, unknown>) =>
    onChange(rows.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  const addRow = () => onChange([...rows, {}]);
  const removeRow = (i: number) => onChange(rows.filter((_, j) => j !== i));
  const moveRow = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= rows.length) return;
    const next = [...rows];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  return (
    <div className="space-y-2 rounded-lg border border-admin-border p-2">
      {rows.map((row, i) => (
        <div key={i} className="rounded-lg border border-admin-border bg-[#fafafa] p-2.5">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-[11px] font-semibold text-admin-text-secondary">#{i + 1}</span>
            <div className="flex items-center gap-1">
              <button type="button" className="px-1 text-admin-text-subdued hover:text-admin-text" onClick={() => moveRow(i, -1)}>↑</button>
              <button type="button" className="px-1 text-admin-text-subdued hover:text-admin-text" onClick={() => moveRow(i, 1)}>↓</button>
              <button type="button" className="px-1 text-red-500" onClick={() => removeRow(i)}>×</button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {(field.subFields || []).map((sf) => (
              <label key={sf.name} className={sf.type === 'textarea' || sf.type === 'multiselect' ? 'col-span-2' : ''}>
                <span className="block text-[11px] font-medium text-admin-text-secondary mb-0.5">{sf.label}</span>
                {sf.type === 'select' ? (
                  <select className={inputClass} value={String(row[sf.name] ?? '')} onChange={(e) => setRow(i, { [sf.name]: e.target.value })}>
                    <option value="">—</option>
                    {(sf.options || []).map((o) => <option key={o} value={o}>{o.replace(/_/g, ' ')}</option>)}
                  </select>
                ) : sf.type === 'multiselect' ? (
                  <MultiSelect options={sf.options || []} allowOther={!!sf.allowOther}
                    value={Array.isArray(row[sf.name]) ? (row[sf.name] as string[]) : []}
                    onChange={(v) => setRow(i, { [sf.name]: v })} />
                ) : sf.type === 'textarea' ? (
                  <textarea className={inputClass} rows={2} value={String(row[sf.name] ?? '')} onChange={(e) => setRow(i, { [sf.name]: e.target.value })} />
                ) : (
                  <input className={inputClass}
                    type={sf.type === 'date' ? 'date' : sf.type === 'time' ? 'time' : sf.type === 'number' || sf.type === 'money' ? 'number' : 'text'}
                    value={sf.type === 'date' && row[sf.name] ? String(row[sf.name]).slice(0, 10) : String(row[sf.name] ?? '')}
                    onChange={(e) => setRow(i, { [sf.name]: e.target.value })} />
                )}
              </label>
            ))}
          </div>
        </div>
      ))}
      <button type="button" className={secondaryBtn} onClick={addRow}>
        <Plus className="h-3.5 w-3.5" /> Add item
      </button>
    </div>
  );
}

function FieldInput({ f, form, setForm, linkOptions }: {
  f: SectorField;
  form: Record<string, unknown>;
  setForm: (v: Record<string, unknown>) => void;
  linkOptions: Record<string, LinkOpt[]>;
}) {
  const val = form[f.name];
  switch (f.type) {
    case 'select':
      return (
        <select className={inputClass} value={String(val ?? '')} onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}>
          <option value="">—</option>
          {(f.options || []).map((o) => <option key={o} value={o}>{o.replace(/_/g, ' ')}</option>)}
        </select>
      );
    case 'link':
      return (
        <select className={inputClass} value={String(val ?? '')} disabled={!!f.readonly}
          onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}>
          <option value="">—</option>
          {(linkOptions[f.name] || []).map((o) => (
            <option key={o._id} value={o._id}>{o.title}{o.sub ? ` — ${o.sub}` : ''}</option>
          ))}
        </select>
      );
    case 'multilink': {
      const chosen: string[] = Array.isArray(val) ? (val as string[]) : [];
      return (
        <div className="max-h-36 space-y-1 overflow-y-auto rounded-lg border border-admin-border p-2">
          {(linkOptions[f.name] || []).length === 0 && (
            <p className="text-[11px] text-admin-text-subdued">No {f.linkTo} records yet — create them first.</p>
          )}
          {(linkOptions[f.name] || []).map((o) => (
            <label key={o._id} className="flex items-center gap-1.5 text-[12px]">
              <input type="checkbox" checked={chosen.includes(o._id)}
                onChange={(e) => setForm({ ...form, [f.name]: e.target.checked ? [...chosen, o._id] : chosen.filter((x) => x !== o._id) })} />
              {o.title}{o.sub ? ` — ${o.sub}` : ''}
            </label>
          ))}
        </div>
      );
    }
    case 'multiselect':
      return (
        <MultiSelect options={f.options || []} allowOther={!!f.allowOther}
          value={Array.isArray(val) ? (val as string[]) : []}
          onChange={(v) => setForm({ ...form, [f.name]: v })} />
      );
    case 'list':
      return (
        <ListInput value={Array.isArray(val) ? (val as string[]) : []} placeholder={f.placeholder}
          onChange={(v) => setForm({ ...form, [f.name]: v })} />
      );
    case 'image':
      return (
        <ImageInput value={typeof val === 'string' ? val : ''}
          onChange={(v) => setForm({ ...form, [f.name]: v })} />
      );
    case 'imagelist':
      return (
        <ImageListInput value={Array.isArray(val) ? (val as string[]) : []}
          onChange={(v) => setForm({ ...form, [f.name]: v })} />
      );
    case 'repeater':
      return (
        <RepeaterInput field={f} value={Array.isArray(val) ? (val as Record<string, unknown>[]) : []}
          onChange={(v) => setForm({ ...form, [f.name]: v })} />
      );
    case 'toggle':
      return (
        <label className="flex items-center gap-2 text-[13px] text-admin-text">
          <input type="checkbox" checked={val === true}
            onChange={(e) => setForm({ ...form, [f.name]: e.target.checked })} />
          {val === true ? 'On' : 'Off'}
        </label>
      );
    case 'textarea':
      return (
        <textarea className={inputClass} rows={3} placeholder={f.placeholder}
          value={String(val ?? '')} onChange={(e) => setForm({ ...form, [f.name]: e.target.value })} />
      );
    default:
      return (
        <input className={inputClass}
          type={f.type === 'date' ? 'date' : f.type === 'time' ? 'time' : f.type === 'number' || f.type === 'money' ? 'number' : 'text'}
          placeholder={f.placeholder} disabled={!!f.readonly}
          value={f.type === 'date' && val ? String(val).slice(0, 10) : String(val ?? '')}
          onChange={(e) => setForm({ ...form, [f.name]: e.target.value })} />
      );
  }
}

// ── Booking confirmation print ──────────────────────────────────
function printConfirmation(rec: RecordDoc, linkTitles: Record<string, string>, biz: Record<string, unknown>) {
  const d = rec.data || {};
  const pkgTitle = linkTitles[String(rec.linkRefs?.packageId || '')] || (d.packageSnapshot as { title?: string })?.title || '';
  const snap = (d.packageSnapshot || {}) as Record<string, unknown>;
  const history = Array.isArray(d.statusHistory) ? d.statusHistory : [];
  const payments = Array.isArray(d.payments) ? d.payments : [];
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>Booking ${d.bookingRef || ''}</title>
<style>body{font-family:system-ui,Arial,sans-serif;color:#111;max-width:720px;margin:24px auto;padding:0 16px}
h1{font-size:20px;margin:0}h2{font-size:14px;margin:24px 0 8px;border-bottom:1px solid #ddd;padding-bottom:4px}
table{width:100%;border-collapse:collapse;font-size:13px}td,th{padding:6px 8px;border:1px solid #ddd;text-align:left}
.muted{color:#666}.right{text-align:right}</style></head><body>
<h1>${biz.businessName || 'Travel Agency'}</h1>
<p class="muted">${[biz.address, biz.contactPhone, biz.email].filter(Boolean).join(' · ')}</p>
<h2>Booking Confirmation — ${d.bookingRef || ''}</h2>
<table><tr><th>Customer</th><td>${d.customerName || ''}</td><th>Status</th><td>${rec.status}</td></tr>
<tr><th>Package</th><td colspan="3">${pkgTitle}${snap.destination ? ' — ' + snap.destination : ''}</td></tr>
<tr><th>Departure</th><td>${String(d.departureDate || '').slice(0, 10)}</td><th>Return</th><td>${String(d.returnDate || '').slice(0, 10) || '—'}</td></tr>
<tr><th>Travellers</th><td colspan="3">${(d.adults || 0)} adult(s)${d.children ? `, ${d.children} child(ren)` : ''}${d.infants ? `, ${d.infants} infant(s)` : ''}</td></tr></table>
<h2>Pricing</h2>
<table><tr><th>Subtotal</th><td class="right">₹${Number(d.subtotal || 0).toLocaleString('en-IN')}</td></tr>
<tr><th>Taxes & fees</th><td class="right">₹${Number(d.taxAmount || 0).toLocaleString('en-IN')}</td></tr>
<tr><th>Discount</th><td class="right">-₹${Number(d.discount || 0).toLocaleString('en-IN')}</td></tr>
<tr><th>Total</th><td class="right"><b>₹${Number(d.total || 0).toLocaleString('en-IN')}</b></td></tr>
<tr><th>Paid</th><td class="right">₹${Number(d.paidTotal || 0).toLocaleString('en-IN')}</td></tr>
<tr><th>Balance due</th><td class="right">₹${Number(d.balance || 0).toLocaleString('en-IN')}</td></tr></table>
${payments.length ? `<h2>Payments</h2><table><tr><th>Date</th><th>Method</th><th>Ref</th><th class="right">Amount</th></tr>${payments.map((p: { date?: string; method?: string; ref?: string; amount?: number }) => `<tr><td>${String(p.date || '').slice(0, 10)}</td><td>${p.method || ''}</td><td>${p.ref || ''}</td><td class="right">₹${Number(p.amount || 0).toLocaleString('en-IN')}</td></tr>`).join('')}</table>` : ''}
${d.specialRequests ? `<h2>Special requests</h2><p>${d.specialRequests}</p>` : ''}
<h2>History</h2><table><tr><th>Date</th><th>Change</th></tr>${history.map((h: { at?: string; from?: string; to?: string; note?: string }) => `<tr><td>${String(h.at || '').slice(0, 10)}</td><td>${h.from ? `${h.from} → ` : ''}${h.to}${h.note ? ` (${h.note})` : ''}</td></tr>`).join('')}</table>
<p class="muted" style="margin-top:24px">Generated ${new Date().toLocaleString()}</p>
</body></html>`;
  const w = window.open('', '_blank', 'width=800,height=900');
  if (!w) { toast.error('Popup blocked — allow popups to print'); return; }
  w.document.write(html);
  w.document.close();
  w.focus();
  setTimeout(() => w.print(), 300);
}

// ── Main page ───────────────────────────────────────────────────

function SectorEntityPageInner({ industry, entity }: { industry: string; entity: string }) {
  const searchParams = useSearchParams();
  const [def, setDef] = useState<SectorEntityDef | null>(null);
  const [allDefs, setAllDefs] = useState<SectorEntityDef[]>([]);
  const [defError, setDefError] = useState('');
  const [records, setRecords] = useState<RecordDoc[]>([]);
  const [linkTitles, setLinkTitles] = useState<Record<string, string>>({});
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusF, setStatusF] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Record<string, unknown>>({});
  const [saving, setSaving] = useState(false);
  const [detail, setDetail] = useState<RecordDoc | null>(null);
  const [detailLinks, setDetailLinks] = useState<Record<string, string>>({});
  const [cancelMode, setCancelMode] = useState(false);
  const [cancelForm, setCancelForm] = useState({ cancelReason: '', refundAmount: '' });
  const [linkOptions, setLinkOptions] = useState<Record<string, LinkOpt[]>>({});
  const [settings, setSettings] = useState<Record<string, unknown>>({});
  const limit = 20;

  // Load entity schema + linked-entity options + settings (for print header)
  useEffect(() => {
    setDef(null); setDefError(''); setRecords([]); setLinkTitles({}); setLinkOptions({}); setDetail(null);
    sectorApi.entities(industry).then(async (r) => {
      const defs: SectorEntityDef[] = r.data.data?.entities || [];
      setAllDefs(defs);
      const found = defs.find((e: SectorEntityDef) => e.key === entity);
      if (!found) { setDefError('This section is not configured for your workspace.'); setLoading(false); return; }
      setDef(found);
      const links: SectorField[] = found.fields.filter((f) => (f.type === 'link' || f.type === 'multilink') && f.linkTo);
      const opts: Record<string, LinkOpt[]> = {};
      await Promise.all(links.map(async (f: SectorField) => {
        try {
          const targetDef = defs.find((e) => e.key === f.linkTo);
          const lr = await sectorApi.list(industry, f.linkTo!, { limit: 100 });
          opts[f.name] = (lr.data.data || []).map((d: RecordDoc) => {
            const title = d.title || String(Object.values(d.data || {})[0] || '');
            const subRaw = targetDef?.subTitleField ? d.data?.[targetDef.subTitleField] : null;
            const sub = Array.isArray(subRaw) ? subRaw.join(', ') : (subRaw ? String(subRaw) : '');
            return { _id: d._id, title, sub: sub || undefined };
          });
        } catch { opts[f.name] = []; }
      }));
      setLinkOptions(opts);
      // settings for the print header
      try {
        const sr = await sectorApi.list(industry, 'settings');
        setSettings((sr.data.data || [])[0]?.data || {});
      } catch { /* settings optional */ }
    }).catch((e: unknown) => {
      const err = e as { response?: { data?: { message?: string } } };
      setDefError(err.response?.data?.message || 'Could not load section');
      setLoading(false);
    });
  }, [industry, entity]);

  const load = (p = page, s = search, st = statusF) => {
    if (!def) return;
    setLoading(true);
    sectorApi.list(industry, entity, { page: p, limit, ...(s ? { search: s } : {}), ...(st ? { status: st } : {}) })
      .then((r) => {
        setRecords(r.data.data || []);
        setTotal(r.data.total || 0);
        setLinkTitles(r.data.linkTitles || {});
      })
      .catch((e: unknown) => {
        const err = e as { response?: { data?: { message?: string } } };
        toast.error(err.response?.data?.message || 'Could not load records');
      })
      .finally(() => setLoading(false));
  };
  useEffect(() => { if (def) load(); }, [def, page, statusF]);

  // ?new=1 deep-link (from overview quick actions)
  useEffect(() => {
    if (def && searchParams?.get('new') === '1') { setEditId(null); setForm({}); setShowForm(true); }
  }, [def, searchParams]);

  const openNew = () => { setEditId(null); setForm({}); setShowForm(true); };
  const openEdit = (r: RecordDoc) => {
    setDetail(null);
    setEditId(r._id);
    const init: Record<string, unknown> = { status: r.status };
    (def?.fields || []).forEach((f) => {
      if (f.readonly) return;
      if (f.type === 'link') init[f.name] = r.linkRefs?.[f.name] || '';
      else if (f.type === 'multilink') init[f.name] = Array.isArray(r.linkRefs?.[f.name]) ? r.linkRefs[f.name] : [];
      else if (f.type === 'multiselect' || f.type === 'list' || f.type === 'repeater' || f.type === 'imagelist') init[f.name] = Array.isArray(r.data?.[f.name]) ? r.data[f.name] : [];
      else if (f.type === 'toggle') init[f.name] = r.data?.[f.name] === true;
      else if (f.type === 'date') init[f.name] = r.data?.[f.name] ? String(r.data[f.name]).slice(0, 10) : '';
      else init[f.name] = r.data?.[f.name] ?? '';
    });
    setForm(init);
    setShowForm(true);
  };

  const openDetail = async (r: RecordDoc) => {
    try {
      const res = await sectorApi.get(industry, entity, r._id);
      setDetail(res.data.data);
      setDetailLinks(res.data.linkTitles || {});
      setCancelMode(false);
      setCancelForm({ cancelReason: '', refundAmount: '' });
    } catch { setDetail(r); setDetailLinks({}); }
  };

  const save = async () => {
    if (!def) return;
    for (const f of def.fields) {
      if (f.required && !f.readonly && !form[f.name]) { toast.error(`${f.label} is required`); return; }
    }
    setSaving(true);
    try {
      if (editId) await sectorApi.update(industry, entity, editId, form);
      else await sectorApi.create(industry, entity, form);
      toast.success(editId ? 'Updated' : 'Created');
      setShowForm(false);
      load();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  };

  const archive = async (id: string) => {
    if (!window.confirm(`Archive this ${def?.singular.toLowerCase()}? History is preserved.`)) return;
    try { await sectorApi.archive(industry, entity, id); toast.success('Archived'); setDetail(null); load(); }
    catch { toast.error('Could not archive'); }
  };

  const doStatus = async (id: string, status: string, extra?: Record<string, unknown>) => {
    try {
      const r = await sectorApi.setStatus(industry, entity, id, { status, ...extra });
      toast.success(`Status → ${status.replace(/_/g, ' ')}`);
      setDetail(r.data.data);
      setCancelMode(false);
      load();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Status change failed');
    }
  };

  const doDuplicate = async (id: string) => {
    try {
      const r = await sectorApi.duplicate(industry, entity, id);
      toast.success('Duplicated — new draft created');
      setDetail(r.data.data);
      load();
    } catch { toast.error('Duplicate failed'); }
  };

  const doConvert = async (id: string) => {
    try {
      const r = await sectorApi.convertEnquiry(industry, id, {});
      const ref = r.data.data?.booking?.data?.bookingRef || '';
      toast.success(`Converted to booking ${ref}`);
      setDetail(r.data.data.enquiry);
      load();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Conversion failed');
    }
  };

  // Actions available on the detail view, by entity + current status
  const detailActions = useMemo(() => {
    if (!detail || !def) return [];
    const s = detail.status;
    const acts: { label: string; run: () => void; cls: string; icon?: React.ReactNode }[] = [];
    if (industry === 'tour_travel' && entity === 'bookings') {
      if (s === 'pending' || s === 'draft') acts.push({ label: 'Confirm booking', run: () => doStatus(detail._id, 'confirmed'), cls: primaryBtn, icon: <CheckCircle2 className="h-4 w-4" /> });
      if (s === 'confirmed') acts.push({ label: 'Mark completed', run: () => doStatus(detail._id, 'completed'), cls: primaryBtn });
      if (s === 'confirmed') acts.push({ label: 'Mark no-show', run: () => doStatus(detail._id, 'no_show'), cls: secondaryBtn });
      if (['pending', 'confirmed', 'draft'].includes(s)) acts.push({ label: 'Cancel booking', run: () => setCancelMode(true), cls: dangerBtn });
      acts.push({ label: 'Print confirmation', run: () => printConfirmation(detail, detailLinks, settings), cls: secondaryBtn, icon: <Printer className="h-4 w-4" /> });
    }
    if (industry === 'tour_travel' && entity === 'packages') {
      acts.push({ label: 'Duplicate package', run: () => doDuplicate(detail._id), cls: secondaryBtn, icon: <Copy className="h-4 w-4" /> });
      if (s === 'draft' || s === 'inactive') acts.push({ label: 'Activate', run: () => doStatus(detail._id, 'active'), cls: primaryBtn });
      if (s === 'active') acts.push({ label: 'Mark sold out', run: () => doStatus(detail._id, 'sold_out'), cls: secondaryBtn });
      if (s === 'active' || s === 'sold_out') acts.push({ label: 'Deactivate', run: () => doStatus(detail._id, 'inactive'), cls: secondaryBtn });
    }
    if (industry === 'tour_travel' && entity === 'enquiries') {
      if (!detail.linkRefs?.convertedBookingId && s !== 'converted' && s !== 'lost') {
        acts.push({ label: 'Convert to booking', run: () => doConvert(detail._id), cls: primaryBtn, icon: <ArrowRightLeft className="h-4 w-4" /> });
      }
    }
    acts.push({ label: 'Edit', run: () => openEdit(detail), cls: secondaryBtn });
    acts.push({ label: 'Archive', run: () => archive(detail._id), cls: dangerBtn });
    return acts;
  }, [detail, def, industry, entity, detailLinks, settings]);

  const listFields = useMemo(() => (def?.fields || []).filter((f) => f.listField).slice(0, 5), [def]);
  const pages = Math.max(1, Math.ceil(total / limit));
  const fieldByName = useMemo(() => {
    const m: Record<string, SectorField> = {};
    (def?.fields || []).forEach((f) => { m[f.name] = f; });
    return m;
  }, [def]);
  const labelFor = (f: SectorField, r: RecordDoc) => {
    if (f.type === 'link') return detailLinksOrList(f, r);
    if (f.type === 'multilink') {
      const ids = Array.isArray(r.linkRefs?.[f.name]) ? (r.linkRefs[f.name] as string[]) : [];
      const titles = ids.map((id) => linkTitles[id]).filter(Boolean);
      return titles.length ? titles.join(', ') : '—';
    }
    return fmtVal(f, r.data?.[f.name]);
  };
  const detailLinksOrList = (f: SectorField, r: RecordDoc) => linkTitles[String(r.linkRefs?.[f.name] || '')] || '—';

  // Sections for the form and the detail view
  const sections = useMemo(() => {
    const map = new Map<string, SectorField[]>();
    (def?.fields || []).forEach((f) => {
      const key = f.section || 'Details';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(f);
    });
    return [...map.entries()];
  }, [def]);

  if (defError) {
    return (
      <div className={adminContentColumnClass}>
        <div className={dashboardCardShell}><p className="text-[13px] text-admin-text-secondary">{defError}</p></div>
      </div>
    );
  }
  if (!def) return <div className={`${adminContentColumnClass} p-4 text-[13px] text-admin-text-secondary`}>Loading…</div>;

  return (
    <div className={`${adminContentColumnClass} space-y-4`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[20px] font-semibold text-admin-text">{def.plural}</h1>
          <p className="mt-1 text-[13px] text-admin-text-secondary">{def.singular} records for this workspace</p>
        </div>
        <button type="button" className={primaryBtn} onClick={openNew}><Plus className="h-4 w-4" /> New {def.singular.toLowerCase()}</button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-admin-text-subdued" />
          <input className={`${inputClass} pl-9`} placeholder={`Search ${def.plural.toLowerCase()}…`}
            value={search} onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { setPage(1); load(1, search); } }} />
        </div>
        <select className={inputClass} style={{ width: 'auto' }} value={statusF} onChange={(e) => { setStatusF(e.target.value); setPage(1); }}>
          <option value="">All statuses</option>
          {def.statuses.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
        </select>
      </div>

      <div className={dashboardCardShell + ' overflow-x-auto p-0'}>
        <table className="w-full min-w-[640px] text-left text-[13px]">
          <thead className="border-b border-admin-border bg-[#f6f6f7] text-admin-text-secondary">
            <tr>
              {listFields.map((f) => <th key={f.name} className="px-4 py-2.5 font-medium">{f.label}</th>)}
              <th className="px-4 py-2.5 font-medium">Status</th>
              <th className="px-4 py-2.5 font-medium">Created</th>
              <th className="px-4 py-2.5 font-medium"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-admin-border">
            {loading && <tr><td colSpan={listFields.length + 3} className="px-4 py-6 text-admin-text-secondary">Loading…</td></tr>}
            {!loading && records.length === 0 && (
              <tr><td colSpan={listFields.length + 3} className="px-4 py-6 text-admin-text-secondary">
                No {def.plural.toLowerCase()} yet. Click “New {def.singular.toLowerCase()}” to create the first one.
              </td></tr>
            )}
            {!loading && records.map((r) => (
              <tr key={r._id} className="cursor-pointer hover:bg-[#fafafa]" onClick={() => openDetail(r)}>
                {listFields.map((f) => <td key={f.name} className="px-4 py-3">{labelFor(f, r)}</td>)}
                <td className="px-4 py-3">
                  <span className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${statusCls(r.status)}`}>
                    {def.statuses.find((s) => s.id === r.status)?.label || r.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-admin-text-secondary">{r.createdAt ? String(r.createdAt).slice(0, 10) : '—'}</td>
                <td className="px-4 py-3">
                  <button type="button" className="text-[12px] text-red-600" onClick={(e) => { e.stopPropagation(); archive(r._id); }}>Archive</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <div className="flex items-center justify-end gap-2 text-[13px]">
          <button type="button" className={secondaryBtn} disabled={page <= 1} onClick={() => setPage((n) => n - 1)}>Previous</button>
          <span className="text-admin-text-secondary">Page {page} of {pages} · {total} records</span>
          <button type="button" className={secondaryBtn} disabled={page >= pages} onClick={() => setPage((n) => n + 1)}>Next</button>
        </div>
      )}

      {/* ── Record detail modal ── */}
      {detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setDetail(null)}>
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-admin-border p-4">
              <div className="flex items-center gap-2.5">
                <h3 className="font-semibold">{detail.title || String(detail.data?.bookingRef || detail.data?.enquiryRef || def.singular)}</h3>
                <span className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${statusCls(detail.status)}`}>
                  {def.statuses.find((s) => s.id === detail.status)?.label || detail.status}
                </span>
              </div>
              <button type="button" onClick={() => setDetail(null)}><X className="h-4 w-4" /></button>
            </div>

            <div className="space-y-4 p-4">
              {sections.map(([section, fields]) => {
                const visible = fields.filter((f) => {
                  const v = f.type === 'link' || f.type === 'multilink' ? detail.linkRefs?.[f.name] : detail.data?.[f.name];
                  return v !== undefined && v !== null && v !== '' && !(Array.isArray(v) && !v.length);
                });
                if (!visible.length) return null;
                return (
                  <div key={section}>
                    <p className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-admin-text-subdued">{section}</p>
                    <dl className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
                      {visible.map((f) => (
                        <div key={f.name} className={f.type === 'textarea' || f.type === 'repeater' || f.type === 'list' || f.type === 'multiselect' || f.type === 'imagelist' ? 'sm:col-span-2' : ''}>
                          <dt className="text-[11px] font-medium text-admin-text-secondary">{f.label}</dt>
                          <dd className="text-[13px] text-admin-text">
                            {f.type === 'link' ? (detailLinks[String(detail.linkRefs?.[f.name] || '')] || '—')
                              : f.type === 'multilink' ? (
                                (Array.isArray(detail.linkRefs?.[f.name]) ? (detail.linkRefs[f.name] as string[]) : [])
                                  .map((id) => detailLinks[id]).filter(Boolean).join(', ') || '—'
                              )
                              : f.type === 'image' ? (
                                detail.data?.[f.name]
                                  ? <img src={String(detail.data[f.name])} alt={f.label} className="mt-1 h-24 w-40 rounded-lg border border-admin-border object-cover" />
                                  : '—'
                              )
                              : f.type === 'imagelist' ? (
                                <div className="mt-1 flex flex-wrap gap-2">
                                  {(Array.isArray(detail.data?.[f.name]) ? (detail.data[f.name] as string[]) : []).map((u) => (
                                    <img key={u} src={u} alt="" className="h-16 w-24 rounded-lg border border-admin-border object-cover" />
                                  ))}
                                  {(!Array.isArray(detail.data?.[f.name]) || !(detail.data[f.name] as string[]).length) && '—'}
                                </div>
                              )
                              : f.type === 'repeater' ? (
                                <div className="mt-1 space-y-1">
                                  {(Array.isArray(detail.data?.[f.name]) ? (detail.data[f.name] as Record<string, unknown>[]) : []).map((row, i) => (
                                    <div key={i} className="rounded-md border border-admin-border bg-[#fafafa] px-2 py-1.5 text-[12px]">
                                      {(f.subFields || []).map((sf) => (
                                        <span key={sf.name} className="mr-3">
                                          <span className="text-admin-text-secondary">{sf.label}:</span> {fmtVal(sf, row[sf.name])}
                                        </span>
                                      ))}
                                    </div>
                                  ))}
                                </div>
                              )
                              : fmtVal(f, detail.data?.[f.name])}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                );
              })}

              {/* status history */}
              {Array.isArray(detail.data?.statusHistory) && (detail.data.statusHistory as { at?: string; from?: string; to?: string; note?: string }[]).length > 0 && (
                <div>
                  <p className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-admin-text-subdued">Status history</p>
                  <div className="space-y-1">
                    {(detail.data.statusHistory as { at?: string; from?: string; to?: string; note?: string }[]).slice().reverse().map((h, i) => (
                      <p key={i} className="text-[12px] text-admin-text-secondary">
                        {String(h.at || '').slice(0, 16).replace('T', ' ')} — {h.from ? `${h.from} → ` : ''}{h.to}{h.note ? ` · ${h.note}` : ''}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* cancel form */}
              {cancelMode && (
                <div className="space-y-2 rounded-lg border border-red-200 bg-red-50/50 p-3">
                  <p className="text-[13px] font-semibold text-red-700">Cancel this booking</p>
                  <input className={inputClass} placeholder="Cancellation reason"
                    value={cancelForm.cancelReason} onChange={(e) => setCancelForm({ ...cancelForm, cancelReason: e.target.value })} />
                  <input className={inputClass} type="number" placeholder="Refund amount (optional)"
                    value={cancelForm.refundAmount} onChange={(e) => setCancelForm({ ...cancelForm, refundAmount: e.target.value })} />
                  <div className="flex gap-2">
                    <button type="button" className={dangerBtn}
                      onClick={() => doStatus(detail._id, 'cancelled', {
                        cancelReason: cancelForm.cancelReason,
                        refundAmount: cancelForm.refundAmount ? Number(cancelForm.refundAmount) : undefined,
                      })}>Confirm cancellation</button>
                    <button type="button" className={secondaryBtn} onClick={() => setCancelMode(false)}>Back</button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2 border-t border-admin-border p-4">
              {detailActions.map((a) => (
                <button key={a.label} type="button" className={a.cls} onClick={a.run}>{a.icon}{a.label}</button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Create / edit form ── */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowForm(false)}>
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-admin-border p-4">
              <h3 className="font-semibold">{editId ? `Edit ${def.singular.toLowerCase()}` : `New ${def.singular.toLowerCase()}`}</h3>
              <button type="button" onClick={() => setShowForm(false)}><X className="h-4 w-4" /></button>
            </div>
            <div className="space-y-4 p-4">
              {sections.map(([section, fields]) => {
                const editable = fields.filter((f) => !f.readonly);
                if (!editable.length) return null;
                return (
                  <div key={section}>
                    <p className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-admin-text-subdued">{section}</p>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {editable.map((f) => (
                        <label key={f.name}
                          className={f.type === 'textarea' || f.type === 'repeater' || f.type === 'list' || f.type === 'multiselect' || f.type === 'multilink' || f.type === 'image' || f.type === 'imagelist' ? 'sm:col-span-2' : ''}>
                          <span className={labelClass}>{f.label}{f.required ? ' *' : ''}</span>
                          <FieldInput f={f} form={form} setForm={setForm} linkOptions={linkOptions} />
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
              <label className="block">
                <span className={labelClass}>Status</span>
                <select className={inputClass} value={String(form.status ?? def.defaultStatus)} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  {def.statuses.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
              </label>
            </div>
            <div className="flex justify-end gap-2 border-t border-admin-border p-4">
              <button type="button" className={secondaryBtn} onClick={() => setShowForm(false)}>Cancel</button>
              <button type="button" className={primaryBtn} disabled={saving} onClick={save}>{saving ? 'Saving…' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SectorEntityPage(props: { industry: string; entity: string }) {
  return (
    <Suspense fallback={<div className="p-4 text-[13px] text-admin-text-secondary">Loading…</div>}>
      <SectorEntityPageInner {...props} />
    </Suspense>
  );
}
