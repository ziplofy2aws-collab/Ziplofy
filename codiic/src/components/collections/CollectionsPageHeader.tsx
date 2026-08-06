import { TagIcon } from "@heroicons/react/24/outline";
import React, { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { adminListPrimaryButtonClass } from "../admin-list-ui";

const CollectionsPageHeader: React.FC = () => {
  const navigate = useNavigate();

  const handleAddCollection = useCallback(() => {
    navigate("/products/collections/new");
  }, [navigate]);

  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-2">
        <TagIcon className="h-5 w-5 shrink-0 text-admin-text-secondary" aria-hidden />
        <h1 className="text-[20px] font-semibold tracking-tight text-admin-text">Collections</h1>
      </div>

      <button
        type="button"
        onClick={handleAddCollection}
        className={adminListPrimaryButtonClass}
      >
        Add collection
      </button>
    </div>
  );
};

export default CollectionsPageHeader;
