import React, { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import BillingInformationModal from '../../components/BillingInformationModal';
import EditProfileModal from '../../components/EditProfileModal';
import GeneralSettingsFooter from '../../components/GeneralSettingsFooter';
import KeyboardShortcutsModal from '../../components/KeyboardShortcutsModal';
import OrderIdSection from '../../components/OrderIdSection';
import OrderProcessingSection from '../../components/OrderProcessingSection';
import ResourcesSection from '../../components/ResourcesSection';
import StoreAssetsSection from '../../components/StoreAssetsSection';
import StoreDefaultsSection from '../../components/StoreDefaultsSection';
import StoreDetailsSection from '../../components/StoreDetailsSection';
import { useCountries } from '../../contexts/country.context';
import { UpdateGeneralSettingsPayload, useGeneralSettings } from '../../contexts/general-settings.context';
import { useStoreContactInfo } from '../../contexts/store-contact-info.context';
import { useStore } from '../../contexts/store.context';
import { useStoreBillingAddress } from '../../contexts/storeBillingAddress.context';
import { useUserContext } from '../../contexts/user.context';
import { SettingsHero } from '../../components/settings/SettingsPageScaffold';


const GeneralSettingsPage: React.FC = () => {
  const { stores, activeStoreId, setStores } = useStore();
  const { loggedInUser } = useUserContext();
  const { addresses, fetchByStoreId } = useStoreBillingAddress();
  const { info, getByStoreId } = useStoreContactInfo();
  const {
    settings,
    loading: settingsLoading,
    getByStoreId: getGeneralSettings,
    update: updateGeneralSettings,
  } = useGeneralSettings();

  const [backupRegion, setBackupRegion] = useState('India');
  const [unitSystem, setUnitSystem] = useState('metric');
  const [weightUnit, setWeightUnit] = useState('kg');
  const [timeZone, setTimeZone] = useState('Asia/Kolkata');
  
  // Order ID settings
  const [orderIdPrefix, setOrderIdPrefix] = useState('#');
  const [orderIdSuffix, setOrderIdSuffix] = useState('');
  
  // Order processing settings
  const [fulfillmentOption, setFulfillmentOption] = useState('dont_fulfill');
  const [notifyCustomers, setNotifyCustomers] = useState(false);
  const [fulfillHighRiskOrders, setFulfillHighRiskOrders] = useState(false);
  const [autoArchive, setAutoArchive] = useState(true);

  // Edit profile modal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [storeName, setStoreName] = useState('');
  const [storeEmail, setStoreEmail] = useState('');
  const [storePhone, setStorePhone] = useState('');
  const [modalFormDirty, setModalFormDirty] = useState(false);
  const [savingModal, setSavingModal] = useState(false);
  const [initialModalValues, setInitialModalValues] = useState({ storeName: '', storeEmail: '', storePhone: '' });

  // Billing information modal
  const [billingModalOpen, setBillingModalOpen] = useState(false);
  const [legalBusinessName, setLegalBusinessName] = useState('');
  const [country, setCountry] = useState('India');
  const [address, setAddress] = useState('');
  const [apartment, setApartment] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [billingFormDirty, setBillingFormDirty] = useState(false);
  const [savingBillingModal, setSavingBillingModal] = useState(false);
  const [initialBillingValues, setInitialBillingValues] = useState({
    legalBusinessName: '',
    country: 'India',
    address: '',
    apartment: '',
    city: '',
    state: '',
    pinCode: '',
  });
  const [isDirty, setIsDirty] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [saving, setSaving] = useState(false);
  const [shortcutsModalOpen, setShortcutsModalOpen] = useState(false);

  const markDirty = useCallback(() => {
    if (initialLoadComplete) {
      setIsDirty(true);
    }
  }, [initialLoadComplete]);

  const handleOpenShortcutsModal = useCallback(() => {
    setShortcutsModalOpen(true);
  }, []);

  const handleCloseShortcutsModal = useCallback(() => {
    setShortcutsModalOpen(false);
  }, []);

  const { getCountries, countries } = useCountries();
  const activeStore = stores.find(s => s._id === activeStoreId);
  const billingAddress = addresses.length > 0 ? addresses[0] : null;

  // Fetch countries on mount
  useEffect(() => {
    getCountries({ limit: 250 });
  }, [getCountries]);

  // Initialize form values when edit modal opens
  useEffect(() => {
    if (editModalOpen) {
      const initialName = settings?.storeName ?? activeStore?.storeName ?? 'My Store';
      const initialEmail = settings?.storeEmail ?? loggedInUser?.email ?? 'developer200419@gmail.com';
      const initialPhone = settings?.storePhone ?? (info?.contactInfo && info.contactInfo.trim() ? info.contactInfo : '');
      
      setStoreName(initialName);
      setStoreEmail(initialEmail);
      setStorePhone(initialPhone);
      setInitialModalValues({ storeName: initialName, storeEmail: initialEmail, storePhone: initialPhone });
      setModalFormDirty(false);
    }
  }, [editModalOpen, settings, activeStore, loggedInUser, info]);

  // Initialize form values when billing modal opens
  useEffect(() => {
    if (!billingModalOpen) {
      return;
    }

    let initialName = '';
    let initialCountry = 'India';
    let initialAddress = '';
    let initialApartment = '';
    let initialCity = '';
    let initialState = '';
    let initialPin = '';

    if (settings) {
      initialName = settings.legalBusinessName ?? '';
      initialCountry = settings.billingCountry ?? 'India';
      initialAddress = settings.billingAddress ?? '';
      initialApartment = settings.billingApartment ?? '';
      initialCity = settings.billingCity ?? '';
      initialState = settings.billingState ?? '';
      initialPin = settings.billingPinCode ?? '';
    } else if (billingAddress) {
      initialName = billingAddress.legalBusinessName || '';
      initialCountry = billingAddress.country || 'India';
      initialAddress = billingAddress.address || '';
      initialApartment = billingAddress.apartment || '';
      initialCity = billingAddress.city || '';
      initialState = billingAddress.state || '';
      initialPin = billingAddress.pinCode || '';
    }

    setLegalBusinessName(initialName);
    setCountry(initialCountry);
    setAddress(initialAddress);
    setApartment(initialApartment);
    setCity(initialCity);
    setState(initialState);
    setPinCode(initialPin);
    setInitialBillingValues({
      legalBusinessName: initialName,
      country: initialCountry,
      address: initialAddress,
      apartment: initialApartment,
      city: initialCity,
      state: initialState,
      pinCode: initialPin,
    });
    setBillingFormDirty(false);
  }, [billingModalOpen, settings, billingAddress]);

  useEffect(() => {
    if (settingsLoading) {
      return;
    }

    if (settings) {
      setBackupRegion(settings.backupRegion ?? 'India');
      setUnitSystem(settings.unitSystem ?? 'metric');
      setWeightUnit(settings.weightUnit ?? 'kg');
      setTimeZone(settings.timeZone ?? 'Asia/Kolkata');
      setOrderIdPrefix(settings.orderIdPrefix ?? '#');
      setOrderIdSuffix(settings.orderIdSuffix ?? '');
      setFulfillmentOption(settings.fulfillmentOption ?? 'dont_fulfill');
      setNotifyCustomers(Boolean(settings.notifyCustomers));
      setFulfillHighRiskOrders(Boolean(settings.fulfillHighRiskOrders));
      setAutoArchive(settings.autoArchive !== undefined ? settings.autoArchive : true);
      setStoreName(settings.storeName ?? activeStore?.storeName ?? 'My Store');
      setStoreEmail(settings.storeEmail ?? loggedInUser?.email ?? '');
      setStorePhone(
        settings.storePhone ?? (info?.contactInfo && info.contactInfo.trim() ? info.contactInfo : '')
      );
      setLegalBusinessName(settings.legalBusinessName ?? '');
      setCountry(settings.billingCountry ?? 'India');
      setAddress(settings.billingAddress ?? '');
      setApartment(settings.billingApartment ?? '');
      setCity(settings.billingCity ?? '');
      setState(settings.billingState ?? '');
      setPinCode(settings.billingPinCode ?? '');
    } else {
      setBackupRegion('India');
      setUnitSystem('metric');
      setWeightUnit('kg');
      setTimeZone('Asia/Kolkata');
      setOrderIdPrefix('#');
      setOrderIdSuffix('');
      setFulfillmentOption('dont_fulfill');
      setNotifyCustomers(false);
      setFulfillHighRiskOrders(false);
      setAutoArchive(true);
      setStoreName(activeStore?.storeName || 'My Store');
      setStoreEmail(loggedInUser?.email || 'developer200419@gmail.com');
      setStorePhone(info?.contactInfo && info.contactInfo.trim() ? info.contactInfo : '');
      setLegalBusinessName(billingAddress?.legalBusinessName || '');
      setCountry(billingAddress?.country || 'India');
      setAddress(billingAddress?.address || '');
      setApartment(billingAddress?.apartment || '');
      setCity(billingAddress?.city || '');
      setState(billingAddress?.state || '');
      setPinCode(billingAddress?.pinCode || '');
    }

    setIsDirty(false);
    setInitialLoadComplete(true);
  }, [
    settings,
    settingsLoading,
    activeStore,
    loggedInUser,
    info,
    billingAddress,
  ]);

  const handleOpenEditModal = useCallback(() => {
    setEditModalOpen(true);
  }, []);

  const handleCloseEditModal = useCallback(() => {
    setEditModalOpen(false);
  }, []);

  const handleSaveProfile = useCallback(async () => {
    if (!settings || !settings._id) {
      toast.error('General settings not found. Please refresh the page.');
      return;
    }

    // Check if values actually changed
    const hasChanges = 
      storeName !== initialModalValues.storeName ||
      storeEmail !== initialModalValues.storeEmail ||
      storePhone !== initialModalValues.storePhone;

    if (!hasChanges) {
      handleCloseEditModal();
      return;
    }

    if (!activeStoreId) {
      toast.error('No store selected. Please select a store to save settings.');
      return;
    }

    setSavingModal(true);
    try {
      const trimmed = (value: string) => value.trim() || undefined;
      await updateGeneralSettings(settings._id, {
        storeId: activeStoreId,
        storeName: trimmed(storeName),
        storeEmail: trimmed(storeEmail),
        storePhone: trimmed(storePhone),
      });
      const nextStoreName = storeName.trim() || storeName || 'My Store';
      setStores((prev) =>
        prev.map((store) =>
          store._id === activeStoreId ? { ...store, storeName: nextStoreName } : store
        )
      );
      setInitialModalValues({
        storeName,
        storeEmail,
        storePhone,
      });
      toast.success('Store profile updated successfully');
      markDirty();
      handleCloseEditModal();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to update store profile';
      toast.error(msg);
    } finally {
      setSavingModal(false);
    }
  }, [
    settings,
    storeName,
    storeEmail,
    storePhone,
    initialModalValues,
    activeStoreId,
    updateGeneralSettings,
    setStores,
    markDirty,
    handleCloseEditModal,
  ]);

  const handleOpenBillingModal = useCallback(() => {
    setBillingModalOpen(true);
  }, []);

  const handleCloseBillingModal = useCallback(() => {
    setBillingModalOpen(false);
  }, []);

  const handleSaveBilling = useCallback(async () => {
    if (!settings || !settings._id) {
      toast.error('General settings not found. Please refresh the page.');
      return;
    }

    if (!activeStoreId) {
      toast.error('No store selected. Please select a store to save settings.');
      return;
    }

    // Check if values actually changed
    const hasChanges =
      legalBusinessName !== initialBillingValues.legalBusinessName ||
      country !== initialBillingValues.country ||
      address !== initialBillingValues.address ||
      apartment !== initialBillingValues.apartment ||
      city !== initialBillingValues.city ||
      state !== initialBillingValues.state ||
      pinCode !== initialBillingValues.pinCode;

    if (!hasChanges) {
      handleCloseBillingModal();
      return;
    }

    setSavingBillingModal(true);
    try {
      const trimmed = (value: string) => value.trim() || undefined;
      await updateGeneralSettings(settings._id, {
        storeId: activeStoreId,
        legalBusinessName: trimmed(legalBusinessName),
        billingCountry: country,
        billingAddress: trimmed(address),
        billingApartment: trimmed(apartment),
        billingCity: trimmed(city),
        billingState: trimmed(state),
        billingPinCode: trimmed(pinCode),
      });
      toast.success('Billing information updated successfully');
      markDirty();
      handleCloseBillingModal();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to update billing information';
      toast.error(msg);
    } finally {
      setSavingBillingModal(false);
    }
  }, [
    settings,
    activeStoreId,
    legalBusinessName,
    country,
    address,
    apartment,
    city,
    state,
    pinCode,
    initialBillingValues,
    updateGeneralSettings,
    markDirty,
    handleCloseBillingModal,
  ]);

  const handleSave = useCallback(async () => {
    if (!activeStoreId) {
      toast.error('No store selected. Please select a store to save settings.');
      return;
    }

    const trimmed = (value: string) => value.trim() || undefined;

    const payload: UpdateGeneralSettingsPayload = {
      storeId: activeStoreId,
      backupRegion,
      unitSystem: unitSystem as 'metric' | 'imperial',
      weightUnit: weightUnit as 'kg' | 'g' | 'lb' | 'oz',
      timeZone,
      orderIdPrefix,
      orderIdSuffix,
      fulfillmentOption: fulfillmentOption as 'fulfill_all' | 'fulfill_gift_cards' | 'dont_fulfill',
      notifyCustomers,
      fulfillHighRiskOrders,
      autoArchive,
      storeName: trimmed(storeName),
      storeEmail: trimmed(storeEmail),
      storePhone: trimmed(storePhone),
      legalBusinessName: trimmed(legalBusinessName),
      billingCountry: country,
      billingAddress: trimmed(address),
      billingApartment: trimmed(apartment),
      billingCity: trimmed(city),
      billingState: trimmed(state),
      billingPinCode: trimmed(pinCode),
    };

    if (!settings || !settings._id) {
      toast.error('General settings not found. Please refresh the page.');
      return;
    }

    setSaving(true);
    try {
      await updateGeneralSettings(settings._id, payload);
      toast.success('General settings updated successfully');
      setIsDirty(false);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to save general settings';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }, [
    activeStoreId,
    backupRegion,
    unitSystem,
    weightUnit,
    timeZone,
    orderIdPrefix,
    orderIdSuffix,
    fulfillmentOption,
    notifyCustomers,
    fulfillHighRiskOrders,
    autoArchive,
    storeName,
    storeEmail,
    storePhone,
    legalBusinessName,
    country,
    address,
    apartment,
    city,
    state,
    pinCode,
    settings,
    updateGeneralSettings,
  ]);

  useEffect(() => {
    if (activeStoreId) {
      fetchByStoreId(activeStoreId);
      getByStoreId(activeStoreId);
      setInitialLoadComplete(false);
      getGeneralSettings(activeStoreId).catch(() => {
        // Error handling managed in context
      });
    }
  }, [activeStoreId, fetchByStoreId, getByStoreId, getGeneralSettings]);

  const timeZones = [
    { value: 'Asia/Kolkata', label: '(GMT+05:30) Chennai, Kolkata, Mumbai, New Delhi' },
    { value: 'America/New_York', label: '(GMT-05:00) Eastern Time (US & Canada)' },
    { value: 'America/Los_Angeles', label: '(GMT-08:00) Pacific Time (US & Canada)' },
    { value: 'Europe/London', label: '(GMT+00:00) Greenwich Mean Time' },
  ];

  const handleBackupRegionChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setBackupRegion(e.target.value);
    markDirty();
  }, [markDirty]);

  const handleUnitSystemChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setUnitSystem(e.target.value);
    markDirty();
  }, [markDirty]);

  const handleWeightUnitChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setWeightUnit(e.target.value);
    markDirty();
  }, [markDirty]);

  const handleTimeZoneChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setTimeZone(e.target.value);
    markDirty();
  }, [markDirty]);

  const handleOrderIdPrefixChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setOrderIdPrefix(e.target.value);
    markDirty();
  }, [markDirty]);

  const handleOrderIdSuffixChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setOrderIdSuffix(e.target.value);
    markDirty();
  }, [markDirty]);

  const handleFulfillmentOptionChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFulfillmentOption(e.target.value);
    markDirty();
  }, [markDirty]);

  const handleNotifyCustomersChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setNotifyCustomers(e.target.checked);
    markDirty();
  }, [markDirty]);

  const handleFulfillHighRiskOrdersChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFulfillHighRiskOrders(e.target.checked);
    markDirty();
  }, [markDirty]);

  const handleAutoArchiveChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setAutoArchive(e.target.checked);
    markDirty();
  }, [markDirty]);

  const handleStoreNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setStoreName(e.target.value);
    setModalFormDirty(true);
  }, []);

  const handleStoreEmailChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setStoreEmail(e.target.value);
    setModalFormDirty(true);
  }, []);

  const handleStorePhoneChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setStorePhone(e.target.value);
    setModalFormDirty(true);
  }, []);

  const handleLegalBusinessNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLegalBusinessName(e.target.value);
    setBillingFormDirty(true);
  }, []);

  const handleCountryChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setCountry(e.target.value);
    setBillingFormDirty(true);
  }, []);

  const handleAddressChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setAddress(e.target.value);
    setBillingFormDirty(true);
  }, []);

  const handleApartmentChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setApartment(e.target.value);
    setBillingFormDirty(true);
  }, []);

  const handleCityChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setCity(e.target.value);
    setBillingFormDirty(true);
  }, []);

  const handleStateChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setState(e.target.value);
    setBillingFormDirty(true);
  }, []);

  const handlePinCodeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setPinCode(e.target.value);
    setBillingFormDirty(true);
  }, []);

  return (
    <div className="w-full">
      <div className="max-w-[1200px] mx-auto w-full flex flex-col gap-6 pb-28">
        <SettingsHero
          title="General"
          description="Manage your store profile, defaults, order settings, and resources."
        />

        {/* Store details section ✅ */}
        <StoreDetailsSection
        settings={settings}
        activeStore={activeStore}
        loggedInUser={loggedInUser}
        info={info}
        billingAddress={billingAddress}
        onEditProfile={handleOpenEditModal}
        onEditBilling={handleOpenBillingModal}
      />

      {/* Store defaults section ✅ */}
      <StoreDefaultsSection
        backupRegion={backupRegion}
        unitSystem={unitSystem}
        weightUnit={weightUnit}
        timeZone={timeZone}
        timeZones={timeZones}
        onBackupRegionChange={handleBackupRegionChange}
        onUnitSystemChange={handleUnitSystemChange}
        onWeightUnitChange={handleWeightUnitChange}
        onTimeZoneChange={handleTimeZoneChange}
      />

      {/* Order ID section ✅ */}
      <OrderIdSection
        orderIdPrefix={orderIdPrefix}
        orderIdSuffix={orderIdSuffix}
        onPrefixChange={handleOrderIdPrefixChange}
        onSuffixChange={handleOrderIdSuffixChange}
      />

      {/* Order processing section ✅ */}
      <OrderProcessingSection
        fulfillmentOption={fulfillmentOption as 'fulfill_all' | 'fulfill_gift_cards' | 'dont_fulfill'}
        notifyCustomers={notifyCustomers}
        fulfillHighRiskOrders={fulfillHighRiskOrders}
        autoArchive={autoArchive}
        onFulfillmentOptionChange={handleFulfillmentOptionChange}
        onNotifyCustomersChange={handleNotifyCustomersChange}
        onFulfillHighRiskOrdersChange={handleFulfillHighRiskOrdersChange}
        onAutoArchiveChange={handleAutoArchiveChange}
      />

      {/* Store assets section  ✅ */}
      <StoreAssetsSection />

      {/* Resources section ✅ */}
      <ResourcesSection onOpenShortcutsModal={handleOpenShortcutsModal} />

      {/* Bottom note and Save button */}
      <GeneralSettingsFooter
        onSave={handleSave}
        saving={saving}
        disabled={!initialLoadComplete || !isDirty || saving || settingsLoading}
      />

      {/* Edit Profile Modal */}
      <EditProfileModal
        open={editModalOpen}
        onClose={handleCloseEditModal}
        onSave={handleSaveProfile}
        saving={savingModal}
        storeName={storeName}
        storeEmail={storeEmail}
        storePhone={storePhone}
        initialValues={initialModalValues}
        onStoreNameChange={handleStoreNameChange}
        onStoreEmailChange={handleStoreEmailChange}
        onStorePhoneChange={handleStorePhoneChange}
      />

      {/* Billing Information Modal */}
      <BillingInformationModal
        open={billingModalOpen}
        onClose={handleCloseBillingModal}
        onSave={handleSaveBilling}
        saving={savingBillingModal}
        legalBusinessName={legalBusinessName}
        country={country}
        address={address}
        apartment={apartment}
        city={city}
        state={state}
        pinCode={pinCode}
        initialValues={initialBillingValues}
        countries={countries}
        onLegalBusinessNameChange={handleLegalBusinessNameChange}
        onCountryChange={handleCountryChange}
        onAddressChange={handleAddressChange}
        onApartmentChange={handleApartmentChange}
        onCityChange={handleCityChange}
        onStateChange={handleStateChange}
        onPinCodeChange={handlePinCodeChange}
      />

      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal
        open={shortcutsModalOpen}
        onClose={handleCloseShortcutsModal}
      />
      </div>
    </div>
  );
};

export default GeneralSettingsPage;
