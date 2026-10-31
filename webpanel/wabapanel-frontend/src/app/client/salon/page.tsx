'use client';
import SectorOverview from '@/components/sector/SectorOverview';

export default function Page() {
  return (
    <SectorOverview
      featureKey="salon"
      industry="salon"
      title="Salon & Spa"
      description="Your salon & spa workspace — bookings, services, staff and customers."
      basePath="/client/salon"
    />
  );
}
