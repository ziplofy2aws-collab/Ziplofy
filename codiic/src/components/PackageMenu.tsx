import React from 'react';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import DropdownMenu from './DropdownMenu';
import DropdownMenuItem from './DropdownMenuItem';

interface PackageMenuProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const PackageMenu: React.FC<PackageMenuProps> = ({
  anchorEl,
  open,
  onClose,
  onEdit,
  onDelete,
}) => {
  return (
    <DropdownMenu anchorEl={anchorEl} open={open} onClose={onClose}>
      <DropdownMenuItem onClick={onEdit}>
        <div className="flex items-center gap-2">
          <PencilIcon className="w-4 h-5 text-gray-500" />
          <span>Edit</span>
        </div>
      </DropdownMenuItem>
      <DropdownMenuItem onClick={onDelete}>
        <div className="flex items-center gap-2 text-red-600">
          <TrashIcon className="w-4 h-5" />
          <span>Delete</span>
        </div>
      </DropdownMenuItem>
    </DropdownMenu>
  );
};

export default PackageMenu;

