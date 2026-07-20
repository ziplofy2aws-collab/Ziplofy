import React from 'react';
import { DataSaleOption } from '../contexts/pixel.context';

interface PixelDataSaleSectionProps {
  dataSale: DataSaleOption;
  onDataSaleChange: (value: DataSaleOption) => void;
}

const PixelDataSaleSection: React.FC<PixelDataSaleSectionProps> = ({
  dataSale,
  onDataSaleChange,
}) => {
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-4">
      <h3 className="text-base font-semibold text-gray-900 mb-2">Data sale</h3>
      <fieldset>
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              name="dataSale"
              value="qualifies_as_data_sale"
              checked={dataSale === 'qualifies_as_data_sale'}
              onChange={(e) => onDataSaleChange(e.target.value as DataSaleOption)}
              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-900">Data collected qualifies as data sale</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              name="dataSale"
              value="qualifies_as_data_sale_limited_use"
              checked={dataSale === 'qualifies_as_data_sale_limited_use'}
              onChange={(e) => onDataSaleChange(e.target.value as DataSaleOption)}
              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-900">Data collected qualifies as data sale and supports limited data use</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              name="dataSale"
              value="does_not_qualify_as_data_sale"
              checked={dataSale === 'does_not_qualify_as_data_sale'}
              onChange={(e) => onDataSaleChange(e.target.value as DataSaleOption)}
              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-900">Data collected does not qualify as data sale</span>
          </label>
        </div>
      </fieldset>
    </div>
  );
};

export default PixelDataSaleSection;

