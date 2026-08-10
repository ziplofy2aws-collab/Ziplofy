import React from 'react';
import ProductTypeItem from './ProductTypeItem';
import TagEntityTable from './TagEntityTable';

interface Tag {
  _id: string;
  name: string;
}

interface ProductTypesListProps {
  tags: Tag[];
  loading: boolean;
  onDeleteClick: (tag: Tag) => void;
}

const ProductTypesList: React.FC<ProductTypesListProps> = ({ tags, loading, onDeleteClick }) => {
  return (
    <TagEntityTable
      loading={loading}
      loadingLabel="Loading types…"
      emptyTitle="No product types yet"
      emptyDescription="Add a type above to get started."
      nameColumnLabel="Type name"
      isEmpty={tags.length === 0}
    >
      {tags.map((tag) => (
        <ProductTypeItem key={tag._id} tag={tag} onDeleteClick={onDeleteClick} />
      ))}
    </TagEntityTable>
  );
};

export default ProductTypesList;
