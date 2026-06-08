interface CatalogRowProps {
  id: string;
  title: string;
  status: string;
  includeCompareAtPrice?: boolean;
  priceAdjustment?: number;
  priceAdjustmentSide?: 'increase' | 'decrease';
  autoIncludeNewProducts?: boolean;
  onSelect: (id: string) => void;
}

export default function CatalogsTableRow({
  id,
  title,
  status,
  includeCompareAtPrice,
  priceAdjustment,
  priceAdjustmentSide,
  autoIncludeNewProducts,
  onSelect,
}: CatalogRowProps) {
  const isActive = status === 'active';
  return (
    <tr
      className="hover:bg-blue-50/50 cursor-pointer transition-colors"
      onClick={() => onSelect(id)}
    >
      <td className="px-4 py-3 text-sm font-medium text-gray-900">{title}</td>
      <td className="px-4 py-3">
        <span
          className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-lg border ${
            isActive
              ? 'bg-green-50 text-green-700 border-green-200/80'
              : 'bg-gray-100 text-gray-600 border-gray-200/80'
          }`}
        >
          {isActive ? 'Active' : 'Draft'}
        </span>
      </td>
      <td className="px-4 py-3 text-sm text-gray-600">—</td>
      <td className="px-4 py-3 text-sm text-gray-600">
        {includeCompareAtPrice ? 'Compare-at included' : '—'}
      </td>
      <td className="px-4 py-3 text-sm text-gray-600">
        {`${priceAdjustment || 0}% ${priceAdjustmentSide === 'increase' ? '↑' : '↓'}`}
      </td>
      <td className="px-4 py-3 text-sm text-gray-600">
        {autoIncludeNewProducts ? 'Auto include new' : 'Manual'}
      </td>
    </tr>
  );
}

