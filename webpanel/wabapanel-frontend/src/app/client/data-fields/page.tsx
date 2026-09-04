'use client';
import toast from 'react-hot-toast';
import React, { useState, useEffect } from 'react';
import { Plus, Database, Trash2, Edit } from 'lucide-react';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import Select from '@/components/ui/Select';
import { dataFieldApi } from '@/lib/api';
import { adminContentColumnClass, dashboardCardShell } from '@/components/layout/dashboard-ui';

const primaryBtn =
  'inline-flex items-center justify-center gap-1.5 rounded-lg bg-admin-text px-3 py-1.5 text-[13px] font-semibold text-white transition-colors hover:bg-[#1a1a1a] disabled:cursor-not-allowed disabled:opacity-50';
const secondaryBtn =
  'inline-flex items-center justify-center gap-1.5 rounded-lg border border-admin-border bg-white px-3 py-1.5 text-[13px] font-medium text-admin-text transition-colors hover:bg-[#f6f6f7]';
const dangerBtn =
  'inline-flex items-center justify-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-[13px] font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-50';

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

const TYPE_OPTIONS = [
  { value: 'text', label: 'Text' },
  { value: 'number', label: 'Number' },
  { value: 'date', label: 'Date' },
  { value: 'dropdown', label: 'Dropdown' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
  { value: 'url', label: 'URL' },
];

export default function DataFieldsPage() {
  const [fields, setFields] = useState<DataField[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingField, setEditingField] = useState<DataField | null>(null);
  const [form, setForm] = useState({ label: '', type: 'text', options: '', required: false, defaultValue: '' });
  const [submitting, setSubmitting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const fetchFields = async () => {
    try {
      const res = await dataFieldApi.list();
      setFields(res.data.data || []);
    } catch { /* empty */ } finally { setLoading(false); }
  };

  useEffect(() => { fetchFields(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    const payload = { ...form, options: form.type === 'dropdown' ? form.options.split(',').map(o => o.trim()).filter(Boolean) : [] };
    try {
      if (editingField) {
        await dataFieldApi.update(editingField._id, payload);
      } else {
        await dataFieldApi.create(payload);
      }
      setShowForm(false);
      setEditingField(null);
      setForm({ label: '', type: 'text', options: '', required: false, defaultValue: '' });
      fetchFields();
      toast.success(editingField ? 'Field updated' : 'Field created');
    } catch { toast.error('Failed to save'); } finally { setSubmitting(false); }
  };

  const handleEdit = (field: DataField) => {
    setEditingField(field);
    setForm({ label: field.label, type: field.type, options: field.options.join(', '), required: field.required, defaultValue: field.defaultValue });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (submitting) return;
    if (!confirm('Are you sure you want to delete this field?')) return;
    setSubmitting(true);
    try { await dataFieldApi.delete(id); fetchFields(); toast.success('Field deleted'); }
    catch { toast.error('Delete failed'); } finally { setSubmitting(false); }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const allSelected = fields.length > 0 && selectedIds.length === fields.length;
  const toggleSelectAll = () => setSelectedIds(allSelected ? [] : fields.map(f => f._id));

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm('Delete ' + selectedIds.length + ' selected items?')) return;
    if (submitting) return;
    setSubmitting(true);
    try {
      await Promise.all(selectedIds.map(id => dataFieldApi.delete(id)));
      toast.success(selectedIds.length + ' items deleted');
      setSelectedIds([]);
      fetchFields();
    } catch { toast.error('Failed to delete some items'); } finally { setSubmitting(false); }
  };

  return (
    <div className={`${adminContentColumnClass} space-y-4`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 shrink-0 text-admin-text-secondary" aria-hidden />
            <h1 className="text-[20px] font-semibold tracking-tight text-admin-text">Data Fields</h1>
          </div>
          <p className="mt-1 text-[13px] text-admin-text-secondary">
            Manage custom contact data fields
          </p>
        </div>
        <button
          type="button"
          className={primaryBtn}
          onClick={() => {
            setEditingField(null);
            setForm({ label: '', type: 'text', options: '', required: false, defaultValue: '' });
            setShowForm(true);
          }}
        >
          <Plus className="h-4 w-4" /> Add Field
        </button>
      </div>

      {selectedIds.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5">
          <span className="text-[13px] font-medium text-red-700">{selectedIds.length} selected</span>
          <div className="flex gap-2">
            <button type="button" onClick={() => setSelectedIds([])} className={secondaryBtn}>Clear</button>
            <button type="button" onClick={handleBulkDelete} disabled={submitting} className={dangerBtn}>Delete selected</button>
          </div>
        </div>
      )}

      <div className={`${dashboardCardShell} overflow-hidden p-0`}>
        {loading ? (
          <div className="py-10 text-center text-[13px] text-admin-text-subdued">Loading…</div>
        ) : fields.length === 0 ? (
          <div className="p-8 text-center text-[13px] text-admin-text-secondary">
            No custom fields yet. Click &quot;Add Field&quot; to create one.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-admin-border bg-[#f6f6f7]">
                <tr>
                  <th className="w-10 px-4 py-3 text-left">
                    <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} className="h-4 w-4 cursor-pointer accent-red-500" />
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-admin-text-subdued">Label</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-admin-text-subdued">Type</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-admin-text-subdued">Required</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-admin-text-subdued">Options</th>
                  <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wide text-admin-text-subdued">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-admin-border">
                {fields.map(f => (
                  <tr key={f._id} className={`hover:bg-[#f6f6f7] ${selectedIds.includes(f._id) ? 'bg-red-50/50' : ''}`}>
                    <td className="px-4 py-3">
                      <input type="checkbox" checked={selectedIds.includes(f._id)} onChange={() => toggleSelect(f._id)} className="h-4 w-4 cursor-pointer accent-red-500" />
                    </td>
                    <td className="px-4 py-3 text-[13px] font-medium text-admin-text">{f.label}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-md bg-[#f1f1f1] px-2 py-0.5 text-[11px] font-medium text-admin-text">{f.type}</span>
                    </td>
                    <td className="px-4 py-3 text-[13px]">
                      {f.required ? (
                        <span className="font-medium text-admin-text">Yes</span>
                      ) : (
                        <span className="text-admin-text-subdued">No</span>
                      )}
                    </td>
                    <td className="max-w-[200px] truncate px-4 py-3 text-[13px] text-admin-text-secondary">
                      {f.options?.length ? f.options.join(', ') : '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex gap-0.5">
                        <button
                          type="button"
                          onClick={() => handleEdit(f)}
                          className="rounded-lg p-1.5 text-admin-text-subdued hover:bg-[#f1f1f1] hover:text-admin-text"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(f._id)}
                          className="rounded-lg p-1.5 text-admin-text-subdued hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditingField(null); }}
        title={editingField ? 'Edit Field' : 'Add New Field'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Label *"
            value={form.label}
            onChange={e => setForm({ ...form, label: e.target.value })}
            required
            placeholder="e.g. Company Name"
          />
          <Select
            label="Type"
            value={form.type}
            onChange={e => setForm({ ...form, type: e.target.value })}
            options={TYPE_OPTIONS}
          />
          {form.type === 'dropdown' && (
            <Input
              label="Options (comma separated)"
              value={form.options}
              onChange={e => setForm({ ...form, options: e.target.value })}
              placeholder="Option 1, Option 2, Option 3"
            />
          )}
          <Input
            label="Default Value"
            value={form.defaultValue}
            onChange={e => setForm({ ...form, defaultValue: e.target.value })}
          />
          <label className="flex items-center gap-2 text-[13px] text-admin-text">
            <input
              type="checkbox"
              checked={form.required}
              onChange={e => setForm({ ...form, required: e.target.checked })}
              className="h-4 w-4 rounded border-admin-border text-admin-text focus:ring-[#005bd3]"
            />
            Required field
          </label>
          <div className="flex gap-2 pt-2">
            <button type="submit" disabled={submitting} className={primaryBtn}>
              {submitting ? 'Saving…' : editingField ? 'Update' : 'Create'}
            </button>
            <button
              type="button"
              className={secondaryBtn}
              onClick={() => { setShowForm(false); setEditingField(null); }}
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
