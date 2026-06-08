import {
  ArrowPathIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import AddPixelModal from '../../components/AddPixelModal';
import CustomerEventsHeader from '../../components/CustomerEventsHeader';
import PixelsTable from '../../components/PixelsTable';
import Tabs from '../../components/Tabs';
import { DataSaleOption, Pixel, usePixels } from '../../contexts/pixel.context';
import { useStore } from '../../contexts/store.context';
import { SettingsHero } from '../../components/settings/SettingsPageScaffold';

const MAX_NAME = 30;
const DEFAULT_CODE = `// Step 1. Initialize the JavaScript pixel SDK (make sure to exclude HTML)

// Step 2. Subscribe to customer events with analytics.subscribe(), and add tracking
// analytics.subscribe("all_standard_events", function (event) {
//   console.log("Event data ", event?.data);
// });`;

type TabValue = 'all' | 'app' | 'custom';

const statusLabelMap: Record<string, string> = {
  inactive: 'Disconnected',
  disconnected: 'Disconnected',
  active: 'Connected',
};

const CustomerEventsPage: React.FC = () => {
  const [addOpen, setAddOpen] = useState(false);
  const [pixelName, setPixelName] = useState('');
  const [dataSale, setDataSale] = useState<DataSaleOption>('does_not_qualify_as_data_sale');
  const [code, setCode] = useState(DEFAULT_CODE);
  const [tab, setTab] = useState<TabValue>('all');

  const { activeStoreId } = useStore();
  const { pixels, create, fetchByStoreId, loading } = usePixels();
  const navigate = useNavigate();

  useEffect(() => {
    if (activeStoreId) {
      fetchByStoreId(activeStoreId).catch((err) => {
        toast.error(err?.message || 'Failed to fetch pixels');
      });
    }
  }, [activeStoreId, fetchByStoreId]);

  const isValid = useMemo(
    () => pixelName.trim().length > 0 && pixelName.length <= MAX_NAME,
    [pixelName]
  );

  const filteredPixels = useMemo(() => {
    if (tab === 'app') return [];
    if (tab === 'custom') return pixels.filter((p) => p.type.toLowerCase() === 'custom');
    return pixels;
  }, [pixels, tab]);

  const hasPixels = filteredPixels.length > 0;

  const handleClose = useCallback(() => {
    setAddOpen(false);
    setPixelName('');
    setDataSale('does_not_qualify_as_data_sale');
    setCode(DEFAULT_CODE);
  }, []);

  const handleCreate = useCallback(async () => {
    if (!isValid) return;
    if (!activeStoreId) {
      toast.error('Select a store before creating a pixel');
      return;
    }
    try {
      await create({
        storeId: activeStoreId,
        pixelName: pixelName.trim(),
        type: 'custom',
        status: 'inactive',
        required: false,
        notRequired: true,
        marketing: false,
        analytics: false,
        preferences: false,
        dataSale,
        code,
      });
      toast.success('Pixel created');
      handleClose();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to create pixel');
    }
  }, [isValid, activeStoreId, pixelName, dataSale, code, create, handleClose]);

  const renderStatusChip = useCallback((pixel: Pixel) => {
    const label = statusLabelMap[pixel.status?.toLowerCase()] || pixel.status;
    return (
      <span className="px-2.5 py-1 rounded-md text-xs font-medium text-gray-700 bg-gray-100 border border-gray-200 capitalize">
        {label}
      </span>
    );
  }, []);

  const handleRefresh = useCallback(() => {
    if (activeStoreId) {
      fetchByStoreId(activeStoreId).catch((err) =>
        toast.error(err?.message || 'Failed to refresh pixels')
      );
    }
  }, [activeStoreId, fetchByStoreId]);

  const handleTabChange = useCallback((value: string) => {
    setTab(value as TabValue);
  }, []);

  const handleOpenModal = useCallback(() => {
    setAddOpen(true);
  }, []);

  const handleRowClick = useCallback((pixelId: string) => {
    navigate(`/settings/customer-events/${pixelId}`);
  }, [navigate]);

  const tabs = useMemo(() => [
    { id: 'all', label: 'All' },
    { id: 'app', label: 'App pixels' },
    { id: 'custom', label: 'Custom pixels' },
  ], []);

  return (
    <div className="w-full">
      <div className="max-w-[1200px] mx-auto w-full flex flex-col gap-6">
        <SettingsHero
          title="Customer events"
          description="Manage pixels and integrations that collect customer event data from your store."
        />

        <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-5 mb-6">
          <CustomerEventsHeader onOpenModal={handleOpenModal} />

          <div className="mt-4 rounded-xl border border-gray-200 overflow-hidden bg-white">
            <div className="px-4 pt-4">
              <Tabs
                tabs={tabs}
                activeTab={tab}
                onTabChange={handleTabChange}
              />
            </div>

            <div className="h-px bg-gray-200" />

            <div className="px-4 py-3 flex justify-end gap-2 bg-gray-50/80">
              <button
                type="button"
                disabled
                className="inline-flex items-center justify-center p-2 rounded-lg border border-gray-200 text-gray-300 bg-white cursor-not-allowed"
              >
                <MagnifyingGlassIcon className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleRefresh}
                className="inline-flex items-center justify-center p-2 rounded-lg border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <ArrowPathIcon className="w-4 h-4" />
              </button>
            </div>

            <div className="h-px bg-gray-200" />

            {loading ? (
              <div className="py-12 flex justify-center">
                <div className="w-6 h-6 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : hasPixels ? (
              <PixelsTable
                pixels={filteredPixels}
                renderStatusChip={renderStatusChip}
                onRowClick={handleRowClick}
              />
            ) : (
              <div className="py-12 text-center text-gray-600">
                <p className="text-sm text-gray-500">No pixels found for this store.</p>
              </div>
            )}
          </div>

          <p className="text-sm text-gray-500 mt-4">
            This list only shows{' '}
            <button type="button" className="text-gray-700 font-medium hover:underline">
              pixels
            </button>{' '}
            that use the applicable Ziplofy APIs, the supported pixel integration.
          </p>

          <button type="button" className="text-sm text-gray-700 font-medium mt-4 inline-flex items-center hover:underline">
            Learn more about pixels
          </button>
        </div>

        <AddPixelModal
          open={addOpen}
          onClose={handleClose}
          pixelName={pixelName}
          onPixelNameChange={setPixelName}
          dataSale={dataSale}
          onDataSaleChange={setDataSale}
          code={code}
          onCodeChange={setCode}
          isValid={isValid}
          loading={loading}
          onCreate={handleCreate}
          maxName={MAX_NAME}
        />
      </div>
    </div>
  );
};

export default CustomerEventsPage;
