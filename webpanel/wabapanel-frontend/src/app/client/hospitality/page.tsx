'use client';
import SectorOverview from '@/components/sector/SectorOverview';

export default function Page() {
  return (
    <SectorOverview
      featureKey="hospitality"
      industry="hospitality"
      title="Hospitality"
      description="Your hospitality workspace — reservations, guests, rooms and services."
      basePath="/client/hospitality"
    />
  );
}
