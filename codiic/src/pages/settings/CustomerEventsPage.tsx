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
import {
  adminListCardClass,
  adminListFooterLinkClass,
} from '../../components/admin-list-ui';
import { SettingsHero } from '../../components/settings/SettingsPageScaffold';
import { DataSaleOption, Pixel, usePixels } from '../../contexts/pixel.context';
import { useStore } from '../../contexts/store.context';

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
      <span className="rounded-md border border-admin-border bg-admin-secondary px-2.5 py-1 text-[12px] font-medium capitalize text-admin-text">
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

  const handleRowClick = useCallback(
    (pixelId: string) => {
      navigate(`/settings/customer-events/${pixelId}`);
    },
    [navigate]
  );

  const tabs = useMemo(
    () => [
      { id: 'all', label: 'All' },
      { id: 'app', label: 'App pixels' },
      { id: 'custom', label: 'Custom pixels' },
    ],
    []
  );

  return (
    <div className="w-full">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-6">
        <SettingsHero
          title="Customer events"
          description="Manage pixels and integrations that collect customer event data from your store."
        />

        <div className={`${adminListCardClass} p-5`}>
          <CustomerEventsHeader onOpenModal={handleOpenModal} />

          <div className="mt-4 overflow-hidden rounded-xl border border-admin-border bg-admin-surface">
            <div className="px-4 pt-4">
              <Tabs tabs={tabs} activeTab={tab} onTabChange={handleTabChange} />
            </div>

            <div className="h-px bg-admin-divider" />

            <div className="flex justify-end gap-2 bg-admin-table-header px-4 py-3">
              <button
                type="button"
                disabled
                className="inline-flex cursor-not-allowed items-center justify-center rounded-lg border border-admin-border bg-admin-surface p-2 text-admin-text-subdued"
              >
                <MagnifyingGlassIcon className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={handleRefresh}
                className="inline-flex items-center justify-center rounded-lg border border-admin-border bg-admin-surface p-2 text-admin-text transition-colors hover:bg-admin-row-hover"
              >
                <ArrowPathIcon className="h-4 w-4" />
              </button>
            </div>

            <div className="h-px bg-admin-divider" />

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-admin-border border-t-admin-text" />
              </div>
            ) : hasPixels ? (
              <PixelsTable
                pixels={filteredPixels}
                renderStatusChip={renderStatusChip}
                onRowClick={handleRowClick}
              />
            ) : (
              <div className="py-12 text-center">
                <p className="text-[13px] text-admin-text-subdued">
                  No pixels found for this store.
                </p>
              </div>
            )}
          </div>

          <p className="mt-4 text-[13px] text-admin-text-secondary">
            This list only shows{' '}
            <button type="button" className={`${adminListFooterLinkClass} font-medium`}>
              pixels
            </button>{' '}
            that use the applicable codiic APIs, the supported pixel integration.
          </p>

          <button
            type="button"
            className={`mt-4 inline-flex items-center text-[13px] font-medium ${adminListFooterLinkClass}`}
          >
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
