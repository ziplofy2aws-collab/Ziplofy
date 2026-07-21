import React from 'react';
import Select from '../Select';
import {
  productFormCardClass,
  productFormSectionTitleClass,
} from '../products/product-form-appearance';
import { PO_FORM_APPEARANCE } from './purchase-order-ui.util';

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
    <section className={productFormCardClass(PO_FORM_APPEARANCE)}>
      <h2 className={productFormSectionTitleClass(PO_FORM_APPEARANCE)}>Supplier & destination</h2>
      <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
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
      <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
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
    </section>
  );
};

export default SupplierDestinationSection;
