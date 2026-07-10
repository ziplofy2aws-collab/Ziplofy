import React from 'react';

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
    const ov = variant.optionValues || {};
    const parts = Object.values(ov).map((val: any) => String(val));
    return parts.join(' / ');
  })();

  const availability = typeof variant.availability === 'number' ? variant.availability : 0;

  return (
    <tr
      key={`var-${variantId}`}
      onClick={() => onToggle(variantId)}
      className={`cursor-pointer hover:bg-gray-50 ${isSelected ? 'bg-gray-100' : ''}`}
    >
      <td className="px-4 py-2">
        <span className="text-sm text-gray-900">{variantLabel}</span>
      </td>
      <td className="px-4 py-2 text-right text-sm text-gray-900">{availability}</td>
    </tr>
  );
};

export default VariantTableRow;

