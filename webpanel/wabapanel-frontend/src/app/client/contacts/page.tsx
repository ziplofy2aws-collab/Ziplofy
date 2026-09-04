'use client';
import React, { useState, useEffect } from 'react';
import { Plus, Upload, Download, Search, Phone, Mail, Trash2, Edit, FileDown, X, Clock, MessageSquare, Users } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import Table from '@/components/ui/Table';
import { contactApi, tagApi, dataFieldApi, badgeApi } from '@/lib/api';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import type { Contact, Tag } from '@/types';
import toast from 'react-hot-toast';
import { adminContentColumnClass } from '@/components/layout/dashboard-ui';

const primaryBtn =
  'inline-flex items-center gap-1.5 rounded-lg bg-admin-text px-3 py-1.5 text-[13px] font-semibold text-white transition-colors hover:bg-[#1a1a1a] disabled:opacity-50';
const secondaryBtn =
  'inline-flex items-center gap-1.5 rounded-lg border border-admin-border bg-white px-3 py-1.5 text-[13px] font-medium text-admin-text transition-colors hover:bg-[#f6f6f7] disabled:opacity-50';
const filterSelect =
  'rounded-lg border border-admin-border bg-white px-2.5 py-1.5 text-[13px] text-admin-text focus:border-[#005bd3] focus:outline-none focus:ring-1 focus:ring-[#005bd3]/30';

const PAGE_SIZE_OPTIONS = [20, 50, 100, 200];

interface DataField {
  _id: string;
  name: string;
  label: string;
  type: string;
  options: string[];
  required: boolean;
  defaultValue: string;
  isActive: boolean;
}

const CHANNEL_LABELS: Record<string, string> = {
  whatsapp: 'WhatsApp',
  whatsapp_qr: 'WhatsApp QR',
  facebook: 'Facebook',
  instagram: 'Instagram',
  telegram: 'Telegram',
  telegram_personal: 'Telegram Personal',
  email: 'Gmail / Email',
};

