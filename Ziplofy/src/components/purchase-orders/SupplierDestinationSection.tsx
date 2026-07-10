import { DocumentTextIcon } from '@heroicons/react/24/outline';
import React from 'react';
import Select from '../Select';

interface SelectOption {
  value: string;
  label: string;
}

interface SupplierDestinationSectionProps {
  supplierId: string;
  onSupplierIdChange: (value: string) => void;
  destinationId: string;
  onDestinationIdChange: (value: string) => void;
  paymentTerms: string;
  onPaymentTermsChange: (value: string) => void;
  currency: string;
  onCurrencyChange: (value: string) => void;
  vendorOptions: SelectOption[];
  locationOptions: SelectOption[];
  paymentTermsOptions: SelectOption[];
  currencyOptions: SelectOption[];
}

const SupplierDestinationSection: React.FC<SupplierDestinationSectionProps> = ({
  supplierId,
  onSupplierIdChange,
  destinationId,
  onDestinationIdChange,
  paymentTerms,
  onPaymentTermsChange,
  currency,
  onCurrencyChange,
  vendorOptions,
  locationOptions,
  paymentTermsOptions,
  currencyOptions,
}) => {
  return (
    <div className="border border-gray-200 p-4 bg-white/95">
      <h2 className="text-base font-medium text-gray-900 mb-3">Supplier & Destination</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Select
          label="Supplier"
          value={supplierId}
          options={vendorOptions}
          onChange={onSupplierIdChange}
          placeholder="Select supplier"
        />
        <Select
          label="Destination"
          value={destinationId}
          options={locationOptions}
          onChange={onDestinationIdChange}
          placeholder="Select destination"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
        <Select
          label="Payment terms (optional)"
          value={paymentTerms}
          options={paymentTermsOptions}
          onChange={onPaymentTermsChange}
          placeholder="Select payment terms"
        />
        <Select
          label="Supplier currency"
          value={currency}
          options={currencyOptions}
          onChange={onCurrencyChange}
          placeholder="Select currency"
        />
      </div>
    </div>
  );
};

export default SupplierDestinationSection;

