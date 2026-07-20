import React, { useCallback, useState } from 'react';
import DropdownMenu from './DropdownMenu';
import DropdownMenuItem from './DropdownMenuItem';
import LocationMenuItem from './LocationMenuItem';

interface DefaultLocationChangeButtonProps {
  otherLocations: Array<{
    _id: string;
    name: string;
    address?: string;
    apartment?: string;
    city?: string;
  }>;
  onSelect: (locationId: string) => void;
}

const DefaultLocationChangeButton: React.FC<DefaultLocationChangeButtonProps> = ({
  otherLocations,
  onSelect,
}) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  const handleOpen = useCallback((e: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(e.currentTarget);
  }, []);

  const handleClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const handleSelect = useCallback(
    (locId: string) => {
      onSelect(locId);
      handleClose();
    },
    [onSelect, handleClose]
  );

  return (
    <div className="flex flex-wrap items-center gap-2 sm:justify-end">
      <span className="inline-flex items-center rounded-md border border-blue-200/80 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-800">
        Default
      </span>
      <button
        type="button"
        onClick={handleOpen}
        className="cursor-pointer rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50"
      >
        Change
      </button>
      <DropdownMenu anchorEl={anchorEl} open={open} onClose={handleClose}>
        {otherLocations.length === 0 ? (
          <DropdownMenuItem disabled>No other locations</DropdownMenuItem>
        ) : (
          otherLocations.map((loc) => (
            <LocationMenuItem key={loc._id} location={loc} onSelect={handleSelect} />
          ))
        )}
      </DropdownMenu>
    </div>
  );
};

export default DefaultLocationChangeButton;

