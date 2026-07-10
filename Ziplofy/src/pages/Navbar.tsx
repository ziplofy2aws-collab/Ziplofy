import {
  BellIcon,
  MagnifyingGlassIcon,
  QuestionMarkCircleIcon,
  SparklesIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import React, { ChangeEvent, useCallback, useEffect, useRef, useState } from 'react';
import ziplofyLogo from '../assets/ziplofy-logo.png';
import StoreDropdown from '../components/StoreDropdown';
import { useCustomerTags } from '../contexts/customer-tags.context';
import { useCustomers } from '../contexts/customer.context';
import { usePackaging } from '../contexts/packaging.context';
import { useProductTags } from '../contexts/product-tags.context';
import { useProductType } from '../contexts/product-type.context';
import { useStore } from '../contexts/store.context';
import { useTransferTags } from '../contexts/transfer-tags.context';
import { useVendors } from '../contexts/vendor.context';

const ZiplofyNavbar: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isAlertsOpen, setIsAlertsOpen] = useState<boolean>(false);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const { setActiveStoreId, activeStoreId } = useStore();
  const { fetchCustomersByStoreId } = useCustomers();
  const { fetchCustomerTags } = useCustomerTags();
  const { fetchProductTags } = useProductTags();
  const { getProductTypesByStoreId } = useProductType();
  const { fetchPackagingsByStoreId } = usePackaging();
  const { fetchVendorsByStoreId } = useVendors();
  const { fetchByStore: fetchTransferTags } = useTransferTags();

  const alertsMenuRef = useRef<HTMLDivElement>(null);
  const alertsButtonRef = useRef<HTMLButtonElement>(null);

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

  const handleSearchChange = useCallback((e: ChangeEvent<HTMLInputElement>): void => {
    setSearchQuery(e.target.value);
  }, []);

  const handleOpenAlerts = useCallback(() => {
    setIsAlertsOpen(true);
  }, []);

  const handleCloseAlerts = useCallback(() => {
    setIsAlertsOpen(false);
  }, []);

  const toggleGuide = useCallback((open: boolean) => {
    setIsGuideOpen(open);
  }, []);

  const handleStoreChange = useCallback((storeId: string) => {
    setActiveStoreId(storeId);
  }, [setActiveStoreId]);

  const handleShowTour = useCallback(() => {
    localStorage.removeItem('ziplofy_onboarding_complete');
    localStorage.removeItem('ziplofy_onboarding_step');
    window.dispatchEvent(new CustomEvent('ziplofy-show-tour'));
  }, []);

  // Close alerts menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        alertsMenuRef.current &&
        alertsButtonRef.current &&
        !alertsMenuRef.current.contains(event.target as Node) &&
        !alertsButtonRef.current.contains(event.target as Node)
      ) {
        handleCloseAlerts();
      }
    };

    if (isAlertsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isAlertsOpen, handleCloseAlerts]);

  // Close drawer when pressing Escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isGuideOpen) {
        toggleGuide(false);
      }
    };

    if (isGuideOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isGuideOpen, toggleGuide]);

  return (
    <>
      {/* Navbar Header */}
      <header className="fixed top-0 left-0 right-0 h-12 bg-white border-b-2  border-gray-200 z-[1201]">
        <div className="h-full px-3 flex items-center justify-between">
        {/* Left Section - Logo */}
          <div className="flex items-center gap-3">
            <img
              src={ziplofyLogo}
              alt="Ziplofy Logo"
              className="h-8 w-auto object-contain"
            />
          </div>

        {/* Center Section - Search */}
          <div className="flex-1 max-w-[500px] mx-4">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 group-focus-within:text-blue-500" />
              </div>
              <input
                type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={handleSearchChange}
                className="w-full h-8 pl-8 pr-3 bg-gray-50 border border-gray-200 rounded text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 transition-all"
              />
            </div>
          </div>

          <div className='flex gap-1.5'>
          {/* Right Section - Icons and Admin Dropdown */}
          <div className="flex items-center gap-1 bg-gray-50 rounded border border-gray-200">
          {/* Notifications */}
            <div className="relative">
              <button
                ref={alertsButtonRef}
            onClick={handleOpenAlerts}
                className="p-1.5 rounded transition-colors hover:bg-gray-100"
                aria-label="Notifications"
                aria-expanded={isAlertsOpen}
            aria-haspopup="true"
              >
                <BellIcon className="w-4 h-4 text-gray-600" />
              </button>

              {/* Alerts Menu */}
              {isAlertsOpen && (
                <div
                  ref={alertsMenuRef}
                  className="absolute right-0 top-full mt-1 min-w-[200px] bg-white border border-gray-200 rounded shadow-md py-1.5 z-50"
          >
                  <div className="px-3 py-2 text-gray-500 text-sm cursor-default">
              No alerts as of now
                  </div>
                </div>
              )}
            </div>

            {/* Helper Icon (Question Mark) */}
            <button
              onClick={() => toggleGuide(true)}
              className="p-1.5 hover:bg-gray-100 rounded transition-colors"
              aria-label="Setup guide"
            >
              <QuestionMarkCircleIcon className="w-4 h-4 text-gray-600" />
            </button>
          </div>

          {/* Show Tour Button */}
          <button
            onClick={handleShowTour}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded text-blue-600 text-xs font-medium transition-colors"
            aria-label="Show tour"
          >
            <SparklesIcon className="w-3.5 h-3.5" />
            Show Tour
          </button>
                      {/* Admin Dropdown */}
            <div className="relative bg-gray-50 rounded border border-gray-200">
              <StoreDropdown onStoreChange={handleStoreChange} />
            </div>

          </div>

        </div>
      </header>

      {/* Right Drawer - Setup Guide */}
      <div
        className={`fixed top-0 right-0 h-full w-[300px] bg-white border-l-2 border-l-blue-600/30 border-gray-200 shadow-lg z-[1300] transform transition-transform duration-300 ease-in-out ${
          isGuideOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
          <div className="p-3 border-b border-gray-200 bg-blue-50/30">
            <div className="flex items-center justify-between mb-1.5">
              <h2 className="text-base font-semibold text-gray-900">Setup guide</h2>
              <button
                onClick={() => toggleGuide(false)}
                className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                aria-label="Close"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-gray-500">
            Follow these steps to get your store ready.
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-3">
            <ul className="space-y-2">
              <li className="flex items-center gap-2 py-1">
                <div className="flex items-center justify-center">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-offset-0"
                  />
                </div>
                <span className="text-sm text-gray-700">Add store name</span>
              </li>
              <li className="flex items-center gap-2 py-1">
                <div className="flex items-center justify-center">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-offset-0"
                  />
                </div>
                <span className="text-sm text-gray-700">Add your first product</span>
              </li>
              <li className="flex items-center gap-2 py-1">
                <div className="flex items-center justify-center">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-offset-0"
                  />
                </div>
                <span className="text-sm text-gray-700">Design your store</span>
              </li>
              <li className="flex items-center gap-2 py-1">
                <div className="flex items-center justify-center">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-offset-0"
                  />
                </div>
                <span className="text-sm text-gray-700">Unlock your store</span>
              </li>
              <li className="flex items-center gap-2 py-1">
                <div className="flex items-center justify-center">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-offset-0"
                  />
                </div>
                <span className="text-sm text-gray-700">Set up a payment provider</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Backdrop */}
      {isGuideOpen && (
        <div
          className="fixed inset-0 bg-gray-500/20 z-[1250]"
          onClick={() => toggleGuide(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
};

export default ZiplofyNavbar;
