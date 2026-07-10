import React from "react";
import ChipList from "./ChipList";

interface Product {
  _id: string;
  title?: string;
}

interface Collection {
  _id: string;
  title?: string;
}

interface CustomerSegment {
  _id: string;
  name?: string;
}

interface Customer {
  _id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
}

interface DiscountTargetsCardProps {
  targetProductDetails?: Product[];
  targetProductIds?: string[];
  targetCollectionDetails?: Collection[];
  targetCollectionIds?: string[];
  targetCustomerSegmentDetails?: CustomerSegment[];
  targetCustomerSegmentIds?: string[];
  targetCustomerDetails?: Customer[];
  targetCustomerIds?: string[];
}

function TargetBlock({
  title,
  chips,
  emptyLabel = "None",
}: {
  title: string;
  chips: { key: string; label: string }[];
  emptyLabel?: string;
}) {
  return (
    <div>
      <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">{title}</h3>
      {chips.length > 0 ? (
        <ChipList items={chips} />
      ) : (
        <p className="text-sm text-gray-400">{emptyLabel}</p>
      )}
    </div>
  );
}

const DiscountTargetsCard: React.FC<DiscountTargetsCardProps> = ({
  targetProductDetails,
  targetProductIds,
  targetCollectionDetails,
  targetCollectionIds,
  targetCustomerSegmentDetails,
  targetCustomerSegmentIds,
  targetCustomerDetails,
  targetCustomerIds,
}) => {
  const productChips =
    targetProductDetails?.length
      ? targetProductDetails.map((p) => ({ key: p._id, label: p.title || p._id }))
      : targetProductIds?.length
        ? targetProductIds.map((id) => ({ key: id, label: id }))
        : [];
  const collectionChips =
    targetCollectionDetails?.length
      ? targetCollectionDetails.map((c) => ({ key: c._id, label: c.title || c._id }))
      : targetCollectionIds?.length
        ? targetCollectionIds.map((id) => ({ key: id, label: id }))
        : [];
  const segmentChips =
    targetCustomerSegmentDetails?.length
      ? targetCustomerSegmentDetails.map((s) => ({ key: s._id, label: s.name || s._id }))
      : targetCustomerSegmentIds?.length
        ? targetCustomerSegmentIds.map((id) => ({ key: id, label: id }))
        : [];
  const customerChips =
    targetCustomerDetails?.length
      ? targetCustomerDetails.map((c) => ({
          key: c._id,
          label: `${c.firstName || ""} ${c.lastName || ""}`.trim() || c.email || c._id,
        }))
      : targetCustomerIds?.length
        ? targetCustomerIds.map((id) => ({ key: id, label: id }))
        : [];

  return (
    <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm overflow-hidden">
      <div className="px-5 py-4 sm:px-6 sm:py-5">
        <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">Targets</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <TargetBlock title="Products" chips={productChips} />
          <TargetBlock title="Collections" chips={collectionChips} />
          <TargetBlock title="Customer segments" chips={segmentChips} />
          <TargetBlock title="Customers" chips={customerChips} />
        </div>
      </div>
    </div>
  );
};

export default DiscountTargetsCard;

