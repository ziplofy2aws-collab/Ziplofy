import React, { useCallback } from "react";

interface ProductStatusSectionProps {
  status: "draft" | "active";
  onChange: (status: "draft" | "active") => void;
}

const ProductStatusSection: React.FC<ProductStatusSectionProps> = ({
  status,
  onChange,
}) => {
  const handleStatusChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value as "draft" | "active");
  }, [onChange]);

  return (
    <div className="bg-white rounded-xl border border-gray-200/80 p-6 shadow-sm">
      <h2 className="text-base font-semibold text-gray-900 mb-4">
        Status
      </h2>
      
      <fieldset>
        <legend className="text-xs font-medium text-gray-600 mb-2">
          Product Status
        </legend>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              value="active"
              checked={status === "active"}
              onChange={handleStatusChange}
              className="w-3.5 h-3.5 text-gray-900 focus:ring-gray-400"
            />
            <span className="text-sm text-gray-700">Active (visible to customers)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              value="draft"
              checked={status === "draft"}
              onChange={handleStatusChange}
              className="w-3.5 h-3.5 text-gray-900 focus:ring-gray-400"
            />
            <span className="text-sm text-gray-700">Draft (not visible to customers)</span>
          </label>
        </div>
      </fieldset>
    </div>
  );
};

export default ProductStatusSection;

