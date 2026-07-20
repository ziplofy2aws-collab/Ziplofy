import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AmountOffOrderDiscount } from '../contexts/amount-off-order-discount.context';

interface AmountOffOrderTableProps {
  discounts: AmountOffOrderDiscount[];
}

const AmountOffOrderTable: React.FC<AmountOffOrderTableProps> = ({
  discounts,
}) => {
  const navigate = useNavigate();

  const handleRowClick = useCallback((discountId: string) => {
    navigate(`/discounts/amount-off-order/${discountId}`);
  }, [navigate]);

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
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Eligibility</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Min Requirement</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Combinations</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Created</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {discounts.map((d) => {
              const codeOrTitle = d.method === 'discount-code' ? d.discountCode : d.title;
              const fixedDisplay = (d.fixedAmount ?? 0) >= 1000 ? ((d.fixedAmount ?? 0) / 100) : (d.fixedAmount ?? 0);
              const value = d.valueType === 'percentage' ? `${d.percentage ?? 0}%` : `₹${fixedDisplay}`;
              const minReq = d.minimumPurchase === 'minimum-amount'
                ? `Min Amount ₹${d.minimumAmount ?? 0}`
                : d.minimumPurchase === 'minimum-quantity'
                  ? `Min Qty ${d.minimumQuantity ?? 0}`
                  : 'None';
              const combos = `P:${d.productDiscounts ? 'Y' : 'N'} / O:${d.orderDiscounts ? 'Y' : 'N'} / S:${d.shippingDiscounts ? 'Y' : 'N'}`;
              return (
                <tr
                  key={d._id}
                  className="hover:bg-blue-50/50 cursor-pointer transition-colors"
                  onClick={() => handleRowClick(d._id)}
                >
                  <td className="px-4 py-3 text-sm text-gray-900">{codeOrTitle || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{d.method}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{value}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{d.eligibility}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{minReq}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{combos}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{d.status || 'active'}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{d.createdAt ? new Date(d.createdAt).toLocaleDateString() : '-'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AmountOffOrderTable;

