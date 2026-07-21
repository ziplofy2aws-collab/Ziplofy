import React, { useCallback } from "react";

interface ProductTaxCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

const ProductTaxCheckbox: React.FC<ProductTaxCheckboxProps> = ({
  checked,
  onChange,
}) => {
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.checked);
  }, [onChange]);

  return (
    <div>
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={handleChange}
          className="w-3.5 h-3.5 text-gray-900 focus:ring-gray-400 rounded border-gray-300"
        />
        <span className="text-sm text-gray-700">Charge tax on this product</span>
      </label>
    </div>
  );
};

export default ProductTaxCheckbox;

