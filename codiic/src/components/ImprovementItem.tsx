import { ChevronRightIcon } from '@heroicons/react/24/outline';
import React from 'react';

export interface ImprovementItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

interface ImprovementItemProps {
  item: ImprovementItem;
  onClick?: (itemId: string) => void;
}

const ImprovementItemComponent: React.FC<ImprovementItemProps> = ({
  item,
  onClick,
}) => {
  return (
    <button
      onClick={() => onClick?.(item.id)}
      className="flex w-full items-start gap-3 rounded-lg border border-admin-border bg-admin-secondary p-3 text-left transition-colors hover:bg-admin-row-hover"
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center">{item.icon}</div>

      <div className="min-w-0 flex-1">
        <h4 className="mb-1 text-[13px] font-medium text-admin-text">{item.title}</h4>
        <p className="text-[12px] text-admin-text-secondary">{item.description}</p>
      </div>

      <div className="shrink-0">
        <ChevronRightIcon className="h-4 w-4 text-admin-text-subdued" />
      </div>
    </button>
  );
};

export default ImprovementItemComponent;
