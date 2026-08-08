import React from 'react';

interface KeyCapProps {
  label: string;
}

const KeyCap: React.FC<KeyCapProps> = ({ label }) => (
  <span className="inline-block min-w-[28px] rounded-md border border-admin-border bg-admin-secondary px-2 py-0.5 text-center text-[13px] font-semibold leading-[1.4] text-admin-text">
    {label}
  </span>
);

export default KeyCap;
