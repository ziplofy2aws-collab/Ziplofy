import React from 'react';
import PixelTableRow from './PixelTableRow';
import type { Pixel } from '../contexts/pixel.context';

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
          <tr className="border-b border-gray-200 bg-gray-50/80">
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">Pixel</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">Type</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">Status</th>
            <th className="px-4 py-3 text-right">&nbsp;</th>
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

