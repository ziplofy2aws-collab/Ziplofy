import React from 'react';
import BillingChargesTableBodyRow from './BillingChargesTableBodyRow';
import BillingChargesTableHeaderRow from './BillingChargesTableHeaderRow';

const BillingChargesTable: React.FC = () => {
  const headers = ['Bill number', 'Date', 'Charge type', 'Source', 'Amount'];
  const rowData = [
    '#446589948',
    'Nov 17, 2025',
    'Subscription charges',
    '-',
    '₹0.00',
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead className="bg-white">
          <BillingChargesTableHeaderRow headers={headers} />
        </thead>
        <tbody>
          <BillingChargesTableBodyRow rowData={rowData} />
        </tbody>
      </table>
    </div>
  );
};

export default BillingChargesTable;

