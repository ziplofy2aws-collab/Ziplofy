import React from 'react';

const BrandVisualPlaceholder: React.FC = () => {
  return (
    <div className="p-6 mb-8 bg-gray-100 min-h-[300px] flex items-center justify-center relative">
      <div className="flex items-center justify-center gap-6 w-full h-full">
        {/* Desktop Browser Mockup */}
        <div className="w-[240px] h-[160px] bg-gray-300 p-3 relative z-10">
          <div className="flex items-center gap-1 mb-3">
            <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
            <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
            <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
          </div>
          <div className="w-full h-6 bg-gray-200 mb-2" />
          <div className="w-4/5 h-6 bg-gray-200" />
        </div>

        {/* Mobile Device Mockup */}
        <div className="w-[140px] h-[220px] bg-gray-300 p-3 relative z-20 -ml-6">
          <div className="w-8 h-8 rounded-full bg-gray-200 mx-auto mb-3" />
          <div className="w-full h-4 bg-gray-200 mb-2" />
          <div className="w-[70%] h-4 bg-gray-200" />
        </div>
      </div>
    </div>
  );
};

export default BrandVisualPlaceholder;

