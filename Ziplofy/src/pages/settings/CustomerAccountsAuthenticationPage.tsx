import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeftIcon, EllipsisHorizontalIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../contexts/store.context';
import { useCustomerAccountSettings } from '../../contexts/customer-account-settings.context';
import {
  SETTINGS_PAGE_CONTAINER_CLASS,
  SettingsCallout,
  SettingsHero,
  SettingsPanel,
} from '../../components/settings/SettingsPageScaffold';

const CustomerAccountsAuthenticationPage: React.FC = () => {
  const navigate = useNavigate();
  const { activeStoreId } = useStore();
  const {
    settings,
    loading,
    error,
    fetchByStoreId,
    update,
  } = useCustomerAccountSettings();
  const [menuAnchor, setMenuAnchor] = useState<{ element: HTMLElement; id: string } | null>(null);
  const [shopEnabled, setShopEnabled] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (activeStoreId) {
      fetchByStoreId(activeStoreId).catch(() => {});
    }
  }, [activeStoreId, fetchByStoreId]);

  useEffect(() => {
    if (!settings) {
      setShopEnabled(true);
      setHasUnsavedChanges(false);
      return;
    }
    setShopEnabled(Boolean(settings.shopAuth?.enabled));
    setHasUnsavedChanges(false);
  }, [settings]);

  useEffect(() => {
    if (!settings) {
      setHasUnsavedChanges(false);
      return;
    }
    setHasUnsavedChanges(Boolean(settings.shopAuth?.enabled) !== shopEnabled);
  }, [shopEnabled, settings]);

  // Handle click outside menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        menuButtonRef.current &&
        !menuButtonRef.current.contains(event.target as Node)
      ) {
        handleMenuClose();
      }
    };

    if (menuAnchor) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuAnchor]);

  const handleBack = () => {
    navigate('/settings/customer-accounts');
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, id: string) => {
    setMenuAnchor({ element: event.currentTarget, id });
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleTurnOff = () => {
    setShopEnabled(false);
    handleMenuClose();
  };

  const handleTurnOn = () => {
    setShopEnabled(true);
    handleMenuClose();
  };

  const handleSave = async () => {
    if (!settings?._id) return;
    try {
      setSaving(true);
      await update(settings._id, {
        shopAuth: { enabled: shopEnabled },
      });
      setHasUnsavedChanges(false);
    } catch (err) {
      // handled by context
    } finally {
      setSaving(false);
    }
  };

  const isDisabled = loading || saving || !settings;

  const btnPrimary =
    'inline-flex min-w-[100px] items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50';

  return (
    <div className="w-full">
      <div className={SETTINGS_PAGE_CONTAINER_CLASS}>
        <SettingsHero
          title="Authentication"
          description="Manage sign-in options and account access for your customers."
          leading={
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Back
            </button>
          }
          actions={
            settings ? (
              <button
                type="button"
                onClick={handleSave}
                disabled={!hasUnsavedChanges || isDisabled}
                className={btnPrimary}
              >
                {saving ? 'Saving…' : 'Save'}
              </button>
            ) : null
          }
        />

        {error ? (
          <SettingsCallout variant="warning" title="Something went wrong">
            <p className="text-sm text-gray-700">{error}</p>
          </SettingsCallout>
        ) : null}

        <div className="flex flex-col gap-6">
          <SettingsPanel className="ring-1 ring-slate-200/60">
            <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50/90 to-white px-5 py-4 sm:px-6">
              <div className="border-l-4 border-blue-500/75 pl-3">
                <h2 className="text-base font-semibold text-gray-900">Sign-in options</h2>
                <p className="mt-1 text-sm text-gray-500">Control the default Shop sign-in experience.</p>
              </div>
            </div>
            <div className="p-5 sm:p-6">
            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/50 p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-400 flex items-center justify-center">
                  <div
                    className={`w-4 h-4 border-2 border-white border-t-transparent border-r-transparent rounded-full ${
                      shopEnabled ? 'animate-spin' : ''
                    }`}
                  />
                </div>
                <p className="text-sm font-medium text-gray-900">Shop</p>
              </div>
              <div className="flex items-center gap-2">
                {shopEnabled ? (
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-medium border border-gray-200">
                    On
                  </span>
                ) : (
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs font-medium border border-gray-200">
                    Off
                  </span>
                )}
                <div className="relative">
                  <button
                    ref={menuButtonRef}
                    onClick={(e) => handleMenuOpen(e, 'shop')}
                    className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors"
                    disabled={isDisabled}
                  >
                    <EllipsisHorizontalIcon className="w-4 h-4" />
                  </button>
                  {menuAnchor?.id === 'shop' && (
                    <div
                      ref={menuRef}
                      className="absolute right-0 top-full mt-1 bg-white border border-gray-200 z-10 min-w-[120px]"
                    >
                      {shopEnabled ? (
                        <button
                          onClick={handleTurnOff}
                          disabled={isDisabled}
                          className="w-full px-3 py-2 text-left text-xs text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Turn off
                        </button>
                      ) : (
                        <button
                          onClick={handleTurnOn}
                          disabled={isDisabled}
                          className="w-full px-3 py-2 text-left text-xs text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Turn on
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
            </div>
          </SettingsPanel>

          <SettingsPanel className="ring-1 ring-slate-200/60">
            <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50/90 to-white px-5 py-4 sm:px-6">
              <div className="border-l-4 border-blue-500/75 pl-3">
                <h2 className="text-base font-semibold text-gray-900">Available connections</h2>
                <p className="mt-1 text-sm text-gray-500">Link social providers for faster customer sign-in.</p>
              </div>
            </div>
            <div className="space-y-3 p-5 sm:p-6">
              {/* Google */}
              <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <img
                    src="https://www.google.com/favicon.ico"
                    alt="Google"
                    className="w-5 h-5"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                  <p className="text-sm font-medium text-gray-900">Google</p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/settings/customer-accounts/authentication/google')}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-sm transition-colors hover:bg-slate-50"
                >
                  Connect
                </button>
              </div>

              {/* Facebook */}
              <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    f
                  </div>
                  <p className="text-sm font-medium text-gray-900">Facebook</p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/settings/customer-accounts/authentication/facebook')}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-sm transition-colors hover:bg-slate-50"
                >
                  Connect
                </button>
              </div>
            </div>
          </SettingsPanel>
        </div>
      </div>
    </div>
  );
};

export default CustomerAccountsAuthenticationPage;
