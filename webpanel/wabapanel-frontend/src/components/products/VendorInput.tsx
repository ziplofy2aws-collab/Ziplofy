import React, { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { useVendors } from "../../contexts/vendor.context";
import {
  type ProductFormAppearance,
  productFormInputClass,
  productFormLabelClass,
} from "./product-form-appearance";
import VendorMenu from "./VendorMenu";

interface VendorInputProps {
  selectedVendorId: string;
  activeStoreId: string | null;
  onVendorChange: (vendorId: string) => void;
  appearance?: ProductFormAppearance;
}

const VendorInput: React.FC<VendorInputProps> = ({
  selectedVendorId,
  activeStoreId,
  onVendorChange,
  appearance = "default",
}) => {
  const { vendors, fetchVendorsByStoreId, createVendor } = useVendors();

  const [vendorQuery, setVendorQuery] = useState("");
  const [vendorMenuOpen, setVendorMenuOpen] = useState(false);
  const [debouncedVendorQuery, setDebouncedVendorQuery] = useState("");

  useEffect(() => {
    if (activeStoreId) {
      fetchVendorsByStoreId(activeStoreId);
    }
  }, [activeStoreId, fetchVendorsByStoreId]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedVendorQuery(vendorQuery.trim()), 250);
    return () => clearTimeout(t);
  }, [vendorQuery]);

  const filteredVendors = useMemo(() => {
    const q = debouncedVendorQuery.toLowerCase();
    if (!q) return vendors.slice(0, 10);
    const starts = vendors.filter((v) => v.name.toLowerCase().startsWith(q));
    const includes = vendors
      .filter((v) => !v.name.toLowerCase().startsWith(q) && v.name.toLowerCase().includes(q))
      .sort((a, b) => a.name.toLowerCase().indexOf(q) - b.name.toLowerCase().indexOf(q));
    return [...starts, ...includes].slice(0, 10);
  }, [debouncedVendorQuery, vendors]);

  useEffect(() => {
    if (selectedVendorId) {
      const selected = vendors.find((v) => v._id === selectedVendorId);
      if (selected) {
        setVendorQuery(selected.name);
      }
    } else {
      setVendorQuery("");
    }
  }, [selectedVendorId, vendors]);

  const handleVendorSelect = useCallback(
    (vendorId: string, vendorName: string) => {
      onVendorChange(vendorId);
      setVendorQuery(vendorName);
      setVendorMenuOpen(false);
    },
    [onVendorChange]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setVendorQuery(e.target.value);
      if (!vendorMenuOpen) setVendorMenuOpen(true);
    },
    [vendorMenuOpen]
  );

  const handleFocus = useCallback(() => {
    setVendorMenuOpen(true);
  }, []);

  const handleBlur = useCallback(() => {
    setTimeout(() => setVendorMenuOpen(false), 150);
  }, []);

  const handleCreateVendor = useCallback(async () => {
    if (!activeStoreId) return;
    try {
      const created = await createVendor({ storeId: activeStoreId, name: debouncedVendorQuery });
      handleVendorSelect(created._id, created.name);
      toast.success("Vendor created");
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Failed to create vendor";
      toast.error(message);
    }
  }, [activeStoreId, debouncedVendorQuery, createVendor, handleVendorSelect]);

  const queryExists = useMemo(() => {
    return vendors.some((v) => v.name.toLowerCase() === debouncedVendorQuery.toLowerCase());
  }, [debouncedVendorQuery, vendors]);

  return (
    <div className="relative">
      <label className={productFormLabelClass(appearance)}>Vendor</label>
      <input
        type="text"
        value={vendorQuery}
        placeholder="Search or create a vendor"
        onChange={handleInputChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className={productFormInputClass(appearance)}
      />
      {vendorMenuOpen && (
        <VendorMenu
          vendors={filteredVendors}
          debouncedQuery={debouncedVendorQuery}
          queryExists={queryExists}
          onVendorSelect={handleVendorSelect}
          onCreateVendor={handleCreateVendor}
        />
      )}
    </div>
  );
};

export default VendorInput;
