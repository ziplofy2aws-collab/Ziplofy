
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
  SETTINGS_PAGE_CONTAINER_CLASS,
  SettingsHero,
  SettingsPanel,
} from '../../components/settings/SettingsPageScaffold';
import { useCheckoutSettings } from '../../contexts/checkout-settings.context';
import { useCountries } from '../../contexts/country.context';
import { useStore } from '../../contexts/store.context';

const btnPrimary =
  'inline-flex shrink-0 items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-blue-600';

const radioClass =
  'h-4 w-4 shrink-0 border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500/30 focus:ring-offset-0';

const radioClassStart = `${radioClass} mt-0.5`;

const checkboxClass =
  'h-4 w-4 shrink-0 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500/30 focus:ring-offset-0';

const checkboxClassStart = `${checkboxClass} mt-0.5`;

const panelWarningClass =
  'rounded-xl border border-amber-200/80 bg-amber-50/90 p-4 text-amber-950 shadow-sm';

const CheckoutSettingsPage: React.FC = () => {
  const { countries, total, loading: countriesLoading, getCountries } = useCountries();
  const { activeStoreId } = useStore();
  const { settings, fetchByStoreId, loading: checkoutLoading, update } = useCheckoutSettings();
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
  const [emailRegionOption, setEmailRegionOption] = useState<'ziplofy_recommended' | 'custom'>('ziplofy_recommended');
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
      emailRegionOption: 'ziplofy_recommended' | 'custom';
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
  }, [activeStoreId, fetchByStoreId]);

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
    const emailMode = settings.marketing?.email?.regionMode ?? 'ziplofy_recommended';
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
      fullNameOption,
      companyNameOption,
      addressLine2Option,
      shippingPhoneOption,
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
    fullNameOption,
    companyNameOption,
    addressLine2Option,
    shippingPhoneOption,
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

  const handleFullNameOptionChange = useCallback((value: 'last_name' | 'first_last') => {
    setFullNameOption(value);
  }, []);

  const handleCompanyNameOptionChange = useCallback((value: 'dont_include' | 'optional' | 'required') => {
    setCompanyNameOption(value);
    if (value === 'required') {
      setShowCompanyNameWarning(true);
    }
  }, []);

  const handleAddressLine2OptionChange = useCallback((value: 'dont_include' | 'optional' | 'required') => {
    setAddressLine2Option(value);
    if (value === 'required') {
      setShowAddressLine2Warning(true);
    }
  }, []);

  const handleShippingPhoneOptionChange = useCallback((value: 'dont_include' | 'optional' | 'required') => {
    setShippingPhoneOption(value);
  }, []);

  const handleEmailMarketingChange = useCallback((checked: boolean) => {
    setEmailMarketing(checked);
  }, []);

  const handleEmailRegionOptionChange = useCallback((value: 'ziplofy_recommended' | 'custom') => {
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

  const handleAddToCartLimitChange = useCallback((checked: boolean) => {
    setAddToCartLimit(checked);
  }, []);

  const handleUseShippingAsBillingChange = useCallback((checked: boolean) => {
    setUseShippingAsBilling(checked);
  }, []);

  const handleUseRecommendedLimitChange = useCallback((checked: boolean) => {
    setUseRecommendedLimit(checked);
  }, []);

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
                className={btnPrimary}
              >
                {isSaving ? 'Saving…' : 'Save changes'}
              </button>
            ) : undefined
          }
        />

        <SettingsPanel className="ring-1 ring-slate-200/60">
          <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50/90 to-white px-5 py-4 sm:px-6">
            <div className="border-l-4 border-blue-500/75 pl-3">
              <h2 className="text-base font-semibold text-gray-900">Contact &amp; checkout</h2>
              <p className="mt-1 text-sm text-gray-500">
                How customers reach you, order tracking links, and sign-in requirements.
              </p>
            </div>
          </div>
          <div className="p-5 sm:p-6">
          <div className="mb-6">
          <div className="mb-3 flex items-center gap-1.5">
            <h3 className="text-sm font-semibold text-gray-900">Customer contact method</h3>
            <InformationCircleIcon className="h-4 w-4 text-slate-400" title="Contact method help" />
          </div>
          <p className="mb-4 text-sm text-gray-600">
            The contact method customers enter at checkout will receive order and shipping{' '}
            <button type="button" className="font-medium text-blue-600 underline decoration-blue-600/30 hover:text-blue-700">
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
              <p className="text-sm font-medium text-gray-900">Phone number or email</p>
              {contactMethod === 'phone_or_email' && (
                <p className="mt-1 text-xs text-gray-600">
                  An{' '}
                  <button type="button" className="font-medium text-blue-600 underline decoration-blue-600/30 hover:text-blue-700">
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
            <p className="text-sm font-medium text-gray-900">Email</p>
          </label>
        </div>
          </div>

        <div className="my-8 border-t border-slate-200/90" />

        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={showOrderTracking}
            onChange={(e) => handleShowOrderTrackingChange(e.target.checked)}
            className={checkboxClassStart}
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-900">
              Show a link for customers to track their order with{' '}
              <button type="button" className="font-medium text-blue-600 underline decoration-blue-600/30 hover:text-blue-700">
                Ziplofy
              </button>
            </p>
            <p className="mt-1 text-xs text-gray-600">
              Customers will be able to download the app from the order status page
            </p>
          </div>
        </label>

        <div className="my-8 border-t border-slate-200/90" />

        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={requireSignIn}
            onChange={(e) => handleRequireSignInChange(e.target.checked)}
            className={checkboxClassStart}
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-900">
              Require customers to sign in to their account before checkout
            </p>
            <p className="mt-1 text-xs text-gray-600">
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

        <SettingsPanel className="ring-1 ring-slate-200/60">
          <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50/90 to-white px-5 py-4 sm:px-6">
            <div className="border-l-4 border-blue-500/75 pl-3">
              <h2 className="text-base font-semibold text-gray-900">Customer information</h2>
              <p className="mt-1 text-sm text-gray-500">Fields collected during checkout for shipping and identity.</p>
            </div>
          </div>
          <div className="p-5 sm:p-6">

          {/* Full name */}
          <div className="mb-4">
            <p className="text-xs text-gray-600 mb-2 font-medium">Full name</p>
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
                <p className="text-sm text-gray-900">Only require last name</p>
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
                <p className="text-sm text-gray-900">Require first and last name</p>
              </label>
            </div>
          </div>

          {/* Company name */}
          <div className="mb-4">
            <p className="text-xs text-gray-600 mb-2 font-medium">Company name</p>
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
                  <p className="text-sm text-gray-900">Don't include</p>
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-medium border border-gray-200 h-5 flex items-center">
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
                <p className="text-sm text-gray-900">Optional</p>
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
                <p className="text-sm text-gray-900">Required</p>
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
            <p className="text-xs text-gray-600 mb-2 font-medium">Address line 2 (apartment, unit, etc.)</p>
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
                <p className="text-sm text-gray-900">Don't include</p>
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
                  <p className="text-sm text-gray-900">Optional</p>
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-medium border border-gray-200 h-5 flex items-center">
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
                <p className="text-sm text-gray-900">Required</p>
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
            <p className="text-xs text-gray-600 mb-2 font-medium">Shipping address phone number</p>
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
                <p className="text-sm text-gray-900">Don't include</p>
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
                <p className="text-sm text-gray-900">Optional</p>
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
                <p className="text-sm text-gray-900">Required</p>
              </label>
            </div>
          </div>
          </div>
        </SettingsPanel>

        <SettingsPanel className="ring-1 ring-slate-200/60">
          <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50/90 to-white px-5 py-4 sm:px-6">
            <div className="border-l-4 border-blue-500/75 pl-3">
              <h2 className="text-base font-semibold text-gray-900">Marketing options</h2>
              <p className="mt-1 text-sm text-gray-500">
                Email and SMS opt-in checkboxes shown during checkout.
              </p>
            </div>
          </div>
          <div className="p-5 sm:p-6">
          {/* Email Marketing Section */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <EnvelopeIcon className="w-4 h-4 text-gray-500" />
                <p className="text-sm font-medium text-gray-900">Email</p>
              </div>
              <ToggleSwitch
                checked={emailMarketing}
                onChange={handleEmailMarketingChange}
              />
            </div>
            {emailMarketing && (
              <>
                <p className="text-xs text-gray-600 mb-3">
                  You can choose to display a preselected checkbox in certain regions.
                </p>
                <div className="flex gap-3">
                  <div
                    onClick={() => handleEmailRegionOptionChange('ziplofy_recommended')}
                    className={`flex-1 cursor-pointer rounded-xl border p-3 transition-colors ${
                      emailRegionOption === 'ziplofy_recommended'
                        ? 'border-blue-600 ring-1 ring-blue-500/25'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <label className="flex items-start gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="emailRegionOption"
                        value="ziplofy_recommended"
                        checked={emailRegionOption === 'ziplofy_recommended'}
                        onChange={(e) => handleEmailRegionOptionChange(e.target.value as 'ziplofy_recommended' | 'custom')}
                        className={radioClassStart}
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 mb-1">
                          Regions recommended by Ziplofy
                        </p>
                        <p className="text-xs text-gray-600 mb-1">United States only</p>
                        <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-medium border border-gray-200 h-5">
                          Automated
                        </span>
                      </div>
                    </label>
                  </div>
                  <div
                    onClick={() => handleEmailRegionOptionChange('custom')}
                    className={`flex-1 cursor-pointer rounded-xl border p-3 transition-colors ${
                      emailRegionOption === 'custom'
                        ? 'border-blue-600 ring-1 ring-blue-500/25'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <label className="flex items-start gap-2 cursor-pointer w-full">
                      <input
                        type="radio"
                        name="emailRegionOption"
                        value="custom"
                        checked={emailRegionOption === 'custom'}
                        onChange={(e) => handleEmailRegionOptionChange(e.target.value as 'ziplofy_recommended' | 'custom')}
                        className={radioClassStart}
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 mb-1">
                          Regions you choose
                        </p>
                        <p className="text-xs text-gray-600 mb-1">
                          {selectedRegions.length === 0 ? 'None selected' : `${selectedRegions.length} selected`}
                        </p>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditRegionsModalOpen(true);
                          }}
                          className="cursor-pointer text-xs font-medium text-blue-600 underline decoration-blue-600/30 hover:text-blue-700"
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
                <PhoneIcon className="w-4 h-4 text-gray-500" />
                <p className="text-sm font-medium text-gray-900">SMS</p>
              </div>
              <ToggleSwitch
                checked={smsMarketing}
                onChange={handleSmsMarketingChange}
              />
            </div>
            {smsMarketing && (
              <p className="text-xs text-gray-600">
                To launch SMS campaigns, you need to install an{' '}
                <button type="button" className="font-medium text-blue-600 underline decoration-blue-600/30 hover:text-blue-700">
                  SMS App
                </button>
                .
              </p>
            )}
          </div>
          </div>
        </SettingsPanel>

        <SettingsPanel className="ring-1 ring-slate-200/60">
          <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50/90 to-white px-5 py-4 sm:px-6">
            <div className="border-l-4 border-blue-500/75 pl-3">
              <h2 className="text-base font-semibold text-gray-900">Tipping</h2>
              <p className="mt-1 text-sm text-gray-500">
                Optional tip presets and visibility before customers add a tip.
              </p>
            </div>
          </div>
          <div className="p-5 sm:p-6">
          <label className={`flex cursor-pointer items-center gap-3 ${showTipping ? 'mb-4' : ''}`}>
            <input
              type="checkbox"
              checked={showTipping}
              onChange={(e) => handleShowTippingChange(e.target.checked)}
              className={checkboxClass}
            />
            <p className="text-sm font-medium text-gray-900">
              Show tipping options at checkout
            </p>
          </label>

          {/* Preset tip percentages */}
          {showTipping && (
            <div className="mb-4">
              <div className="flex gap-3 items-center">
                <div className="flex-1">
                  <p className="text-xs text-gray-600 mb-1">Preset 1</p>
                  <div className="relative">
                    <input
                      type="text"
                      value={preset1}
                      onChange={(e) => setPreset1(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 pr-8 text-sm shadow-inner focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">%</span>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-600 mb-1">Preset 2</p>
                  <div className="relative">
                    <input
                      type="text"
                      value={preset2}
                      onChange={(e) => setPreset2(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 pr-8 text-sm shadow-inner focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">%</span>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-600 mb-1">Preset 3</p>
                  <div className="relative">
                    <input
                      type="text"
                      value={preset3}
                      onChange={(e) => setPreset3(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 pr-8 text-sm shadow-inner focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">%</span>
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
              <p className="text-sm font-medium text-gray-900">
                Hide tipping options until customers choose to add a tip
              </p>
            </label>
          )}
          </div>
        </SettingsPanel>

        <SettingsPanel className="ring-1 ring-slate-200/60">
          <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50/90 to-white px-5 py-4 sm:px-6">
            <div className="border-l-4 border-blue-500/75 pl-3">
              <h2 className="text-base font-semibold text-gray-900">Checkout language</h2>
              <p className="mt-1 text-sm text-gray-500">Locale shown to customers during checkout (read-only for now).</p>
            </div>
          </div>
          <div className="p-5 sm:p-6">
          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3">
            <input
              type="text"
              value="English"
              disabled
              className="w-full cursor-not-allowed rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-500"
            />
          </div>
          </div>
        </SettingsPanel>

        <SettingsPanel className="ring-1 ring-slate-200/60">
          <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50/90 to-white px-5 py-4 sm:px-6">
            <div className="border-l-4 border-blue-500/75 pl-3">
              <h2 className="text-base font-semibold text-gray-900">Advanced preferences</h2>
              <p className="mt-1 text-sm text-gray-500">Address collection and cart quantity limits.</p>
            </div>
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
            className="cursor-pointer rounded-xl border border-slate-200 p-4 transition-colors hover:border-slate-300 hover:bg-slate-50/80"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <MapPinIcon className="h-5 w-5 shrink-0 text-slate-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 mb-1">Address collection</p>
                  <p className="text-xs text-gray-600">
                    Manage how you collect shipping and billing addresses
                  </p>
                </div>
              </div>
              <ChevronRightIcon className="h-4 w-4 shrink-0 text-slate-400" />
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
            className="cursor-pointer rounded-xl border border-slate-200 p-4 transition-colors hover:border-slate-300 hover:bg-slate-50/80"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <ShoppingCartIcon className="h-5 w-5 shrink-0 text-slate-500" />
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium text-gray-900">Add-to-cart limit</p>
                    <span className="flex h-5 items-center rounded border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-700">
                      Recommended
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">
                    Protects your available inventory quantities from being revealed
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <div onClick={(e) => e.stopPropagation()} className="inline-flex">
                  <ToggleSwitch checked={addToCartLimit} onChange={handleAddToCartLimitChange} />
                </div>
                <ChevronRightIcon className="h-4 w-4 text-slate-400" />
              </div>
            </div>
          </div>
          </div>
        </SettingsPanel>

        <SettingsPanel className="ring-1 ring-slate-200/60">
          <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50/90 to-white px-5 py-4 sm:px-6">
            <div className="border-l-4 border-blue-500/75 pl-3">
              <h2 className="text-base font-semibold text-gray-900">Checkout rules</h2>
              <p className="mt-1 text-sm text-gray-500">
                App-based rules for cart behavior, limits, and verification.
              </p>
            </div>
          </div>
          <div className="p-5 sm:p-6">
          <p className="text-sm text-gray-600">
            Rules set parameters for how the cart or checkout responds to different customer scenarios. You can set product limits, perform age verification and more.
          </p>
          <p className="mt-3 text-sm text-gray-600">
            There are no apps installed with rules for checkout or cart. Visit the{' '}
            <button type="button" className="font-medium text-blue-600 underline decoration-blue-600/30 hover:text-blue-700">
              Ziplofy App Store
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
            <h3 className="text-lg font-semibold text-gray-900">Add-to-cart limit</h3>
            <InformationCircleIcon className="w-[18px] h-[18px] text-gray-500" />
          </div>
        }
        actions={
          <>
            <button
              onClick={() => setAddToCartLimitModalOpen(false)}
              className="px-4 py-2 text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              disabled
              className="px-4 py-2 bg-gray-400 text-white rounded-lg cursor-not-allowed"
            >
              Done
            </button>
          </>
        }
      >
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-base text-gray-900">
                Set a maximum quantity per item that can be added to a cart.
              </p>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs font-medium rounded h-5 flex items-center">
                  Recommended
                </span>
                <ToggleSwitch
                  checked={useRecommendedLimit}
                  onChange={handleUseRecommendedLimitChange}
                />
              </div>
            </div>
            <p className="text-sm text-gray-500">
              Protects your available inventory quantities from being revealed whenever they are higher than this limit.
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500 mb-2 font-medium">Limit</p>
            <input
              type="text"
              value={cartLimit}
              onChange={(e) => setCartLimit(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <p className="text-sm text-gray-500">
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
            <h3 className="text-lg font-semibold text-gray-900">Address collection</h3>
            <InformationCircleIcon className="w-[18px] h-[18px] text-gray-500" />
          </div>
        }
        actions={
          <>
            <button
              onClick={() => setAddressCollectionModalOpen(false)}
              className="px-4 py-2 text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              disabled
              className="px-4 py-2 bg-gray-400 text-white rounded-lg cursor-not-allowed"
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
              className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500/30"
            />
            <p className="text-base font-medium text-gray-900">
              Use the shipping address as the billing address by default
            </p>
          </label>
          <p className="text-sm text-gray-500 ml-7">
            The billing address can still be edited
          </p>
        </div>
      </Modal>

      {/* Edit Regions Modal */}
      <Modal
        open={editRegionsModalOpen}
        onClose={() => setEditRegionsModalOpen(false)}
        maxWidth="sm"
        title={<h3 className="text-lg font-semibold text-gray-900">Edit regions</h3>}
        actions={
          <>
            <button
              onClick={() => setEditRegionsModalOpen(false)}
              className="px-4 py-2 text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => setEditRegionsModalOpen(false)}
              className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Done
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500 font-medium">Regions</p>
            <p className="text-sm text-gray-500">
              {selectedRegions.length} of {total || countries.length} selected
            </p>
          </div>

          <Tabs
            tabs={regionTabs}
            activeTab={regionTab}
            onTabChange={handleRegionTabChange}
          />

          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search"
              value={regionSearch}
              onChange={(e) => setRegionSearch(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="max-h-[400px] overflow-y-auto border border-gray-200 rounded">
            {countriesLoading ? (
              <div className="p-6 text-center">
                <p className="text-sm text-gray-500">Loading countries...</p>
              </div>
            ) : (
              <div>
                {/* Select All Option */}
                <div className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-200">
                  <input
                    type="checkbox"
                    checked={isAllRegionsSelected}
                    ref={(input) => {
                      if (input) {
                        input.indeterminate = isSomeRegionsSelected && !isAllRegionsSelected;
                      }
                    }}
                    onChange={(e) => handleSelectAllRegions(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500/30"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Regions</p>
                    <p className="text-xs text-gray-500">{selectedRegions.length}/{countries.length || total}</p>
                  </div>
                </div>

                {/* Countries List */}
                {filteredCountries.map((country) => {
                  const isRecommended = recommendedCountryCodes.includes(country.iso2);
                  return (
                    <div
                      key={country._id}
                      className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-200 last:border-b-0"
                    >
                      <input
                        type="checkbox"
                        checked={selectedRegions.includes(country._id)}
                        onChange={(e) => handleRegionToggle(country._id, e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500/30"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{country.flagEmoji || '🌍'}</span>
                          <p className="text-sm text-gray-900">
                            {country.iso2} {country.name}
                          </p>
                          {isRecommended && (
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs font-medium rounded h-5 flex items-center">
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
