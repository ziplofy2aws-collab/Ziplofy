import React from 'react';

interface CodToggleProps {
  enabled: boolean;
  submitting?: boolean;
  onToggle: (enabled: boolean) => void | Promise<void>;
}

const CodToggle: React.FC<CodToggleProps> = ({ enabled, submitting = false, onToggle }) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-gray-900">Cash on delivery (COD)</h2>
          <p className="mt-1 text-sm text-gray-500">
            Let customers pay in cash when their order is delivered. Turn this on to show COD at
            checkout.
          </p>
          <p className="mt-2 text-xs font-medium text-gray-600">
            Status:{' '}
            <span className={enabled ? 'text-green-700' : 'text-gray-500'}>
              {enabled ? 'Activated' : 'Not activated'}
            </span>
          </p>
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          aria-label="Activate cash on delivery"
          disabled={submitting}
          onClick={() => onToggle(!enabled)}
          className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:cursor-not-allowed disabled:opacity-50 ${
            enabled ? 'bg-blue-600' : 'bg-slate-300'
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition ${
              enabled ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>
    </div>
  );
};

export default CodToggle;
