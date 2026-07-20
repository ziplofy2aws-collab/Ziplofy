import React, { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AddPaymentModal from '../../components/AddPaymentModal';
import BillingAddressCurrencySection from '../../components/BillingAddressCurrencySection';
import BillingPaymentMethodsSection from '../../components/BillingPaymentMethodsSection';
import BillingTaxIdSection from '../../components/BillingTaxIdSection';
import GstModal from '../../components/GstModal';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { SettingsHero } from '../../components/settings/SettingsPageScaffold';

const BillingProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [addPaymentOpen, setAddPaymentOpen] = useState(false);
  const [paymentType, setPaymentType] = useState('Credit card');
  const [country, setCountry] = useState('India');
  const [state, setState] = useState('Andaman and Nicobar Islands');
  const [consent, setConsent] = useState(false);
  const [gstModalOpen, setGstModalOpen] = useState(false);
  const [gstin, setGstin] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('showAddPaymentModal') === 'true') {
      setAddPaymentOpen(true);
    }
  }, [location.search]);

  const handleBack = useCallback(() => {
    navigate('/settings/billing');
  }, [navigate]);

  const handleOpenAddPayment = useCallback(() => {
    setAddPaymentOpen(true);
  }, []);

  const handleCloseAddPayment = useCallback(() => {
    setAddPaymentOpen(false);
  }, []);

  const handlePaymentTypeChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    setPaymentType(event.target.value);
  }, []);

  const handleCountryChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    setCountry(event.target.value);
  }, []);

  const handleStateChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    setState(event.target.value);
  }, []);

  const handleConsentChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setConsent(event.target.checked);
  }, []);

  const handleOpenGstModal = useCallback(() => {
    setGstModalOpen(true);
  }, []);

  const handleCloseGstModal = useCallback(() => {
    setGstModalOpen(false);
  }, []);

  const handleGstinChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setGstin(event.target.value);
  }, []);

  const handleManageClick = useCallback(
    (managePath?: string) => {
      if (managePath) {
        navigate(managePath);
      }
    },
    [navigate]
  );

  return (
    <div className="w-full">
      <div className="max-w-[1200px] mx-auto w-full flex flex-col gap-6">
        <SettingsHero
          title="Billing profile"
          description="Your payment methods, tax ID, billing currency and store address."
          leading={
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200/90 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50/90 transition-colors"
              aria-label="Back to billing"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Back
            </button>
          }
        />

        <BillingPaymentMethodsSection onAddPayment={handleOpenAddPayment} />

        <BillingTaxIdSection onAddGstin={handleOpenGstModal} />

        <BillingAddressCurrencySection onManage={handleManageClick} />

        <AddPaymentModal
          open={addPaymentOpen}
          onClose={handleCloseAddPayment}
          paymentType={paymentType}
          onPaymentTypeChange={handlePaymentTypeChange}
          country={country}
          onCountryChange={handleCountryChange}
          state={state}
          onStateChange={handleStateChange}
          consent={consent}
          onConsentChange={handleConsentChange}
        />

        <GstModal
          open={gstModalOpen}
          onClose={handleCloseGstModal}
          gstin={gstin}
          onGstinChange={handleGstinChange}
        />
      </div>
    </div>
  );
};

export default BillingProfilePage;
