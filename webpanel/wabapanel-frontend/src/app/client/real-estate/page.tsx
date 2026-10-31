'use client';
import SectorOverview from '@/components/sector/SectorOverview';

export default function Page() {
  return (
    <SectorOverview
      featureKey="realEstate"
      industry="real_estate"
      title="Real Estate"
      description="Your real-estate workspace — listings, enquiries, site visits, clients and deals."
      basePath="/client/real-estate"
    />
  );
}
