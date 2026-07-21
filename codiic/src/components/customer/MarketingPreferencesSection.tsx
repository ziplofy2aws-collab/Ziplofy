import React, { useCallback } from 'react';
import {
  customerSectionSubtitleClass,
  customerSectionTitleClass,
} from '../customers/customer-ui.util';

interface MarketingPreferencesData {
  agreedToMarketingEmails: boolean;
  agreedToSmsMarketing: boolean;
}

interface MarketingPreferencesSectionProps {
  data: MarketingPreferencesData;
  onChange: (field: string, value: boolean) => void;
}

const MarketingPreferencesSection: React.FC<MarketingPreferencesSectionProps> = ({
  data,
  onChange,
}) => {
  const handleChange = useCallback(
    (field: keyof MarketingPreferencesData) => (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(field, e.target.checked);
    },
    [onChange]
  );

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200/80 bg-white shadow-sm">
      <div className="border-b border-gray-100 px-4 py-3">
        <h2 className={customerSectionTitleClass}>Marketing preferences</h2>
        <p className={customerSectionSubtitleClass}>How this customer can be contacted for marketing.</p>
      </div>
      <div className="px-4 py-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={data.agreedToMarketingEmails}
              onChange={handleChange('agreedToMarketingEmails')}
              className="h-3.5 w-3.5 rounded border-gray-300 text-gray-900 focus:ring-gray-300"
            />
            <span className="text-[13px] text-gray-700">Agreed to receive marketing emails</span>
          </label>
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={data.agreedToSmsMarketing}
              onChange={handleChange('agreedToSmsMarketing')}
              className="h-3.5 w-3.5 rounded border-gray-300 text-gray-900 focus:ring-gray-300"
            />
            <span className="text-[13px] text-gray-700">Agreed to receive SMS marketing</span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default MarketingPreferencesSection;
