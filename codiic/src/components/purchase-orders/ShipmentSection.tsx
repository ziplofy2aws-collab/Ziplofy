import React from 'react';
import Select from '../Select';
import {
  productFormCardClass,
  productFormInputClass,
  productFormLabelClass,
  productFormSectionTitleClass,
} from '../products/product-form-appearance';
import { PO_FORM_APPEARANCE } from './purchase-order-ui.util';

interface SelectOption {
  value: string;
  label: string;
}

interface ShipmentSectionProps {
  eta: string;
  onEtaChange: (value: string) => void;
  carrier: string;
  onCarrierChange: (value: string) => void;
  tracking: string;
  onTrackingChange: (value: string) => void;
  carrierOptions: SelectOption[];
}

const ShipmentSection: React.FC<ShipmentSectionProps> = ({
  eta,
  onEtaChange,
  carrier,
  onCarrierChange,
  tracking,
  onTrackingChange,
  carrierOptions,
}) => {
  return (
    <section className={productFormCardClass(PO_FORM_APPEARANCE)}>
      <h2 className={productFormSectionTitleClass(PO_FORM_APPEARANCE)}>Shipment details</h2>
      <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
        <div>
          <label className={productFormLabelClass(PO_FORM_APPEARANCE)} htmlFor="po-eta">
            Estimated arrival
          </label>
          <input
            id="po-eta"
            type="date"
            value={eta}
            onChange={(e) => onEtaChange(e.target.value)}
            className={productFormInputClass(PO_FORM_APPEARANCE)}
          />
        </div>
        <Select
          label="Shipping carrier"
          value={carrier}
          options={carrierOptions}
          onChange={onCarrierChange}
          placeholder="Select carrier"
        />
        <div>
          <label className={productFormLabelClass(PO_FORM_APPEARANCE)} htmlFor="po-tracking">
            Tracking number
          </label>
          <input
            id="po-tracking"
            type="text"
            placeholder="Enter tracking"
            value={tracking}
            onChange={(e) => onTrackingChange(e.target.value)}
            className={productFormInputClass(PO_FORM_APPEARANCE)}
          />
        </div>
      </div>
    </section>
  );
};

export default ShipmentSection;
