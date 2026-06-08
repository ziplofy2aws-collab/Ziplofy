import React, { useState } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import type { SectionInsertContext } from './insert-context';

const SHOPIFY_BLUE = '#005bd3';

export type SectionInsertZoneProps = {
  /** Left padding to align with section row content (px). */
  paddingLeft?: number;
  insertContext: SectionInsertContext;
  onInsert: () => void;
  onHoverChange?: (ctx: SectionInsertContext | null) => void;
  className?: string;
};

/** Thin hover target between sidebar sections — blue rule + centered + control. */
export const SectionInsertZone: React.FC<SectionInsertZoneProps> = ({
  paddingLeft = 12,
  insertContext,
  onInsert,
  onHoverChange,
  className = '',
}) => {
  const [active, setActive] = useState(false);

  return (
    <div
      className={`group/insert relative z-[1] -my-0.5 flex h-3 w-full items-center ${className}`}
      style={{ paddingLeft, paddingRight: 12 }}
      onMouseEnter={() => {
        setActive(true);
        onHoverChange?.(insertContext);
      }}
      onMouseLeave={() => {
        setActive(false);
        onHoverChange?.(null);
      }}
    >
      <div
        className={`pointer-events-none absolute inset-x-3 top-1/2 flex -translate-y-1/2 items-center gap-0 transition-opacity duration-100 ${
          active ? 'opacity-100' : 'opacity-0'
        }`}
        aria-hidden={!active}
      >
        <div className="h-px flex-1" style={{ backgroundColor: SHOPIFY_BLUE }} />
        <button
          type="button"
          tabIndex={active ? 0 : -1}
          aria-label="Add section"
          className={`pointer-events-auto flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full text-white shadow-sm transition-transform hover:scale-105 ${
            active ? 'scale-100' : 'scale-90'
          }`}
          style={{ backgroundColor: SHOPIFY_BLUE }}
          onClick={(e) => {
            e.stopPropagation();
            onInsert();
          }}
        >
          <PlusIcon className="h-3.5 w-3.5 stroke-[2.5]" />
        </button>
        <div className="h-px flex-1" style={{ backgroundColor: SHOPIFY_BLUE }} />
      </div>
    </div>
  );
};

export default SectionInsertZone;
