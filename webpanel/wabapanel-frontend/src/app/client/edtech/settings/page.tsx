'use client';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { edtechApi } from '@/lib/api';
import { adminContentColumnClass, dashboardCardShell } from '@/components/layout/dashboard-ui';

const primaryBtn = 'inline-flex items-center gap-1.5 rounded-lg bg-admin-text px-3 py-1.5 text-[13px] font-semibold text-white disabled:opacity-50';
const inputClass = 'w-full rounded-lg border border-admin-border px-3 py-2 text-[13px]';

export default function EdtechSettingsPage() {
  const [prefix, setPrefix] = useState('STU');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    edtechApi.settings.get().then((r) => setPrefix(r.data.data?.enrollmentPrefix || 'STU')).catch(() => {});
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      await edtechApi.settings.update({ enrollmentPrefix: prefix });
      toast.success('Settings saved');
    } catch { toast.error('Save failed'); } finally { setSaving(false); }
  };

  return (
    <div className={`${adminContentColumnClass} space-y-4`}>
      <h1 className="text-[20px] font-semibold text-admin-text">Edtech settings</h1>
      <div className={dashboardCardShell + ' space-y-3'}>
        <label className="block text-[13px]">Enrollment prefix
          <input className={inputClass} maxLength={8} value={prefix} onChange={(e) => setPrefix(e.target.value.toUpperCase())} />
          <span className="mt-1 block text-[12px] text-admin-text-secondary">New students get IDs like {prefix || 'STU'}-0001</span>
        </label>
        <button type="button" className={primaryBtn} disabled={saving} onClick={save}>{saving ? 'Saving…' : 'Save'}</button>
      </div>
    </div>
  );
}
