import {
  adminListTableHeadClass,
  adminListTableHeadRowClass,
} from './admin-list-ui';
import CatalogsTableRow from './CatalogsTableRow';

interface CatalogItem {
  _id: string;
  title: string;
  status: string;
  includeCompareAtPrice?: boolean;
  priceAdjustment?: number;
  priceAdjustmentSide?: 'increase' | 'decrease';
  autoIncludeNewProducts?: boolean;
}

interface CatalogsTableProps {
  catalogs: CatalogItem[];
  onSelect: (id: string) => void;
}

export default function CatalogsTable({ catalogs, onSelect }: CatalogsTableProps) {
  return (
    <div className="overflow-x-auto bg-admin-surface">
      <table className="w-full min-w-[720px] border-collapse text-left">
        <thead>
          <tr className={adminListTableHeadRowClass}>
            <th className={adminListTableHeadClass}>Title</th>
            <th className={adminListTableHeadClass}>Status</th>
            <th className={adminListTableHeadClass}>Assigned to</th>
            <th className={adminListTableHeadClass}>Price overrides</th>
            <th className={adminListTableHeadClass}>Overall adjustment</th>
            <th className={adminListTableHeadClass}>Products</th>
          </tr>
        </thead>
        <tbody className="bg-admin-surface">
          {catalogs.map((c) => (
            <CatalogsTableRow
              key={c._id}
              id={c._id}
              title={c.title}
              status={c.status}
              includeCompareAtPrice={c.includeCompareAtPrice}
              priceAdjustment={c.priceAdjustment}
              priceAdjustmentSide={c.priceAdjustmentSide}
              autoIncludeNewProducts={c.autoIncludeNewProducts}
              onSelect={onSelect}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
