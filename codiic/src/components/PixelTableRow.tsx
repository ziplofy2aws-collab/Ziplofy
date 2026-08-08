import { EllipsisHorizontalIcon, Squares2X2Icon } from '@heroicons/react/24/outline';
import React from 'react';
import type { Pixel } from '../contexts/pixel.context';

interface PixelTableRowProps {
  pixel: Pixel;
  renderStatusChip: (pixel: Pixel) => React.ReactNode;
  onRowClick: (pixelId: string) => void;
}

const PixelTableRow: React.FC<PixelTableRowProps> = ({
  pixel,
  renderStatusChip,
  onRowClick,
}) => {
  return (
    <tr
      onClick={() => onRowClick(pixel._id)}
      className="cursor-pointer border-b border-admin-divider bg-admin-surface transition-colors last:border-b-0 hover:bg-admin-row-hover"
    >
      <td className="px-3 py-2.5">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-admin-border bg-admin-secondary text-admin-text-secondary">
            <Squares2X2Icon className="h-3.5 w-3.5" />
          </div>
          <span className="text-[13px] font-medium capitalize text-admin-text">
            {pixel.pixelName}
          </span>
        </div>
      </td>
      <td className="px-3 py-2.5 text-[13px] capitalize text-admin-text">{pixel.type}</td>
      <td className="px-3 py-2.5">{renderStatusChip(pixel)}</td>
      <td className="px-3 py-2.5 text-right">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
          }}
          className="inline-flex items-center justify-center rounded-lg p-2 text-admin-text-subdued transition-colors hover:bg-admin-row-hover hover:text-admin-text"
        >
          <EllipsisHorizontalIcon className="h-4 w-4" />
        </button>
      </td>
    </tr>
  );
};

export default PixelTableRow;
