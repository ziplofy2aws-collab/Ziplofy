'use client';
import SectorOverview from '@/components/sector/SectorOverview';

export default function Page() {
  return (
    <SectorOverview
      featureKey="travel"
      industry="tour_travel"
      title="Tour & Travel"
      description="Your tour & travel workspace — packages, bookings, travellers and enquiries."
      basePath="/client/travel"
    />
  );
}
