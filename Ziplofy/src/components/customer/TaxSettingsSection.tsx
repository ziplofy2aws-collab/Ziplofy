import React, { useCallback } from 'react';

interface TaxSettingsData {
  collectTax: 'collect' | 'dont_collect' | 'collect_unless_exempt';
}

interface TaxSettingsSectionProps {
  data: TaxSettingsData;
  onChange: (field: string, value: string) => void;
}

const TaxSettingsSection: React.FC<TaxSettingsSectionProps> = ({
  data,
  onChange,
}) => {
  const handleChange = useCallback(
    (value: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange('taxSettings.collectTax', value);
    },
    [onChange]
  );

  return (
    <div className="bg-white rounded-xl border border-gray-200/80 p-6 shadow-sm">
      <h2 className="text-base font-semibold text-gray-900 mb-4">Tax Settings</h2>
      
      <fieldset>
        <legend className="block text-sm font-medium text-gray-700 mb-2">Tax Collection</legend>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="collectTax"
              value="collect"
              checked={data.collectTax === 'collect'}
              onChange={handleChange('collect')}
              className="w-4 h-4 text-gray-900 border-gray-300 focus:ring-gray-400"
            />
            <span className="text-sm text-gray-700">Collect Tax</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="collectTax"
              value="dont_collect"
              checked={data.collectTax === 'dont_collect'}
              onChange={handleChange('dont_collect')}
              className="w-4 h-4 text-gray-900 border-gray-300 focus:ring-gray-400"
            />
            <span className="text-sm text-gray-700">Don't collect tax</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="collectTax"
              value="collect_unless_exempt"
              checked={data.collectTax === 'collect_unless_exempt'}
              onChange={handleChange('collect_unless_exempt')}
              className="w-4 h-4 text-gray-900 border-gray-300 focus:ring-gray-400"
            />
            <span className="text-sm text-gray-700">Collect tax unless exemptions apply</span>
          </label>
        </div>
      </fieldset>
    </div>
  );
};

export default TaxSettingsSection;

