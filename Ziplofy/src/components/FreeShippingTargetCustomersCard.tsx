import React from "react";
import ChipList from "./ChipList";

interface FreeShippingTargetCustomersCardProps {
  targetCustomerIds: any[];
  customerLabel: (c: any) => string;
}

const FreeShippingTargetCustomersCard: React.FC<FreeShippingTargetCustomersCardProps> = ({
  targetCustomerIds,
  customerLabel,
}) => {
  if (!targetCustomerIds || targetCustomerIds.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm overflow-hidden">
      <div className="px-5 py-4 sm:px-6 sm:py-5">
        <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">Target customers</h2>
        <ChipList items={targetCustomerIds.map((c: any, idx: number) => ({
          key: c?._id || idx.toString(),
          label: customerLabel(c)
        }))} />
      </div>
    </div>
  );
};

export default FreeShippingTargetCustomersCard;

