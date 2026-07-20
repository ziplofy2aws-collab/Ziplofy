import React from "react";
import {
  type ProductFormAppearance,
  productFormInputClass,
  productFormLabelClass,
} from "./product-form-appearance";

interface ProductTitleInputProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  appearance?: ProductFormAppearance;
}

const ProductTitleInput: React.FC<ProductTitleInputProps> = ({
  value,
  onChange,
  required = true,
  appearance = 'default',
}) => {
  return (
    <div>
      <label className={productFormLabelClass(appearance)}>
        Product Title {required && <span className="text-red-400">*</span>}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter product title"
        required={required}
        className={productFormInputClass(appearance)}
      />
    </div>
  );
};

export default ProductTitleInput;
