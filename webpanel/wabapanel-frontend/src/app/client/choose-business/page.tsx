'use client';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { adminContentColumnClass, dashboardCardShell } from '@/components/layout/dashboard-ui';

type BusinessOption = { id: string; label: string };

export default function ChooseBusinessPage() {
  const applyServiceChoices = useAuthStore((s) => s.applyServiceChoices);
  const [options, setOptions] = useState<BusinessOption[]>([]);
  const [industry, setIndustry] = useState('');
  const [savingId, setSavingId] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const res = await authApi.businessOptions();
      setOptions(res.data.data.options || []);
      setIndustry(res.data.data.industry || '');
    } catch {
      toast.error('Could not load business options');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const select = async (option: BusinessOption) => {
    if (option.id === industry || savingId) return;
    setSavingId(option.id);
    try {
      const res = await authApi.updateIndustry(option.id);
      const data = res.data.data;
      setIndustry(data.featureOverrides?.industry || option.id);
      applyServiceChoices({
        selectedModules: data.selected || data.featureOverrides?.selectedModules || [],
        features: data.features || {},
        industry: data.featureOverrides?.industry || option.id,
      });
      toast.success(`${option.label} added to your sidebar`);
    } catch {
      toast.error('Could not update business');
      await load();
    } finally {
      setSavingId('');
    }
  };

  return (
    <div className={`${adminContentColumnClass} space-y-4`}>
      <div>
        <h1 className="text-[20px] font-semibold text-admin-text">Choose your business</h1>
        <p className="mt-1 text-[13px] text-admin-text-secondary">
          Pick one service sector. Your sidebar updates to match, and that workspace stays included under Choose your services.
        </p>
      </div>

      {loading ? (
        <div className={`${dashboardCardShell} text-[13px] text-admin-text-secondary`}>Loading…</div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {options.map((option) => {
            const selected = industry === option.id;
            return (
              <button
                key={option.id}
                type="button"
                disabled={savingId === option.id}
                onClick={() => select(option)}
                className={`${dashboardCardShell} text-left transition ${
                  selected ? 'ring-2 ring-admin-text' : 'hover:border-admin-text/40'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-[15px] font-semibold">{option.label}</h2>
                    <p className="mt-1 text-[12px] text-admin-text-secondary">
                      {selected
                        ? 'Currently active in your sidebar'
                        : 'Replace the current sector workspace with this one'}
                    </p>
                  </div>
                  <input type="radio" readOnly checked={selected} className="mt-1" />
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
