import React from 'react';

/** Dev/demo placeholder — grid background wrapper was removed app-wide. */
const DemoGridPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-page-background-color">
      <div className="p-6">
        <div className="mx-auto max-w-[1600px]">
          <h1 className="mb-4 text-3xl font-bold text-gray-900">Demo page</h1>
          <p className="text-gray-600">Plain admin background (no grid overlay).</p>
        </div>
      </div>
    </div>
  );
};

export default DemoGridPage;
