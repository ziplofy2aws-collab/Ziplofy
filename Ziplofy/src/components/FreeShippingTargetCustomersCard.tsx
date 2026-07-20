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
    <div className="overflow-hidden rounded-lg border border-gray-200/80 bg-white shadow-sm">
      <div className="px-5 py-4 sm:px-6 sm:py-5">
        <h2 className="text-[13px] font-semibold text-gray-900 mb-4">Target customers</h2>
        <ChipList items={targetCustomerIds.map((c: any, idx: number) => ({
          key: c?._id || idx.toString(),
          label: customerLabel(c)
        }))} />
      </div>
    </div>
  );
};

export default FreeShippingTargetCustomersCard;

