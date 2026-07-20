import React from 'react';

const ThemesEmptyState: React.FC = () => {
  return (
    <div className="flex justify-center items-center py-12 px-5">
      <div className="text-center">
        <h3 className="text-base font-medium text-gray-900 m-0 mb-1.5">No themes found</h3>
        <p className="text-sm text-gray-600 m-0">Try adjusting your search or filter criteria</p>
      </div>
    </div>
  );
};

export default ThemesEmptyState;

