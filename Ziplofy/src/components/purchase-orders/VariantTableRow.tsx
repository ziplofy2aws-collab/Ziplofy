import React from 'react';
import { poTableCellClass, poTableCellRightClass } from './purchase-order-ui.util';

interface VariantTableRowProps {
  variantId: string;
  variant: any;
  isSelected: boolean;
  onToggle: (variantId: string) => void;
}

const VariantTableRow: React.FC<VariantTableRowProps> = ({
  variantId,
  variant,
  isSelected,
  onToggle,
}) => {
  const variantLabel = (() => {
    const optionValues = variant.optionValues || {};
    return Object.values(optionValues).map((value) => String(value)).join(' / ');
  })();

  const availability = typeof variant.availability === 'number' ? variant.availability : 0;

  return (
    <tr
      onClick={() => onToggle(variantId)}
      className={`cursor-pointer border-b border-gray-100 transition-colors hover:bg-gray-50/60 ${
        isSelected ? 'bg-gray-50' : ''
      }`}
    >
      <td className={`${poTableCellClass} pl-12`}>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={isSelected}
            readOnly
            className="h-3.5 w-3.5 rounded border-gray-300 text-gray-900 focus:ring-gray-300"
          />
          <span>{variantLabel || 'Default variant'}</span>
        </div>
      </td>
      <td className={poTableCellRightClass}>{availability}</td>
    </tr>
  );
};

export default VariantTableRow;
