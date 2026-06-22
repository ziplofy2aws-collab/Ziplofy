import React, { useCallback } from 'react';
import {
  customerInputClass,
  customerLabelClass,
  customerSectionSubtitleClass,
  customerSectionTitleClass,
} from '../customers/customer-ui.util';

interface BasicInformationData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  language: string;
}

interface BasicInformationSectionProps {
  data: BasicInformationData;
  onChange: (field: string, value: string) => void;
}

const BasicInformationSection: React.FC<BasicInformationSectionProps> = ({
  data,
  onChange,
}) => {
  const handleChange = useCallback(
    (field: keyof BasicInformationData) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        onChange(field, e.target.value);
      },
    [onChange]
  );

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200/80 bg-white shadow-sm">
      <div className="border-b border-gray-100 px-4 py-3">
        <h2 className={customerSectionTitleClass}>Basic information</h2>
        <p className={customerSectionSubtitleClass}>Name, contact details, and language.</p>
      </div>
      <div className="px-4 py-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={customerLabelClass} htmlFor="customer-first-name">
              First name <span className="text-red-500">*</span>
            </label>
            <input
              id="customer-first-name"
              type="text"
              value={data.firstName}
              onChange={handleChange('firstName')}
              required
              className={customerInputClass}
            />
          </div>
          <div>
            <label className={customerLabelClass} htmlFor="customer-last-name">
              Last name <span className="text-red-500">*</span>
            </label>
            <input
              id="customer-last-name"
              type="text"
              value={data.lastName}
              onChange={handleChange('lastName')}
              required
              className={customerInputClass}
            />
          </div>
          <div>
            <label className={customerLabelClass} htmlFor="customer-email">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              id="customer-email"
              type="email"
              value={data.email}
              onChange={handleChange('email')}
              required
              className={customerInputClass}
            />
          </div>
          <div>
            <label className={customerLabelClass} htmlFor="customer-phone">
              Phone number <span className="text-red-500">*</span>
            </label>
            <input
              id="customer-phone"
              type="tel"
              value={data.phoneNumber}
              onChange={handleChange('phoneNumber')}
              required
              className={customerInputClass}
            />
          </div>
          <div>
            <label className={customerLabelClass} htmlFor="customer-language">
              Language
            </label>
            <select
              id="customer-language"
              value={data.language}
              onChange={handleChange('language')}
              className={customerInputClass}
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BasicInformationSection;
