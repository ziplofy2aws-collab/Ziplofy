import React from 'react';
import BillingChargesTableCell from './BillingChargesTableCell';

interface BillingChargesTableBodyRowProps {
  rowData: string[];
}

const BillingChargesTableBodyRow: React.FC<BillingChargesTableBodyRowProps> = ({ rowData }) => {
  return (
    <tr>
      {rowData.map((cell, index) => (
        <BillingChargesTableCell key={`${cell}-${index}`} cell={cell} index={index} />
      ))}
    </tr>
  );
};

export default BillingChargesTableBodyRow;

