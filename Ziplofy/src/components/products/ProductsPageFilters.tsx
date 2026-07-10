import {
  ChevronDownIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ListBulletIcon,
  Squares2X2Icon,
} from "@heroicons/react/24/outline";
import React from "react";

type FilterTab = "All" | "Active" | "Draft";

interface ProductsPageFiltersProps {
  activeTab: FilterTab;
  onTabChange: (tab: FilterTab) => void;
  search: string;
  onSearchChange: (v: string) => void;
  viewMode: "list" | "grid";
  onViewModeChange: (mode: "list" | "grid") => void;
  counts: Record<FilterTab, number>;
}

const ProductsPageFilters: React.FC<ProductsPageFiltersProps> = ({
  activeTab,
  onTabChange,
  search,
  onSearchChange,
  viewMode,
  onViewModeChange,
  counts,
}) => {
  return (
    <div className="flex items-center justify-between gap-4 flex-wrap mb-5 rounded-2xl border border-gray-200/80 bg-white p-3.5 shadow-sm">
      {/* Filter Tabs */}
      <div className="flex items-center gap-1">
        {(["All", "Active", "Draft"] as FilterTab[]).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => onTabChange(tab)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab
                ? "bg-blue-50 text-blue-700 shadow-sm"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            {tab}
            <span
              className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                activeTab === tab ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-500"
              }`}
            >
              {counts[tab]}
            </span>
          </button>
        ))}
      </div>

      {/* Search and Actions */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search products"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 pr-3 py-2.5 border border-gray-200 bg-gray-50/70 rounded-xl text-sm w-[340px] max-w-full focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-colors"
          />
        </div>
        <button className="inline-flex items-center gap-1.5 p-2.5 px-3 text-gray-600 border border-gray-200 bg-white hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors text-sm" title="Status">
          <FunnelIcon className="w-4 h-4" />
          Status
          <ChevronDownIcon className="w-3.5 h-3.5 text-gray-400" />
        </button>
        <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
          <button
            type="button"
            onClick={() => onViewModeChange("list")}
            className={`p-2.5 transition-colors ${
              viewMode === "list" ? "bg-blue-50 text-blue-700" : "text-gray-400 hover:text-gray-600"
            }`}
            title="List view"
          >
            <ListBulletIcon className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange("grid")}
            className={`p-2.5 transition-colors ${
              viewMode === "grid" ? "bg-blue-50 text-blue-700" : "text-gray-400 hover:text-gray-600"
            }`}
            title="Grid view"
          >
            <Squares2X2Icon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductsPageFilters;

