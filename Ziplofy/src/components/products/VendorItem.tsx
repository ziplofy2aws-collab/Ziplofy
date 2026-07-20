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
      className="px-4 py-2 cursor-pointer hover:bg-gray-100 transition-colors"
      onClick={handleClick}
    >
      {vendor.name}
    </div>
  );
};

export default VendorItem;

