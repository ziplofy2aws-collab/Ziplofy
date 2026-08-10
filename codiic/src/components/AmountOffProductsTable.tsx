import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

interface AmountOffProductsDiscount {
  _id: string;
  valueType: 'percentage' | 'fixed-amount';
  percentage?: number;
  fixedAmount?: number;
  method: string;
  discountCode?: string;
  title?: string;
  appliesTo?: string;
  eligibility?: string;
  minimumPurchase?: string;
  minimumAmount?: number;
  minimumQuantity?: number;
  productDiscounts?: boolean;
  orderDiscounts?: boolean;
  shippingDiscounts?: boolean;
  totalUsesLimit?: number;
  limitTotalUses?: boolean;
  status?: string;
  createdAt: string;
}

interface AmountOffProductsTableProps {
  discounts: AmountOffProductsDiscount[];
}

const AmountOffProductsTable: React.FC<AmountOffProductsTableProps> = ({
  discounts,
}) => {
  const navigate = useNavigate();

  const handleRowClick = useCallback((discountId: string) => {
    navigate(`/discounts/amount-off-products/${discountId}`);
  }, [navigate]);

  const boolToYesNo = useCallback((v?: boolean) => (v ? 'Yes' : 'No'), []);

  if (discounts.length === 0) {
    return null;
  }

  return (
    <div className="overflow-hidden rounded-xl border border-admin-border bg-admin-surface">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-admin-divider">
          <thead className="bg-admin-table-header">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-admin-text-secondary">Code / Title</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-admin-text-secondary">Method</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-admin-text-secondary">Value</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-admin-text-secondary">Applies to</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-admin-text-secondary">Eligibility</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-admin-text-secondary">Min Purchase</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-admin-text-secondary">Min Qty</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-admin-text-secondary">Product Disc.</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-admin-text-secondary">Order Disc.</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-admin-text-secondary">Shipping Disc.</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-admin-text-secondary">Total Uses Limit</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-admin-text-secondary">Limit Total Uses</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-admin-text-secondary">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-admin-text-secondary">Created</th>
            </tr>
          </thead>
          <tbody className="bg-admin-surface divide-y divide-admin-divider">
            {discounts.map((d) => {
              const value = d.valueType === 'percentage'
                ? `${d.percentage ?? 0}%`
                : `₹${d.fixedAmount ?? 0}`;
              const codeOrTitle = d.method === 'discount-code' ? d.discountCode : d.title;
              return (
                <tr
                  key={d._id}
                  className="hover:bg-admin-row-hover cursor-pointer transition-colors"
                  onClick={() => handleRowClick(d._id)}
                >
                  <td className="px-4 py-3 text-sm text-admin-text">{codeOrTitle || '-'}</td>
                  <td className="px-4 py-3 text-sm text-admin-text">{d.method}</td>
                  <td className="px-4 py-3 text-sm text-admin-text">{value}</td>
                  <td className="px-4 py-3 text-sm text-admin-text">{d.appliesTo}</td>
                  <td className="px-4 py-3 text-sm text-admin-text">{d.eligibility}</td>
                  <td className="px-4 py-3 text-sm text-admin-text">{d.minimumPurchase || '-'}{d.minimumPurchase === 'minimum-amount' && d.minimumAmount !== undefined ? ` (₹${d.minimumAmount})` : ''}</td>
                  <td className="px-4 py-3 text-sm text-admin-text">{d.minimumQuantity ?? '-'}</td>
                  <td className="px-4 py-3 text-sm text-admin-text">{boolToYesNo(d.productDiscounts)}</td>
                  <td className="px-4 py-3 text-sm text-admin-text">{boolToYesNo(d.orderDiscounts)}</td>
                  <td className="px-4 py-3 text-sm text-admin-text">{boolToYesNo(d.shippingDiscounts)}</td>
                  <td className="px-4 py-3 text-sm text-admin-text">{d.totalUsesLimit ?? '-'}</td>
                  <td className="px-4 py-3 text-sm text-admin-text">{boolToYesNo(d.limitTotalUses)}</td>
                  <td className="px-4 py-3 text-sm text-admin-text">{d.status || 'active'}</td>
                  <td className="px-4 py-3 text-sm text-admin-text">{new Date(d.createdAt).toLocaleDateString()}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AmountOffProductsTable;

