'use client';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { adminContentColumnClass, dashboardCardShell } from '@/components/layout/dashboard-ui';

type CatalogModule = { id: string; label: string; locked: boolean; selected: boolean };

const CORE_IDS = new Set(['whatsapp', 'websiteBuilder']);

const CARD_DESCRIPTIONS: Record<string, string> = {
  websiteBuilder: 'Store, themes, pages, and the public website. Always included.',
  whatsapp: 'WhatsApp inbox, QR inbox, and channel settings.',
  clinic: 'Your clinic workspace — OPD queue, consults, doctors, patients, and calendar. Included with Healthcare.',
  edtech: 'Your institute workspace — courses, batches, students, teachers, and attendance. Included with Education.',
  realEstate: 'Your real-estate workspace — included with the Real estate industry.',
  agency: 'Your agency workspace — included with the Agency / consulting industry.',
  legal: 'Your legal-practice workspace — included with the Legal industry.',
  hospitality: 'Your hospitality workspace — included with the Hospitality industry.',
  salon: 'Your salon & spa workspace — included with the Salon / spa industry.',
  serviceBusiness: 'Your service-business workspace — included with your industry selection.',
};

export default function ChooseServicesPage() {
  const applyServiceChoices = useAuthStore((s) => s.applyServiceChoices);
  const [modules, setModules] = useState<CatalogModule[]>([]);
  const [savingId, setSavingId] = useState('');

  const load = () =>
    authApi.modules().then((r) => setModules(r.data.data.modules || [])).catch(() => {});

  useEffect(() => { load(); }, []);

  const toggle = async (item: CatalogModule) => {
    if (item.locked) return;
    const next = modules
      .filter((mod) => (mod.id === item.id ? !mod.selected : mod.selected))
      .map((mod) => mod.id);
    setSavingId(item.id);
    setModules((current) => current.map((mod) => (mod.id === item.id ? { ...mod, selected: !mod.selected } : mod)));
    try {
      const res = await authApi.updateModules(next);
      const data = res.data.data;
      setModules(data.modules || []);
      applyServiceChoices({
        selectedModules: data.selected || next,
        features: data.features || {},
        industry: data.featureOverrides?.industry,
      });
      toast.success(item.selected ? `${item.label} removed` : `${item.label} added to sidebar`);
    } catch {
      toast.error('Could not update services');
      load();
    } finally {
      setSavingId('');
    }
  };

  // Cards: only the two core services. Locked modules (e.g. the sector
  // workspace included with the user's industry) stay in the checkbox grid,
  // already checked and disabled.
  const core = modules.filter((item) => CORE_IDS.has(item.id));
  const extra = modules.filter((item) => !CORE_IDS.has(item.id));

  return (
    <div className={`${adminContentColumnClass} space-y-4`}>
      <div>
        <h1 className="text-[20px] font-semibold text-admin-text">Choose your services</h1>
        <p className="mt-1 text-[13px] text-admin-text-secondary">Check a service to add it to the sidebar. Uncheck to hide it. Dashboard and Store stay on.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {core.map((item) => (
          <button
            key={item.id}
            type="button"
            disabled={item.locked || savingId === item.id}
            onClick={() => toggle(item)}
            className={`${dashboardCardShell} text-left ${item.selected ? 'ring-2 ring-admin-text' : ''}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-[15px] font-semibold">{item.label}</h2>
                <p className="mt-1 text-[12px] text-admin-text-secondary">
                  {CARD_DESCRIPTIONS[item.id] || 'Included with your plan.'}
                </p>
              </div>
              <input type="checkbox" readOnly checked={item.selected} className="mt-1" />
            </div>
          </button>
        ))}
      </div>

      <div className={dashboardCardShell}>
        <h3 className="mb-3 text-[14px] font-semibold">More panels</h3>
        <div className="grid gap-2 sm:grid-cols-2">
          {extra.map((item) => (
            <label key={item.id} className="flex items-center gap-2 rounded-lg border border-admin-border px-3 py-2 text-[13px]">
              <input
                type="checkbox"
                checked={item.selected}
                disabled={item.locked || savingId === item.id}
                onChange={() => toggle(item)}
              />
              <span>{item.label}{item.locked ? ' · included' : ''}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
