import {
  ArrowsUpDownIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import React, { useEffect, useRef, useState } from "react";

type FilterTab = "All" | "Active" | "Draft";

interface ProductsPageFiltersProps {
  activeTab: FilterTab;
  onTabChange: (tab: FilterTab) => void;
  search: string;
  onSearchChange: (v: string) => void;
}

const FILTER_OPTIONS: FilterTab[] = ["All", "Active", "Draft"];

const ProductsPageFilters: React.FC<ProductsPageFiltersProps> = ({
  activeTab,
  onTabChange,
  search,
  onSearchChange,
}) => {
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!filterOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [filterOpen]);

  return (
    <div className="flex items-center gap-2 border-b border-admin-border bg-admin-surface px-3 py-2.5">
      <div className="relative shrink-0" ref={filterRef}>
        {/* Secondary gray fill — same language as Shopify Export/Import chips */}
        <button
          type="button"
          onClick={() => setFilterOpen((prev) => !prev)}
          className="inline-flex items-center gap-1 rounded-lg bg-admin-fill px-2.5 py-1.5 text-[13px] font-medium text-admin-text transition-colors hover:bg-[#d4d4d4]"
        >
          {activeTab}
          <ArrowsUpDownIcon className="h-3.5 w-3.5 text-admin-text-subdued" aria-hidden />
        </button>
        {filterOpen ? (
          <div className="absolute left-0 top-full z-20 mt-1 min-w-[120px] overflow-hidden rounded-lg border border-admin-border bg-admin-surface py-1 shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
            {FILTER_OPTIONS.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => {
                  onTabChange(tab);
                  setFilterOpen(false);
                }}
                className={`flex w-full items-center px-3 py-1.5 text-left text-[13px] transition-colors hover:bg-admin-row-hover ${
                  activeTab === tab
                    ? "bg-admin-row-hover font-medium text-admin-text"
                    : "text-admin-text"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div className="relative min-w-0 flex-1">
        <MagnifyingGlassIcon className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-admin-text-subdued" />
        <input
          type="search"
          placeholder="Search and filter"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full rounded-lg border border-admin-border bg-admin-surface py-1.5 pl-8 pr-3 text-[13px] font-normal text-admin-text placeholder:text-admin-text-subdued focus:border-[#005bd3] focus:outline-none focus:ring-1 focus:ring-[#005bd3]/30"
        />
      </div>
    </div>
  );
};

export default ProductsPageFilters;
