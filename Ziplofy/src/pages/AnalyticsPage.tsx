import React from "react";
import DashboardContent from '../components/DashboardContent';

const AnalyticsPage: React.FC = () => {
  return (
    <div className="min-h-[calc(100vh-48px)] w-full bg-dashboard-canvas">
      <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-8 pl-3 border-l-4 border-blue-500/70">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Analytics</h1>
          <p className="mt-1 text-base text-slate-500">View your store&apos;s analytics and performance metrics</p>
        </div>
        <DashboardContent />
      </div>
    </div>
  );
};

export default AnalyticsPage;
