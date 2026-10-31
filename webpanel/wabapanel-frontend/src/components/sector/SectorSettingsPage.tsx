'use client';
import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { sectorApi } from '@/lib/api';
import { adminContentColumnClass, dashboardCardShell } from '@/components/layout/dashboard-ui';
import { MultiSelect, ListInput } from './SectorEntityPage';
import type { SectorEntityDef, SectorField } from './SectorEntityPage';

const primaryBtn =
  'inline-flex items-center justify-center gap-1.5 rounded-lg bg-admin-text px-3 py-1.5 text-[13px] font-semibold text-white hover:bg-[#1a1a1a] disabled:opacity-50';
const inputClass = 'w-full rounded-lg border border-admin-border px-3 py-2 text-[13px] focus:border-[#005bd3] focus:outline-none';
const labelClass = 'block text-[12px] font-medium text-admin-text-secondary mb-1';

function FieldInput({ f, form, setForm }: {
  f: SectorField;
  form: Record<string, unknown>;
  setForm: (v: Record<string, unknown>) => void;
}) {
  switch (f.type) {
    case 'select':
      return (
        <select className={inputClass} value={String(form[f.name] ?? '')} onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}>
          <option value="">—</option>
          {(f.options || []).map((o) => <option key={o} value={o}>{o.replace(/_/g, ' ')}</option>)}
        </select>
      );
    case 'list':
      return (
        <ListInput
          value={Array.isArray(form[f.name]) ? (form[f.name] as string[]) : []}
          placeholder={f.placeholder}
          onChange={(v) => setForm({ ...form, [f.name]: v })}
        />
      );
    case 'multiselect':
      return (
        <MultiSelect
          options={f.options || []}
          allowOther={!!f.allowOther}
          value={Array.isArray(form[f.name]) ? (form[f.name] as string[]) : []}
          onChange={(v) => setForm({ ...form, [f.name]: v })}
        />
      );
    case 'toggle': {
      const on = form[f.name] === true;
      return (
        <button
          type="button"
          onClick={() => setForm({ ...form, [f.name]: !on })}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${on ? 'bg-emerald-500' : 'bg-gray-300'}`}
        >
          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${on ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
      );
    }
    case 'textarea':
      return (
        <textarea className={inputClass} rows={3} value={String(form[f.name] ?? '')}
          onChange={(e) => setForm({ ...form, [f.name]: e.target.value })} />
      );
    default:
      return (
        <input
          className={inputClass}
          type={f.type === 'number' || f.type === 'money' ? 'number' : f.type === 'date' ? 'date' : f.type === 'time' ? 'time' : 'text'}
          placeholder={f.placeholder}
          value={String(form[f.name] ?? '')}
          onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
        />
      );
  }
}

export default function SectorSettingsPage({ industry, entity = 'settings' }: { industry: string; entity?: string }) {
  const [def, setDef] = useState<SectorEntityDef | null>(null);
  const [recId, setRecId] = useState<string | null>(null);
  const [form, setForm] = useState<Record<string, unknown>>({});
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    sectorApi.entities(industry).then(async (r) => {
      const found = (r.data.data?.entities || []).find((e: SectorEntityDef) => e.key === entity);
      if (!found) { setErr('Settings are not configured for this workspace.'); return; }
      setDef(found);
      const list = await sectorApi.list(industry, entity);
      const existing = (list.data.data || [])[0];
      if (existing) { setRecId(existing._id); setForm(existing.data || {}); }
    }).catch((e: unknown) => {
      const er = e as { response?: { data?: { message?: string } } };
      setErr(er.response?.data?.message || 'Could not load settings');
    });
  }, [industry, entity]);

  const save = async () => {
    setSaving(true);
    try {
      if (recId) await sectorApi.update(industry, entity, recId, form);
      else {
        const r = await sectorApi.create(industry, entity, form);
        setRecId(r.data.data?._id || null);
      }
      toast.success('Settings saved');
    } catch (e: unknown) {
      const er = e as { response?: { data?: { message?: string } } };
      toast.error(er.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  };

  // Group fields into labelled sections (fields without a section go to "General")
  const sections = useMemo(() => {
    const map = new Map<string, SectorField[]>();
    (def?.fields || []).forEach((f) => {
      const key = f.section || 'General';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(f);
    });
    return [...map.entries()];
  }, [def]);

  if (err) {
    return (
      <div className={adminContentColumnClass}>
        <div className={dashboardCardShell}><p className="text-[13px] text-admin-text-secondary">{err}</p></div>
      </div>
    );
  }
  if (!def) return <div className={`${adminContentColumnClass} p-4 text-[13px] text-admin-text-secondary`}>Loading…</div>;

  return (
    <div className={`${adminContentColumnClass} space-y-4`}>
      <div>
        <h1 className="text-[20px] font-semibold text-admin-text">{def.plural}</h1>
        <p className="mt-1 text-[13px] text-admin-text-secondary">Workspace defaults for this section</p>
      </div>

      {sections.map(([section, fields]) => (
        <div key={section} className={dashboardCardShell + ' p-0'}>
          <p className="border-b border-admin-border px-4 py-2.5 text-[13px] font-semibold text-admin-text">{section}</p>
          <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2">
            {fields.map((f) => (
              <label
                key={f.name}
                className={f.type === 'textarea' || f.type === 'multiselect' ? 'sm:col-span-2' : f.type === 'toggle' ? 'flex items-center justify-between rounded-lg border border-admin-border px-3 py-2' : ''}
              >
                {f.type === 'toggle' ? (
                  <>
                    <span className="text-[13px] font-medium text-admin-text">{f.label}</span>
                    <FieldInput f={f} form={form} setForm={setForm} />
                  </>
                ) : (
                  <>
                    <span className={labelClass}>{f.label}{f.required ? ' *' : ''}</span>
                    <FieldInput f={f} form={form} setForm={setForm} />
                  </>
                )}
              </label>
            ))}
          </div>
        </div>
      ))}

      <div className="flex justify-end">
        <button type="button" className={primaryBtn} disabled={saving} onClick={save}>{saving ? 'Saving…' : 'Save settings'}</button>
      </div>
    </div>
  );
}
