'use client';
import SectorOverview from '@/components/sector/SectorOverview';

export default function Page() {
  return (
    <SectorOverview
      featureKey="agency"
      industry="agency"
      title="Agency"
      description="Your agency workspace — clients, projects, tasks and proposals."
      basePath="/client/agency"
    />
  );
}
