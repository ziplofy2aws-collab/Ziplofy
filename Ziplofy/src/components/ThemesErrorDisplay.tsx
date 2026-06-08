import React from 'react';

interface ThemesErrorDisplayProps {
  error: string;
}

const ThemesErrorDisplay: React.FC<ThemesErrorDisplayProps> = ({ error }) => {
  return (
    <div className="flex justify-center items-center py-12 px-5 col-span-full">
      <div className="text-center">
        <h3 className="text-base font-medium text-red-600 m-0">{error}</h3>
      </div>
    </div>
  );
};

export default ThemesErrorDisplay;

