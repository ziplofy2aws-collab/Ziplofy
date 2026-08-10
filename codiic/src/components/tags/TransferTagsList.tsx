import React from 'react';
import TagEntityTable from './TagEntityTable';
import TransferTagItem from './TransferTagItem';

interface Tag {
  _id: string;
  name: string;
}

interface TransferTagsListProps {
  tags: Tag[];
  loading: boolean;
  onDeleteClick: (tag: Tag) => void;
}

const TransferTagsList: React.FC<TransferTagsListProps> = ({ tags, loading, onDeleteClick }) => {
  return (
    <TagEntityTable
      loading={loading}
      loadingLabel="Loading tags…"
      emptyTitle="No tags yet"
      nameColumnLabel="Tag name"
      isEmpty={tags.length === 0}
    >
      {tags.map((tag) => (
        <TransferTagItem key={tag._id} tag={tag} onDeleteClick={onDeleteClick} />
      ))}
    </TagEntityTable>
  );
};

export default TransferTagsList;
