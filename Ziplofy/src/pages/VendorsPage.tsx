import { BuildingOffice2Icon, PlusIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import React, { useCallback, useEffect, useState } from 'react';
import AddVendorModal from '../components/vendors/AddVendorModal';
import VendorList from '../components/vendors/VendorList';
import { useStore } from '../contexts/store.context';
import { useVendors } from '../contexts/vendor.context';

const VendorsPage: React.FC = () => {
  const { vendors, fetchVendorsByStoreId, loading, createVendor } = useVendors();
  const { activeStoreId } = useStore();
  const [open, setOpen] = useState(false);
  const [vendorName, setVendorName] = useState('');

  useEffect(() => {
    if (activeStoreId) {
      fetchVendorsByStoreId(activeStoreId);
    }
  }, [activeStoreId, fetchVendorsByStoreId]);

  const handleOpenModal = useCallback(() => {
    setOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setOpen(false);
    setVendorName('');
  }, []);

  const handleVendorNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setVendorName(e.target.value);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!activeStoreId || !vendorName.trim()) {
      setOpen(false);
      return;
    }
    try {
      await createVendor({ storeId: activeStoreId, name: vendorName.trim() });
    } finally {
      setVendorName('');
      setOpen(false);
    }
  }, [activeStoreId, vendorName, createVendor]);

  const count = vendors.length;

  return (
    <div className="w-full space-y-6 pb-8">
      <header className="rounded-2xl border border-gray-200/80 bg-gradient-to-b from-white to-blue-50/20 px-5 py-5 shadow-sm sm:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 pl-3 border-l-4 border-blue-500/70">
            <div className="flex flex-wrap items-center gap-2 gap-y-1">
              <h1 className="text-3xl font-semibold tracking-tight text-gray-900">Vendors</h1>
              <span className="inline-flex items-center gap-1 rounded-full border border-blue-100 bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-800">
                <UserGroupIcon className="h-3.5 w-3.5" aria-hidden />
                {count} {count === 1 ? 'supplier' : 'suppliers'}
              </span>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Organize product suppliers and assign them when editing products or purchase orders.
            </p>
          </div>
          <button
            type="button"
            onClick={handleOpenModal}
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
          >
            <PlusIcon className="h-4 w-4" aria-hidden />
            Add vendor
          </button>
        </div>
        <div className="mt-4 hidden rounded-xl border border-blue-100/80 bg-blue-50/40 px-4 py-2.5 sm:block">
          <p className="text-xs leading-relaxed text-blue-950/80">
            <span className="font-semibold text-blue-950">Tip:</span> use clear vendor names so your team can filter
            and report on sourcing consistently.
          </p>
        </div>
      </header>

      <section className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm">
        <div className="border-b border-gray-100 bg-gradient-to-r from-gray-50/90 to-white px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
              <BuildingOffice2Icon className="h-5 w-5 text-blue-600" aria-hidden />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-900">Vendor directory</h2>
              <p className="text-xs text-gray-500">
                {loading ? 'Loading…' : count === 0 ? 'No suppliers on file yet' : `${count} on record`}
              </p>
            </div>
          </div>
        </div>

        <div className="p-0">
          {loading ? (
            <div className="flex min-h-[280px] items-center justify-center px-4 py-16">
              <div className="flex flex-col items-center gap-4">
                <div
                  className="h-10 w-10 animate-spin rounded-full border-2 border-gray-200 border-t-blue-600"
                  aria-hidden
                />
                <p className="text-sm font-medium text-gray-600">Loading vendors…</p>
              </div>
            </div>
          ) : count === 0 ? (
            <div className="flex min-h-[280px] flex-col items-center justify-center px-8 py-16 text-center">
              <div className="relative mb-5">
                <div className="absolute inset-0 rounded-full bg-blue-400/10 blur-xl" aria-hidden />
                <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-gray-100 bg-white shadow-sm">
                  <BuildingOffice2Icon className="h-8 w-8 text-blue-500" aria-hidden />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">No vendors yet</h3>
              <p className="mt-2 max-w-md text-sm text-gray-500">
                Add suppliers to link products and purchase orders to the businesses you buy from.
              </p>
              <button
                type="button"
                onClick={handleOpenModal}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
              >
                <PlusIcon className="h-4 w-4" aria-hidden />
                Add vendor
              </button>
            </div>
          ) : (
            <VendorList vendors={vendors} />
          )}
        </div>
      </section>

      <AddVendorModal
        isOpen={open}
        onClose={handleCloseModal}
        vendorName={vendorName}
        onVendorNameChange={handleVendorNameChange}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default VendorsPage;
