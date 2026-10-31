import React, { useCallback } from "react";

interface Vendor {
  _id: string;
  name: string;
}

interface VendorItemProps {
  vendor: Vendor;
  onSelect: (vendorId: string, vendorName: string) => void;
}

const VendorItem: React.FC<VendorItemProps> = ({
  vendor,
  onSelect,
}) => {
  const handleClick = useCallback(() => {
    onSelect(vendor._id, vendor.name);
  }, [vendor, onSelect]);

  return (
    <div
      className="cursor-pointer px-3 py-2 text-[13px] text-gray-700 transition-colors hover:bg-gray-50"
      onClick={handleClick}
    >
      {vendor.name}
    </div>
  );
};

export default VendorItem;

