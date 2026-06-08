import {
  ArrowLeftIcon,
  MapPinIcon,
  TruckIcon,
} from '@heroicons/react/24/outline';
import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLocalDeliveryLocationEntries } from '../../contexts/local-delivery-location-entries.context';
import { SettingsHero, SettingsPanel } from '../../components/settings/SettingsPageScaffold';

const LocalDeliveriesPage: React.FC = () => {
  const navigate = useNavigate();
  const { localDeliveryId } = useParams<{ localDeliveryId?: string }>();
  const {
    entries,
    fetchEntriesByLocalDeliveryId,
    loading: entriesLoading,
  } = useLocalDeliveryLocationEntries();

  useEffect(() => {
    if (localDeliveryId) {
      fetchEntriesByLocalDeliveryId(localDeliveryId);
    }
  }, [localDeliveryId, fetchEntriesByLocalDeliveryId]);

  const combinedEntries = entries;
  const missingLocalDeliveryId = !localDeliveryId;
  const isLoading = entriesLoading && !missingLocalDeliveryId;

  return (
    <div className="w-full">
      <div className="max-w-[1200px] mx-auto w-full flex flex-col gap-6">
        <SettingsHero
          title="Local delivery"
          description="Deliver orders to customers directly from your locations."
          tip={
            <span className="inline-flex items-center gap-2">
              <TruckIcon className="h-4 w-4 text-blue-700" />
              Configure zones and pricing per location from the table below.
            </span>
          }
          leading={
            <button
              type="button"
              onClick={() => navigate('/settings/shipping-and-delivery')}
              className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200/90 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50/90 transition-colors"
              aria-label="Back to shipping"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Back
            </button>
          }
        />

        <SettingsPanel className="overflow-hidden p-0">
          <div className="p-5 border-b border-gray-200">
            <h2 className="text-base font-semibold text-gray-900">Your locations</h2>
            <p className="mt-1 text-sm text-gray-500">
              Manage which locations offer local delivery and their settings.
            </p>
          </div>

          <div className="p-5">
            {missingLocalDeliveryId ? (
              <p className="text-sm text-gray-500 py-2">
                Local delivery identifier missing. Please navigate via the Manage button.
              </p>
            ) : isLoading ? (
              <div className="py-12 flex flex-col items-center justify-center gap-3">
                <div className="w-8 h-8 border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin" />
                <p className="text-sm text-gray-500">Loading locations…</p>
              </div>
            ) : combinedEntries.length === 0 ? (
              <p className="text-sm text-gray-500 py-2">No locations found.</p>
            ) : (
              <div className="divide-y divide-gray-100">
                {combinedEntries.map((entry) => {
                  const location =
                    typeof entry.locationId === 'string' || !entry.locationId
                      ? null
                      : entry.locationId;
                  const locationId =
                    typeof entry.locationId === 'string' ? entry.locationId : entry.locationId?._id;
                  if (!locationId) return null;
                  return (
                    <button
                      key={locationId}
                      type="button"
                      onClick={() => {
                        if (!localDeliveryId) return;
                        navigate(
                          `/settings/shipping-and-delivery/local_deliveries/${localDeliveryId}/locations/${locationId}`
                        );
                      }}
                      className="w-full flex items-center justify-between gap-4 py-4 text-left rounded-lg hover:bg-gray-50 transition-colors first:pt-0 last:pb-0"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 text-gray-600 shrink-0">
                          <MapPinIcon className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {location?.name || 'Unknown location'}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {location?.countryRegion || 'No country specified'}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`shrink-0 px-2.5 py-1 rounded-md text-xs font-medium ${
                          entry.canLocalDeliver
                            ? 'bg-green-50 text-green-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {entry.canLocalDeliver ? 'Offers delivery' : "Doesn't offer delivery"}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </SettingsPanel>
      </div>
    </div>
  );
};

export default LocalDeliveriesPage;

