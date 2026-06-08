import React from "react";
import ChipList from "./ChipList";

interface Product {
  _id: string;
  title: string;
}

interface Collection {
  _id: string;
  title: string;
}

interface CustomerSegment {
  _id: string;
  name: string;
}

interface Customer {
  _id: string;
  name: string;
}

interface BuyXGetYTargetsCardProps {
  buysProducts: Product[];
  buysCollections: Collection[];
  getsProducts: Product[];
  getsCollections: Collection[];
  segments: CustomerSegment[];
  customers: Customer[];
}

function TargetBlock({
  title,
  chips,
}: {
  title: string;
  chips: { key: string; label: string }[];
}) {
  return (
    <div>
      <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">{title}</h3>
      {chips.length > 0 ? (
        <ChipList items={chips} />
      ) : (
        <p className="text-sm text-gray-400">None</p>
      )}
    </div>
  );
}

const BuyXGetYTargetsCard: React.FC<BuyXGetYTargetsCardProps> = ({
  buysProducts,
  buysCollections,
  getsProducts,
  getsCollections,
  segments,
  customers,
}) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm overflow-hidden">
      <div className="px-5 py-4 sm:px-6 sm:py-5">
        <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">Targets</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <TargetBlock title="Buys – Products" chips={buysProducts.map(p => ({ key: p._id, label: p.title }))} />
          <TargetBlock title="Buys – Collections" chips={buysCollections.map(c => ({ key: c._id, label: c.title }))} />
          <TargetBlock title="Gets – Products" chips={getsProducts.map(p => ({ key: p._id, label: p.title }))} />
          <TargetBlock title="Gets – Collections" chips={getsCollections.map(c => ({ key: c._id, label: c.title }))} />
          <TargetBlock title="Customer segments" chips={segments.map(s => ({ key: s._id, label: s.name }))} />
          <TargetBlock title="Customers" chips={customers.map(c => ({ key: c._id, label: c.name }))} />
        </div>
      </div>
    </div>
  );
};

export default BuyXGetYTargetsCard;

