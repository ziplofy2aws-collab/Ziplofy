import React, { useState } from 'react';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { SettingsHero, SettingsPanel } from '../../components/settings/SettingsPageScaffold';
import { useShippingProfiles } from '../../contexts/shipping-profile.context';
import { useStore } from '../../contexts/store.context';

const ShippingProfileCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { activeStoreId } = useStore();
  const { createShippingProfile, loading } = useShippingProfiles();

  const [profileName, setProfileName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleBack = () => {
    navigate('/settings/shipping-and-delivery');
  };

  const handleSave = async () => {
    if (!activeStoreId) {
      setError('Please select a store.');
      return;
    }

    if (!profileName.trim()) {
      setError('Profile name is required.');
      return;
    }

    try {
      setError(null);
      await createShippingProfile({
        profileName: profileName.trim(),
        storeId: activeStoreId,
      });

      navigate('/settings/shipping-and-delivery');
    } catch (err: any) {
      setError(err.message || 'Failed to create shipping profile');
    }
  };

  return (
    <div className="w-full">
      <div className="max-w-[1200px] mx-auto w-full flex flex-col gap-6">
        <SettingsHero
          title="Create shipping profile"
          actions={
            <>
              <button
                type="button"
                onClick={handleBack}
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <ArrowLeftIcon className="h-4 w-4" />
                Back
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={!profileName.trim() || loading}
                className="min-w-[100px] rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
            </>
          }
        />

        <SettingsPanel className="max-w-2xl p-4">
          <h2 className="text-sm font-medium text-gray-900 mb-1">
            Profile name
          </h2>
          <p className="text-xs text-gray-600 mb-3">
            Customers won't see this
          </p>
          <input
            type="text"
            placeholder="Fragile products"
            value={profileName}
            onChange={(e) => setProfileName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-sm"
          />
          {error && (
            <p className="text-xs text-red-600 mt-2">
              {error}
            </p>
          )}
        </SettingsPanel>
      </div>
    </div>
  );
};

export default ShippingProfileCreatePage;
