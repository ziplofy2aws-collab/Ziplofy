import React from 'react';
import ProductSearchResults from './ProductSearchResults';

interface ProductSearchTableProps {
  searching: boolean;
  results: any[];
  selectedVariantIds: Set<string>;
  onVariantToggle: (variantId: string) => void;
}

const ProductSearchTable: React.FC<ProductSearchTableProps> = ({
  searching,
  results,
  selectedVariantIds,
  onVariantToggle,
}) => {
  return (
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-white">
        <tr>
          <th className="px-4 py-2 text-left text-sm font-medium text-gray-900">
            Product / Variant
          </th>
          <th className="px-4 py-2 text-right text-sm font-medium text-gray-900">
            Availability
          </th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {searching && (
          <tr>
            <td colSpan={2} className="px-4 py-2 text-sm text-gray-600">
              Searching...
            </td>
          </tr>
        )}
        {!searching && results.length === 0 && (
          <tr>
            <td colSpan={2} className="px-4 py-2 text-sm text-gray-600">
              No results
            </td>
          </tr>
        )}
        {!searching && (
          <ProductSearchResults
            results={results}
            selectedVariantIds={selectedVariantIds}
            onVariantToggle={onVariantToggle}
          />
        )}
      </tbody>
    </table>
  );
};

export default ProductSearchTable;

