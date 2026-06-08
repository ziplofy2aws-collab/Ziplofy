import React from "react";

interface ProductTitleInputProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}

const ProductTitleInput: React.FC<ProductTitleInputProps> = ({ 
  value, 
  onChange, 
  required = true 
}) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Product Title {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter product title"
        required={required}
        className="w-full px-3 py-2 border border-gray-200 rounded text-base focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-colors"
      />
    </div>
  );
};

export default ProductTitleInput;

