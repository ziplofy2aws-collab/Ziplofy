import React from 'react';

const ThemesLoadingDisplay: React.FC = () => {
  return (
    <div className="flex justify-center items-center py-12 px-5 col-span-full">
      <div className="text-center">
        <h3 className="text-base font-medium text-gray-900 m-0">Loading themes...</h3>
      </div>
    </div>
  );
};

export default ThemesLoadingDisplay;

