import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FreeShippingDiscount } from '../contexts/free-shipping-discount.context';

interface FreeShippingTableProps {
  discounts: FreeShippingDiscount[];
}

const FreeShippingTable: React.FC<FreeShippingTableProps> = ({
  discounts,
}) => {
  const navigate = useNavigate();

  const handleRowClick = useCallback((discountId: string) => {
    navigate(`/discounts/free-shipping/${discountId}`);
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
              <th className="px-4 py-3 text-left text-xs font-semibold text-admin-text-secondary">Country Selection</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-admin-text-secondary">Exclude Rates</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-admin-text-secondary">Rate Limit</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-admin-text-secondary">Eligibility</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-admin-text-secondary">Min Requirement</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-admin-text-secondary">Combinations</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-admin-text-secondary">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-admin-text-secondary">Created</th>
            </tr>
          </thead>
          <tbody className="bg-admin-surface divide-y divide-admin-divider">
            {discounts.map((d) => {
              const codeOrTitle = d.method === 'discount-code' ? d.discountCode : d.title;
              const minReq = d.minimumPurchase === 'minimum-amount'
                ? `Min Amount ₹${d.minimumAmount ?? 0}`
                : d.minimumPurchase === 'minimum-quantity'
                  ? `Min Qty ${d.minimumQuantity ?? 0}`
                  : 'None';
              const combos = `P:${d.productDiscounts ? 'Y' : 'N'} / O:${d.orderDiscounts ? 'Y' : 'N'}`;
              return (
                <tr
                  key={d._id}
                  className="hover:bg-admin-row-hover cursor-pointer transition-colors"
                  onClick={() => handleRowClick(d._id)}
                >
                  <td className="px-4 py-3 text-[13px] text-admin-text">{codeOrTitle || '-'}</td>
                  <td className="px-4 py-3 text-[13px] text-admin-text">{d.method}</td>
                  <td className="px-4 py-3 text-[13px] text-admin-text">{d.countrySelection}</td>
                  <td className="px-4 py-3 text-[13px] text-admin-text">{d.excludeShippingRates ? 'Yes' : 'No'}</td>
                  <td className="px-4 py-3 text-[13px] text-admin-text">{d.excludeShippingRates ? (d.shippingRateLimit ?? '-') : '-'}</td>
                  <td className="px-4 py-3 text-[13px] text-admin-text">{d.eligibility}</td>
                  <td className="px-4 py-3 text-[13px] text-admin-text">{minReq}</td>
                  <td className="px-4 py-3 text-[13px] text-admin-text">{combos}</td>
                  <td className="px-4 py-3 text-[13px] text-admin-text">{d.status || 'active'}</td>
                  <td className="px-4 py-3 text-[13px] text-admin-text">{d.createdAt ? new Date(d.createdAt).toLocaleDateString() : '-'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FreeShippingTable;

