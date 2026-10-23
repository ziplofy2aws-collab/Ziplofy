'use client';
import React, { useEffect, useState } from 'react';
import { Settings } from 'lucide-react';
import toast from 'react-hot-toast';
import { clinicApi, appointmentApi } from '@/lib/api';
import { adminContentColumnClass, dashboardCardShell } from '@/components/layout/dashboard-ui';

const primaryBtn =
  'inline-flex items-center justify-center gap-1.5 rounded-lg bg-admin-text px-3 py-1.5 text-[13px] font-semibold text-white hover:bg-[#1a1a1a] disabled:opacity-50';
const inputClass = 'w-full rounded-lg border border-admin-border px-3 py-2 text-[13px] focus:border-[#005bd3] focus:outline-none';
const labelClass = 'block text-[12px] font-medium text-admin-text-secondary mb-1';
const sectionTitle = 'mb-3 text-[13px] font-semibold text-admin-text';

const emptyForm = {
  slotDuration: 15, whatsappRxCaption: '', whatsappConfirm: '', whatsappReminder: '', uhidPrefix: 'CLN',
  clinicName: '', clinicPhone: '', clinicEmail: '', clinicAddress: '', clinicWebsite: '', clinicLogo: '',
  timezone: 'Asia/Kolkata', currency: 'INR', language: 'en',
  tokenPrefix: '', tokenResetPolicy: 'daily',
  rxHeader: '', rxFooter: '', rxInstructions: '',
  remind24h: true, remind1h: true, confirmOnCreate: true,
};
const emptyBooking = { enabled: false, slug: '', advanceDays: 30, maxPerSlot: 1 };

