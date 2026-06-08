import React from 'react';

const ThemesHeader: React.FC = () => {
  return (
    <div className="py-4 border-b border-gray-200 mb-4">
      <div className="text-center max-w-[600px] mx-auto">
        <h1 className="text-xl font-medium text-gray-900 m-0 mb-1.5">
          Themes
        </h1>
        <p className="text-sm text-gray-600 m-0">
          Discover professionally designed themes to make your store stand out
        </p>
      </div>
    </div>
  );
};

export default ThemesHeader;

