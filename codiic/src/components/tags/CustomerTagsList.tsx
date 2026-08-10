import React from 'react';
import CustomerTagItem from './CustomerTagItem';
import TagEntityTable from './TagEntityTable';

interface Tag {
  _id: string;
  name: string;
}

interface CustomerTagsListProps {
  tags: Tag[];
  loading: boolean;
  onDeleteClick: (tag: Tag) => void;
}

const CustomerTagsList: React.FC<CustomerTagsListProps> = ({ tags, loading, onDeleteClick }) => {
  return (
    <TagEntityTable
      loading={loading}
      loadingLabel="Loading tags…"
      emptyTitle="No tags yet"
      nameColumnLabel="Tag name"
      isEmpty={tags.length === 0}
    >
      {tags.map((tag) => (
        <CustomerTagItem key={tag._id} tag={tag} onDeleteClick={onDeleteClick} />
      ))}
    </TagEntityTable>
  );
};

export default CustomerTagsList;
