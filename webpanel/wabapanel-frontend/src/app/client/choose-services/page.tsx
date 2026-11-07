'use client';

import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Check, LayoutGrid, Lock, Sparkles } from 'lucide-react';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { adminContentColumnClass, dashboardCardShell } from '@/components/layout/dashboard-ui';
import { fireServiceUnlockConfetti } from '@/lib/confettiFireworks';

type CatalogModule = { id: string; label: string; locked: boolean; selected: boolean };

const CORE_IDS = new Set(['whatsapp', 'websiteBuilder']);

const CARD_DESCRIPTIONS: Record<string, string> = {
  websiteBuilder: 'Store, themes, pages, and the public website. Always included.',
  whatsapp: 'WhatsApp inbox, QR inbox, and channel settings.',
  clinic:
    'Your clinic workspace — OPD queue, consults, doctors, patients, and calendar. Included with Healthcare.',
  edtech:
    'Your institute workspace — courses, batches, students, teachers, and attendance. Included with Education.',
  realEstate: 'Your real-estate workspace — included with the Real estate industry.',
  agency: 'Your agency workspace — included with the Agency / consulting industry.',
  legal: 'Your legal-practice workspace — included with the Legal industry.',
  hospitality: 'Your hospitality workspace — included with the Hospitality industry.',
  salon: 'Your salon & spa workspace — included with the Salon / spa industry.',
  travel:
    'Your tour & travel workspace — packages, bookings, travellers, and enquiries. Included with Tour & travel.',
  serviceBusiness: 'Your service-business workspace — included with your industry selection.',
};

export default function ChooseServicesPage() {
  const applyServiceChoices = useAuthStore((s) => s.applyServiceChoices);
  const [modules, setModules] = useState<CatalogModule[]>([]);
  const [savingId, setSavingId] = useState('');

  const load = () =>
    authApi
      .modules()
      .then((r) => setModules(r.data.data.modules || []))
      .catch(() => {});

  useEffect(() => {
    load();
  }, []);

  const toggle = async (item: CatalogModule) => {
    if (item.locked) return;
    const willAdd = !item.selected;
    const next = modules
      .filter((mod) => (mod.id === item.id ? !mod.selected : mod.selected))
      .map((mod) => mod.id);
    setSavingId(item.id);
    setModules((current) =>
      current.map((mod) => (mod.id === item.id ? { ...mod, selected: !mod.selected } : mod))
    );
    try {
      const res = await authApi.updateModules(next);
      const data = res.data.data;
      setModules(data.modules || []);
      applyServiceChoices({
        selectedModules: data.selected || next,
        features: data.features || {},
        industry: data.featureOverrides?.industry,
      });
      if (willAdd) {
        void fireServiceUnlockConfetti();
        toast.success(`${item.label} added to sidebar`);
      } else {
        toast.success(`${item.label} removed from sidebar`);
      }
    } catch {
      toast.error('Could not update services');
      load();
    } finally {
      setSavingId('');
    }
  };

  const core = modules.filter((item) => CORE_IDS.has(item.id));
  const extra = modules.filter((item) => !CORE_IDS.has(item.id));

  return (
    <div className={`${adminContentColumnClass} space-y-5`}>
      <div className="relative overflow-hidden rounded-2xl border border-white/50 bg-white/55 px-5 py-5 shadow-[0_8px_28px_rgba(15,61,46,0.06),inset_0_1px_0_rgba(255,255,255,0.65)] backdrop-blur-xl">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(212,244,216,0.55),transparent_45%),radial-gradient(circle_at_100%_0%,rgba(219,234,254,0.4),transparent_40%)]"
          aria-hidden
        />
        <div className="relative flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#e8f5a8] to-[#d4f4d8] text-[#00896F] shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
            <LayoutGrid className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-[20px] font-semibold tracking-tight text-[#101828]">
              Choose your services
            </h1>
            <p className="mt-1 text-[13px] text-[#6b7a74]">
              Turn a service on to add it to your sidebar. Unlocking a new one plays a short confetti
              celebration.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {core.map((item) => {
          const selected = item.selected;
          const busy = savingId === item.id;
          return (
            <button
              key={item.id}
              type="button"
              disabled={item.locked || busy}
              onClick={() => toggle(item)}
              className={`${dashboardCardShell} group text-left ${
                selected
                  ? 'ring-2 ring-[#00896F]/35 shadow-[0_12px_28px_rgba(0,137,111,0.12)]'
                  : ''
              } ${busy ? 'opacity-70' : ''}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="text-[15px] font-semibold text-[#101828]">{item.label}</h2>
                    {selected && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#d4f4d8] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#0f3d2e]">
                        <Sparkles className="h-3 w-3" /> Active
                      </span>
                    )}
                  </div>
                  <p className="mt-1.5 text-[12px] leading-relaxed text-[#6b7a74]">
                    {CARD_DESCRIPTIONS[item.id] || 'Included with your plan.'}
                  </p>
                </div>
                <span
                  className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border transition-all ${
                    selected
                      ? 'border-[#00896F] bg-[#00896F] text-white'
                      : 'border-[#e8efe9] bg-white/80 text-transparent group-hover:border-[#b7e4c0]'
                  }`}
                >
                  <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <div className={dashboardCardShell}>
        <div className="mb-3 flex items-center justify-between gap-2">
          <h3 className="text-[14px] font-semibold text-[#101828]">More panels</h3>
          <span className="text-[11px] font-medium text-[#8a9a93]">
            {extra.filter((m) => m.selected).length}/{extra.length} on
          </span>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {extra.map((item) => {
            const busy = savingId === item.id;
            return (
              <button
                key={item.id}
                type="button"
                disabled={item.locked || busy}
                onClick={() => toggle(item)}
                className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-[13px] transition-all duration-200 ${
                  item.selected
                    ? 'border-[#b7e4c0] bg-[#eef8f0]/80 text-[#0f3d2e]'
                    : 'border-[#e8efe9]/80 bg-white/50 text-[#3d4a45] hover:border-[#b7e4c0] hover:bg-[#f4faf5]'
                } ${item.locked || busy ? 'cursor-not-allowed opacity-70' : ''}`}
              >
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                    item.selected
                      ? 'border-[#00896F] bg-[#00896F] text-white'
                      : 'border-[#e8efe9] bg-white text-transparent'
                  }`}
                >
                  {item.locked ? (
                    <Lock className="h-3 w-3 text-[#8a9a93]" />
                  ) : (
                    <Check className="h-3 w-3" strokeWidth={2.5} />
                  )}
                </span>
                <span className="min-w-0 flex-1 font-medium">
                  {item.label}
                  {item.locked ? (
                    <span className="ml-1 text-[11px] font-normal text-[#8a9a93]">· included</span>
                  ) : null}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
