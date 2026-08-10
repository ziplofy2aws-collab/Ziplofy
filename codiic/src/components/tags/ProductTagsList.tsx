import React from 'react';
import ProductTagItem from './ProductTagItem';
import TagEntityTable from './TagEntityTable';

interface Tag {
  _id: string;
  name: string;
}

interface ProductTagsListProps {
  tags: Tag[];
  loading: boolean;
  onDeleteClick: (tag: Tag) => void;
}

const ProductTagsList: React.FC<ProductTagsListProps> = ({ tags, loading, onDeleteClick }) => {
  return (
    <TagEntityTable
      loading={loading}
      loadingLabel="Loading tags…"
      emptyTitle="No tags yet"
      nameColumnLabel="Tag name"
      isEmpty={tags.length === 0}
    >
      {tags.map((tag) => (
        <ProductTagItem key={tag._id} tag={tag} onDeleteClick={onDeleteClick} />
      ))}
    </TagEntityTable>
  );
};

export default ProductTagsList;
