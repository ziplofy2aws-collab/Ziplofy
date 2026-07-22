import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import codiicLogo from '../assets/codiic-logo.png';
import AdminNavbarSearch from '../components/AdminNavbarSearch';
import StoreDropdown from '../components/StoreDropdown';
import { useCustomerTags } from '../contexts/customer-tags.context';
import { useCustomers } from '../contexts/customer.context';
import { usePackaging } from '../contexts/packaging.context';
import { useProductTags } from '../contexts/product-tags.context';
import { useProductType } from '../contexts/product-type.context';
import { useStore } from '../contexts/store.context';
import { useTransferTags } from '../contexts/transfer-tags.context';
import { useVendors } from '../contexts/vendor.context';
import { CodiixChatPanel, CodiixFaceIcon } from '../create-theme/codiix';

const codiicNavbar: React.FC = () => {
  const navigate = useNavigate();
  const { setActiveStoreId, activeStoreId } = useStore();
  const { fetchCustomersByStoreId } = useCustomers();
  const { fetchCustomerTags } = useCustomerTags();
  const { fetchProductTags } = useProductTags();
  const { getProductTypesByStoreId } = useProductType();
  const { fetchPackagingsByStoreId } = usePackaging();
  const { fetchVendorsByStoreId } = useVendors();
  const { fetchByStore: fetchTransferTags } = useTransferTags();
  const [codiixOpen, setCodiixOpen] = useState(false);
  const [codiixExpanded, setCodiixExpanded] = useState(true);

  useEffect(() => {
    if (activeStoreId) {
      fetchCustomersByStoreId(activeStoreId);
      fetchCustomerTags(activeStoreId);
      fetchProductTags(activeStoreId);
      getProductTypesByStoreId(activeStoreId);
      fetchPackagingsByStoreId(activeStoreId);
      fetchVendorsByStoreId(activeStoreId);
      fetchTransferTags(activeStoreId);
    }
  }, [
    activeStoreId,
    fetchCustomersByStoreId,
    fetchCustomerTags,
    fetchProductTags,
    getProductTypesByStoreId,
    fetchPackagingsByStoreId,
    fetchVendorsByStoreId,
    fetchTransferTags,
  ]);

  const handleStoreChange = useCallback((storeId: string) => {
    setActiveStoreId(storeId);
  }, [setActiveStoreId]);

  const toggleCodiix = useCallback(() => setCodiixOpen((v) => !v), []);
  const closeCodiix = useCallback(() => setCodiixOpen(false), []);
  const navigateAdmin = useCallback(
    (path: string) => {
      navigate(path);
    },
    [navigate],
  );

  return (
    <header className="fixed top-0 left-0 right-0 z-[1201] h-12 border-b-2 border-gray-200 bg-white">
      <div className="flex h-full items-center justify-between px-3">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="inline-flex shrink-0 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50"
            aria-label="Go to home"
          >
            <img src={codiicLogo} alt="codiic Logo" className="h-8 w-auto object-contain" />
          </Link>
        </div>

        <div className="mx-4 max-w-[500px] flex-1">
          <AdminNavbarSearch />
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={toggleCodiix}
            className={`codiix-header-btn ${codiixOpen ? 'codiix-header-btn--active' : ''}`}
            title="Ask Codiix"
            aria-label="Ask Codiix"
            aria-pressed={codiixOpen}
            aria-haspopup="dialog"
          >
            <CodiixFaceIcon className="h-7 w-7" title="Codiix" />
          </button>
          <div className="relative rounded border border-gray-200 bg-gray-50">
            <StoreDropdown onStoreChange={handleStoreChange} />
          </div>
        </div>
      </div>

      {codiixOpen ? (
        <CodiixChatPanel
          open={codiixOpen}
          onClose={closeCodiix}
          expanded={codiixExpanded}
          onExpandedChange={setCodiixExpanded}
          surface="admin"
          onNavigateAdmin={navigateAdmin}
        />
      ) : null}
    </header>
  );
};

export default codiicNavbar;
