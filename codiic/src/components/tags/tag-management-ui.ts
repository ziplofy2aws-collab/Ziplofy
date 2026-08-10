import {
  adminListPrimaryButtonClass,
  adminListSecondaryButtonClass,
  adminListTableHeadClass,
  adminListTableHeadRowClass,
} from '../admin-list-ui';

export const tagSectionHeaderClass =
  'border-b border-admin-divider bg-admin-table-header px-5 py-4 sm:px-6';

export const tagAddBarClass =
  'border-b border-admin-divider bg-admin-secondary px-5 py-4 sm:px-6';

export const tagInputClass =
  'min-w-0 flex-1 rounded-lg border border-admin-border bg-admin-surface px-3 py-2 text-[13px] font-normal text-admin-text placeholder:text-admin-text-subdued focus:border-[#005bd3] focus:outline-none focus:ring-1 focus:ring-[#005bd3]/30';

export const tagAddButtonClass = `${adminListPrimaryButtonClass} gap-1.5 shrink-0`;

export const tagBackButtonClass = `${adminListSecondaryButtonClass} gap-1.5`;

export const tagErrorClass =
  'border-b border-red-200 bg-red-50 px-5 py-3 text-[13px] text-red-700 sm:px-6';

export const tagTableHeadRowClass = adminListTableHeadRowClass;

export const tagTableHeadClass = `${adminListTableHeadClass} px-5 sm:px-6`;

export const tagTableHeadActionsClass =
  'w-24 px-4 py-2 text-right text-[12px] font-medium leading-5 text-[#616161]';

export const tagTableRowClass =
  'border-b border-admin-divider bg-admin-surface transition-colors last:border-b-0 hover:bg-admin-row-hover';

export const tagIconBubbleClass =
  'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-admin-secondary text-admin-text-secondary';

export const tagDeleteButtonClass =
  'inline-flex rounded-lg p-1.5 text-admin-text-subdued transition-colors hover:bg-red-50 hover:text-red-600';

export const tagEmptyStateClass = 'px-5 py-14 text-center sm:px-6';
