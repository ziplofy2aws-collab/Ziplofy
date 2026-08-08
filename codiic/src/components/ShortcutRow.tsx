import React from 'react';
import KeyCap from './KeyCap';

interface ShortcutRowProps {
  action: string;
  keys: string[];
}

const ShortcutRow: React.FC<ShortcutRowProps> = ({ action, keys }) => (
  <div className="flex items-center justify-between gap-4">
    <p className="flex-1 text-[13px] text-admin-text-secondary">{action}</p>
    <div className="flex flex-wrap justify-end gap-1.5">
      {keys.map((key, index) => (
        <KeyCap key={`${action}-${key}-${index}`} label={key} />
      ))}
    </div>
  </div>
);

export default ShortcutRow;