export default function ClinicSettingsPage() {
  const [form, setForm] = useState(emptyForm);
  const [booking, setBooking] = useState(emptyBooking);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    clinicApi.settings.get().then((r) => {
      const s = r.data.data || {};
      setForm((f) => ({ ...f, ...Object.fromEntries(Object.keys(emptyForm).filter((k) => k in s).map((k) => [k, s[k]])) }));
    }).catch(() => {});
    appointmentApi.getAvailability().then((r) => {
      const s = r.data.data || {};
      setBooking({ enabled: !!s.enabled, slug: s.slug || '', advanceDays: s.advanceDays ?? 30, maxPerSlot: s.maxPerSlot ?? 1 });
    }).catch(() => {});
  }, []);

  const set = (k: keyof typeof emptyForm, v: unknown) => { setForm((f) => ({ ...f, [k]: v })); setDirty(true); };
  const setB = (k: keyof typeof emptyBooking, v: unknown) => { setBooking((b) => ({ ...b, [k]: v })); setDirty(true); };

  const save = async () => {
    setSaving(true);
    try {
      await clinicApi.settings.update(form);
      await appointmentApi.updateAvailability({
        slotDuration: form.slotDuration,
        enabled: booking.enabled,
        advanceDays: booking.advanceDays,
        maxPerSlot: booking.maxPerSlot,
      });
      setDirty(false);
      toast.success('Settings saved');
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  };

  const bookingLink = booking.slug && typeof window !== 'undefined' ? `${window.location.origin}/book/${booking.slug}` : '';

  return (
    <div className={`${adminContentColumnClass} space-y-4`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-admin-text-secondary" />
            <h1 className="text-[20px] font-semibold text-admin-text">Clinic settings</h1>
          </div>
          <p className="mt-1 text-[13px] text-admin-text-secondary">Clinic identity, scheduling, queue, prescription and reminder configuration</p>
        </div>
        <div className="flex items-center gap-2">
          {dirty && <span className="text-[11px] text-amber-600">Unsaved changes</span>}
          <button type="button" className={primaryBtn} disabled={saving} onClick={save}>{saving ? 'Saving…' : 'Save settings'}</button>
        </div>
      </div>

      <div className={dashboardCardShell}>
        <p className={sectionTitle}>Clinic information <span className="font-normal text-admin-text-subdued">— shown on prescriptions and public booking</span></p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label><span className={labelClass}>Clinic name</span>
            <input className={inputClass} value={form.clinicName} placeholder={form.clinicName || 'Defaults to workspace name'} onChange={(e) => set('clinicName', e.target.value)} /></label>
          <label><span className={labelClass}>Contact phone</span>
            <input className={inputClass} value={form.clinicPhone} onChange={(e) => set('clinicPhone', e.target.value)} /></label>
          <label><span className={labelClass}>Contact email</span>
            <input className={inputClass} value={form.clinicEmail} onChange={(e) => set('clinicEmail', e.target.value)} /></label>
          <label><span className={labelClass}>Website</span>
            <input className={inputClass} value={form.clinicWebsite} onChange={(e) => set('clinicWebsite', e.target.value)} /></label>
          <label className="sm:col-span-2"><span className={labelClass}>Address</span>
            <input className={inputClass} value={form.clinicAddress} onChange={(e) => set('clinicAddress', e.target.value)} /></label>
          <label><span className={labelClass}>Logo URL</span>
            <input className={inputClass} value={form.clinicLogo} onChange={(e) => set('clinicLogo', e.target.value)} /></label>
          <div className="grid grid-cols-3 gap-2">
            <label><span className={labelClass}>Timezone</span>
              <input className={inputClass} value={form.timezone} onChange={(e) => set('timezone', e.target.value)} /></label>
            <label><span className={labelClass}>Currency</span>
              <input className={inputClass} value={form.currency} onChange={(e) => set('currency', e.target.value)} /></label>
            <label><span className={labelClass}>Language</span>
              <input className={inputClass} value={form.language} onChange={(e) => set('language', e.target.value)} /></label>
          </div>
        </div>
      </div>

      <div className={dashboardCardShell}>
        <p className={sectionTitle}>Scheduling</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <label><span className={labelClass}>Default slot length (minutes)</span>
            <input type="number" className={inputClass} min={5} max={180} value={form.slotDuration} onChange={(e) => set('slotDuration', Number(e.target.value))} /></label>
          <label><span className={labelClass}>Booking horizon (days ahead)</span>
            <input type="number" className={inputClass} min={1} max={365} value={booking.advanceDays} onChange={(e) => setB('advanceDays', Number(e.target.value))} /></label>
          <label><span className={labelClass}>Max patients per slot</span>
            <input type="number" className={inputClass} min={1} max={100} value={booking.maxPerSlot} onChange={(e) => setB('maxPerSlot', Number(e.target.value))} /></label>
        </div>
        <p className="mt-2 text-[12px] text-admin-text-secondary">Clinic working hours and holidays are configured per doctor on the Doctors page (weekly hours + leave dates). Doctor hours drive slot availability.</p>
      </div>

      <div className={dashboardCardShell}>
        <p className={sectionTitle}>UHID &amp; queue</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <label><span className={labelClass}>UHID prefix</span>
            <input className={inputClass} maxLength={8} value={form.uhidPrefix} onChange={(e) => set('uhidPrefix', e.target.value.toUpperCase())} />
            <span className="mt-1 block text-[11px] text-admin-text-subdued">New charts get IDs like {form.uhidPrefix || 'CLN'}-0001. Existing UHIDs are never rewritten.</span></label>
          <label><span className={labelClass}>Queue token prefix</span>
            <input className={inputClass} maxLength={6} value={form.tokenPrefix} placeholder="e.g. A-" onChange={(e) => set('tokenPrefix', e.target.value.toUpperCase())} />
            <span className="mt-1 block text-[11px] text-admin-text-subdued">Tokens display like {form.tokenPrefix || ''}1</span></label>
          <label><span className={labelClass}>Token numbering</span>
            <select className={inputClass} value={form.tokenResetPolicy} onChange={(e) => set('tokenResetPolicy', e.target.value)}>
              <option value="daily">Reset every day</option>
              <option value="never">Continuous</option>
            </select></label>
        </div>
      </div>

      <div className={dashboardCardShell}>
        <p className={sectionTitle}>Prescription template</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label><span className={labelClass}>Header note</span>
            <input className={inputClass} value={form.rxHeader} placeholder="e.g. Mon–Sat, 10am–6pm" onChange={(e) => set('rxHeader', e.target.value)} /></label>
          <label><span className={labelClass}>Footer note</span>
            <input className={inputClass} value={form.rxFooter} placeholder="e.g. This is a digitally generated prescription" onChange={(e) => set('rxFooter', e.target.value)} /></label>
          <label className="sm:col-span-2"><span className={labelClass}>Default patient instructions</span>
            <input className={inputClass} value={form.rxInstructions} placeholder="Printed on every prescription" onChange={(e) => set('rxInstructions', e.target.value)} /></label>
          <label className="sm:col-span-2"><span className={labelClass}>WhatsApp prescription caption</span>
            <textarea className={inputClass} rows={3} value={form.whatsappRxCaption} onChange={(e) => set('whatsappRxCaption', e.target.value)} /></label>
        </div>
      </div>

      <div className={dashboardCardShell}>
        <p className={sectionTitle}>Reminders &amp; notifications <span className="font-normal text-admin-text-subdued">— sent automatically by the Appointments scheduler via WhatsApp</span></p>
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          <label className="flex items-center gap-2 text-[13px]"><input type="checkbox" checked={form.confirmOnCreate} onChange={(e) => set('confirmOnCreate', e.target.checked)} /> Booking confirmation on create</label>
          <label className="flex items-center gap-2 text-[13px]"><input type="checkbox" checked={form.remind24h} onChange={(e) => set('remind24h', e.target.checked)} /> 24-hour reminder</label>
          <label className="flex items-center gap-2 text-[13px]"><input type="checkbox" checked={form.remind1h} onChange={(e) => set('remind1h', e.target.checked)} /> 1-hour reminder</label>
        </div>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label><span className={labelClass}>Confirmation template note</span>
            <textarea className={inputClass} rows={2} placeholder="Extra line appended to confirmation messages" value={form.whatsappConfirm} onChange={(e) => set('whatsappConfirm', e.target.value)} /></label>
          <label><span className={labelClass}>Reminder template note</span>
            <textarea className={inputClass} rows={2} placeholder="Extra line appended to reminder messages" value={form.whatsappReminder} onChange={(e) => set('whatsappReminder', e.target.value)} /></label>
        </div>
      </div>

      <div className={dashboardCardShell}>
        <p className={sectionTitle}>Public booking</p>
        <label className="flex items-center gap-2 text-[13px]"><input type="checkbox" checked={booking.enabled} onChange={(e) => setB('enabled', e.target.checked)} /> Enable the public booking page</label>
        {bookingLink && (
          <p className="mt-2 text-[12px] text-admin-text-secondary">
            Public URL: <a className="font-medium text-[#005bd3]" href={bookingLink} target="_blank" rel="noreferrer">{bookingLink}</a>
          </p>
        )}
        <p className="mt-1 text-[11px] text-admin-text-subdued">Public bookings use the same appointment engine — slots, conflicts and reminders all apply. Internal notes and patient records are never exposed.</p>
      </div>

      <div className="flex justify-end">
        <button type="button" className={primaryBtn} disabled={saving} onClick={save}>{saving ? 'Saving…' : 'Save settings'}</button>
      </div>
    </div>
  );
}
