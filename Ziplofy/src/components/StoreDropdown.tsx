import {
  ArrowRightOnRectangleIcon,
  BuildingStorefrontIcon,
  ChevronDownIcon,
  PlusIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useStore } from '../contexts/store.context';
import toast from 'react-hot-toast';
import { frontendEnv } from '../config/env';

interface StoreDropdownProps {
  onStoreChange?: (storeId: string) => void;
}

const StoreDropdown: React.FC<StoreDropdownProps> = ({ onStoreChange }) => {
  const { stores, activeStoreId, loading, error, createStore } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isManageStoresOpen, setIsManageStoresOpen] = useState(false);
  const [isCreateStoreOpen, setIsCreateStoreOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [storeName, setStoreName] = useState('');
  const [storeDescription, setStoreDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const manageStoresModalRef = useRef<HTMLDivElement>(null);
  const createStoreModalRef = useRef<HTMLDivElement>(null);
  const logoutConfirmModalRef = useRef<HTMLDivElement>(null);

  const handleClick = useCallback(() => {
    setIsOpen(prev=>!prev)
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleStoreSelect = useCallback((storeId: string) => {
    if (onStoreChange) {
      onStoreChange(storeId);
    }
    handleClose();
  }, [onStoreChange, handleClose]);

  const handleManageStoresClick = useCallback(() => {
    setIsManageStoresOpen(true);
    handleClose();
  }, [handleClose]);

  const handleCloseManageStores = useCallback(() => {
    setIsManageStoresOpen(false);
  }, []);

  const handleCreateStoreClick = useCallback(() => {
    setIsCreateStoreOpen(true);
  }, []);

  const handleCloseCreateStore = useCallback(() => {
    setIsCreateStoreOpen(false);
    setStoreName('');
    setStoreDescription('');
    setIsSubmitting(false);
  }, []);

  const handleSubmitCreateStore = useCallback(async () => {
    if (!storeName.trim() || !storeDescription.trim()) {
      return;
    }

    try {
      setIsSubmitting(true);
      await createStore({
        storeName: storeName.trim(),
        storeDescription: storeDescription.trim(),
      });
      handleCloseCreateStore();
    } catch (err) {
      console.error('Error creating store:', err);
    } finally {
      setIsSubmitting(false);
    }
  }, [storeName, storeDescription, createStore, handleCloseCreateStore]);

  const handleLogoutClick = useCallback(() => {
    setIsLogoutConfirmOpen(true);
    handleClose();
  }, [handleClose]);

  const handleCloseLogoutConfirm = useCallback(() => {
    setIsLogoutConfirmOpen(false);
  }, []);

  const handleConfirmLogout = useCallback(() => {
    window.location.href = `${frontendEnv.authMicroserviceFrontendUrl}?logout=true`
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        buttonRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, handleClose]);

  // Close modals when pressing Escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (isManageStoresOpen) handleCloseManageStores();
        if (isCreateStoreOpen) handleCloseCreateStore();
        if (isLogoutConfirmOpen) handleCloseLogoutConfirm();
      }
    };

    if (isManageStoresOpen || isCreateStoreOpen || isLogoutConfirmOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isManageStoresOpen, isCreateStoreOpen, isLogoutConfirmOpen, handleCloseManageStores, handleCloseCreateStore, handleCloseLogoutConfirm]);

  // Find the active store
  const activeStore = stores.find(store => store._id === activeStoreId);
  
  // Get store initials for avatar
  const getStoreInitials = (storeName: string) => {
    return storeName
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <div className="bg-gray-600 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium">
          ...
        </div>
        <span className="text-gray-900 text-sm">Loading...</span>
      </div>
    );
  }

  if (error || !activeStore) {
    return (
      <div className="flex items-center gap-2">
        <div className="bg-gray-600 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium">
          ?
        </div>
        <span className="text-gray-900 text-sm">No Store</span>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center gap-2 relative">
        <button
          ref={buttonRef}
          onClick={handleClick}
          className="flex items-center gap-2 hover:bg-gray-100 rounded px-2.5 py-1.5 transition-colors"
        >
          <div className="bg-gray-600 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium">
            {getStoreInitials(activeStore.storeName)}
          </div>
          <span className="text-gray-900 text-sm font-medium max-w-[100px] truncate">
            {activeStore.storeName}
          </span>
          <ChevronDownIcon className="w-4 h-4 text-gray-500" />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div
            ref={dropdownRef}
            className="absolute right-0 top-full mt-1 min-w-[220px] bg-white border border-gray-200 rounded shadow-md py-1.5 z-50"
          >
            {/* Show current store */}
            {activeStore && (
              <div className="px-3 py-2 bg-gray-50 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-medium shrink-0">
                    {getStoreInitials(activeStore.storeName)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {activeStore.storeName}
                    </div>
                    {activeStore.storeDescription && (
                      <div className="text-xs text-gray-500 truncate mt-0.5">
                        {activeStore.storeDescription}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {/* Show all stores */}
            <div className="max-h-[280px] overflow-y-auto py-1">
              {stores.map((store) => (
                <button
                  key={store._id}
                  onClick={() => handleStoreSelect(store._id)}
                  className={`w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 transition-colors text-left ${
                    store._id === activeStoreId ? 'bg-blue-50/50' : ''
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium shrink-0 ${
                      store._id === activeStoreId ? 'bg-blue-600' : 'bg-gray-400'
                    }`}
                  >
                    {getStoreInitials(store.storeName)}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <div
                      className={`text-sm truncate ${
                        store._id === activeStoreId
                          ? 'font-medium text-gray-900'
                          : 'text-gray-700'
                      }`}
                    >
                      {store.storeName}
                    </div>
                    {store.storeDescription && (
                      <div className="text-xs text-gray-500 truncate mt-0.5">
                        {store.storeDescription}
                      </div>
                    )}
                  </div>
                  {store._id === activeStoreId && (
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
                  )}
                </button>
              ))}
            </div>
            
            {/* Divider */}
            <div className="border-t border-gray-100 my-1" />
            
            {/* Manage Stores */}
            <button
              onClick={handleManageStoresClick}
              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 transition-colors text-left"
            >
              <BuildingStorefrontIcon className="w-4 h-4 text-gray-500 shrink-0" />
              <span className="text-sm text-gray-700">Manage Stores</span>
            </button>
            
            {/* Logout */}
            <button
              onClick={handleLogoutClick}
              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-red-50 transition-colors text-left"
            >
              <ArrowRightOnRectangleIcon className="w-4 h-4 text-red-500 shrink-0" />
              <span className="text-sm text-red-600">Logout</span>
            </button>
          </div>
        )}
      </div>

      {/* Manage Stores Modal */}
      {isManageStoresOpen && (
        <div
          className="fixed inset-0 bg-gray-500/20 z-[1400] flex items-center justify-center p-4"
          onClick={handleCloseManageStores}
        >
          <div
            ref={manageStoresModalRef}
            className="bg-white rounded-lg w-full max-w-3xl max-h-[85vh] flex flex-col shadow-lg border border-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center px-4 py-3 border-b border-gray-200">
              <h2 className="text-base font-medium text-gray-900">Manage Stores</h2>
              <button
                onClick={handleCloseManageStores}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <XMarkIcon className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 overflow-y-auto flex-1">
              {/* Create Store Button */}
              <div className="mb-4">
                <button
                  onClick={handleCreateStoreClick}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 text-white text-sm font-medium rounded hover:bg-gray-800 transition-colors"
                >
                  <PlusIcon className="w-4 h-4" />
                  Create New Store
                </button>
              </div>

              {/* Stores Table */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">
                          Store Name
                        </th>
                        <th className="px-3 py-2 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">
                          Description
                        </th>
                        <th className="px-3 py-2 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-3 py-2 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">
                          Created
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {stores.map((store) => (
                        <tr
                          key={store._id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-3 py-2.5">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-gray-600 flex items-center justify-center text-white text-xs font-medium shrink-0">
                                {getStoreInitials(store.storeName)}
                              </div>
                              <span className="text-sm font-medium text-gray-900">{store.storeName}</span>
                            </div>
                          </td>
                          <td className="px-3 py-2.5">
                            <span className="text-sm text-gray-600 max-w-[200px] truncate block">
                              {store.storeDescription || '—'}
                            </span>
                          </td>
                          <td className="px-3 py-2.5">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                store._id === activeStoreId
                                  ? 'bg-gray-100 text-gray-700'
                                  : 'bg-gray-50 text-gray-600'
                              }`}
                            >
                              {store._id === activeStoreId ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-3 py-2.5">
                            <span className="text-sm text-gray-600">
                              {new Date(store.createdAt).toLocaleDateString()}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-gray-200 flex justify-end">
              <button
                onClick={handleCloseManageStores}
                className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Store Form Modal */}
      {isCreateStoreOpen && (
        <div
          className="fixed inset-0 bg-gray-500/20 z-[1400] flex items-center justify-center p-4"
          onClick={handleCloseCreateStore}
        >
          <div
            ref={createStoreModalRef}
            className="bg-white rounded-lg w-full max-w-md max-h-[85vh] flex flex-col shadow-lg border border-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center px-4 py-3 border-b border-gray-200">
              <h2 className="text-base font-medium text-gray-900">Create New Store</h2>
              <button
                onClick={handleCloseCreateStore}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <XMarkIcon className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 overflow-y-auto flex-1">
              <div className="space-y-4">
                {/* Store Name Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Store Name
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="text"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-300 transition-all"
                    placeholder="Enter store name"
                  />
                </div>

                {/* Store Description Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Store Description
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <textarea
                    value={storeDescription}
                    onChange={(e) => setStoreDescription(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-200 rounded text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-300 transition-all resize-none"
                    placeholder="Enter store description"
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-gray-200 flex justify-end gap-2">
              <button
                onClick={handleCloseCreateStore}
                className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitCreateStore}
                disabled={!storeName.trim() || !storeDescription.trim() || isSubmitting}
                className="px-3 py-1.5 text-sm font-medium text-white bg-gray-900 rounded hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Creating...' : 'Create Store'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {isLogoutConfirmOpen && (
        <div
          className="fixed inset-0 bg-gray-500/20 z-[1400] flex items-center justify-center p-4"
          onClick={handleCloseLogoutConfirm}
        >
          <div
            ref={logoutConfirmModalRef}
            className="bg-white rounded-lg w-full max-w-md shadow-lg border border-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-200">
              <h2 className="text-base font-medium text-gray-900">Confirm Logout</h2>
            </div>

            {/* Content */}
            <div className="px-4 py-4">
              <p className="text-sm text-gray-700">
                Are you sure you want to logout?
              </p>
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-gray-200 flex justify-end gap-2">
              <button
                onClick={handleCloseLogoutConfirm}
                className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded transition-colors"
              >
                No
              </button>
              <button
                onClick={handleConfirmLogout}
                className="px-3 py-1.5 text-sm font-medium text-white bg-red-600 rounded hover:bg-red-700 transition-colors"
              >
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default StoreDropdown;
