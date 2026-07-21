import React from 'react';
import { InformationCircleIcon } from '@heroicons/react/24/outline';

interface PixelCodeSectionProps {
  code: string;
  onCodeChange: (value: string) => void;
  /** Omit outer card — for use inside `SettingsPanel` */
  embedded?: boolean;
}

const PixelCodeSection: React.FC<PixelCodeSectionProps> = ({
  code,
  onCodeChange,
  embedded = false,
}) => {
  const fields = (
    <>
      <p className="mb-3 text-sm text-gray-500">
        Paste your pixel or tracking code snippet below.
      </p>
      <textarea
        value={code}
        rows={8}
        onChange={(e) => onCodeChange(e.target.value)}
        className="w-full rounded-lg border border-gray-200 bg-gray-50/80 px-3 py-2 font-mono text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        placeholder="<script>...</script>"
      />
    </>
  );

  if (embedded) {
    return fields;
  }

  return (
    <div className="rounded-xl border border-gray-200/80 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <h3 className="text-base font-semibold text-gray-900">Code</h3>
        <InformationCircleIcon
          className="h-5 w-5 cursor-help text-gray-500"
          title="Pixel code snippet"
        />
      </div>
      {fields}
    </div>
  );
};

export default PixelCodeSection;
