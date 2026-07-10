import React, { useCallback } from 'react';

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
    <div className="bg-white rounded-xl border border-gray-200/80 p-6 shadow-sm">
      <h2 className="text-base font-semibold text-gray-900 mb-4">Marketing Preferences</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={data.agreedToMarketingEmails}
            onChange={handleChange('agreedToMarketingEmails')}
            className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-400"
          />
          <span className="text-sm text-gray-700">Agreed to receive marketing emails</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={data.agreedToSmsMarketing}
            onChange={handleChange('agreedToSmsMarketing')}
            className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-400"
          />
          <span className="text-sm text-gray-700">Agreed to receive SMS marketing</span>
        </label>
      </div>
    </div>
  );
};

export default MarketingPreferencesSection;

