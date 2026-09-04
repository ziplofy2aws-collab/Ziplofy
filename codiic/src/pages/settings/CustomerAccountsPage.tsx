import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomerAccountsManagementCard from '../../components/CustomerAccountsManagementCard';
import SignInLinksCard from '../../components/SignInLinksCard';
import TurnOffSelfServeReturnsModal from '../../components/TurnOffSelfServeReturnsModal';
import { adminListPrimaryButtonClass } from '../../components/admin-list-ui';
import { SettingsHero } from '../../components/settings/SettingsPageScaffold';
import { useCustomerAccountSettings } from '../../contexts/customer-account-settings.context';
import { useStore } from '../../contexts/store.context';

const CustomerAccountsPage: React.FC = () => {
  const navigate = useNavigate();
  const { activeStoreId, stores } = useStore();
  const {
    settings,
    loading,
    error,
    fetchByStoreId,
    update,
  } = useCustomerAccountSettings();
  const [showSignInLinks, setShowSignInLinks] = useState(false);
  const [accountVersion, setAccountVersion] = useState<'recommended' | 'legacy'>('recommended');
  const [selfServeReturns, setSelfServeReturns] = useState(false);
  const [storeCredit, setStoreCredit] = useState(false);
  const [turnOffReturnsModalOpen, setTurnOffReturnsModalOpen] = useState(false);
  const [pendingReturnsValue, setPendingReturnsValue] = useState(false);
  const [accountUrl, setAccountUrl] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saving, setSaving] = useState(false);

  const activeStore = useMemo(
    () => stores.find((store) => store._id === activeStoreId) || null,
    [stores, activeStoreId],
  );

  useEffect(() => {
    if (activeStoreId) {
      fetchByStoreId(activeStoreId).catch(() => {
        // errors handled via context state
      });
    }
  }, [activeStoreId, fetchByStoreId]);

  useEffect(() => {
    if (!settings) {
      setAccountUrl('');
      return;
    }
    setShowSignInLinks(Boolean(settings.showSignInLinks));
    setAccountVersion(settings.accountVersion);
    setSelfServeReturns(Boolean(settings.selfServeReturns));
    setStoreCredit(Boolean(settings.storeCredit));

    const slug =
      activeStore?.storeName
        ? activeStore.storeName.toLowerCase().replace(/[^a-z0-9]+/g, '-')
        : 'store';
    const fallbackUrl = `https://codiic.com/${slug}/account`;
    setAccountUrl(settings.customAccountUrl || fallbackUrl);
  }, [settings, activeStore]);

  useEffect(() => {
    if (!settings) {
      setHasUnsavedChanges(false);
      return;
    }
    const dirty =
      showSignInLinks !== settings.showSignInLinks ||
      accountVersion !== settings.accountVersion ||
      selfServeReturns !== settings.selfServeReturns ||
      storeCredit !== settings.storeCredit;
    setHasUnsavedChanges(dirty);
  }, [settings, showSignInLinks, accountVersion, selfServeReturns, storeCredit]);

  const isControlsDisabled = loading || !settings || saving;

  const handleSave = useCallback(async () => {
    if (!settings?._id) return;
    try {
      setSaving(true);
      await update(settings._id, {
        showSignInLinks,
        accountVersion,
        selfServeReturns,
        storeCredit,
      });
      setHasUnsavedChanges(false);
    } catch (err) {
      // errors handled in context
    } finally {
      setSaving(false);
    }
  }, [settings, showSignInLinks, accountVersion, selfServeReturns, storeCredit, update]);

  const handleShowSignInLinksChange = useCallback((checked: boolean) => {
    setShowSignInLinks(checked);
  }, []);

  const handleAccountVersionChange = useCallback((value: 'recommended' | 'legacy') => {
    setAccountVersion(value);
  }, []);

  const handleSelfServeReturnsChange = useCallback((checked: boolean) => {
    if (selfServeReturns && !checked) {
      setPendingReturnsValue(checked);
      setTurnOffReturnsModalOpen(true);
    } else {
      setSelfServeReturns(checked);
    }
  }, [selfServeReturns]);

  const handleStoreCreditChange = useCallback((checked: boolean) => {
    setStoreCredit(checked);
  }, []);

  const handleCloseModal = useCallback(() => {
    setTurnOffReturnsModalOpen(false);
  }, []);

  const handleConfirmTurnOff = useCallback(() => {
    setSelfServeReturns(pendingReturnsValue);
    setTurnOffReturnsModalOpen(false);
  }, [pendingReturnsValue]);

  const handleNavigateToAuthentication = useCallback(() => {
    navigate('/settings/customer-accounts/authentication');
  }, [navigate]);

  const handleNavigateToDomains = useCallback(() => {
    navigate('/settings/domains');
  }, [navigate]);

  return (
    <div className="w-full">
      <div className="mx-auto flex w-full max-w-[1000px] flex-col gap-6">
        <SettingsHero
          title="Customer accounts"
          description="Configure sign-in options, authentication, and account features."
          actions={
            settings ? (
              <button
                type="button"
                onClick={handleSave}
                disabled={!hasUnsavedChanges || isControlsDisabled}
                className={`${adminListPrimaryButtonClass} min-w-[100px] shrink-0`}
              >
                {saving ? 'Saving...' : 'Save changes'}
              </button>
            ) : undefined
          }
        />

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50/80 px-4 py-3 text-[13px] text-red-800">
            {error}
          </div>
        )}

        <div className="space-y-6">
          <SignInLinksCard
            showSignInLinks={showSignInLinks}
            onShowSignInLinksChange={handleShowSignInLinksChange}
            accountVersion={accountVersion}
            onAccountVersionChange={handleAccountVersionChange}
            isControlsDisabled={isControlsDisabled}
          />

          <CustomerAccountsManagementCard
            accountUrl={accountUrl}
            onNavigateToAuthentication={handleNavigateToAuthentication}
            onNavigateToDomains={handleNavigateToDomains}
            selfServeReturns={selfServeReturns}
            onSelfServeReturnsChange={handleSelfServeReturnsChange}
            storeCredit={storeCredit}
            onStoreCreditChange={handleStoreCreditChange}
            isControlsDisabled={isControlsDisabled}
          />
        </div>

        <TurnOffSelfServeReturnsModal
          open={turnOffReturnsModalOpen}
          onClose={handleCloseModal}
          onConfirm={handleConfirmTurnOff}
        />
      </div>
    </div>
  );
};

export default CustomerAccountsPage;
