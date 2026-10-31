'use client';
import SectorOverview from '@/components/sector/SectorOverview';

export default function Page() {
  return (
    <SectorOverview
      featureKey="serviceBusiness"
      industry="other_service"
      title="Service Business"
      description="Your service-business workspace — services, bookings, customers and team."
      basePath="/client/service-business"
    />
  );
}
