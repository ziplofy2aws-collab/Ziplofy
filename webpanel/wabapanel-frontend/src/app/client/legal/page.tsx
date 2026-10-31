'use client';
import SectorOverview from '@/components/sector/SectorOverview';

export default function Page() {
  return (
    <SectorOverview
      featureKey="legal"
      industry="legal"
      title="Legal Practice"
      description="Your legal workspace — clients, matters, hearings and documents."
      basePath="/client/legal"
    />
  );
}
