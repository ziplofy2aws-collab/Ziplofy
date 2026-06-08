import React from 'react';
import BillingChargesTableHeader from './BillingChargesTableHeader';

interface BillingChargesTableHeaderRowProps {
  headers: string[];
}

const BillingChargesTableHeaderRow: React.FC<BillingChargesTableHeaderRowProps> = ({ headers }) => {
  return (
    <tr>
      {headers.map((header) => (
        <BillingChargesTableHeader key={header} header={header} />
      ))}
    </tr>
  );
};

export default BillingChargesTableHeaderRow;

