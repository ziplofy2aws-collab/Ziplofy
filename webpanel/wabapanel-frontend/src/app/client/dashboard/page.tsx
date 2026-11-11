'use client';
import React from 'react';
import Link from 'next/link';
import { Globe } from 'lucide-react';
import SetupGuideCards from '@/components/dashboard/SetupGuideCards';
import { adminContentColumnClass } from '@/components/layout/dashboard-ui';
import { useAuthStore } from '@/stores/authStore';
import { displayPersonName } from '@/lib/brand';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const firstName = (displayPersonName(user?.name) || '').split(' ')[0];

  return (
    <div className={adminContentColumnClass}>
      {/* Top: greeting + primary action */}
      <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-[20px] font-semibold tracking-tight text-admin-text sm:text-2xl">
            Welcome{firstName ? `, ${firstName}` : ''}
          </h1>
          <p className="mt-1.5 text-[13px] text-admin-text-secondary">
            Let&apos;s get your workspace ready.
          </p>
        </div>
        <Link
          href="/client/online-store"
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-emerald-500 to-emerald-600 px-3.5 py-2 text-[13px] font-semibold text-white shadow-[0_10px_22px_rgba(5,150,105,0.28)] transition hover:brightness-105"
        >
          <Globe className="h-4 w-4" aria-hidden />
          Open store
        </Link>
      </div>

      <SetupGuideCards />
    </div>
  );
}
