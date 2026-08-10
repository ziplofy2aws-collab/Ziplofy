import React from 'react';
import {
  tagEmptyStateClass,
  tagTableHeadActionsClass,
  tagTableHeadClass,
  tagTableHeadRowClass,
} from './tag-management-ui';

type TagEntityTableProps = {
  loading: boolean;
  loadingLabel?: string;
  emptyTitle: string;
  emptyDescription?: string;
  nameColumnLabel: string;
  children: React.ReactNode;
  isEmpty: boolean;
};

const TagEntityTable: React.FC<TagEntityTableProps> = ({
  loading,
  loadingLabel = 'Loading…',
  emptyTitle,
  emptyDescription = 'Add one above to get started.',
  nameColumnLabel,
  children,
  isEmpty,
}) => {
  if (loading) {
    return (
      <div className={`${tagEmptyStateClass} text-[13px] text-admin-text-secondary`}>
        {loadingLabel}
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className={tagEmptyStateClass}>
        <p className="text-[13px] font-semibold text-admin-text">{emptyTitle}</p>
        <p className="mt-1 text-[13px] text-admin-text-secondary">{emptyDescription}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[360px] text-left">
        <thead>
          <tr className={tagTableHeadRowClass}>
            <th className={tagTableHeadClass}>{nameColumnLabel}</th>
            <th className={tagTableHeadActionsClass} aria-label="Actions">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
};

export default TagEntityTable;
