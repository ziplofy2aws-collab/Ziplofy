import React from 'react';
import NewCustomerCard from './NewCustomerCard';
import ReturnProductsCard from './ReturnProductsCard';
import RevenueAnalyticsCard from './RevenueAnalyticsCard';
import TotalIncomeCard from './TotalIncomeCard';
import TotalRevenueCard from './TotalRevenueCard';
import TotalSalesCard from './TotalSalesCard';

const DashboardContent: React.FC = () => {
  return (
    <div className="flex flex-col gap-8">
      <section aria-label="Key metrics">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4 lg:gap-6">
          <TotalSalesCard />
          <ReturnProductsCard />
          <NewCustomerCard />
          <TotalRevenueCard />
        </div>
      </section>

      <section aria-label="Charts" className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
        <RevenueAnalyticsCard />
        <TotalIncomeCard />
      </section>
    </div>
  );
};

export default DashboardContent;
