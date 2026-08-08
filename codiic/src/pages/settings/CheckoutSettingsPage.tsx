
import {
  ChevronRightIcon,
  EnvelopeIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  PhoneIcon,
  ShoppingCartIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import Modal from '../../components/Modal';
import Tabs from '../../components/Tabs';
import ToggleSwitch from '../../components/ToggleSwitch';
import {
  adminListFooterLinkClass,
  adminListPrimaryButtonClass,
  adminListSecondaryButtonClass,
} from '../../components/admin-list-ui';
import {
  SETTINGS_PAGE_CONTAINER_CLASS,
  SettingsHero,
  SettingsPanel,
} from '../../components/settings/SettingsPageScaffold';
import CheckoutConfigurationsBlock from '../../components/settings/CheckoutConfigurationsBlock';
import { useCheckoutSettings, DEFAULT_CHECKOUT_CUSTOMER_INFORMATION, normalizeCheckoutEmailRegionMode } from '../../contexts/checkout-settings.context';
import { useStoreCheckoutConfigurations } from '../../contexts/store-checkout-configurations.context';
import { useCountries } from '../../contexts/country.context';
import { useStore } from '../../contexts/store.context';

const radioClass =
  'h-4 w-4 shrink-0 border-admin-border text-admin-text focus:ring-2 focus:ring-[#005bd3]/30 focus:ring-offset-0';

const radioClassStart = `${radioClass} mt-0.5`;

const checkboxClass =
  'h-4 w-4 shrink-0 rounded border-admin-border text-admin-text focus:ring-2 focus:ring-[#005bd3]/30 focus:ring-offset-0';

const checkboxClassStart = `${checkboxClass} mt-0.5`;

const sectionHeaderClass = 'border-b border-admin-divider bg-admin-table-header px-5 py-4 sm:px-6';

const inputClass =
  'w-full rounded-lg border border-admin-border bg-admin-surface px-3 py-2 text-sm text-admin-text shadow-inner focus:border-[#005bd3] focus:outline-none focus:ring-2 focus:ring-[#005bd3]/30';

const badgeClass =
  'inline-flex h-5 items-center border border-admin-border bg-admin-fill px-2 py-0.5 text-xs font-medium text-admin-text-secondary';

const panelWarningClass =
  'rounded-xl border border-amber-200/80 bg-amber-50/90 p-4 text-amber-950 shadow-sm';

const preferenceRowClass =
  'cursor-pointer rounded-xl border border-admin-border p-4 transition-colors hover:border-admin-border hover:bg-admin-row-hover';

const CheckoutSettingsPage: React.FC = () => {
  const { countries, total, loading: countriesLoading, getCountries } = useCountries();
  const { activeStoreId, stores } = useStore();
  const { settings, fetchByStoreId, loading: checkoutLoading, update } = useCheckoutSettings();
  const {
    configuration: checkoutConfiguration,
    loading: checkoutConfigurationLoading,
    getByStoreId: fetchCheckoutConfiguration,
    create: createCheckoutConfiguration,
    deleteConfiguration,
  } = useStoreCheckoutConfigurations();
  const [creatingCheckoutConfiguration, setCreatingCheckoutConfiguration] = useState(false);
  const [deletingCheckoutConfiguration, setDeletingCheckoutConfiguration] = useState(false);
  // Customer contact method
  const [contactMethod, setContactMethod] = useState<'phone_or_email' | 'email'>('phone_or_email');
  
  // Order tracking
  const [showOrderTracking, setShowOrderTracking] = useState(true);
  
  // Checkout requirements
  const [requireSignIn, setRequireSignIn] = useState(false);
  const [showWarningAlert, setShowWarningAlert] = useState(true);
  
  // Customer information
  const [fullNameOption, setFullNameOption] = useState<'last_name' | 'first_last'>('last_name');
  const [companyNameOption, setCompanyNameOption] = useState<'dont_include' | 'optional' | 'required'>('dont_include');
  const [showCompanyNameWarning, setShowCompanyNameWarning] = useState(true);
  const [addressLine2Option, setAddressLine2Option] = useState<'dont_include' | 'optional' | 'required'>('optional');
  const [showAddressLine2Warning, setShowAddressLine2Warning] = useState(true);
  const [shippingPhoneOption, setShippingPhoneOption] = useState<'dont_include' | 'optional' | 'required'>('dont_include');
  
  // Marketing options
  const [emailMarketing, setEmailMarketing] = useState(true);
  const [emailRegionOption, setEmailRegionOption] = useState<'codiic_recommended' | 'custom'>('codiic_recommended');
  const [smsMarketing, setSmsMarketing] = useState(true);
  const [editRegionsModalOpen, setEditRegionsModalOpen] = useState(false);
  const [regionTab, setRegionTab] = useState<'all' | 'recommended'>('all');
  const [regionSearch, setRegionSearch] = useState('');
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const stateSnapshotRef = useRef<string>('');

  // Recommended countries (e.g., US)
  const recommendedCountryCodes = ['US'];

  const buildSnapshot = useCallback(
    (data: {
      contactMethod: 'phone_or_email' | 'email';
      showOrderTracking: boolean;
      requireSignIn: boolean;
      emailMarketing: boolean;
      emailRegionOption: 'codiic_recommended' | 'custom';
      smsMarketing: boolean;
      selectedRegions: string[];
      showTipping: boolean;
      presets: Array<string | number>;
      hideTippingUntilChosen: boolean;
      useShippingAsBilling: boolean;
      addToCartLimit: boolean;
      cartLimit: string | number | null;
      useRecommendedLimit: boolean;
      fullNameOption: 'last_name' | 'first_last';
      companyNameOption: 'dont_include' | 'optional' | 'required';
      addressLine2Option: 'dont_include' | 'optional' | 'required';
      shippingPhoneOption: 'dont_include' | 'optional' | 'required';
    }) => {
      return JSON.stringify({
        contactMethod: data.contactMethod,
        showOrderTracking: data.showOrderTracking,
        requireSignIn: data.requireSignIn,
        emailMarketing: data.emailMarketing,
        emailRegionOption: data.emailRegionOption,
        smsMarketing: data.smsMarketing,
        selectedRegions: [...(data.selectedRegions ?? [])].sort(),
        showTipping: data.showTipping,
        presets: data.presets.map((value) => String(value ?? '').trim()),
        hideTippingUntilChosen: data.hideTippingUntilChosen,
        useShippingAsBilling: data.useShippingAsBilling,
        addToCartLimit: data.addToCartLimit,
        cartLimit:
          data.cartLimit === null || data.cartLimit === undefined
            ? ''
            : String(data.cartLimit).trim(),
        useRecommendedLimit: data.useRecommendedLimit,
        fullNameOption: data.fullNameOption,
        companyNameOption: data.companyNameOption,
        addressLine2Option: data.addressLine2Option,
        shippingPhoneOption: data.shippingPhoneOption,
      });
    },
    []
  );

  // Fetch countries when modal opens or search changes
  useEffect(() => {
    if (editRegionsModalOpen) {
      getCountries({ 
        limit: 1000, // Fetch all countries
        q: regionSearch || undefined 
      });
    }
  }, [editRegionsModalOpen, getCountries, regionSearch]);

  useEffect(() => {
    if (!activeStoreId) return;
    fetchByStoreId(activeStoreId).catch((err) => {
      toast.dismiss();
      toast.error(err.message || 'Failed to load checkout settings');
    });
    fetchCheckoutConfiguration(activeStoreId).catch(() => {
      // Block handles empty state; avoid noisy toast on first visit.
    });
  }, [activeStoreId, fetchByStoreId, fetchCheckoutConfiguration]);

  // Tipping
  const [showTipping, setShowTipping] = useState(true);
  const [preset1, setPreset1] = useState('10');
  const [preset2, setPreset2] = useState('15');
  const [preset3, setPreset3] = useState('20');
  const [hideTippingUntilChosen, setHideTippingUntilChosen] = useState(false);
  
  // Add-to-cart limit
  const [addToCartLimit, setAddToCartLimit] = useState(true);
  const [addToCartLimitModalOpen, setAddToCartLimitModalOpen] = useState(false);
  const [cartLimit, setCartLimit] = useState('5');
  const [useRecommendedLimit, setUseRecommendedLimit] = useState(false);

  // Address collection
  const [addressCollectionModalOpen, setAddressCollectionModalOpen] = useState(false);
  const [useShippingAsBilling, setUseShippingAsBilling] = useState(true);

  useEffect(() => {
    if (!settings) return;

    setIsInitializing(true);

    const contactMethodValue = settings.contactMethod ?? 'phone_or_email';
    const orderTrackingEnabled = settings.orderTracking?.enabled ?? true;
    const requireSignInValue = settings.requireSignIn ?? false;
    const emailEnabled = settings.marketing?.email?.enabled ?? true;
    const emailMode = normalizeCheckoutEmailRegionMode(settings.marketing?.email?.regionMode);
    const smsEnabled = settings.marketing?.sms?.enabled ?? false;
    const tippingEnabled = settings.tipping?.enabled ?? false;
    const tippingPresets = settings.tipping?.presets ?? [];
    const hideUntilSelectedValue = settings.tipping?.hideUntilSelected ?? false;
    const addToCartEnabled = settings.addToCartLimit?.enabled ?? false;
    const addToCartLimitValue =
      settings.addToCartLimit?.limit !== undefined && settings.addToCartLimit?.limit !== null
        ? settings.addToCartLimit?.limit
        : '';
    const addToCartUseRecommended = settings.addToCartLimit?.useRecommended ?? true;
    const useShippingAsBillingValue = settings.addressCollection?.useShippingAsBilling ?? true;
    const regionIds = settings.emailSelectedRegionIds ?? [];
    const customerInfo = {
      ...DEFAULT_CHECKOUT_CUSTOMER_INFORMATION,
      ...(settings.customerInformation ?? {}),
    };

    setContactMethod(contactMethodValue);
    setShowOrderTracking(orderTrackingEnabled);
    setRequireSignIn(requireSignInValue);
    setShowWarningAlert(requireSignInValue);
    setEmailMarketing(emailEnabled);
    setEmailRegionOption(emailMode);
    setSmsMarketing(smsEnabled);
    setSelectedRegions(regionIds);
    setShowTipping(tippingEnabled);
    setPreset1(tippingPresets[0] !== undefined ? String(tippingPresets[0]) : '10');
    setPreset2(tippingPresets[1] !== undefined ? String(tippingPresets[1]) : '15');
    setPreset3(tippingPresets[2] !== undefined ? String(tippingPresets[2]) : '20');
    setHideTippingUntilChosen(hideUntilSelectedValue);
    setUseShippingAsBilling(useShippingAsBillingValue);
    setAddToCartLimit(addToCartEnabled);
    setCartLimit(
      addToCartLimitValue === ''
        ? ''
        : typeof addToCartLimitValue === 'number'
        ? String(addToCartLimitValue)
        : addToCartLimitValue
    );
    setUseRecommendedLimit(addToCartUseRecommended);
    setFullNameOption(customerInfo.fullNameOption);
    setCompanyNameOption(customerInfo.companyNameOption);
    setAddressLine2Option(customerInfo.addressLine2Option);
    setShippingPhoneOption(customerInfo.shippingPhoneOption);

    const initialSnapshot = buildSnapshot({
      contactMethod: contactMethodValue,
      showOrderTracking: orderTrackingEnabled,
      requireSignIn: requireSignInValue,
      emailMarketing: emailEnabled,
      emailRegionOption: emailMode,
      smsMarketing: smsEnabled,
      selectedRegions: regionIds,
      showTipping: tippingEnabled,
      presets: tippingPresets,
      hideTippingUntilChosen: hideUntilSelectedValue,
      useShippingAsBilling: useShippingAsBillingValue,
      addToCartLimit: addToCartEnabled,
      cartLimit: addToCartLimitValue,
      useRecommendedLimit: addToCartUseRecommended,
      fullNameOption: customerInfo.fullNameOption,
      companyNameOption: customerInfo.companyNameOption,
      addressLine2Option: customerInfo.addressLine2Option,
      shippingPhoneOption: customerInfo.shippingPhoneOption,
    });

    stateSnapshotRef.current = initialSnapshot;
    setIsDirty(false);

    const timeout = window.setTimeout(() => {
      setIsInitializing(false);
    }, 0);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [
    settings,
    buildSnapshot,
  ]);

  const handleSave = useCallback(async () => {
    if (!settings || !settings._id) return;

    const parsePreset = (value: string) => {
      const trimmed = value.trim();
      if (!trimmed) return 0;
      const num = Number(trimmed);
      return Number.isNaN(num) || num < 0 ? 0 : num;
    };

    const presets = [preset1, preset2, preset3].map(parsePreset);
    const parsedLimit = Number(cartLimit);
    const limitValue = cartLimit.trim() === '' || Number.isNaN(parsedLimit) ? null : parsedLimit;

    const payload = {
      contactMethod,
      orderTracking: { enabled: showOrderTracking },
      requireSignIn,
      marketing: {
        email: {
          enabled: emailMarketing,
          regionMode: emailRegionOption,
        },
        sms: {
          enabled: smsMarketing,
        },
      },
      tipping: {
        enabled: showTipping,
        presets,
        hideUntilSelected: hideTippingUntilChosen,
      },
      checkoutLanguage: settings.checkoutLanguage ?? 'English',
      addressCollection: {
        useShippingAsBilling,
      },
      addToCartLimit: {
        enabled: addToCartLimit,
        limit: limitValue,
        useRecommended: useRecommendedLimit,
      },
      customerInformation: {
        fullNameOption,
        companyNameOption,
        addressLine2Option,
        shippingPhoneOption,
      },
      emailSelectedRegionIds: selectedRegions,
    } as const;

    try {
      setIsSaving(true);
      toast.dismiss();
      await update(settings._id, payload);
      toast.dismiss();
      toast.success('Checkout settings saved');
      stateSnapshotRef.current = buildSnapshot({
        contactMethod,
        showOrderTracking,
        requireSignIn,
        emailMarketing,
        emailRegionOption,
        smsMarketing,
        selectedRegions,
        showTipping,
        presets,
        hideTippingUntilChosen,
        useShippingAsBilling,
        addToCartLimit,
        cartLimit: limitValue,
        useRecommendedLimit,
        fullNameOption,
        companyNameOption,
        addressLine2Option,
        shippingPhoneOption,
      });
      setIsDirty(false);
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Failed to save checkout settings';
      toast.dismiss();
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  }, [
    settings,
    contactMethod,
    showOrderTracking,
    requireSignIn,
    emailMarketing,
    emailRegionOption,
    smsMarketing,
    showTipping,
    hideTippingUntilChosen,
    useShippingAsBilling,
    addToCartLimit,
    cartLimit,
    useRecommendedLimit,
    selectedRegions,
    preset1,
    preset2,
    preset3,
    update,
    buildSnapshot,
    fullNameOption,
    companyNameOption,
    addressLine2Option,
    shippingPhoneOption,
  ]);

  useEffect(() => {
    if (isInitializing) return;
    const snapshot = buildSnapshot({
      contactMethod,
      showOrderTracking,
      requireSignIn,
      emailMarketing,
      emailRegionOption,
      smsMarketing,
      selectedRegions,
      showTipping,
      presets: [preset1, preset2, preset3],
      hideTippingUntilChosen,
      useShippingAsBilling,
      addToCartLimit,
      cartLimit,
      useRecommendedLimit,
      fullNameOption,
      companyNameOption,
      addressLine2Option,
      shippingPhoneOption,
    });
    setIsDirty(snapshot !== stateSnapshotRef.current);
  }, [
    buildSnapshot,
    isInitializing,
    contactMethod,
    showOrderTracking,
    requireSignIn,
    emailMarketing,
    emailRegionOption,
    smsMarketing,
    selectedRegions,
    showTipping,
    preset1,
    preset2,
    preset3,
    hideTippingUntilChosen,
    useShippingAsBilling,
    addToCartLimit,
    cartLimit,
    useRecommendedLimit,
    fullNameOption,
    companyNameOption,
    addressLine2Option,
    shippingPhoneOption,
  ]);

  const handleContactMethodChange = useCallback((value: 'phone_or_email' | 'email') => {
    setContactMethod(value);
  }, []);

  const handleShowOrderTrackingChange = useCallback((checked: boolean) => {
    setShowOrderTracking(checked);
  }, []);

  const handleRequireSignInChange = useCallback((checked: boolean) => {
    setRequireSignIn(checked);
    if (checked) {
      setShowWarningAlert(true);
    }
  }, []);

  const persistCustomerInformation = useCallback(
    async (next: {
      fullNameOption: 'last_name' | 'first_last';
      companyNameOption: 'dont_include' | 'optional' | 'required';
      addressLine2Option: 'dont_include' | 'optional' | 'required';
      shippingPhoneOption: 'dont_include' | 'optional' | 'required';
    }) => {
      if (!settings?._id || isInitializing || checkoutLoading) return;

      if (!/^[a-f\d]{24}$/i.test(settings._id)) {
        toast.error('Checkout settings are still loading. Please try again.');
        return;
      }

      try {
        await update(settings._id, { customerInformation: next });
        stateSnapshotRef.current = buildSnapshot({
          contactMethod,
          showOrderTracking,
          requireSignIn,
          emailMarketing,
          emailRegionOption,
          smsMarketing,
          selectedRegions,
          showTipping,
          presets: [preset1, preset2, preset3],
          hideTippingUntilChosen,
          useShippingAsBilling,
          addToCartLimit,
          cartLimit,
          useRecommendedLimit,
          ...next,
        });
        setIsDirty(false);
      } catch (err: any) {
        const message =
          err?.response?.data?.error ||
          err?.response?.data?.message ||
          err?.message ||
          'Failed to save customer information';
        toast.dismiss();
        toast.error(message);
      }
    },
    [
      settings?._id,
      isInitializing,
      checkoutLoading,
      update,
      buildSnapshot,
      contactMethod,
      showOrderTracking,
      requireSignIn,
      emailMarketing,
      emailRegionOption,
      smsMarketing,
      selectedRegions,
      showTipping,
      preset1,
      preset2,
      preset3,
      hideTippingUntilChosen,
      useShippingAsBilling,
      addToCartLimit,
      cartLimit,
      useRecommendedLimit,
    ]
  );

  const handleFullNameOptionChange = useCallback(
    (value: 'last_name' | 'first_last') => {
      setFullNameOption(value);
      void persistCustomerInformation({
        fullNameOption: value,
        companyNameOption,
        addressLine2Option,
        shippingPhoneOption,
      });
    },
    [companyNameOption, addressLine2Option, shippingPhoneOption, persistCustomerInformation]
  );

  const handleCompanyNameOptionChange = useCallback(
    (value: 'dont_include' | 'optional' | 'required') => {
      setCompanyNameOption(value);
      if (value === 'required') {
        setShowCompanyNameWarning(true);
      }
      void persistCustomerInformation({
        fullNameOption,
        companyNameOption: value,
        addressLine2Option,
        shippingPhoneOption,
      });
    },
    [fullNameOption, addressLine2Option, shippingPhoneOption, persistCustomerInformation]
  );

  const handleAddressLine2OptionChange = useCallback(
    (value: 'dont_include' | 'optional' | 'required') => {
      setAddressLine2Option(value);
      if (value === 'required') {
        setShowAddressLine2Warning(true);
      }
      void persistCustomerInformation({
        fullNameOption,
        companyNameOption,
        addressLine2Option: value,
        shippingPhoneOption,
      });
    },
    [fullNameOption, companyNameOption, shippingPhoneOption, persistCustomerInformation]
  );

  const handleShippingPhoneOptionChange = useCallback(
    (value: 'dont_include' | 'optional' | 'required') => {
      setShippingPhoneOption(value);
      void persistCustomerInformation({
        fullNameOption,
        companyNameOption,
        addressLine2Option,
        shippingPhoneOption: value,
      });
    },
    [fullNameOption, companyNameOption, addressLine2Option, persistCustomerInformation]
  );

  const handleEmailMarketingChange = useCallback((checked: boolean) => {
    setEmailMarketing(checked);
  }, []);

  const handleEmailRegionOptionChange = useCallback((value: 'codiic_recommended' | 'custom') => {
    setEmailRegionOption(value);
  }, []);

  const handleSmsMarketingChange = useCallback((checked: boolean) => {
    setSmsMarketing(checked);
  }, []);

  const handleShowTippingChange = useCallback((checked: boolean) => {
    setShowTipping(checked);
  }, []);

  const handleHideTippingUntilChosenChange = useCallback((checked: boolean) => {
    setHideTippingUntilChosen(checked);
  }, []);

  const handleAddToCartLimitChange = useCallback(
    async (checked: boolean) => {
      const previous = addToCartLimit;
      setAddToCartLimit(checked);
      if (!settings?._id) return;

      try {
        await update(settings._id, {
          addToCartLimit: {
            enabled: checked,
            limit: settings.addToCartLimit?.limit ?? null,
            useRecommended: settings.addToCartLimit?.useRecommended ?? true,
          },
        });
        toast.success(checked ? 'Add-to-cart limit enabled' : 'Add-to-cart limit disabled');
      } catch (err: any) {
        setAddToCartLimit(previous);
        toast.error(
          err?.response?.data?.message || err?.message || 'Failed to update add-to-cart limit'
        );
      }
    },
    [addToCartLimit, settings, update]
  );

  const handleUseShippingAsBillingChange = useCallback((checked: boolean) => {
    setUseShippingAsBilling(checked);
  }, []);

  const handleUseRecommendedLimitChange = useCallback((checked: boolean) => {
    setUseRecommendedLimit(checked);
  }, []);

  const handleSaveAddToCartLimit = useCallback(async () => {
    if (!settings?._id) return;

    const parsedLimit = Number(cartLimit);
    if (
      !useRecommendedLimit &&
      (!Number.isInteger(parsedLimit) || parsedLimit < 1)
    ) {
      toast.error('Enter a whole-number cart limit of at least 1');
      return;
    }

    try {
      setIsSaving(true);
      await update(settings._id, {
        addToCartLimit: {
          enabled: addToCartLimit,
          limit: useRecommendedLimit ? 50 : parsedLimit,
          useRecommended: useRecommendedLimit,
        },
      });
      toast.success('Add-to-cart limit saved and synced to your store');
      setAddToCartLimitModalOpen(false);
    } catch (err: any) {
      const message =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        'Failed to save add-to-cart limit';
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  }, [settings, cartLimit, useRecommendedLimit, update, addToCartLimit]);

  const handleRegionTabChange = useCallback((tabId: string) => {
    setRegionTab(tabId as 'all' | 'recommended');
  }, []);

  const handleSelectAllRegions = useCallback((checked: boolean) => {
    if (checked) {
      setSelectedRegions(countries.map((c) => c._id));
    } else {
      setSelectedRegions([]);
    }
  }, [countries]);

  const handleRegionToggle = useCallback((countryId: string, checked: boolean) => {
    if (checked) {
      setSelectedRegions((prev) => [...prev, countryId]);
    } else {
      setSelectedRegions((prev) => prev.filter((id) => id !== countryId));
    }
  }, []);

  const regionTabs = useMemo(() => [
    { id: 'all', label: 'All' },
    { id: 'recommended', label: 'Recommended' },
  ], []);

  const filteredCountries = useMemo(() => {
    return countries.filter((country) => {
      if (regionTab === 'recommended' && !recommendedCountryCodes.includes(country.iso2)) {
        return false;
      }
      return true;
    });
  }, [countries, regionTab, recommendedCountryCodes]);

  const isAllRegionsSelected = useMemo(() => {
    return countries.length > 0 && selectedRegions.length === countries.length;
  }, [countries.length, selectedRegions.length]);

  const isSomeRegionsSelected = useMemo(() => {
    return selectedRegions.length > 0 && selectedRegions.length < countries.length;
  }, [selectedRegions.length, countries.length]);

  const activeStoreName = useMemo(() => {
    if (!activeStoreId) return 'My Store';
    return stores.find((store) => store._id === activeStoreId)?.storeName || 'My Store';
  }, [activeStoreId, stores]);

  const handleCreateCheckoutConfiguration = useCallback(async () => {
    if (!activeStoreId) {
      toast.error('Select a store first');
      return;
    }
    setCreatingCheckoutConfiguration(true);
    try {
      await createCheckoutConfiguration({
        storeId: activeStoreId,
        checkoutConfig: {},
      });
      toast.success('Checkout configuration created');
    } catch (err: unknown) {
      toast.error((err as Error)?.message || 'Failed to create checkout configuration');
    } finally {
      setCreatingCheckoutConfiguration(false);
    }
  }, [activeStoreId, createCheckoutConfiguration]);

  const handleDeleteCheckoutConfiguration = useCallback(async () => {
    if (!checkoutConfiguration?._id) return;
    if (!window.confirm('Delete this checkout configuration? This cannot be undone.')) return;
    setDeletingCheckoutConfiguration(true);
    try {
      await deleteConfiguration(checkoutConfiguration._id);
      toast.success('Checkout configuration deleted');
    } catch (err: unknown) {
      toast.error((err as Error)?.message || 'Failed to delete checkout configuration');
    } finally {
      setDeletingCheckoutConfiguration(false);
    }
  }, [checkoutConfiguration?._id, deleteConfiguration]);

  const handleEditCheckoutConfiguration = useCallback(() => {
    if (!checkoutConfiguration?._id) return;
    const url = new URL(
      `/themes/editor/checkout/${checkoutConfiguration._id}`,
      window.location.origin
    );
    window.open(url.toString(), '_blank', 'noopener,noreferrer');
  }, [checkoutConfiguration?._id]);

  return (
    <div className="w-full">
      <div className={SETTINGS_PAGE_CONTAINER_CLASS}>
        <SettingsHero
          title="Checkout"
          description="Manage contact, marketing, and advanced checkout preferences."
          tip="Saved changes apply to new checkout sessions. Some options also affect order notifications."
          actions={
            isDirty ? (
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving || checkoutLoading || !settings}
                className={adminListPrimaryButtonClass}
              >
                {isSaving ? 'Saving…' : 'Save changes'}
              </button>
            ) : undefined
          }
        />

        <SettingsPanel>
          <CheckoutConfigurationsBlock
            storeName={activeStoreName}
            configuration={checkoutConfiguration}
            loading={checkoutConfigurationLoading}
            creating={creatingCheckoutConfiguration}
            deleting={deletingCheckoutConfiguration}
            onCreate={handleCreateCheckoutConfiguration}
            onEdit={handleEditCheckoutConfiguration}
            onDelete={handleDeleteCheckoutConfiguration}
          />
        </SettingsPanel>

        <SettingsPanel>
          <div className={sectionHeaderClass}>
            <h2 className="text-[13px] font-semibold text-admin-text">Contact &amp; checkout</h2>
            <p className="mt-1 text-[13px] text-admin-text-secondary">
              How customers reach you, order tracking links, and sign-in requirements.
            </p>
          </div>
          <div className="p-5 sm:p-6">
          <div className="mb-6">
          <div className="mb-3 flex items-center gap-1.5">
            <h3 className="text-sm font-semibold text-admin-text">Customer contact method</h3>
            <InformationCircleIcon className="h-4 w-4 text-admin-text-subdued" title="Contact method help" />
          </div>
          <p className="mb-4 text-sm text-admin-text-secondary">
            The contact method customers enter at checkout will receive order and shipping{' '}
            <button type="button" className={`${adminListFooterLinkClass} font-medium`}>
              notifications
            </button>
            .
          </p>
        <div className="space-y-4">
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="radio"
              name="contactMethod"
              value="phone_or_email"
              checked={contactMethod === 'phone_or_email'}
              onChange={(e) => handleContactMethodChange(e.target.value as 'phone_or_email' | 'email')}
              className={radioClassStart}
            />
            <div className="flex-1">
              <p className="text-sm font-medium text-admin-text">Phone number or email</p>
              {contactMethod === 'phone_or_email' && (
                <p className="mt-1 text-xs text-admin-text-secondary">
                  An{' '}
                  <button type="button" className={`${adminListFooterLinkClass} font-medium`}>
                    SMS App
                  </button>{' '}
                  is required to send SMS updates
                </p>
              )}
            </div>
          </label>
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="radio"
              name="contactMethod"
              value="email"
              checked={contactMethod === 'email'}
              onChange={(e) => handleContactMethodChange(e.target.value as 'phone_or_email' | 'email')}
              className={radioClassStart}
            />
            <p className="text-sm font-medium text-admin-text">Email</p>
          </label>
        </div>
          </div>

        <div className="my-8 border-t border-admin-divider" />

        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={showOrderTracking}
            onChange={(e) => handleShowOrderTrackingChange(e.target.checked)}
            className={checkboxClassStart}
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-admin-text">
              Show a link for customers to track their order with{' '}
              <button type="button" className={`${adminListFooterLinkClass} font-medium`}>
                codiic
              </button>
            </p>
            <p className="mt-1 text-xs text-admin-text-secondary">
              Customers will be able to download the app from the order status page
            </p>
          </div>
        </label>

        <div className="my-8 border-t border-admin-divider" />

        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={requireSignIn}
            onChange={(e) => handleRequireSignInChange(e.target.checked)}
            className={checkboxClassStart}
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-admin-text">
              Require customers to sign in to their account before checkout
            </p>
            <p className="mt-1 text-xs text-admin-text-secondary">
              Customers can only use email when sign-in is required
            </p>
          </div>
        </label>

        {requireSignIn && showWarningAlert && (
          <div className={`${panelWarningClass} mt-4`}>
            <div className="flex items-start gap-2">
              <ExclamationTriangleIcon className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
              <div className="min-w-0 flex-1">
                <p className="text-xs leading-relaxed text-amber-950/90">
                  Requiring a sign-in may discourage some customers from checking out and reduce your store&apos;s total orders. To manage the current sign-in experience, go to{' '}
                  <button type="button" className="font-semibold text-amber-950 underline decoration-amber-800/40 hover:no-underline">
                    customer accounts settings
                  </button>
                  .
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowWarningAlert(false)}
                className="shrink-0 text-amber-800/80 transition-colors hover:text-amber-950"
                aria-label="Dismiss"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
          </div>
        </SettingsPanel>

        <SettingsPanel>
          <div className={sectionHeaderClass}>
            <h2 className="text-[13px] font-semibold text-admin-text">Customer information</h2>
            <p className="mt-1 text-[13px] text-admin-text-secondary">Fields collected during checkout for shipping and identity.</p>
          </div>
          <div className="p-5 sm:p-6">

          {/* Full name */}
          <div className="mb-4">
            <p className="text-xs text-admin-text-secondary mb-2 font-medium">Full name</p>
            <div className="space-y-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="fullNameOption"
                  value="last_name"
                  checked={fullNameOption === 'last_name'}
                  onChange={(e) => handleFullNameOptionChange(e.target.value as 'last_name' | 'first_last')}
                  className={radioClass}
                />
                <p className="text-sm text-admin-text">Only require last name</p>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="fullNameOption"
                  value="first_last"
                  checked={fullNameOption === 'first_last'}
                  onChange={(e) => handleFullNameOptionChange(e.target.value as 'last_name' | 'first_last')}
                  className={radioClass}
                />
                <p className="text-sm text-admin-text">Require first and last name</p>
              </label>
            </div>
          </div>

          {/* Company name */}
          <div className="mb-4">
            <p className="text-xs text-admin-text-secondary mb-2 font-medium">Company name</p>
            <div className="space-y-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="companyNameOption"
                  value="dont_include"
                  checked={companyNameOption === 'dont_include'}
                  onChange={(e) => handleCompanyNameOptionChange(e.target.value as 'dont_include' | 'optional' | 'required')}
                  className={radioClass}
                />
                <div className="flex items-center gap-2">
                  <p className="text-sm text-admin-text">Don't include</p>
                  <span className={badgeClass}>
                    Recommended
                  </span>
                </div>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="companyNameOption"
                  value="optional"
                  checked={companyNameOption === 'optional'}
                  onChange={(e) => handleCompanyNameOptionChange(e.target.value as 'dont_include' | 'optional' | 'required')}
                  className={radioClass}
                />
                <p className="text-sm text-admin-text">Optional</p>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="companyNameOption"
                  value="required"
                  checked={companyNameOption === 'required'}
                  onChange={(e) => handleCompanyNameOptionChange(e.target.value as 'dont_include' | 'optional' | 'required')}
                  className={radioClass}
                />
                <p className="text-sm text-admin-text">Required</p>
              </label>
            </div>

            {/* Warning Alert for Company name */}
            {companyNameOption === 'required' && showCompanyNameWarning && (
              <div className={`${panelWarningClass} mt-3`}>
                <div className="flex items-start gap-2">
                  <ExclamationTriangleIcon className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs leading-relaxed text-amber-950/90">
                      Requiring a company name may prevent some customers from checking out and reduce your store&apos;s total orders
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowCompanyNameWarning(false)}
                    className="shrink-0 text-amber-800/80 transition-colors hover:text-amber-950"
                    aria-label="Dismiss"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Address line 2 */}
          <div className="mb-4">
            <p className="text-xs text-admin-text-secondary mb-2 font-medium">Address line 2 (apartment, unit, etc.)</p>
            <div className="space-y-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="addressLine2Option"
                  value="dont_include"
                  checked={addressLine2Option === 'dont_include'}
                  onChange={(e) => handleAddressLine2OptionChange(e.target.value as 'dont_include' | 'optional' | 'required')}
                  className={radioClass}
                />
                <p className="text-sm text-admin-text">Don't include</p>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="addressLine2Option"
                  value="optional"
                  checked={addressLine2Option === 'optional'}
                  onChange={(e) => handleAddressLine2OptionChange(e.target.value as 'dont_include' | 'optional' | 'required')}
                  className={radioClass}
                />
                <div className="flex items-center gap-2">
                  <p className="text-sm text-admin-text">Optional</p>
                  <span className={badgeClass}>
                    Recommended
                  </span>
                </div>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="addressLine2Option"
                  value="required"
                  checked={addressLine2Option === 'required'}
                  onChange={(e) => handleAddressLine2OptionChange(e.target.value as 'dont_include' | 'optional' | 'required')}
                  className={radioClass}
                />
                <p className="text-sm text-admin-text">Required</p>
              </label>
            </div>

            {/* Warning Alert for Address line 2 */}
            {addressLine2Option === 'required' && showAddressLine2Warning && (
              <div className={`${panelWarningClass} mt-3`}>
                <div className="flex items-start gap-2">
                  <ExclamationTriangleIcon className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs leading-relaxed text-amber-950/90">
                      Requiring an address line 2 may prevent some customers from checking out and reduce your store&apos;s total orders
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAddressLine2Warning(false)}
                    className="shrink-0 text-amber-800/80 transition-colors hover:text-amber-950"
                    aria-label="Dismiss"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Shipping address phone number */}
          <div>
            <p className="text-xs text-admin-text-secondary mb-2 font-medium">Shipping address phone number</p>
            <div className="space-y-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="shippingPhoneOption"
                  value="dont_include"
                  checked={shippingPhoneOption === 'dont_include'}
                  onChange={(e) => handleShippingPhoneOptionChange(e.target.value as 'dont_include' | 'optional' | 'required')}
                  className={radioClass}
                />
                <p className="text-sm text-admin-text">Don't include</p>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="shippingPhoneOption"
                  value="optional"
                  checked={shippingPhoneOption === 'optional'}
                  onChange={(e) => handleShippingPhoneOptionChange(e.target.value as 'dont_include' | 'optional' | 'required')}
                  className={radioClass}
                />
                <p className="text-sm text-admin-text">Optional</p>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="shippingPhoneOption"
                  value="required"
                  checked={shippingPhoneOption === 'required'}
                  onChange={(e) => handleShippingPhoneOptionChange(e.target.value as 'dont_include' | 'optional' | 'required')}
                  className={radioClass}
                />
                <p className="text-sm text-admin-text">Required</p>
              </label>
            </div>
          </div>
          </div>
        </SettingsPanel>

        <SettingsPanel>
          <div className={sectionHeaderClass}>
            <h2 className="text-[13px] font-semibold text-admin-text">Marketing options</h2>
            <p className="mt-1 text-[13px] text-admin-text-secondary">
              Email and SMS opt-in checkboxes shown during checkout.
            </p>
          </div>
          <div className="p-5 sm:p-6">
          {/* Email Marketing Section */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <EnvelopeIcon className="w-4 h-4 text-admin-text-secondary" />
                <p className="text-sm font-medium text-admin-text">Email</p>
              </div>
              <ToggleSwitch
                checked={emailMarketing}
                onChange={handleEmailMarketingChange}
              />
            </div>
            {emailMarketing && (
              <>
                <p className="text-xs text-admin-text-secondary mb-3">
                  You can choose to display a preselected checkbox in certain regions.
                </p>
                <div className="flex gap-3">
                  <div
                    onClick={() => handleEmailRegionOptionChange('codiic_recommended')}
                    className={`flex-1 cursor-pointer rounded-xl border p-3 transition-colors ${
                      emailRegionOption === 'codiic_recommended'
                        ? 'border-[#005bd3] ring-1 ring-[#005bd3]/30'
                        : 'border-admin-border hover:border-admin-border hover:bg-admin-row-hover'
                    }`}
                  >
                    <label className="flex items-start gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="emailRegionOption"
                        value="codiic_recommended"
                        checked={emailRegionOption === 'codiic_recommended'}
                        onChange={(e) => handleEmailRegionOptionChange(e.target.value as 'codiic_recommended' | 'custom')}
                        className={radioClassStart}
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-admin-text mb-1">
                          Regions recommended by codiic
                        </p>
                        <p className="text-xs text-admin-text-secondary mb-1">United States only</p>
                        <span className={badgeClass}>
                          Automated
                        </span>
                      </div>
                    </label>
                  </div>
                  <div
                    onClick={() => handleEmailRegionOptionChange('custom')}
                    className={`flex-1 cursor-pointer rounded-xl border p-3 transition-colors ${
                      emailRegionOption === 'custom'
                        ? 'border-[#005bd3] ring-1 ring-[#005bd3]/30'
                        : 'border-admin-border hover:border-admin-border hover:bg-admin-row-hover'
                    }`}
                  >
                    <label className="flex items-start gap-2 cursor-pointer w-full">
                      <input
                        type="radio"
                        name="emailRegionOption"
                        value="custom"
                        checked={emailRegionOption === 'custom'}
                        onChange={(e) => handleEmailRegionOptionChange(e.target.value as 'codiic_recommended' | 'custom')}
                        className={radioClassStart}
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-admin-text mb-1">
                          Regions you choose
                        </p>
                        <p className="text-xs text-admin-text-secondary mb-1">
                          {selectedRegions.length === 0 ? 'None selected' : `${selectedRegions.length} selected`}
                        </p>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditRegionsModalOpen(true);
                          }}
                          className={`cursor-pointer text-xs font-medium ${adminListFooterLinkClass}`}
                        >
                          Edit
                        </button>
                      </div>
                    </label>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* SMS Marketing Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <PhoneIcon className="w-4 h-4 text-admin-text-secondary" />
                <p className="text-sm font-medium text-admin-text">SMS</p>
              </div>
              <ToggleSwitch
                checked={smsMarketing}
                onChange={handleSmsMarketingChange}
              />
            </div>
            {smsMarketing && (
              <p className="text-xs text-admin-text-secondary">
                To launch SMS campaigns, you need to install an{' '}
                <button type="button" className={`${adminListFooterLinkClass} font-medium`}>
                  SMS App
                </button>
                .
              </p>
            )}
          </div>
          </div>
        </SettingsPanel>

        <SettingsPanel>
          <div className={sectionHeaderClass}>
            <h2 className="text-[13px] font-semibold text-admin-text">Tipping</h2>
            <p className="mt-1 text-[13px] text-admin-text-secondary">
              Optional tip presets and visibility before customers add a tip.
            </p>
          </div>
          <div className="p-5 sm:p-6">
          <label className={`flex cursor-pointer items-center gap-3 ${showTipping ? 'mb-4' : ''}`}>
            <input
              type="checkbox"
              checked={showTipping}
              onChange={(e) => handleShowTippingChange(e.target.checked)}
              className={checkboxClass}
            />
            <p className="text-sm font-medium text-admin-text">
              Show tipping options at checkout
            </p>
          </label>

          {/* Preset tip percentages */}
          {showTipping && (
            <div className="mb-4">
              <div className="flex gap-3 items-center">
                <div className="flex-1">
                  <p className="text-xs text-admin-text-secondary mb-1">Preset 1</p>
                  <div className="relative">
                    <input
                      type="text"
                      value={preset1}
                      onChange={(e) => setPreset1(e.target.value)}
                      className={`${inputClass} pr-8`}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-admin-text-subdued">%</span>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-xs text-admin-text-secondary mb-1">Preset 2</p>
                  <div className="relative">
                    <input
                      type="text"
                      value={preset2}
                      onChange={(e) => setPreset2(e.target.value)}
                      className={`${inputClass} pr-8`}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-admin-text-subdued">%</span>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-xs text-admin-text-secondary mb-1">Preset 3</p>
                  <div className="relative">
                    <input
                      type="text"
                      value={preset3}
                      onChange={(e) => setPreset3(e.target.value)}
                      className={`${inputClass} pr-8`}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-admin-text-subdued">%</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Hide tipping options checkbox */}
          {showTipping && (
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={hideTippingUntilChosen}
                onChange={(e) => handleHideTippingUntilChosenChange(e.target.checked)}
                className={checkboxClass}
              />
              <p className="text-sm font-medium text-admin-text">
                Hide tipping options until customers choose to add a tip
              </p>
            </label>
          )}
          </div>
        </SettingsPanel>

        <SettingsPanel>
          <div className={sectionHeaderClass}>
            <h2 className="text-[13px] font-semibold text-admin-text">Checkout language</h2>
            <p className="mt-1 text-[13px] text-admin-text-secondary">Locale shown to customers during checkout (read-only for now).</p>
          </div>
          <div className="p-5 sm:p-6">
          <div className="rounded-xl border border-admin-border bg-admin-fill/50 p-3">
            <input
              type="text"
              value="English"
              disabled
              className="w-full cursor-not-allowed rounded-lg border border-admin-border bg-admin-surface px-3 py-2 text-sm text-admin-text-subdued"
            />
          </div>
          </div>
        </SettingsPanel>

        <SettingsPanel>
          <div className={sectionHeaderClass}>
            <h2 className="text-[13px] font-semibold text-admin-text">Advanced preferences</h2>
            <p className="mt-1 text-[13px] text-admin-text-secondary">Address collection and cart quantity limits.</p>
          </div>
          <div className="space-y-3 p-5 sm:p-6">
          <div
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setAddressCollectionModalOpen(true);
              }
            }}
            onClick={() => setAddressCollectionModalOpen(true)}
            className={preferenceRowClass}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <MapPinIcon className="h-5 w-5 shrink-0 text-admin-text-secondary" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-admin-text mb-1">Address collection</p>
                  <p className="text-xs text-admin-text-secondary">
                    Manage how you collect shipping and billing addresses
                  </p>
                </div>
              </div>
              <ChevronRightIcon className="h-4 w-4 shrink-0 text-admin-text-subdued" />
            </div>
          </div>

          <div
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setAddToCartLimitModalOpen(true);
              }
            }}
            onClick={() => setAddToCartLimitModalOpen(true)}
            className={preferenceRowClass}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <ShoppingCartIcon className="h-5 w-5 shrink-0 text-admin-text-secondary" />
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium text-admin-text">Add-to-cart limit</p>
                    <span className={badgeClass}>
                      Recommended
                    </span>
                  </div>
                  <p className="text-xs text-admin-text-secondary">
                    Protects your available inventory quantities from being revealed
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <div onClick={(e) => e.stopPropagation()} className="inline-flex">
                  <ToggleSwitch checked={addToCartLimit} onChange={handleAddToCartLimitChange} />
                </div>
                <ChevronRightIcon className="h-4 w-4 text-admin-text-subdued" />
              </div>
            </div>
          </div>
          </div>
        </SettingsPanel>

        <SettingsPanel>
          <div className={sectionHeaderClass}>
            <h2 className="text-[13px] font-semibold text-admin-text">Checkout rules</h2>
            <p className="mt-1 text-[13px] text-admin-text-secondary">
              App-based rules for cart behavior, limits, and verification.
            </p>
          </div>
          <div className="p-5 sm:p-6">
          <p className="text-sm text-admin-text-secondary">
            Rules set parameters for how the cart or checkout responds to different customer scenarios. You can set product limits, perform age verification and more.
          </p>
          <p className="mt-3 text-sm text-admin-text-secondary">
            There are no apps installed with rules for checkout or cart. Visit the{' '}
            <button type="button" className={`${adminListFooterLinkClass} font-medium`}>
              codiic App Store
            </button>{' '}
            to install one.
          </p>
          </div>
        </SettingsPanel>

      {/* Add-to-cart limit Modal */}
      <Modal
        open={addToCartLimitModalOpen}
        onClose={() => setAddToCartLimitModalOpen(false)}
        maxWidth="sm"
        title={
          <div className="flex items-center gap-1">
            <h3 className="text-lg font-semibold text-admin-text">Add-to-cart limit</h3>
            <InformationCircleIcon className="w-[18px] h-[18px] text-admin-text-secondary" />
          </div>
        }
        actions={
          <>
            <button
              onClick={() => setAddToCartLimitModalOpen(false)}
              className={adminListSecondaryButtonClass}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => void handleSaveAddToCartLimit()}
              disabled={
                isSaving ||
                (!useRecommendedLimit &&
                  (!Number.isInteger(Number(cartLimit)) || Number(cartLimit) < 1))
              }
              className={adminListPrimaryButtonClass}
            >
              {isSaving ? 'Saving…' : 'Done'}
            </button>
          </>
        }
      >
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-base text-admin-text">
                Set a maximum quantity per item that can be added to a cart.
              </p>
              <div className="flex items-center gap-2">
                <span className={`${badgeClass} rounded`}>
                  Recommended
                </span>
                <ToggleSwitch
                  checked={useRecommendedLimit}
                  onChange={handleUseRecommendedLimitChange}
                />
              </div>
            </div>
            <p className="text-sm text-admin-text-secondary">
              Protects your available inventory quantities from being revealed whenever they are higher than this limit.
            </p>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-admin-text-secondary">Limit</p>
            <input
              type="number"
              min={1}
              step={1}
              value={cartLimit}
              onChange={(e) => setCartLimit(e.target.value)}
              disabled={useRecommendedLimit}
              placeholder={useRecommendedLimit ? '50' : 'Enter a limit'}
              className={`${inputClass} disabled:bg-admin-fill disabled:text-admin-text-subdued`}
            />
          </div>

          <p className="text-sm text-admin-text-secondary">
            Your store's recommended limit is 50
          </p>
        </div>
      </Modal>

      {/* Address collection Modal */}
      <Modal
        open={addressCollectionModalOpen}
        onClose={() => setAddressCollectionModalOpen(false)}
        maxWidth="sm"
        title={
          <div className="flex items-center gap-1">
            <h3 className="text-lg font-semibold text-admin-text">Address collection</h3>
            <InformationCircleIcon className="w-[18px] h-[18px] text-admin-text-secondary" />
          </div>
        }
        actions={
          <>
            <button
              onClick={() => setAddressCollectionModalOpen(false)}
              className={adminListSecondaryButtonClass}
            >
              Cancel
            </button>
            <button
              disabled
              className={`${adminListPrimaryButtonClass} disabled:opacity-50`}
            >
              Done
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={useShippingAsBilling}
              onChange={(e) => handleUseShippingAsBillingChange(e.target.checked)}
              className={checkboxClassStart}
            />
            <p className="text-base font-medium text-admin-text">
              Use the shipping address as the billing address by default
            </p>
          </label>
          <p className="ml-7 text-sm text-admin-text-secondary">
            The billing address can still be edited
          </p>
        </div>
      </Modal>

      {/* Edit Regions Modal */}
      <Modal
        open={editRegionsModalOpen}
        onClose={() => setEditRegionsModalOpen(false)}
        maxWidth="sm"
        title={<h3 className="text-lg font-semibold text-admin-text">Edit regions</h3>}
        actions={
          <>
            <button
              onClick={() => setEditRegionsModalOpen(false)}
              className={adminListSecondaryButtonClass}
            >
              Cancel
            </button>
            <button
              onClick={() => setEditRegionsModalOpen(false)}
              className={adminListPrimaryButtonClass}
            >
              Done
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-admin-text-secondary">Regions</p>
            <p className="text-sm text-admin-text-secondary">
              {selectedRegions.length} of {total || countries.length} selected
            </p>
          </div>

          <Tabs
            tabs={regionTabs}
            activeTab={regionTab}
            onTabChange={handleRegionTabChange}
          />

          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-admin-text-subdued" />
            <input
              type="text"
              placeholder="Search"
              value={regionSearch}
              onChange={(e) => setRegionSearch(e.target.value)}
              className={`${inputClass} pl-10`}
            />
          </div>

          <div className="max-h-[400px] overflow-y-auto rounded border border-admin-border">
            {countriesLoading ? (
              <div className="p-6 text-center">
                <p className="text-sm text-admin-text-secondary">Loading countries...</p>
              </div>
            ) : (
              <div>
                {/* Select All Option */}
                <div className="flex cursor-pointer items-center gap-3 border-b border-admin-divider p-3 hover:bg-admin-row-hover">
                  <input
                    type="checkbox"
                    checked={isAllRegionsSelected}
                    ref={(input) => {
                      if (input) {
                        input.indeterminate = isSomeRegionsSelected && !isAllRegionsSelected;
                      }
                    }}
                    onChange={(e) => handleSelectAllRegions(e.target.checked)}
                    className={checkboxClass}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-admin-text">Regions</p>
                    <p className="text-xs text-admin-text-subdued">{selectedRegions.length}/{countries.length || total}</p>
                  </div>
                </div>

                {/* Countries List */}
                {filteredCountries.map((country) => {
                  const isRecommended = recommendedCountryCodes.includes(country.iso2);
                  return (
                    <div
                      key={country._id}
                      className="flex cursor-pointer items-center gap-3 border-b border-admin-divider p-3 last:border-b-0 hover:bg-admin-row-hover"
                    >
                      <input
                        type="checkbox"
                        checked={selectedRegions.includes(country._id)}
                        onChange={(e) => handleRegionToggle(country._id, e.target.checked)}
                        className={checkboxClass}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{country.flagEmoji || '🌍'}</span>
                          <p className="text-sm text-admin-text">
                            {country.iso2} {country.name}
                          </p>
                          {isRecommended && (
                            <span className={`${badgeClass} rounded`}>
                              Recommended
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </Modal>
      </div>
    </div>
  );
};

export default CheckoutSettingsPage;
