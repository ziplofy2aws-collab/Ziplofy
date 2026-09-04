'use client';
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Plus, Trash2, Edit, FormInput, Copy, Eye, ArrowLeft, ClipboardList, X } from 'lucide-react';
import { formApi } from '@/lib/api';
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
const modalOverlayClass =
  'fixed inset-0 z-[1300] flex items-center justify-center p-4 sm:p-6';
const modalPanelClass =
  'relative z-10 flex max-h-[min(90vh,880px)] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-admin-border bg-white shadow-[0_16px_48px_rgba(16,24,40,0.18)]';
const sectionClass = 'space-y-3 rounded-lg border border-admin-border bg-[#fafafa] p-4';
const fieldTypeOptions = [
  { value: 'text', label: 'Text' },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
  { value: 'number', label: 'Number' },
  { value: 'textarea', label: 'Textarea' },
  { value: 'select', label: 'Dropdown' },
  { value: 'radio', label: 'Radio' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'date', label: 'Date' },
  { value: 'file', label: 'File upload' },
] as const;

interface FormField {
  id: string;
  label: string;
  type: string;
  required: boolean;
  placeholder: string;
  options: string[];
  order: number;
}

interface FormSubmission {
  data: Record<string, string>;
  contact?: { name?: string; phone?: string };
  submittedAt: string;
}

interface FormItem {
  _id: string;
  name: string;
  description: string;
  fields: FormField[];
  submissions: FormSubmission[];
  status: string;
  submissionCount: number;
  createdAt: string;
  waFlow?: { flowId: string; status: string; error?: string };
}

