import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { BuyXGetYDiscount } from '../contexts/buy-x-get-y-discount.context';

interface BuyXGetYTableProps {
  discounts: BuyXGetYDiscount[];
}

const BuyXGetYTable: React.FC<BuyXGetYTableProps> = ({
  discounts,
}) => {
  const navigate = useNavigate();

  const handleRowClick = useCallback((discountId: string) => {
    navigate(`/discounts/pyxgety/${discountId}`);
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
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Customer Buys</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Any Items From</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Gets Qty</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Gets From</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Value</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Eligibility</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Created</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {discounts.map((d) => {
              const codeOrTitle = d.method === 'discount-code' ? d.discountCode : d.title;
              const value = d.discountedValue === 'percentage' ? `${d.discountedPercentage ?? 0}%` : d.discountedValue === 'amount' ? `₹${d.discountedAmount ?? 0 }` : 'Free';
              return (
                <tr
                  key={d._id}
                  className="hover:bg-blue-50/50 cursor-pointer transition-colors"
                  onClick={() => handleRowClick(d._id)}
                >
                  <td className="px-4 py-3 text-sm text-gray-900">{codeOrTitle || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{d.method}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{d.customerBuys}{d.customerBuys === 'minimum-quantity' && d.quantity ? ` (${d.quantity})` : d.customerBuys === 'minimum-amount' && d.amount ? ` (₹${d.amount})` : ''}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{d.anyItemsFrom}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{d.customerGetsQuantity}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{d.customerGetsAnyItemsFrom}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{value}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{d.eligibility}</td>
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

export default BuyXGetYTable;

