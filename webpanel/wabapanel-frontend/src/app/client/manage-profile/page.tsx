'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Building2, Check, Globe2, UserRound } from 'lucide-react';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import AppStatusScreen from '@/components/status/AppStatusScreen';
import { FlowButton, FlowButtonLoading } from '@/components/ui/flow-button';

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

const glassCard =
  'overflow-hidden rounded-2xl border border-[#e3e3e3] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.06),0_1px_3px_rgba(16,24,40,0.04)]';
const fieldClass =
  'mt-1.5 w-full rounded-xl border border-[#e3e3e3] bg-white px-3.5 py-2.5 text-[14px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20';
const labelClass = 'block text-[13px] font-semibold text-slate-800';

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
    return <AppStatusScreen variant="loading" fullScreen={false} />;
  }

  const steps = [
    { label: 'Personal Information', hint: 'Name, contact, photo', icon: UserRound },
    { label: 'Business & billing', hint: 'Company & billing', icon: Building2 },
    { label: 'Regional & language', hint: 'Timezone & language', icon: Globe2 },
  ];

  return (
    <div className="mx-auto max-w-[980px] space-y-5">
      <div className={glassCard}>
        <div className="h-1 w-full" style={{ background: 'linear-gradient(95deg, #059669 0%, #0d9488 55%, #14b8a6 100%)' }} />
        <div className="px-5 py-6 sm:px-7">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#98A2B3]">
            Profile setup
          </p>
          <h1 className="mt-2 text-[28px] font-extrabold tracking-tight text-[#101828] sm:text-[32px]">
            Manage Profile
          </h1>
          <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-[#667085]">
            Complete personal, billing, and regional details before creating your workspace.
          </p>
        </div>
      </div>

      <div className={`${glassCard} px-5 py-5 sm:px-7`}>
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="text-[13px] font-semibold text-slate-700">
            {step + 1} of 3 sections · {progress}%
          </p>
          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 ring-1 ring-emerald-100">
            {progress}% done
          </span>
        </div>
        <div className="mb-5 h-2.5 overflow-hidden rounded-full bg-[#f2f4f7]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {steps.map((item, idx) => {
            const Icon = item.icon;
            const done = idx < step;
            const active = idx === step;
            return (
              <div
                key={item.label}
                className={`rounded-2xl border px-3.5 py-3.5 transition ${
                  active
                    ? 'border-emerald-200 bg-emerald-50/80 shadow-[0_8px_24px_rgba(16,185,129,0.10)]'
                    : done
                      ? 'border-[#e3e3e3] bg-[#fafafa]'
                      : 'border-[#e3e3e3] bg-white'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                      done
                        ? 'bg-emerald-600 text-white'
                        : active
                          ? 'bg-emerald-500 text-white'
                          : 'bg-[#f2f4f7] text-slate-500'
                    }`}
                  >
                    {done ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                  </span>
                  <div>
                    <p className="text-[13px] font-bold text-slate-900">{item.label}</p>
                    <p className="mt-0.5 text-[11px] text-slate-500">{item.hint}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className={`${glassCard} space-y-4 px-5 py-6 sm:px-7`}>
        <div key={step} className="step-blur-transition space-y-4">
        {step === 0 && (
          <>
            <div>
              <h2 className="text-[18px] font-bold tracking-tight text-slate-900">Personal information</h2>
              <p className="mt-1 text-[13px] text-slate-500">Confirm the details from signup.</p>
            </div>
            <label className={labelClass}>
              Full name <span className="text-rose-500">*</span>
              <input
                className={fieldClass}
                value={form.name}
                onChange={(e) => setField('name', e.target.value)}
                required
              />
            </label>
            <label className={labelClass}>
              Email address
              <input className={`${fieldClass} cursor-not-allowed opacity-80`} value={form.email} readOnly />
            </label>
            <label className={labelClass}>
              Phone number <span className="text-rose-500">*</span>
              <input
                className={fieldClass}
                value={form.phone}
                onChange={(e) => setField('phone', e.target.value)}
                required
              />
            </label>
          </>
        )}

        {step === 1 && (
          <>
            <div>
              <h2 className="text-[18px] font-bold tracking-tight text-slate-900">Business & billing</h2>
              <p className="mt-1 text-[13px] text-slate-500">
                These details appear on your subscription invoices (BILL TO).
              </p>
            </div>
            <label className={labelClass}>
              Business name <span className="text-rose-500">*</span>
              <input
                className={fieldClass}
                value={form.companyName}
                onChange={(e) => setField('companyName', e.target.value)}
                placeholder="e.g. Acme Business Solutions LLC"
                required
              />
              <span className="mt-1 block text-[12px] font-normal text-slate-500">
                Shown as the company name on invoices.
              </span>
            </label>
            <label className={labelClass}>
              GST / Tax ID
              <input
                className={fieldClass}
                value={form.gstNumber}
                onChange={(e) => setField('gstNumber', e.target.value)}
                placeholder="e.g. GSTIN, VAT, or TRN"
              />
            </label>
            <label className={labelClass}>
              Business address <span className="text-rose-500">*</span>
              <textarea
                className={`${fieldClass} min-h-[110px] resize-y`}
                value={form.address}
                onChange={(e) => setField('address', e.target.value)}
                placeholder="Street, city, state / emirate, postal code, country"
                required
              />
            </label>
          </>
        )}

        {step === 2 && (
          <>
            <div>
              <h2 className="text-[18px] font-bold tracking-tight text-slate-900">Regional & language</h2>
              <p className="mt-1 text-[13px] text-slate-500">Set your default timezone and language.</p>
            </div>
            <label className={labelClass}>
              Timezone <span className="text-rose-500">*</span>
              <select
                className={fieldClass}
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
            <label className={labelClass}>
              Language
              <select
                className={fieldClass}
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
        </div>

        <div className="flex flex-col-reverse items-stretch gap-2 border-t border-[#e3e3e3] pt-5 sm:flex-row sm:items-center sm:justify-end">
          <FlowButton
            type="button"
            text="Back"
            className="sm:w-auto sm:min-w-[120px]"
            disabled={step === 0 || saving}
            onClick={() => setStep((s) => Math.max(0, s - 1) as 0 | 1 | 2)}
          />
          {saving ? (
            <FlowButtonLoading text="Saving…" className="sm:w-auto sm:min-w-[160px]" />
          ) : (
            <FlowButton
              type="button"
              text={step === 2 ? 'Finish' : 'Continue'}
              className="sm:w-auto sm:min-w-[160px]"
              onClick={saveStep}
            />
          )}
        </div>
      </div>
    </div>
  );
}
