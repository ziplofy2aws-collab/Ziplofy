import React from 'react';
import { locationInputClass } from './locations/location-ui.util';

interface LocationFormFieldsProps {
  form: {
    name: string;
    countryRegion: string;
    address: string;
    apartment: string;
    city: string;
    state: string;
    postalCode: string;
    phone: string;
  };
  onChange: (field: string, value: string) => void;
}

const labelClass = 'mb-1.5 block text-[13px] font-medium text-gray-700';

const LocationFormFields: React.FC<LocationFormFieldsProps> = ({ form, onChange }) => {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200/80 bg-white shadow-sm">
      <div className="border-b border-gray-100 px-4 py-3">
        <h2 className="text-[13px] font-semibold text-gray-900">Location details</h2>
        <p className="mt-0.5 text-[12px] font-normal text-gray-500">
          Address and contact for this location.
        </p>
      </div>
      <div className="px-4 py-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="location-name">
              Location name
            </label>
            <input
              id="location-name"
              type="text"
              value={form.name}
              onChange={(e) => onChange('name', e.target.value)}
              className={locationInputClass}
              placeholder="e.g. Main store"
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="location-country">
              Country / region
            </label>
            <input
              id="location-country"
              type="text"
              value={form.countryRegion}
              onChange={(e) => onChange('countryRegion', e.target.value)}
              className={locationInputClass}
              placeholder="e.g. India"
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass} htmlFor="location-address">
              Address
            </label>
            <input
              id="location-address"
              type="text"
              value={form.address}
              onChange={(e) => onChange('address', e.target.value)}
              className={locationInputClass}
              placeholder="Street address"
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="location-apartment">
              Apartment, suite, etc. (optional)
            </label>
            <input
              id="location-apartment"
              type="text"
              value={form.apartment}
              onChange={(e) => onChange('apartment', e.target.value)}
              className={locationInputClass}
              placeholder="Optional"
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="location-city">
              City
            </label>
            <input
              id="location-city"
              type="text"
              value={form.city}
              onChange={(e) => onChange('city', e.target.value)}
              className={locationInputClass}
              placeholder="City"
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="location-state">
              State / province
            </label>
            <input
              id="location-state"
              type="text"
              value={form.state}
              onChange={(e) => onChange('state', e.target.value)}
              className={locationInputClass}
              placeholder="State or province"
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="location-postal">
              PIN / postal code
            </label>
            <input
              id="location-postal"
              type="text"
              value={form.postalCode}
              onChange={(e) => onChange('postalCode', e.target.value)}
              className={locationInputClass}
              placeholder="Postal code"
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="location-phone">
              Phone number
            </label>
            <input
              id="location-phone"
              type="text"
              value={form.phone}
              onChange={(e) => onChange('phone', e.target.value)}
              className={locationInputClass}
              placeholder="Phone"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationFormFields;
