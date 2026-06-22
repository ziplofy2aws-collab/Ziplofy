import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import React, { ReactNode } from 'react';
import { locationPrimaryButtonClass, locationSecondaryButtonClass } from './location-ui.util';

type LocationFormHeaderProps = {
  title: string;
  backLabel?: string;
  onBack?: () => void;
  onCancel?: () => void;
  onSubmit?: () => void;
  submitLabel?: string;
  submitDisabled?: boolean;
  actions?: ReactNode;
};

const LocationFormHeader: React.FC<LocationFormHeaderProps> = ({
  title,
  backLabel = 'Back to locations',
  onBack,
  onCancel,
  onSubmit,
  submitLabel,
  submitDisabled = false,
  actions,
}) => {
  return (
    <div className="mb-4">
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          className="mb-3 flex items-center gap-2 text-sm font-normal text-gray-400 transition-colors hover:text-gray-600"
        >
          <ArrowLeftIcon className="h-4 w-4" aria-hidden />
          {backLabel}
        </button>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {actions}
          {onCancel ? (
            <button type="button" onClick={onCancel} className={locationSecondaryButtonClass}>
              Cancel
            </button>
          ) : null}
          {onSubmit && submitLabel ? (
            <button
              type="button"
              onClick={onSubmit}
              disabled={submitDisabled}
              className={locationPrimaryButtonClass}
            >
              {submitLabel}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default LocationFormHeader;
