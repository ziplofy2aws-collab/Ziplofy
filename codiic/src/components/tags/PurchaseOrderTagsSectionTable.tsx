import React from 'react';
import PurchaseOrderTagSectionTableItem from './PurchaseOrderTagSectionTableItem';
import TagEntityTable from './TagEntityTable';

interface Tag {
  _id: string;
  name: string;
}

interface PurchaseOrderTagsSectionTableProps {
  tags: Tag[];
  loading: boolean;
  onDeleteClick: (tag: Tag) => void;
}

const PurchaseOrderTagsSectionTable: React.FC<PurchaseOrderTagsSectionTableProps> = ({
  tags,
  loading,
  onDeleteClick,
}) => {
  return (
    <TagEntityTable
      loading={loading}
      loadingLabel="Loading tags…"
      emptyTitle="No tags yet"
      nameColumnLabel="Tag name"
      isEmpty={tags.length === 0}
    >
      {tags.map((tag) => (
        <PurchaseOrderTagSectionTableItem key={tag._id} tag={tag} onDeleteClick={onDeleteClick} />
      ))}
    </TagEntityTable>
  );
};

export default PurchaseOrderTagsSectionTable;
