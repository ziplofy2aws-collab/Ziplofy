'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Building2, Check, Globe2, UserRound } from 'lucide-react';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { adminContentColumnClass, adminListPrimaryButtonClass, adminListSecondaryButtonClass, dashboardCardShell } from '@/components/layout/dashboard-ui';

type ProfileForm = {
  name: string;
  email: string;
  phone: string;
  companyName: string;
  gstNumber: string;
  address: string;
  preferredTimezone: string;
  preferredLanguage: string;
};

const TIMEZONES = [
  'Asia/Kolkata',
  'Asia/Dubai',
  'Asia/Singapore',
  'Europe/London',
  'America/New_York',
  'UTC',
];

const LANGUAGES = [
  { id: 'en', label: 'English' },
  { id: 'hi', label: 'Hindi' },
  { id: 'ar', label: 'Arabic' },
];

export default function ManageProfilePage() {
  const router = useRouter();
  const updateUser = useAuthStore((s) => s.updateUser);
  const applyServiceChoices = useAuthStore((s) => s.applyServiceChoices);
  const features = useAuthStore((s) => s.features);
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<ProfileForm>({
    name: '',
    email: '',
    phone: '',
    companyName: '',
    gstNumber: '',
    address: '',
    preferredTimezone: 'Asia/Kolkata',
    preferredLanguage: 'en',
  });

  useEffect(() => {
    authApi
      .onboardingStatus()
      .then((res) => {
        const data = res.data.data;
        if (data.profileComplete) {
          router.replace(data.nextPath || '/client/workspace');
          return;
        }
        const p = data.profile || {};
        setForm({
          name: p.name || '',
          email: p.email || '',
          phone: p.phone || '',
          companyName: p.companyName || '',
          gstNumber: p.gstNumber || '',
          address: p.address || '',
          preferredTimezone: p.preferredTimezone || 'Asia/Kolkata',
          preferredLanguage: p.preferredLanguage || 'en',
        });
      })
      .catch(() => toast.error('Could not load profile'))
      .finally(() => setLoading(false));
  }, [router]);

  const progress = useMemo(() => Math.round(((step + 1) / 3) * 100), [step]);

  const setField = (key: keyof ProfileForm, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const saveStep = async () => {
    setSaving(true);
    try {
      let payload: Record<string, unknown>;
      if (step === 0) {
        payload = { step: 'personal', name: form.name, phone: form.phone };
      } else if (step === 1) {
        payload = {
          step: 'billing',
          companyName: form.companyName,
          gstNumber: form.gstNumber,
          address: form.address,
        };
      } else {
        payload = {
          step: 'regional',
          preferredTimezone: form.preferredTimezone,
          preferredLanguage: form.preferredLanguage,
        };
      }
      const res = await authApi.saveOnboardingProfile(payload);
      const data = res.data.data;
      updateUser({
        name: data.profile?.name,
        phone: data.profile?.phone,
        companyName: data.profile?.companyName,
        address: data.profile?.address,
        gstNumber: data.profile?.gstNumber,
        preferredTimezone: data.profile?.preferredTimezone,
        preferredLanguage: data.profile?.preferredLanguage,
        featureOverrides: data.featureOverrides,
      } as never);
      if (data.featureOverrides) {
        applyServiceChoices({
          selectedModules: data.featureOverrides.selectedModules || [],
          features,
          industry: data.featureOverrides.industry,
        });
      }
      if (step < 2) {
        setStep((s) => (s + 1) as 0 | 1 | 2);
      } else {
        toast.success('Profile complete');
        router.replace(data.nextPath || '/client/workspace');
      }
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Could not save profile';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={`${adminContentColumnClass} py-16 text-center text-[13px] text-admin-text-secondary`}>
        Loading profile setup…
      </div>
    );
  }

  const steps = [
    { label: 'Personal Information', hint: 'Name, contact, photo', icon: UserRound },
    { label: 'Business & billing', hint: 'Company & billing', icon: Building2 },
    { label: 'Regional & language', hint: 'Timezone & language', icon: Globe2 },
  ];

  return (
    <div className={`${adminContentColumnClass} space-y-5`}>
      <div>
        <p className="text-[12px] font-semibold uppercase tracking-wide text-admin-text-subdued">Profile setup</p>
        <h1 className="mt-1 text-[22px] font-semibold text-admin-text">Manage Profile</h1>
        <p className="mt-1 text-[13px] text-admin-text-secondary">
          Complete personal, billing, and regional details before creating your workspace.
        </p>
      </div>

      <div className={dashboardCardShell}>
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="text-[13px] font-medium text-admin-text">
            {step + 1} of 3 sections · {progress}%
          </p>
        </div>
        <div className="mb-4 h-2 overflow-hidden rounded-full bg-[#ebebeb]">
          <div className="h-full rounded-full bg-black transition-all" style={{ width: `${progress}%` }} />
        </div>
        <div className="grid gap-2 sm:grid-cols-3">
          {steps.map((item, idx) => {
            const Icon = item.icon;
            const done = idx < step;
            const active = idx === step;
            return (
              <div
                key={item.label}
                className={`rounded-lg border px-3 py-3 ${
                  active ? 'border-black bg-[#f6f6f7]' : 'border-admin-border bg-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex h-7 w-7 items-center justify-center rounded-full ${
                      done ? 'bg-emerald-600 text-white' : active ? 'bg-black text-white' : 'bg-[#ebebeb] text-admin-text'
                    }`}
                  >
                    {done ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                  </span>
                  <div>
                    <p className="text-[13px] font-semibold text-admin-text">{item.label}</p>
                    <p className="text-[11px] text-admin-text-secondary">{item.hint}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className={`${dashboardCardShell} space-y-4`}>
        {step === 0 && (
          <>
            <h2 className="text-[16px] font-semibold">Personal information</h2>
            <p className="text-[13px] text-admin-text-secondary">Confirm the details from signup.</p>
            <label className="block text-[13px] font-medium">
              Full name <span className="text-red-600">*</span>
              <input
                className="mt-1 w-full rounded-lg border border-admin-border px-3 py-2 text-[13px]"
                value={form.name}
                onChange={(e) => setField('name', e.target.value)}
                required
              />
            </label>
            <label className="block text-[13px] font-medium">
              Email address
              <input
                className="mt-1 w-full rounded-lg border border-admin-border bg-[#f6f6f7] px-3 py-2 text-[13px]"
                value={form.email}
                readOnly
              />
            </label>
            <label className="block text-[13px] font-medium">
              Phone number <span className="text-red-600">*</span>
              <input
                className="mt-1 w-full rounded-lg border border-admin-border px-3 py-2 text-[13px]"
                value={form.phone}
                onChange={(e) => setField('phone', e.target.value)}
                required
              />
            </label>
          </>
        )}

        {step === 1 && (
          <>
            <h2 className="text-[16px] font-semibold">Business & billing</h2>
            <p className="text-[13px] text-admin-text-secondary">
              These details appear on your subscription invoices (BILL TO).
            </p>
            <label className="block text-[13px] font-medium">
              Business name <span className="text-red-600">*</span>
              <input
                className="mt-1 w-full rounded-lg border border-admin-border px-3 py-2 text-[13px]"
                value={form.companyName}
                onChange={(e) => setField('companyName', e.target.value)}
                placeholder="e.g. Acme Business Solutions LLC"
                required
              />
              <span className="mt-1 block text-[12px] text-admin-text-secondary">Shown as the company name on invoices.</span>
            </label>
            <label className="block text-[13px] font-medium">
              GST / Tax ID
              <input
                className="mt-1 w-full rounded-lg border border-admin-border px-3 py-2 text-[13px]"
                value={form.gstNumber}
                onChange={(e) => setField('gstNumber', e.target.value)}
                placeholder="e.g. GSTIN, VAT, or TRN"
              />
              <span className="mt-1 block text-[12px] text-admin-text-secondary">Optional. Include if you need it printed on invoices.</span>
            </label>
            <label className="block text-[13px] font-medium">
              Business address <span className="text-red-600">*</span>
              <textarea
                className="mt-1 min-h-[100px] w-full rounded-lg border border-admin-border px-3 py-2 text-[13px]"
                value={form.address}
                onChange={(e) => setField('address', e.target.value)}
                placeholder="Street, city, state / emirate, postal code, country"
                required
              />
              <span className="mt-1 block text-[12px] text-admin-text-secondary">Full billing address used on invoices.</span>
            </label>
          </>
        )}

        {step === 2 && (
          <>
            <h2 className="text-[16px] font-semibold">Regional & language</h2>
            <p className="text-[13px] text-admin-text-secondary">Set your default timezone and language.</p>
            <label className="block text-[13px] font-medium">
              Timezone <span className="text-red-600">*</span>
              <select
                className="mt-1 w-full rounded-lg border border-admin-border px-3 py-2 text-[13px]"
                value={form.preferredTimezone}
                onChange={(e) => setField('preferredTimezone', e.target.value)}
              >
                {TIMEZONES.map((tz) => (
                  <option key={tz} value={tz}>
                    {tz}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-[13px] font-medium">
              Language
              <select
                className="mt-1 w-full rounded-lg border border-admin-border px-3 py-2 text-[13px]"
                value={form.preferredLanguage}
                onChange={(e) => setField('preferredLanguage', e.target.value)}
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang.id} value={lang.id}>
                    {lang.label}
                  </option>
                ))}
              </select>
            </label>
          </>
        )}

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            className={adminListSecondaryButtonClass}
            disabled={step === 0 || saving}
            onClick={() => setStep((s) => (Math.max(0, s - 1) as 0 | 1 | 2))}
          >
            Back
          </button>
          <button type="button" className={adminListPrimaryButtonClass} disabled={saving} onClick={saveStep}>
            {saving ? 'Saving…' : step === 2 ? 'Finish' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
}
