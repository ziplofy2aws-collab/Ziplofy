'use client';

import SetupGuideCards, { useSetupFlags } from '@/components/dashboard/SetupGuideCards';
import LegacyDashboard from './LegacyDashboard';

// Setup mode: show the 4 step cards until all are connected/done.
// Once every step is complete, swap to the full workspace dashboard.
export default function DashboardPage() {
  const { websiteDone, domainDone, waConnected, crmDone } = useSetupFlags();
  const allDone = websiteDone && domainDone && waConnected && crmDone;
  if (allDone) return <LegacyDashboard />;
  return <SetupGuideCards />;
}
