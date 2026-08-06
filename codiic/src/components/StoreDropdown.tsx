import {
  ArrowRightOnRectangleIcon,
  BuildingStorefrontIcon,
  ChevronDownIcon,
  PlusIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useStore } from '../contexts/store.context';
import {
  adminListPrimaryButtonClass,
  adminListSecondaryButtonClass,
  adminListTableHeadClass,
  adminListTableHeadRowClass,
} from './admin-list-ui';

interface StoreDropdownProps {
  onStoreChange?: (storeId: string) => void;
}

const storeAvatarClass =
  'flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#aeea00] text-xs font-semibold text-black';

const menuItemClass =
  'flex w-full items-center gap-2 px-3 py-2 text-left text-[13px] text-admin-text transition-colors hover:bg-admin-row-hover';

const modalOverlayClass =
  'fixed inset-0 z-[1400] flex items-center justify-center bg-black/20 p-4';

const modalPanelClass =
  'flex max-h-[85vh] w-full flex-col rounded-xl border border-admin-border bg-admin-surface shadow-lg';

const modalInputClass =
  'w-full rounded-lg border border-admin-border bg-admin-surface px-3 py-2 text-[13px] text-admin-text placeholder:text-admin-text-subdued transition-colors focus:border-[#005bd3] focus:outline-none focus:ring-1 focus:ring-[#005bd3]/30';

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
    // Auth now lives inside this app; clear the session and go to the login page.
    try {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('token');
    } catch {
      // ignore storage access errors
    }
    window.location.href = '/login';
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
      <div className="flex items-center gap-2 rounded-lg bg-admin-header-control px-2.5 py-1.5">
        <div className={storeAvatarClass}>...</div>
        <span className="text-sm text-white">Loading...</span>
      </div>
    );
  }

  if (error || !activeStore) {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-admin-header-control px-2.5 py-1.5">
        <div className={storeAvatarClass}>?</div>
        <span className="text-sm text-white">No Store</span>
      </div>
    );
  }

  return (
    <>
      <div className="relative flex items-center gap-2">
        <button
          ref={buttonRef}
          type="button"
          onClick={handleClick}
          className="flex items-center gap-2 rounded-lg bg-admin-header-control px-2.5 py-1.5 transition-colors hover:bg-admin-header-control-hover"
        >
          <div className={storeAvatarClass}>
            {getStoreInitials(activeStore.storeName)}
          </div>
          <span className="max-w-[100px] truncate text-sm font-medium text-white">
            {activeStore.storeName}
          </span>
          <ChevronDownIcon className="h-4 w-4 text-[#b5b5b5]" />
        </button>

        {isOpen && (
          <div
            ref={dropdownRef}
            className="absolute right-0 top-full z-50 mt-1.5 min-w-[240px] overflow-hidden rounded-xl border border-admin-border bg-admin-surface py-1.5 shadow-lg"
          >
            {activeStore && (
              <div className="border-b border-admin-border bg-admin-table-header px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#aeea00] text-xs font-semibold text-black">
                    {getStoreInitials(activeStore.storeName)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13px] font-semibold text-admin-text">
                      {activeStore.storeName}
                    </div>
                    {activeStore.storeDescription && (
                      <div className="mt-0.5 truncate text-xs text-admin-text-subdued">
                        {activeStore.storeDescription}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="max-h-[280px] overflow-y-auto py-1">
              {stores.map((store) => {
                const isActive = store._id === activeStoreId;
                return (
                  <button
                    key={store._id}
                    type="button"
                    onClick={() => handleStoreSelect(store._id)}
                    className={`${menuItemClass} ${
                      isActive ? 'bg-admin-secondary' : ''
                    }`}
                  >
                    <div
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs font-semibold ${
                        isActive
                          ? 'bg-[#aeea00] text-black'
                          : 'bg-admin-fill text-admin-text'
                      }`}
                    >
                      {getStoreInitials(store.storeName)}
                    </div>
                    <div className="min-w-0 flex-1 text-left">
                      <div
                        className={`truncate text-[13px] ${
                          isActive
                            ? 'font-semibold text-admin-text'
                            : 'font-medium text-admin-text'
                        }`}
                      >
                        {store.storeName}
                      </div>
                      {store.storeDescription && (
                        <div className="mt-0.5 truncate text-xs text-admin-text-subdued">
                          {store.storeDescription}
                        </div>
                      )}
                    </div>
                    {isActive && (
                      <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-admin-text" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="my-1 border-t border-admin-divider" />

            <button type="button" onClick={handleManageStoresClick} className={menuItemClass}>
              <BuildingStorefrontIcon className="h-4 w-4 shrink-0 text-admin-text-secondary" />
              <span>Manage Stores</span>
            </button>

            <button
              type="button"
              onClick={handleLogoutClick}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-[13px] text-red-600 transition-colors hover:bg-red-50"
            >
              <ArrowRightOnRectangleIcon className="h-4 w-4 shrink-0 text-red-500" />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>

      {isManageStoresOpen && (
        <div className={modalOverlayClass} onClick={handleCloseManageStores}>
          <div
            ref={manageStoresModalRef}
            className={`${modalPanelClass} max-w-3xl`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-admin-border px-4 py-3">
              <h2 className="text-[15px] font-semibold text-admin-text">Manage Stores</h2>
              <button
                type="button"
                onClick={handleCloseManageStores}
                className="rounded-lg p-1 text-admin-text-secondary transition-colors hover:bg-admin-row-hover"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <div className="mb-4">
                <button
                  type="button"
                  onClick={handleCreateStoreClick}
                  className={`${adminListPrimaryButtonClass} gap-1.5`}
                >
                  <PlusIcon className="h-4 w-4" />
                  Create New Store
                </button>
              </div>

              <div className="overflow-hidden rounded-xl border border-admin-border">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className={adminListTableHeadRowClass}>
                        <th className={adminListTableHeadClass}>Store Name</th>
                        <th className={adminListTableHeadClass}>Description</th>
                        <th className={adminListTableHeadClass}>Status</th>
                        <th className={adminListTableHeadClass}>Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stores.map((store) => (
                        <tr
                          key={store._id}
                          className="border-b border-admin-divider bg-admin-surface transition-colors last:border-b-0 hover:bg-admin-row-hover"
                        >
                          <td className="px-3 py-2.5">
                            <div className="flex items-center gap-2">
                              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#aeea00] text-xs font-semibold text-black">
                                {getStoreInitials(store.storeName)}
                              </div>
                              <span className="text-[13px] font-medium text-admin-text">
                                {store.storeName}
                              </span>
                            </div>
                          </td>
                          <td className="px-3 py-2.5">
                            <span className="block max-w-[200px] truncate text-[13px] text-admin-text-secondary">
                              {store.storeDescription || '—'}
                            </span>
                          </td>
                          <td className="px-3 py-2.5">
                            <span
                              className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${
                                store._id === activeStoreId
                                  ? 'bg-admin-fill text-admin-text'
                                  : 'bg-admin-secondary text-admin-text-secondary'
                              }`}
                            >
                              {store._id === activeStoreId ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-3 py-2.5">
                            <span className="text-[13px] text-admin-text-secondary">
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

            <div className="flex justify-end border-t border-admin-border px-4 py-3">
              <button
                type="button"
                onClick={handleCloseManageStores}
                className={adminListSecondaryButtonClass}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {isCreateStoreOpen && (
        <div className={modalOverlayClass} onClick={handleCloseCreateStore}>
          <div
            ref={createStoreModalRef}
            className={`${modalPanelClass} max-w-md`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-admin-border px-4 py-3">
              <h2 className="text-[15px] font-semibold text-admin-text">Create New Store</h2>
              <button
                type="button"
                onClick={handleCloseCreateStore}
                className="rounded-lg p-1 text-admin-text-secondary transition-colors hover:bg-admin-row-hover"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-[13px] font-medium text-admin-text">
                    Store Name
                    <span className="ml-1 text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    className={modalInputClass}
                    placeholder="Enter store name"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-[13px] font-medium text-admin-text">
                    Store Description
                    <span className="ml-1 text-red-500">*</span>
                  </label>
                  <textarea
                    value={storeDescription}
                    onChange={(e) => setStoreDescription(e.target.value)}
                    rows={4}
                    className={`${modalInputClass} resize-none`}
                    placeholder="Enter store description"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-admin-border px-4 py-3">
              <button
                type="button"
                onClick={handleCloseCreateStore}
                className={adminListSecondaryButtonClass}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmitCreateStore}
                disabled={!storeName.trim() || !storeDescription.trim() || isSubmitting}
                className={adminListPrimaryButtonClass}
              >
                {isSubmitting ? 'Creating...' : 'Create Store'}
              </button>
            </div>
          </div>
        </div>
      )}

      {isLogoutConfirmOpen && (
        <div className={modalOverlayClass} onClick={handleCloseLogoutConfirm}>
          <div
            ref={logoutConfirmModalRef}
            className={`${modalPanelClass} max-w-md`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b border-admin-border px-4 py-3">
              <h2 className="text-[15px] font-semibold text-admin-text">Confirm Logout</h2>
            </div>

            <div className="px-4 py-4">
              <p className="text-[13px] text-admin-text-secondary">
                Are you sure you want to logout?
              </p>
            </div>

            <div className="flex justify-end gap-2 border-t border-admin-border px-4 py-3">
              <button
                type="button"
                onClick={handleCloseLogoutConfirm}
                className={adminListSecondaryButtonClass}
              >
                No
              </button>
              <button
                type="button"
                onClick={handleConfirmLogout}
                className="inline-flex items-center rounded-lg bg-red-600 px-3 py-1.5 text-[13px] font-semibold text-white transition-colors hover:bg-red-700"
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
