import React from "react";
import VendorItem from "./VendorItem";

interface Vendor {
  _id: string;
  name: string;
}

interface VendorListProps {
  vendors: Vendor[];
  onVendorSelect: (vendorId: string, vendorName: string) => void;
}

const VendorList: React.FC<VendorListProps> = ({
  vendors,
  onVendorSelect,
}) => {
  return (
    <>
      {vendors.map(v => (
        <VendorItem
          key={v._id}
          vendor={v}
          onSelect={onVendorSelect}
        />
      ))}
    </>
  );
};

export default VendorList;

