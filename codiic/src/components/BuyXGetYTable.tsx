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
    <div className="overflow-hidden rounded-xl border border-admin-border bg-admin-surface">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-admin-divider">
          <thead className="bg-admin-table-header">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-admin-text-secondary">Code / Title</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-admin-text-secondary">Method</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-admin-text-secondary">Customer Buys</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-admin-text-secondary">Any Items From</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-admin-text-secondary">Gets Qty</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-admin-text-secondary">Gets From</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-admin-text-secondary">Value</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-admin-text-secondary">Eligibility</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-admin-text-secondary">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-admin-text-secondary">Created</th>
            </tr>
          </thead>
          <tbody className="bg-admin-surface divide-y divide-admin-divider">
            {discounts.map((d) => {
              const codeOrTitle = d.method === 'discount-code' ? d.discountCode : d.title;
              const value = d.discountedValue === 'percentage' ? `${d.discountedPercentage ?? 0}%` : d.discountedValue === 'amount' ? `₹${d.discountedAmount ?? 0 }` : 'Free';
              return (
                <tr
                  key={d._id}
                  className="hover:bg-admin-row-hover cursor-pointer transition-colors"
                  onClick={() => handleRowClick(d._id)}
                >
                  <td className="px-4 py-3 text-sm text-admin-text">{codeOrTitle || '-'}</td>
                  <td className="px-4 py-3 text-sm text-admin-text">{d.method}</td>
                  <td className="px-4 py-3 text-sm text-admin-text">{d.customerBuys}{d.customerBuys === 'minimum-quantity' && d.quantity ? ` (${d.quantity})` : d.customerBuys === 'minimum-amount' && d.amount ? ` (₹${d.amount})` : ''}</td>
                  <td className="px-4 py-3 text-sm text-admin-text">{d.anyItemsFrom}</td>
                  <td className="px-4 py-3 text-sm text-admin-text">{d.customerGetsQuantity}</td>
                  <td className="px-4 py-3 text-sm text-admin-text">{d.customerGetsAnyItemsFrom}</td>
                  <td className="px-4 py-3 text-sm text-admin-text">{value}</td>
                  <td className="px-4 py-3 text-sm text-admin-text">{d.eligibility}</td>
                  <td className="px-4 py-3 text-sm text-admin-text">{d.status || 'active'}</td>
                  <td className="px-4 py-3 text-sm text-admin-text">{d.createdAt ? new Date(d.createdAt).toLocaleDateString() : '-'}</td>
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

