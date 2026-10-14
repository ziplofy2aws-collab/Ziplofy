'use client';
import React, { useEffect, useState } from 'react';
import { Settings } from 'lucide-react';
import toast from 'react-hot-toast';
import { clinicApi, appointmentApi } from '@/lib/api';
import { adminContentColumnClass, dashboardCardShell } from '@/components/layout/dashboard-ui';

const primaryBtn =
  'inline-flex items-center justify-center gap-1.5 rounded-lg bg-admin-text px-3 py-1.5 text-[13px] font-semibold text-white hover:bg-[#1a1a1a] disabled:opacity-50';
const inputClass = 'w-full rounded-lg border border-admin-border px-3 py-2 text-[13px] focus:border-[#005bd3] focus:outline-none';

export default function ClinicSettingsPage() {
  const [form, setForm] = useState({ slotDuration: 15, whatsappRxCaption: '', whatsappConfirm: '', whatsappReminder: '', uhidPrefix: 'CLN' });
  const [bookingEnabled, setBookingEnabled] = useState(false);
  const [slug, setSlug] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    clinicApi.settings.get().then((r) => setForm((f) => ({ ...f, ...(r.data.data || {}) }))).catch(() => {});
    appointmentApi.getAvailability().then((r) => {
      const s = r.data.data || {};
      setBookingEnabled(!!s.enabled);
      setSlug(s.slug || '');
    }).catch(() => {});
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      await clinicApi.settings.update(form);
      if (form.slotDuration) {
        await appointmentApi.updateAvailability({ slotDuration: form.slotDuration });
      }
      toast.success('Settings saved');
    } catch { toast.error('Save failed'); } finally { setSaving(false); }
  };

  const bookingLink = slug && typeof window !== 'undefined' ? `${window.location.origin}/book/${slug}` : '';

  return (
    <div className={`${adminContentColumnClass} space-y-4`}>
      <div className="flex items-center gap-2">
        <Settings className="h-5 w-5 text-admin-text-secondary" />
        <h1 className="text-[20px] font-semibold text-admin-text">Clinic settings</h1>
      </div>
      <div className={dashboardCardShell + ' space-y-3'}>
        <label className="block text-[13px]">Default slot length (minutes)
          <input type="number" className={inputClass} value={form.slotDuration} onChange={(e) => setForm({ ...form, slotDuration: Number(e.target.value) })} />
        </label>
        <label className="block text-[13px]">UHID prefix
          <input className={inputClass} maxLength={8} value={form.uhidPrefix} onChange={(e) => setForm({ ...form, uhidPrefix: e.target.value.toUpperCase() })} />
          <span className="mt-1 block text-[12px] text-admin-text-secondary">New charts get IDs like {form.uhidPrefix || 'CLN'}-0001</span>
        </label>
        <label className="block text-[13px]">WhatsApp prescription caption
          <textarea className={inputClass} rows={3} value={form.whatsappRxCaption} onChange={(e) => setForm({ ...form, whatsappRxCaption: e.target.value })} />
        </label>
        <p className="text-[12px] text-admin-text-secondary">
          Confirm / 24h / 1h reminders already run from Appointments. Public booking is {bookingEnabled ? 'on' : 'off'}
          {bookingLink ? <> · <a className="text-[#005bd3]" href={bookingLink} target="_blank" rel="noreferrer">{bookingLink}</a></> : null}
        </p>
        <button type="button" className={primaryBtn} disabled={saving} onClick={save}>{saving ? 'Saving…' : 'Save'}</button>
      </div>
    </div>
  );
}
