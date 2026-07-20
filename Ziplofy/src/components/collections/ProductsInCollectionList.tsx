import React from 'react';
import type { CollectionEntry } from '../../contexts/collection-entries.context';
import ProductsInCollectionItem from './ProductsInCollectionItem';

interface ProductsInCollectionListProps {
  collectionEntries: CollectionEntry[];
  onProductClick: (productId: string) => void;
  onRemoveProduct: (e: React.MouseEvent, entryId: string) => void;
}

const ProductsInCollectionList: React.FC<ProductsInCollectionListProps> = ({
  collectionEntries,
  onProductClick,
  onRemoveProduct,
}) => {
  return (
    <ul className="space-y-3" aria-label="Products in collection">
      {collectionEntries.map((entry) => (
        <li key={entry._id}>
          <ProductsInCollectionItem
            entry={entry}
            onProductClick={onProductClick}
            onRemoveProduct={onRemoveProduct}
          />
        </li>
      ))}
    </ul>
  );
};

export default ProductsInCollectionList;
