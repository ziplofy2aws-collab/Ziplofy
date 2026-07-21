import React from 'react';

interface BillingChargesTableCellProps {
  cell: string;
  index: number;
}

const BillingChargesTableCell: React.FC<BillingChargesTableCellProps> = ({ cell, index }) => {
  return (
    <td
      className={`py-3 px-3 text-sm text-gray-900 border-b border-gray-100 ${
        index === 4 ? 'font-semibold' : ''
      }`}
    >
      {cell}
    </td>
  );
};

export default BillingChargesTableCell;

