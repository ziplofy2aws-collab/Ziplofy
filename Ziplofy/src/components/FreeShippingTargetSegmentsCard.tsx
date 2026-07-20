import React from "react";
import ChipList from "./ChipList";

interface FreeShippingTargetSegmentsCardProps {
  targetCustomerSegmentIds: any[];
  segmentLabel: (s: any) => string;
}

const FreeShippingTargetSegmentsCard: React.FC<FreeShippingTargetSegmentsCardProps> = ({
  targetCustomerSegmentIds,
  segmentLabel,
}) => {
  if (!targetCustomerSegmentIds || targetCustomerSegmentIds.length === 0) {
    return null;
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200/80 bg-white shadow-sm">
      <div className="px-5 py-4 sm:px-6 sm:py-5">
        <h2 className="text-[13px] font-semibold text-gray-900 mb-4">Target customer segments</h2>
        <ChipList items={targetCustomerSegmentIds.map((s: any, idx: number) => ({
          key: s?._id || idx.toString(),
          label: segmentLabel(s)
        }))} />
      </div>
    </div>
  );
};

export default FreeShippingTargetSegmentsCard;

