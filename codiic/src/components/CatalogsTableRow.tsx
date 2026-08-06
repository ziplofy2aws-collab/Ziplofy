import { adminListRowClass, adminListTableCellClass } from './admin-list-ui';

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
    <tr className={adminListRowClass} onClick={() => onSelect(id)}>
      <td className={`${adminListTableCellClass} font-medium text-admin-text`}>{title}</td>
      <td className={adminListTableCellClass}>
        <span
          className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium ${
            isActive
              ? 'bg-admin-secondary text-admin-text'
              : 'bg-admin-fill text-admin-text-secondary'
          }`}
        >
          {isActive ? 'Active' : 'Draft'}
        </span>
      </td>
      <td className={adminListTableCellClass}>—</td>
      <td className={adminListTableCellClass}>
        {includeCompareAtPrice ? 'Compare-at included' : '—'}
      </td>
      <td className={adminListTableCellClass}>
        {`${priceAdjustment || 0}% ${priceAdjustmentSide === 'increase' ? '↑' : '↓'}`}
      </td>
      <td className={adminListTableCellClass}>
        {autoIncludeNewProducts ? 'Auto include new' : 'Manual'}
      </td>
    </tr>
  );
}
