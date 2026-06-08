import React from 'react';

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

const inputClass =
  'w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500';
const labelClass = 'block text-sm font-medium text-gray-700 mb-1';

const LocationFormFields: React.FC<LocationFormFieldsProps> = ({ form, onChange }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-5">
      <h2 className="text-base font-semibold text-gray-900">Location details</h2>
      <p className="mt-1 text-sm text-gray-500 mb-4">
        Address and contact for this location.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Location name</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => onChange('name', e.target.value)}
            className={inputClass}
            placeholder="e.g. Main store"
          />
        </div>
        <div>
          <label className={labelClass}>Country / region</label>
          <input
            type="text"
            value={form.countryRegion}
            onChange={(e) => onChange('countryRegion', e.target.value)}
            className={inputClass}
            placeholder="e.g. India"
          />
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass}>Address</label>
          <input
            type="text"
            value={form.address}
            onChange={(e) => onChange('address', e.target.value)}
            className={inputClass}
            placeholder="Street address"
          />
        </div>
        <div>
          <label className={labelClass}>Apartment, suite, etc. (optional)</label>
          <input
            type="text"
            value={form.apartment}
            onChange={(e) => onChange('apartment', e.target.value)}
            className={inputClass}
            placeholder="Optional"
          />
        </div>
        <div>
          <label className={labelClass}>City</label>
          <input
            type="text"
            value={form.city}
            onChange={(e) => onChange('city', e.target.value)}
            className={inputClass}
            placeholder="City"
          />
        </div>
        <div>
          <label className={labelClass}>State / province</label>
          <input
            type="text"
            value={form.state}
            onChange={(e) => onChange('state', e.target.value)}
            className={inputClass}
            placeholder="State or province"
          />
        </div>
        <div>
          <label className={labelClass}>PIN / postal code</label>
          <input
            type="text"
            value={form.postalCode}
            onChange={(e) => onChange('postalCode', e.target.value)}
            className={inputClass}
            placeholder="Postal code"
          />
        </div>
        <div>
          <label className={labelClass}>Phone number</label>
          <input
            type="text"
            value={form.phone}
            onChange={(e) => onChange('phone', e.target.value)}
            className={inputClass}
            placeholder="Phone"
          />
        </div>
      </div>
    </div>
  );
};

export default LocationFormFields;

