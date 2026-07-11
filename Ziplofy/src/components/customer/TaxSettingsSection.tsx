import React, { useCallback } from 'react';
import {
  customerSectionSubtitleClass,
  customerSectionTitleClass,
} from '../customers/customer-ui.util';

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
    (value: string) => () => {
      onChange('taxSettings.collectTax', value);
    },
    [onChange]
  );

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200/80 bg-white shadow-sm">
      <div className="border-b border-gray-100 px-4 py-3">
        <h2 className={customerSectionTitleClass}>Tax settings</h2>
        <p className={customerSectionSubtitleClass}>Choose how tax applies to this customer.</p>
      </div>
      <div className="px-4 py-4">
        <fieldset>
          <legend className="sr-only">Tax collection</legend>
          <div className="space-y-2">
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="radio"
                name="collectTax"
                value="collect"
                checked={data.collectTax === 'collect'}
                onChange={handleChange('collect')}
                className="h-3.5 w-3.5 border-gray-300 text-gray-900 focus:ring-gray-300"
              />
              <span className="text-[13px] text-gray-700">Collect tax</span>
            </label>
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="radio"
                name="collectTax"
                value="dont_collect"
                checked={data.collectTax === 'dont_collect'}
                onChange={handleChange('dont_collect')}
                className="h-3.5 w-3.5 border-gray-300 text-gray-900 focus:ring-gray-300"
              />
              <span className="text-[13px] text-gray-700">Don&apos;t collect tax</span>
            </label>
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="radio"
                name="collectTax"
                value="collect_unless_exempt"
                checked={data.collectTax === 'collect_unless_exempt'}
                onChange={handleChange('collect_unless_exempt')}
                className="h-3.5 w-3.5 border-gray-300 text-gray-900 focus:ring-gray-300"
              />
              <span className="text-[13px] text-gray-700">Collect tax unless exemptions apply</span>
            </label>
          </div>
        </fieldset>
      </div>
    </div>
  );
};

export default TaxSettingsSection;
