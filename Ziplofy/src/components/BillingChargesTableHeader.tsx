import React from 'react';

interface BillingChargesTableHeaderProps {
  header: string;
}

const BillingChargesTableHeader: React.FC<BillingChargesTableHeaderProps> = ({ header }) => {
  return (
    <th className="text-left py-3 px-3 text-sm font-semibold text-gray-700 border-b border-gray-200">
      {header}
    </th>
  );
};

export default BillingChargesTableHeader;

