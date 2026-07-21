import { QuestionMarkCircleIcon } from "@heroicons/react/24/outline";
import React, { useCallback } from "react";

interface CompareAtPriceInputProps {
  value: string;
  onChange: (value: string) => void;
}

const CompareAtPriceInput: React.FC<CompareAtPriceInputProps> = ({
  value,
  onChange,
}) => {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value);
    },
    [onChange]
  );

  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-700">
        Compare-at price
      </label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base text-gray-500">
          ₹
        </span>
        <input
          type="number"
          value={value}
          onChange={handleChange}
          placeholder="0.00"
          className="w-full rounded-lg border border-gray-200 py-2 pl-8 pr-10 text-base transition-colors focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400"
        />
        <span
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
          title="Shown to customers to highlight a discount from this price."
        >
          <QuestionMarkCircleIcon className="h-4 w-4" aria-hidden />
        </span>
      </div>
    </div>
  );
};

export default CompareAtPriceInput;

