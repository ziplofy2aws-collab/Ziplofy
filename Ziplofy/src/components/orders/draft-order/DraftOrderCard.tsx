import React from 'react';

type DraftOrderCardProps = {
  title: string;
  headerAction?: React.ReactNode;
  children: React.ReactNode;
  bodyClassName?: string;
};

const DraftOrderCard: React.FC<DraftOrderCardProps> = ({
  title,
  headerAction,
  children,
  bodyClassName = 'px-4 py-4',
}) => {
  return (
    <section className="overflow-hidden rounded-lg border border-gray-200/80 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
        <h2 className="text-[13px] font-semibold text-gray-900">{title}</h2>
        {headerAction ? <div className="shrink-0">{headerAction}</div> : null}
      </div>
      <div className={bodyClassName}>{children}</div>
    </section>
  );
};

export default DraftOrderCard;
