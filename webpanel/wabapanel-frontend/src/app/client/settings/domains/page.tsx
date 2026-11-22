'use client';
import React from 'react';
import { Globe } from 'lucide-react';
import DomainsPanel from '@/components/settings/DomainsPanel';
import {
  adminContentColumnClass,
  dashboardCardShell,
  dashboardPageSubtitleClass,
  dashboardPageTitleClass,
} from '@/components/layout/dashboard-ui';

export default function DomainsSettingsPage() {
  return (
    <div className={`${adminContentColumnClass} space-y-4`}>
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <Globe className="h-5 w-5 shrink-0 text-admin-text-secondary" aria-hidden />
          <h1 className={dashboardPageTitleClass}>Domains</h1>
        </div>
        <p className={dashboardPageSubtitleClass}>
          Connect and manage the domains customers use to reach your store
        </p>
      </div>
      <div className={dashboardCardShell}>
        <DomainsPanel />
      </div>
    </div>
  );
}
