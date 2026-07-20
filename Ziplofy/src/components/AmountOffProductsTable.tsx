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
    <div className="overflow-hidden rounded-xl border border-gray-200/70 bg-gray-50/40 shadow-sm ring-1 ring-black/[0.02]">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-gray-50/80">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Code / Title</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Method</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Value</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Applies to</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Eligibility</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Min Purchase</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Min Qty</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Product Disc.</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Order Disc.</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Shipping Disc.</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Total Uses Limit</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Limit Total Uses</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Created</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {discounts.map((d) => {
              const value = d.valueType === 'percentage'
                ? `${d.percentage ?? 0}%`
                : `₹${d.fixedAmount ?? 0}`;
              const codeOrTitle = d.method === 'discount-code' ? d.discountCode : d.title;
              return (
                <tr
                  key={d._id}
                  className="hover:bg-blue-50/50 cursor-pointer transition-colors"
                  onClick={() => handleRowClick(d._id)}
                >
                  <td className="px-4 py-3 text-sm text-gray-900">{codeOrTitle || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{d.method}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{value}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{d.appliesTo}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{d.eligibility}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{d.minimumPurchase || '-'}{d.minimumPurchase === 'minimum-amount' && d.minimumAmount !== undefined ? ` (₹${d.minimumAmount})` : ''}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{d.minimumQuantity ?? '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{boolToYesNo(d.productDiscounts)}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{boolToYesNo(d.orderDiscounts)}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{boolToYesNo(d.shippingDiscounts)}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{d.totalUsesLimit ?? '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{boolToYesNo(d.limitTotalUses)}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{d.status || 'active'}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{new Date(d.createdAt).toLocaleDateString()}</td>
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