const CHANNEL_OPTIONS = [
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'whatsapp_qr', label: 'WhatsApp QR' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'telegram', label: 'Telegram' },
  { value: 'telegram_personal', label: 'Telegram Personal' },
  { value: 'email', label: 'Gmail / Email' },
];

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [badges, setBadges] = useState<Tag[]>([]);
  const [dataFields, setDataFields] = useState<DataField[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editContact, setEditContact] = useState<Contact | null>(null);
  const [search, setSearch] = useState('');
  const [channelFilter, setChannelFilter] = useState('');
  const [tagFilter, setTagFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [optedOutCount, setOptedOutCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const isAgent = useAuthStore(s => s.user?.role === 'agent');
  const [detailContact, setDetailContact] = useState<Contact | null>(null);
  const [contactActivity, setContactActivity] = useState<Array<{_id: string; action: string; details: string; createdAt: string}>>([]);
  const [activityLoading, setActivityLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [form, setForm] = useState({ name: '', phone: '', email: '', birthday: '', anniversary: '', tags: [] as string[], badges: [] as string[], customFields: {} as Record<string, string> });
  const importFileRef = React.useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deleting, setDeleting] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const res = await contactApi.list({ page, search, limit: pageSize, channel: channelFilter || undefined, tag: tagFilter || undefined, status: statusFilter || undefined });
      setContacts(res.data.data || []);
      setTotalPages(res.data.pagination?.totalPages || res.data.pagination?.pages || 1);
      setTotal(res.data.pagination?.total || 0);
    } catch { /* empty */ }
    setLoading(false);
  };

  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get('tag');
    if (t) setTagFilter(t);
  }, []);

  useEffect(() => { fetchContacts(); setSelectedIds([]); }, [page, pageSize, search, channelFilter, tagFilter, statusFilter]);
  useEffect(() => {
    contactApi.list({ status: 'opted_out', limit: 1 })
      .then(r => setOptedOutCount(r.data.pagination?.total || 0))
      .catch(() => {});
  }, [statusFilter, total]);
  useEffect(() => {
    tagApi.list().then(r => setTags(r.data.data || [])).catch(() => {});
    badgeApi.list().then(r => setBadges(r.data.data || [])).catch(() => {});
    dataFieldApi.list().then(r => setDataFields((r.data.data || []).filter((f: DataField) => f.isActive))).catch(() => {});
  }, []);

  const getDefaultCustomFields = (): Record<string, string> => {
    const defaults: Record<string, string> = {};
    dataFields.forEach(f => { defaults[f.name] = f.defaultValue || ''; });
    return defaults;
  };

  const handleSave = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const payload = { ...form, birthday: form.birthday || null, anniversary: form.anniversary || null };
      if (editContact) {
        await contactApi.update(editContact._id, payload);
        toast.success('Contact updated');
      } else {
        await contactApi.create(payload);
        toast.success('Contact created');
      }
      setShowModal(false);
      setEditContact(null);
      setForm({ name: '', phone: '', email: '', birthday: '', anniversary: '', tags: [], badges: [], customFields: {} });
      fetchContacts();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (submitting) return;
    setSubmitting(true);

    if (!confirm('Delete this contact?')) return;
    try {
      await contactApi.delete(id);
      toast.success('Contact deleted');
      fetchContacts();
    } catch { toast.error('Failed to delete'); } finally { setSubmitting(false); }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleBulkDelete = async () => {
    if (submitting) return;
    setSubmitting(true);

    if (selectedIds.length === 0) return;
    if (!confirm(`Delete ${selectedIds.length} selected contacts?`)) return;
    setDeleting(true);
    try {
      await contactApi.bulkDelete(selectedIds);
      toast.success(`${selectedIds.length} contacts deleted`);
      setSelectedIds([]);
      fetchContacts();
    } catch { toast.error('Bulk delete failed'); } finally { setSubmitting(false); }
    setDeleting(false);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === contacts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(contacts.map(c => c._id));
    }
  };

  const handleDownloadTemplate = () => {
    const customCols = dataFields.map(f => f.name);
    const header = ['name', 'phone', 'email', 'tags', 'stage', 'segments', 'birthday', 'anniversary', ...customCols].join(',');
    const row1 = ['Hari Soni', '919782005500', 'hari@example.com', 'VIP;Lead', 'Negotiation', 'Wholesale;Mumbai', '21-04-1995', '02-11-2018', ...customCols.map(() => '')].join(',');
    const row2 = ['Manu Sharma', '919876543210', '', 'Customer', 'New', 'Retail', '', '', ...customCols.map(() => '')].join(',');
    const csv = [header, row1, row2].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'contacts-import-template.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (submitting) return;
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await contactApi.import(formData);
      toast.success(res.data.message || 'Contacts imported');
      fetchContacts();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Import failed');
    } finally {
      setSubmitting(false);
    }
    setImporting(false);
    if (importFileRef.current) importFileRef.current.value = '';
  };

  const handleExport = async () => {
    if (submitting) return;
    setSubmitting(true);

    try {
      const res = await contactApi.export();
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a'); a.href = url; a.download = 'contacts.csv'; a.click();
    } catch { toast.error('Export failed'); } finally { setSubmitting(false); }
  };

  const openEdit = (contact: Contact) => {
    setEditContact(contact);
    const cf = ((contact as unknown as Record<string, unknown>).customFields || {}) as Record<string, string>;
    const customFields: Record<string, string> = {};
    dataFields.forEach(f => { customFields[f.name] = cf[f.name] || f.defaultValue || ''; });
    const cext = contact as unknown as { birthday?: string; anniversary?: string };
    setForm({
      name: contact.name, phone: contact.phone, email: contact.email,
      birthday: cext.birthday ? cext.birthday.slice(0, 10) : '',
      anniversary: cext.anniversary ? cext.anniversary.slice(0, 10) : '',
      tags: contact.tags?.map(t => t._id || t as unknown as string) || [],
      badges: contact.badges?.map(b => b._id || b as unknown as string) || [],
      customFields,
    });
    setShowModal(true);
  };

  const openAdd = () => {
    setEditContact(null);
    setForm({ name: '', phone: '', email: '', birthday: '', anniversary: '', tags: [], badges: [], customFields: getDefaultCustomFields() });
    setShowModal(true);
  };

  const updateCustomField = (fieldName: string, value: string) => {
    setForm(prev => ({ ...prev, customFields: { ...prev.customFields, [fieldName]: value } }));
  };

  const statusPill = (status: string) => {
    const map: Record<string, string> = {
      active: 'bg-[#cdfee1] text-[#0d6b38] ring-[#0d6b38]/15',
      opted_out: 'bg-amber-50 text-amber-700 ring-amber-600/15',
      blocked: 'bg-red-50 text-red-700 ring-red-600/15',
    };
    const label = status === 'opted_out' ? 'Unsubscribed' : status;
    return (
      <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${map[status] || 'bg-[#f6f6f7] text-admin-text-secondary ring-admin-border'}`}>
        {label}
      </span>
    );
  };

  const columns = [
    { key: 'select', title: (
      <input type="checkbox" checked={contacts.length > 0 && selectedIds.length === contacts.length} onChange={toggleSelectAll} className="h-4 w-4 rounded border-admin-border" />
    ), render: (c: Contact) => (
      <input type="checkbox" checked={selectedIds.includes(c._id)} onChange={() => toggleSelect(c._id)} className="h-4 w-4 rounded border-admin-border" onClick={(e) => e.stopPropagation()} />
    )},
    { key: 'name', title: 'Name', render: (c: Contact) => (
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f1f1f1] text-[12px] font-semibold text-admin-text">{c.name?.charAt(0)?.toUpperCase() || '?'}</div>
        <span className="font-medium text-admin-text">{c.name}</span>
      </div>
    )},
    { key: 'phone', title: 'Phone', render: (c: Contact) => <span className="inline-flex items-center gap-1 text-admin-text"><Phone className="h-3 w-3 text-admin-text-subdued" />{c.phone}</span> },
    { key: 'email', title: 'Email', render: (c: Contact) => c.email ? <span className="inline-flex items-center gap-1"><Mail className="h-3 w-3 text-admin-text-subdued" />{c.email}</span> : <span className="text-admin-text-subdued">—</span> },
    { key: 'tags', title: 'Labels', render: (c: Contact) => (
      <div className="flex max-w-[220px] flex-wrap gap-1">
        {c.tags?.slice(0, 3).map((t, i) => (
          <span key={i} className="rounded-full bg-[#f1f1f1] px-2 py-0.5 text-[11px] font-medium text-admin-text">{typeof t === 'object' ? t.name : t}</span>
        ))}
        {c.badges?.slice(0, 2).map((b, i) => (
          <span key={'bg'+i} className="rounded-full px-2 py-0.5 text-[11px] font-medium" style={{ backgroundColor: ((typeof b==='object'&&b.color)||'#10b981')+'20', color: (typeof b==='object'&&b.color)||'#10b981' }}>{typeof b === 'object' ? b.name : b}</span>
        ))}
      </div>
    )},
    { key: 'platform', title: 'Platform', render: (c: Contact) => (
      <span className="inline-flex rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700 ring-1 ring-inset ring-blue-600/15">
        {CHANNEL_LABELS[c.channel || ''] || CHANNEL_LABELS[c.source || ''] || 'WhatsApp'}
      </span>
    )},
    { key: 'status', title: 'Status', render: (c: Contact) => statusPill(c.status) },
    { key: 'actions', title: '', render: (c: Contact) => (
      <div className="flex gap-0.5">
        <button type="button" onClick={(e) => { e.stopPropagation(); openEdit(c); }} className="rounded-lg p-1.5 text-admin-text-subdued hover:bg-[#f1f1f1] hover:text-admin-text"><Edit className="h-4 w-4" /></button>
        {!isAgent && <button type="button" onClick={(e) => { e.stopPropagation(); handleDelete(c._id); }} className="rounded-lg p-1.5 text-admin-text-subdued hover:bg-red-50 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>}
      </div>
    )},
  ];

  // Agents can view/edit contacts but not delete them, so drop the bulk-select column for them.
  const visibleColumns = isAgent ? columns.filter(col => col.key !== 'select') : columns;

  const renderCustomField = (field: DataField) => {
    const value = form.customFields[field.name] || '';
    const isRequired = field.required;
    const label = `${field.label}${isRequired ? ' *' : ''}`;

    switch (field.type) {
      case 'dropdown':
        return (
          <div key={field._id}>
            <label className="block text-sm font-medium text-admin-text mb-1">{label}</label>
            <select
              value={value}
              onChange={(e) => updateCustomField(field.name, e.target.value)}
              className="w-full rounded-lg border border-admin-border bg-white px-3 py-2 text-sm text-admin-text focus:border-[#005bd3] focus:outline-none focus:ring-1 focus:ring-[#005bd3]/30"
              required={isRequired}
            >
              <option value="">Select {field.label}</option>
              {field.options.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        );
      case 'checkbox':
        return (
          <div key={field._id}>
            <label className="flex items-center gap-2 text-sm text-admin-text">
              <input
                type="checkbox"
                checked={value === 'true'}
                onChange={(e) => updateCustomField(field.name, e.target.checked ? 'true' : 'false')}
                className="rounded border-admin-border text-admin-text focus:ring-[#005bd3]"
              />
              {field.label}
            </label>
          </div>
        );
      case 'date':
        return <Input key={field._id} label={label} type="date" value={value} onChange={(e) => updateCustomField(field.name, e.target.value)} required={isRequired} />;
      case 'number':
        return <Input key={field._id} label={label} type="number" value={value} onChange={(e) => updateCustomField(field.name, e.target.value)} required={isRequired} />;
      case 'email':
        return <Input key={field._id} label={label} type="email" value={value} onChange={(e) => updateCustomField(field.name, e.target.value)} required={isRequired} />;
      case 'url':
        return <Input key={field._id} label={label} type="url" value={value} onChange={(e) => updateCustomField(field.name, e.target.value)} placeholder="https://" required={isRequired} />;
      case 'phone':
        return <Input key={field._id} label={label} type="tel" value={value} onChange={(e) => updateCustomField(field.name, e.target.value)} placeholder="+91XXXXXXXXXX" required={isRequired} />;
      default:
        return <Input key={field._id} label={label} value={value} onChange={(e) => updateCustomField(field.name, e.target.value)} required={isRequired} />;
    }
  };

  return (
    <div className={adminContentColumnClass}>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 shrink-0 text-admin-text-secondary" aria-hidden />
            <h1 className="text-[20px] font-semibold tracking-tight text-admin-text">Contacts</h1>
          </div>
          <p className="mt-1 text-[13px] text-admin-text-secondary">
            {total} total contacts
            {optedOutCount > 0 && (
              <>
                {' · '}
                <button type="button" onClick={() => { setPage(1); setStatusFilter('opted_out'); }} className="font-medium text-amber-700 hover:underline">
                  {optedOutCount} unsubscribed
                </button>
              </>
            )}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className={secondaryBtn} onClick={handleExport}><Download className="h-4 w-4" /> Export</button>
          <button type="button" className={secondaryBtn} onClick={handleDownloadTemplate}><FileDown className="h-4 w-4" /> Template</button>
          <input ref={importFileRef} type="file" accept=".csv" className="hidden" onChange={handleImport} />
          <button type="button" className={secondaryBtn} onClick={() => importFileRef.current?.click()} disabled={importing}>
            <Upload className="h-4 w-4" /> {importing ? 'Importing…' : 'Import'}
          </button>
          <button type="button" className={primaryBtn} onClick={openAdd}><Plus className="h-4 w-4" /> Add contact</button>
        </div>
      </div>

      <div className="mb-3 overflow-hidden rounded-xl border border-admin-border bg-white shadow-[0_1px_2px_rgba(16,24,40,0.06)]">
        <div className="flex flex-wrap items-center gap-2 border-b border-admin-border px-3 py-2.5">
          <div className="relative min-w-[180px] flex-1">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-admin-text-subdued" />
            <input
              type="search"
              placeholder="Search contacts"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-admin-border bg-white py-1.5 pl-8 pr-3 text-[13px] text-admin-text placeholder:text-admin-text-subdued focus:border-[#005bd3] focus:outline-none focus:ring-1 focus:ring-[#005bd3]/30"
            />
          </div>
          <select value={channelFilter} onChange={(e) => { setPage(1); setChannelFilter(e.target.value); }} className={filterSelect}>
            <option value="">All platforms</option>
            {CHANNEL_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <select value={statusFilter} onChange={(e) => { setPage(1); setStatusFilter(e.target.value); }} className={filterSelect}>
            <option value="">All statuses</option>
            <option value="active">Subscribed</option>
            <option value="opted_out">Unsubscribed ({optedOutCount})</option>
            <option value="blocked">Blocked</option>
          </select>
          {tagFilter && (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#f1f1f1] px-2.5 py-1 text-[12px] font-medium text-admin-text">
              Label: {tags.find(t => t._id === tagFilter)?.name || 'filter'}
              <button type="button" onClick={() => { setPage(1); setTagFilter(''); window.history.replaceState(null, '', '/client/contacts'); }} className="hover:text-admin-text"><X className="h-3 w-3" /></button>
            </span>
          )}
          {!isAgent && selectedIds.length > 0 && (
            <button type="button" onClick={handleBulkDelete} disabled={deleting} className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-[13px] font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50">
              <Trash2 className="h-4 w-4" /> Delete {selectedIds.length}
            </button>
          )}
          <div className="ml-auto flex items-center gap-1.5 text-[13px] text-admin-text-secondary">
            <span>Show</span>
            <select value={pageSize} onChange={(e) => { setPage(1); setPageSize(Number(e.target.value)); }} className={filterSelect}>
              {PAGE_SIZE_OPTIONS.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        </div>
      </div>

      <Table columns={visibleColumns} data={contacts} loading={loading} pagination={{ page, totalPages, total, onPageChange: setPage }} onRowClick={(c: Contact) => { setDetailContact(c); setActivityLoading(true); api.get('/conversations', { params: { contact: c._id, limit: 10 } }).then(r => setContactActivity((r.data.data || []).map((cv: { _id: string; status?: string; lastMessage?: { text?: string }; updatedAt?: string }) => ({ _id: cv._id, action: cv.status === 'closed' ? 'Chat resolved' : 'Chat active', details: cv.lastMessage?.text || '', createdAt: cv.updatedAt || '' })))).catch(() => setContactActivity([])).finally(() => setActivityLoading(false)); }} onBulkDelete={isAgent ? undefined : async (ids) => { await Promise.all(ids.map((id) => contactApi.delete(id).catch(() => null))); fetchContacts(); }} />

      {detailContact && (
        <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setDetailContact(null)}>
          <div className="absolute inset-0 bg-black/30" />
          <div className="relative h-full w-full max-w-md overflow-y-auto border-l border-admin-border bg-white shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-admin-border px-5 py-4">
              <h3 className="text-[15px] font-semibold text-admin-text">{detailContact.name}</h3>
              <button type="button" onClick={() => setDetailContact(null)} className="rounded-lg p-1 text-admin-text-subdued hover:bg-[#f6f6f7]"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-4 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f1f1f1] text-lg font-semibold text-admin-text">{detailContact.name?.charAt(0)?.toUpperCase() || '?'}</div>
                <div>
                  <p className="font-medium text-admin-text">{detailContact.name}</p>
                  <p className="flex items-center gap-1 text-[13px] text-admin-text-secondary"><Phone className="h-3 w-3" />{detailContact.phone}</p>
                  {detailContact.email && <p className="flex items-center gap-1 text-[13px] text-admin-text-secondary"><Mail className="h-3 w-3" />{detailContact.email}</p>}
                </div>
              </div>
              {detailContact.tags && detailContact.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">{detailContact.tags.map((t, i) => <span key={i} className="rounded-full bg-[#f1f1f1] px-2 py-0.5 text-[11px] font-medium text-admin-text">{typeof t === 'object' ? (t as {name: string}).name : t}</span>)}</div>
              )}
              {detailContact.badges && detailContact.badges.length > 0 && (
                <div className="flex flex-wrap gap-1">{detailContact.badges.map((b, i) => <span key={'b'+i} className="rounded-full px-2 py-0.5 text-[11px] font-medium" style={{ backgroundColor: ((typeof b==='object'&&(b as {color?:string}).color)||'#10b981')+'20', color: (typeof b==='object'&&(b as {color?:string}).color)||'#10b981' }}>{typeof b === 'object' ? (b as {name:string}).name : b}</span>)}</div>
              )}
              <div className="border-t border-admin-border pt-4">
                <h4 className="mb-3 flex items-center gap-1.5 text-[13px] font-semibold text-admin-text"><Clock className="h-4 w-4" /> Activity</h4>
                {activityLoading ? (
                  <p className="text-[13px] text-admin-text-subdued">Loading…</p>
                ) : contactActivity.length === 0 ? (
                  <p className="text-[13px] text-admin-text-subdued">No recent activity</p>
                ) : (
                  <div className="space-y-3">
                    {contactActivity.map(a => (
                      <div key={a._id} className="flex gap-3">
                        <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#f1f1f1]"><MessageSquare className="h-3 w-3 text-admin-text-subdued" /></div>
                        <div className="min-w-0">
                          <p className="text-[13px] text-admin-text">{a.action}</p>
                          {a.details && <p className="truncate text-[12px] text-admin-text-subdued">{a.details}</p>}
                          <p className="text-[11px] text-admin-text-subdued">{a.createdAt ? new Date(a.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-2 border-t border-admin-border pt-4">
                <button type="button" onClick={() => { window.location.href = '/client/chat?channel=whatsapp&conv=' + (detailContact as {conversations?: string[]}).conversations?.[0]; }} className={`${primaryBtn} flex-1 justify-center`}><MessageSquare className="h-4 w-4" /> Open chat</button>
                <button type="button" onClick={() => { openEdit(detailContact); setDetailContact(null); }} className={`${secondaryBtn} flex-1 justify-center`}><Edit className="h-4 w-4" /> Edit</button>
              </div>
              <div>
                <button
                  type="button"
                  onClick={async () => {
                    const optedOut = detailContact.status === 'opted_out';
                    const next = optedOut ? 'active' : 'opted_out';
                    try {
                      await contactApi.update(detailContact._id, { status: next, optInStatus: optedOut });
                      setDetailContact({ ...detailContact, status: next });
                      fetchContacts();
                      toast.success(optedOut ? 'Contact re-subscribed' : 'Contact unsubscribed');
                    } catch { toast.error('Failed to update'); }
                  }}
                  className={`flex w-full items-center justify-center rounded-lg border px-3 py-2 text-[13px] font-medium ${detailContact.status === 'opted_out' ? 'border-[#aee9d1] text-[#0d6b38] hover:bg-[#f1f8f5]' : 'border-amber-200 text-amber-700 hover:bg-amber-50'}`}
                >
                  {detailContact.status === 'opted_out' ? 'Re-subscribe (opt-in)' : 'Unsubscribe (opt-out)'}
                </button>
                <p className="mt-1 text-center text-[11px] text-admin-text-subdued">Unsubscribed contacts are excluded from broadcasts &amp; campaigns.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editContact ? 'Edit Contact' : 'Add Contact'}>
        <div className="space-y-4">
          <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91XXXXXXXXXX" required />
          <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-[13px] font-medium text-admin-text">Birthday</label>
              <input type="date" value={form.birthday} onClick={(e) => (e.target as HTMLInputElement).showPicker?.()} onChange={(e) => setForm({ ...form, birthday: e.target.value })} className="w-full rounded-lg border border-admin-border px-3 py-2 text-[13px]" />
            </div>
            <div>
              <label className="mb-1 block text-[13px] font-medium text-admin-text">Anniversary</label>
              <input type="date" value={form.anniversary} onClick={(e) => (e.target as HTMLInputElement).showPicker?.()} onChange={(e) => setForm({ ...form, anniversary: e.target.value })} className="w-full rounded-lg border border-admin-border px-3 py-2 text-[13px]" />
            </div>
          </div>

          {dataFields.length > 0 && (
            <div className="border-t border-admin-border pt-4">
              <p className="mb-3 text-[13px] font-semibold text-admin-text-secondary">Additional information</p>
              <div className="space-y-3">
                {dataFields.map(renderCustomField)}
              </div>
            </div>
          )}

          <div>
            <label className="mb-1 block text-[13px] font-medium text-admin-text">Labels</label>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <button
                  key={tag._id}
                  type="button"
                  onClick={() => setForm({ ...form, tags: form.tags.includes(tag._id) ? form.tags.filter(t => t !== tag._id) : [...form.tags, tag._id] })}
                  className={`rounded-full border px-3 py-1 text-[12px] ${form.tags.includes(tag._id) ? 'border-admin-text bg-[#f1f1f1] font-medium text-admin-text' : 'border-admin-border bg-white text-admin-text-secondary hover:bg-[#f6f6f7]'}`}
                >
                  {tag.name}
                </button>
              ))}
            </div>
          </div>

          {badges.length > 0 && (
          <div>
            <label className="mb-1 block text-[13px] font-medium text-admin-text">Badges</label>
            <div className="flex flex-wrap gap-2">
              {badges.map((bg) => (
                <button
                  key={bg._id}
                  type="button"
                  onClick={() => setForm({ ...form, badges: form.badges.includes(bg._id) ? form.badges.filter(b => b !== bg._id) : [...form.badges, bg._id] })}
                  className="rounded-full border px-3 py-1 text-[12px]"
                  style={form.badges.includes(bg._id) ? { backgroundColor: (bg.color||'#10b981')+'20', borderColor: bg.color, color: bg.color } : { background:'#fff', borderColor:'#e3e3e3', color:'#616161' }}
                >
                  {bg.name}
                </button>
              ))}
            </div>
          </div>
          )}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <button type="button" onClick={handleSave} className={primaryBtn}>{editContact ? 'Update' : 'Create'}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
