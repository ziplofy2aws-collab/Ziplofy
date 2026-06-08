import React from 'react';
import KeyCap from './KeyCap';

interface KeyboardShortcut {
  action: string;
  keys: string[];
}

interface ShortcutRowProps {
  action: string;
  keys: string[];
}

const ShortcutRow: React.FC<ShortcutRowProps> = ({ action, keys }) => (
  <div className="flex items-center justify-between gap-4">
    <p className="text-sm text-gray-600 flex-1">{action}</p>
    <div className="flex gap-1.5 flex-wrap justify-end">
      {keys.map((key, index) => (
        <KeyCap key={`${action}-${key}-${index}`} label={key} />
      ))}
    </div>
  </div>
);

export default ShortcutRow;