const genId = () => `field_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

export default function FormsPage() {
  const [forms, setForms] = useState<FormItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editForm, setEditForm] = useState<FormItem | null>(null);
  const [publishingId, setPublishingId] = useState<string | null>(null);

  const handlePublishFlow = async (id: string) => {
    setPublishingId(id);
    try {
      await formApi.publishFlow(id);
      toast.success('Published as WhatsApp Flow — you can now send it as a native form in chat');
      fetchForms();
    } catch (e) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Publish failed');
      fetchForms();
    }
    setPublishingId(null);
  };

  const [showResponses, setShowResponses] = useState<FormItem | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    fields: [{ id: genId(), label: '', type: 'text', required: true, placeholder: '', options: [] as string[], order: 0 }] as FormField[],
  });
  const [submitting, setSubmitting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    if (showModal) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [showModal]);

  const closeModal = () => setShowModal(false);

  const fetchForms = () => {
    formApi.list().then(r => setForms(r.data.data || [])).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetchForms(); }, []);

  const handleSave = async () => {
    if (submitting) return;
    if (!formData.name.trim()) { toast.error('Form name is required'); return; }
    if (formData.fields.length === 0) { toast.error('Add at least one field'); return; }
    if (formData.fields.some(f => !f.label.trim())) { toast.error('All fields must have a label'); return; }

    const payload = {
      ...formData,
      fields: formData.fields.map((f, i) => ({ ...f, id: f.id || genId(), order: i, options: (f.options || []).map(o => o.trim()).filter(Boolean) })),
    };

    setSubmitting(true);
    try {
      if (editForm) {
        await formApi.update(editForm._id, payload);
        toast.success('Form updated');
      } else {
        await formApi.create(payload);
        toast.success('Form created');
      }
      setShowModal(false);
      fetchForms();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to save');
    } finally {
      setSubmitting(false);
    }
  };

  const addField = () => {
    setFormData({
      ...formData,
      fields: [...formData.fields, { id: genId(), label: '', type: 'text', required: false, placeholder: '', options: [], order: formData.fields.length }],
    });
  };

  const removeField = (i: number) => {
    setFormData({ ...formData, fields: formData.fields.filter((_, idx) => idx !== i) });
  };

  const updateField = (i: number, updates: Partial<FormField>) => {
    const fields = [...formData.fields];
    fields[i] = { ...fields[i], ...updates };
    setFormData({ ...formData, fields });
  };

  const openNew = () => {
    setEditForm(null);
    setFormData({
      name: '', description: '',
      fields: [{ id: genId(), label: '', type: 'text', required: true, placeholder: '', options: [], order: 0 }],
    });
    setShowModal(true);
  };

  const openEdit = (f: FormItem) => {
    setEditForm(f);
    setFormData({
      name: f.name, description: f.description || '',
      fields: (f.fields || []).map((field, i) => ({ ...field, id: field.id || genId(), order: field.order || i })),
    });
    setShowModal(true);
  };

  const openResponses = async (f: FormItem) => {
    try {
      const res = await formApi.get(f._id);
      setShowResponses(res.data.data);
    } catch {
      setShowResponses(f);
    }
  };

  const handleDelete = async (id: string) => {
    if (submitting) return;
    setSubmitting(true);

    if (!confirm('Delete this form?')) return;
    try { await formApi.delete(id); toast.success('Form deleted'); fetchForms(); }
    catch { toast.error('Failed'); } finally { setSubmitting(false); }
  };

  const copyFormLink = (id: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/form/${id}`);
    toast.success('Form link copied!');
  };

  // Responses View
  if (showResponses) {
    return (
      <div className={`${adminContentColumnClass} space-y-4`}>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowResponses(null)}
            className="rounded-lg p-2 text-admin-text-subdued hover:bg-[#f6f6f7] hover:text-admin-text"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 shrink-0 text-admin-text-secondary" aria-hidden />
              <h1 className="text-[20px] font-semibold tracking-tight text-admin-text">{showResponses.name} — Responses</h1>
            </div>
            <p className="mt-1 text-[13px] text-admin-text-secondary">{showResponses.submissionCount || 0} total submissions</p>
          </div>
        </div>

        {(!showResponses.submissions || showResponses.submissions.length === 0) ? (
          <div className={`${cardClass} p-12 text-center`}>
            <ClipboardList className="mx-auto mb-4 h-16 w-16 text-admin-text-subdued" />
            <h3 className="text-[15px] font-medium text-admin-text-secondary">No responses yet</h3>
            <p className="mt-1 text-[13px] text-admin-text-subdued">Share the form link to start collecting responses</p>
            <button type="button" onClick={() => copyFormLink(showResponses._id)} className={`mt-4 ${primaryBtn}`}>
              <Copy className="h-4 w-4" /> Copy Form Link
            </button>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-admin-border bg-white">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-admin-border">
                <thead className="bg-[#f6f6f7]">
                  <tr>
                    <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wide text-admin-text-subdued">#</th>
                    {showResponses.fields?.map(f => (
                      <th key={f.id} className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wide text-admin-text-subdued">{f.label}</th>
                    ))}
                    <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wide text-admin-text-subdued">Submitted At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-admin-border">
                  {showResponses.submissions.map((sub, i) => (
                    <tr key={i} className="hover:bg-[#f6f6f7]">
                      <td className="px-4 py-3 text-[13px] text-admin-text-secondary">{i + 1}</td>
                      {showResponses.fields?.map(f => (
                        <td key={f.id} className="px-4 py-3 text-[13px] text-admin-text">{sub.data?.[f.label] || sub.data?.[f.id] || '-'}</td>
                      ))}
                      <td className="px-4 py-3 text-[13px] text-admin-text-secondary">{new Date(sub.submittedAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  }

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const allSelected = forms.length > 0 && selectedIds.length === forms.length;
  const toggleSelectAll = () => setSelectedIds(allSelected ? [] : forms.map(f => f._id));

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm('Delete ' + selectedIds.length + ' selected items?')) return;
    if (submitting) return;
    setSubmitting(true);
    try {
      await Promise.all(selectedIds.map(id => formApi.delete(id)));
      toast.success(selectedIds.length + ' items deleted');
      setSelectedIds([]);
      fetchForms();
    } catch { toast.error('Failed to delete some items'); } finally { setSubmitting(false); }
  };

  return (
    <div className={`${adminContentColumnClass} space-y-4`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <FormInput className="h-5 w-5 shrink-0 text-admin-text-secondary" aria-hidden />
            <h1 className="text-[20px] font-semibold tracking-tight text-admin-text">Lead Gen Forms</h1>
          </div>
          <p className="mt-1 text-[13px] text-admin-text-secondary">
            Create forms to collect customer information via WhatsApp or web link
          </p>
        </div>
        <button type="button" onClick={openNew} className={primaryBtn}>
          <Plus className="h-4 w-4" /> Create Form
        </button>
      </div>

      {!loading && forms.length > 0 && (
        <div className={`flex items-center justify-between rounded-xl border px-4 py-2.5 ${selectedIds.length ? 'border-red-200 bg-red-50' : 'border-admin-border bg-white'}`}>
          <label className="flex cursor-pointer items-center gap-2 text-[13px] font-medium text-admin-text">
            <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} className="h-4 w-4 cursor-pointer accent-red-500" />
            Select all{selectedIds.length > 0 && <span className="text-red-700"> · {selectedIds.length} selected</span>}
          </label>
          {selectedIds.length > 0 && (
            <div className="flex gap-2">
              <button type="button" onClick={() => setSelectedIds([])} className={secondaryBtn}>Clear</button>
              <button
                type="button"
                onClick={handleBulkDelete}
                disabled={submitting}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-[13px] font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-50"
              >
                Delete selected
              </button>
            </div>
          )}
        </div>
      )}

      {loading ? (
        <div className="py-8 text-center text-[13px] text-admin-text-subdued">Loading...</div>
      ) : forms.length === 0 ? (
        <div className={`${cardClass} p-12 text-center`}>
          <FormInput className="mx-auto mb-4 h-16 w-16 text-admin-text-subdued" />
          <h3 className="text-[15px] font-medium text-admin-text-secondary">No forms created yet</h3>
          <p className="mt-1 text-[13px] text-admin-text-subdued">Create your first lead gen form to start collecting data</p>
          <button type="button" onClick={openNew} className={`mt-4 ${primaryBtn}`}>
            <Plus className="h-4 w-4" /> Create Form
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {forms.map((f) => (
            <div key={f._id} className={cardClass}>
              <div className="mb-3 flex items-start justify-between">
                <div className="flex min-w-0 items-start gap-2">
                  <input type="checkbox" checked={selectedIds.includes(f._id)} onChange={() => toggleSelect(f._id)} className="mt-1 h-4 w-4 shrink-0 cursor-pointer accent-red-500" />
                  <div>
                    <h3 className="text-[13px] font-semibold text-admin-text">{f.name}</h3>
                    <p className="mt-0.5 text-[12px] text-admin-text-secondary">{f.fields?.length || 0} fields</p>
                  </div>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${f.status === 'active' ? 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/15' : 'bg-[#f6f6f7] text-admin-text-secondary ring-1 ring-inset ring-admin-border'}`}>{f.status}</span>
              </div>
              {f.description && <p className="mb-2 text-[13px] text-admin-text-secondary">{f.description}</p>}
              <div className="mb-3 flex items-center gap-3 text-[12px] text-admin-text-subdued">
                <span>{f.submissionCount || 0} responses</span>
                <span>{new Date(f.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex gap-1 border-t border-admin-border pt-2">
                <button type="button" onClick={() => openResponses(f)} className="rounded-lg p-1.5 text-admin-text-subdued hover:bg-[#f6f6f7] hover:text-admin-text" title="View Responses"><Eye className="h-4 w-4" /></button>
                <button type="button" onClick={() => openEdit(f)} className="rounded-lg p-1.5 text-admin-text-subdued hover:bg-[#f6f6f7] hover:text-admin-text" title="Edit"><Edit className="h-4 w-4" /></button>
                <button type="button" onClick={() => copyFormLink(f._id)} className="rounded-lg p-1.5 text-admin-text-subdued hover:bg-[#f6f6f7] hover:text-admin-text" title="Copy Link"><Copy className="h-4 w-4" /></button>
                <button type="button" onClick={() => handleDelete(f._id)} className="rounded-lg p-1.5 text-admin-text-subdued hover:bg-red-50 hover:text-red-600" title="Delete"><Trash2 className="h-4 w-4" /></button>
                <button
                  type="button"
                  onClick={() => handlePublishFlow(f._id)}
                  disabled={publishingId === f._id}
                  className={`ml-auto rounded-lg border px-2 py-1 text-[11px] font-medium transition-colors disabled:opacity-50 ${f.waFlow?.status === 'published' ? 'border-admin-border bg-[#f6f6f7] text-admin-text' : 'border-admin-border bg-white text-admin-text-secondary hover:bg-[#f6f6f7]'}`}
                  title={f.waFlow?.status === 'published' ? 'Re-publish updated fields to WhatsApp' : 'Publish as native WhatsApp Flow (form opens inside WhatsApp)'}
                >
                  {publishingId === f._id ? 'Publishing...' : f.waFlow?.status === 'published' ? 'WhatsApp Flow ✓' : 'Publish to WhatsApp'}
                </button>
              </div>
              {f.waFlow?.status === 'failed' && f.waFlow?.error && <p className="mt-2 text-[11px] text-red-500">{f.waFlow.error}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && mounted && createPortal(
        <div className={modalOverlayClass}>
          <div className="absolute inset-0 bg-black/45" onClick={closeModal} />
          <div
            className={modalPanelClass}
            role="dialog"
            aria-modal="true"
            aria-label={editForm ? 'Edit form' : 'Create lead gen form'}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="shrink-0 border-b border-admin-border px-5 py-4 sm:px-6">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="text-[16px] font-semibold tracking-tight text-admin-text">
                    {editForm ? 'Edit form' : 'Create lead gen form'}
                  </h3>
                  <p className="mt-0.5 text-[12px] text-admin-text-secondary">
                    Add fields, preview the form, then save — share the public link or publish to WhatsApp later.
                  </p>
                </div>
                <button type="button" onClick={closeModal} className="rounded-lg p-1.5 text-admin-text-subdued hover:bg-[#f6f6f7] hover:text-admin-text" aria-label="Close">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5 sm:p-6">
              <div className={sectionClass}>
                <h4 className="text-[13px] font-semibold text-admin-text">Form details</h4>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className={labelClass}>Form name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={inputClass}
                      placeholder="Customer Inquiry Form"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Description</label>
                    <input
                      type="text"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className={inputClass}
                      placeholder="Brief description"
                    />
                  </div>
                </div>
              </div>

              <div className={sectionClass}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h4 className="text-[13px] font-semibold text-admin-text">Form fields</h4>
                    <p className="mt-0.5 text-[11px] text-admin-text-subdued">{formData.fields.length} field{formData.fields.length === 1 ? '' : 's'}</p>
                  </div>
                  <button type="button" onClick={addField} className={secondaryBtn}>
                    <Plus className="h-3.5 w-3.5" /> Add field
                  </button>
                </div>

                <div className="space-y-3">
                  {formData.fields.map((field, i) => (
                    <div key={field.id} className="rounded-lg border border-admin-border bg-white p-3 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <span className="rounded-md bg-[#f6f6f7] px-2 py-0.5 text-[11px] font-semibold text-admin-text-secondary">
                          Field {i + 1}
                        </span>
                        <div className="flex items-center gap-2">
                          <label className="flex items-center gap-1.5 text-[12px] text-admin-text-secondary">
                            <input
                              type="checkbox"
                              checked={field.required}
                              onChange={(e) => updateField(i, { required: e.target.checked })}
                              className="rounded border-admin-border accent-admin-text"
                            />
                            Required
                          </label>
                          <button
                            type="button"
                            onClick={() => removeField(i)}
                            disabled={formData.fields.length <= 1}
                            className="rounded-lg p-1.5 text-admin-text-subdued hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
                            title="Remove field"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                          <label className={labelClass}>Label</label>
                          <input
                            type="text"
                            placeholder="e.g. Full Name"
                            value={field.label}
                            onChange={(e) => updateField(i, { label: e.target.value })}
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>Type</label>
                          <select
                            value={field.type}
                            onChange={(e) => updateField(i, { type: e.target.value })}
                            className={inputClass}
                          >
                            {fieldTypeOptions.map((o) => (
                              <option key={o.value} value={o.value}>{o.label}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className={labelClass}>Placeholder</label>
                          <input
                            type="text"
                            placeholder="Hint text"
                            value={field.placeholder}
                            onChange={(e) => updateField(i, { placeholder: e.target.value })}
                            className={inputClass}
                          />
                        </div>
                      </div>

                      {(field.type === 'select' || field.type === 'radio' || field.type === 'checkbox') && (
                        <div className="mt-3 space-y-1.5 border-t border-admin-border pt-3">
                          <label className={labelClass}>
                            Options ({field.type === 'select' ? 'dropdown choices' : `${field.type} choices`})
                          </label>
                          {(field.options || []).map((opt, oi) => (
                            <div key={oi} className="flex items-center gap-2">
                              <input
                                type="text"
                                value={opt}
                                placeholder={`Option ${oi + 1}`}
                                onChange={(e) => {
                                  const opts = [...(field.options || [])];
                                  opts[oi] = e.target.value;
                                  updateField(i, { options: opts });
                                }}
                                className={inputClass}
                              />
                              <button
                                type="button"
                                onClick={() => updateField(i, { options: (field.options || []).filter((_, x) => x !== oi) })}
                                className="rounded-lg p-1.5 text-admin-text-subdued hover:bg-red-50 hover:text-red-600"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => updateField(i, { options: [...(field.options || []), ''] })}
                            className={secondaryBtn}
                          >
                            <Plus className="h-3 w-3" /> Add option
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className={sectionClass}>
                <h4 className="flex items-center gap-2 text-[13px] font-semibold text-admin-text">
                  <Eye className="h-4 w-4 text-admin-text-secondary" /> Live preview
                </h4>
                <div className="mx-auto max-w-sm rounded-lg border border-admin-border bg-white p-4 shadow-sm">
                  <h4 className="text-[14px] font-semibold text-admin-text">{formData.name || 'Form name'}</h4>
                  {formData.description ? (
                    <p className="mt-1 text-[12px] text-admin-text-secondary">{formData.description}</p>
                  ) : (
                    <p className="mt-1 text-[12px] text-admin-text-subdued">Description appears here</p>
                  )}
                  <div className="mt-3 space-y-3">
                    {formData.fields.map((f) => (
                      <div key={f.id}>
                        <label className="text-[12px] font-medium text-admin-text-secondary">
                          {f.label || 'Untitled field'}{f.required ? ' *' : ''}
                        </label>
                        <div className="mt-1 rounded-lg border border-admin-border bg-[#f6f6f7] px-2.5 py-2 text-[12px] text-admin-text-subdued">
                          {f.placeholder || f.type}
                        </div>
                      </div>
                    ))}
                  </div>
                  <button type="button" className={`mt-4 w-full ${primaryBtn}`}>Submit</button>
                </div>
              </div>
            </div>

            <div className="flex shrink-0 items-center justify-end gap-2 border-t border-admin-border bg-[#fafafa] px-5 py-3.5 sm:px-6">
              <button type="button" onClick={closeModal} className={secondaryBtn}>Cancel</button>
              <button type="button" onClick={handleSave} disabled={submitting} className={primaryBtn}>
                {submitting ? 'Saving...' : editForm ? 'Update form' : 'Create form'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
