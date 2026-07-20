import React from 'react';

interface KeyCapProps {
  label: string;
}

const KeyCap: React.FC<KeyCapProps> = ({ label }) => (
  <span className="inline-block min-w-[28px] px-2 py-0.5 rounded-md border border-gray-300 bg-gray-50 font-semibold text-[13px] text-center text-gray-900 leading-[1.4]">
    {label}
  </span>
);

export default KeyCap;

