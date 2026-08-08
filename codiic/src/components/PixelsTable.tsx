import React from 'react';
import type { Pixel } from '../contexts/pixel.context';
import {
  adminListTableHeadClass,
  adminListTableHeadRowClass,
} from './admin-list-ui';
import PixelTableRow from './PixelTableRow';

interface PixelsTableProps {
  pixels: Pixel[];
  renderStatusChip: (pixel: Pixel) => React.ReactNode;
  onRowClick: (pixelId: string) => void;
}

const PixelsTable: React.FC<PixelsTableProps> = ({
  pixels,
  renderStatusChip,
  onRowClick,
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className={adminListTableHeadRowClass}>
            <th className={adminListTableHeadClass}>Pixel</th>
            <th className={adminListTableHeadClass}>Type</th>
            <th className={adminListTableHeadClass}>Status</th>
            <th className="px-3 py-2 text-right">&nbsp;</th>
          </tr>
        </thead>
        <tbody>
          {pixels.map((pixel) => (
            <PixelTableRow
              key={pixel._id}
              pixel={pixel}
              renderStatusChip={renderStatusChip}
              onRowClick={onRowClick}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PixelsTable;
