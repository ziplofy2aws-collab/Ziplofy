import React, { useCallback, useEffect, useMemo, useState } from 'react';
import AddVendorModal from '../components/vendors/AddVendorModal';
import VendorsPageFilters from '../components/vendors/VendorsPageFilters';
import VendorsPageHeader from '../components/vendors/VendorsPageHeader';
import VendorsTable from '../components/vendors/VendorsTable';
import { vendorPrimaryButtonClass } from '../components/vendors/vendor-ui.util';
import { useStore } from '../contexts/store.context';
import { useVendors } from '../contexts/vendor.context';

const VendorsPage: React.FC = () => {
  const { vendors, fetchVendorsByStoreId, loading, error, createVendor } = useVendors();
  const { activeStoreId } = useStore();
  const [open, setOpen] = useState(false);
  const [vendorName, setVendorName] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (activeStoreId) {
      fetchVendorsByStoreId(activeStoreId).catch(() => {});
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

  const filteredVendors = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return vendors;
    return vendors.filter((v) => v.name.toLowerCase().includes(query));
  }, [vendors, search]);

  const hasVendors = vendors.length > 0;

  return (
    <div className="min-h-screen bg-page-background-color">
      <div className="mx-auto max-w-[1200px] px-3 py-4 sm:px-4">
        <VendorsPageHeader onAddVendor={handleOpenModal} />

        {error ? (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        ) : null}

        <div className="overflow-hidden rounded-lg border border-gray-200/80 bg-white shadow-sm">
          {hasVendors ? (
            <VendorsPageFilters search={search} onSearchChange={setSearch} />
          ) : null}

          {loading ? (
            <div className="flex min-h-[280px] items-center justify-center py-16">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-gray-700" />
            </div>
          ) : !hasVendors ? (
            <div className="flex min-h-[360px] flex-col items-center justify-center px-6 py-16 text-center">
              <p className="text-[15px] font-semibold text-gray-900">Add your vendors</p>
              <p className="mt-1.5 text-[13px] font-normal text-gray-500">
                Organize product suppliers and assign them when editing products or purchase orders
              </p>
              <button type="button" onClick={handleOpenModal} className={`mt-4 ${vendorPrimaryButtonClass}`}>
                Add vendor
              </button>
            </div>
          ) : (
            <VendorsTable vendors={filteredVendors} />
          )}
        </div>

        <div className="py-5 text-center">
          <p className="text-xs text-gray-500">
            <a href="#" className="text-gray-600 hover:text-gray-800">
              Learn more about vendors
            </a>
          </p>
        </div>
      </div>

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
