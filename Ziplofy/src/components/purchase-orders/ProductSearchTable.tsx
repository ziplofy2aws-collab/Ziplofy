import React from 'react';
import ProductSearchResults from './ProductSearchResults';
import { poTableCellClass, poTableHeadClass, poTableHeadRightClass } from './purchase-order-ui.util';

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
    <table className="w-full min-w-[480px] text-left">
      <thead>
        <tr className="border-b border-gray-100 bg-gray-50/50">
          <th className={poTableHeadClass}>Product / variant</th>
          <th className={poTableHeadRightClass}>Availability</th>
        </tr>
      </thead>
      <tbody className="bg-white">
        {searching ? (
          <tr>
            <td colSpan={2} className={`${poTableCellClass} py-8 text-center text-gray-500`}>
              Searching…
            </td>
          </tr>
        ) : null}
        {!searching && results.length === 0 ? (
          <tr>
            <td colSpan={2} className={`${poTableCellClass} py-8 text-center text-gray-500`}>
              Search to find products
            </td>
          </tr>
        ) : null}
        {!searching ? (
          <ProductSearchResults
            results={results}
            selectedVariantIds={selectedVariantIds}
            onVariantToggle={onVariantToggle}
          />
        ) : null}
      </tbody>
    </table>
  );
};

export default ProductSearchTable;
