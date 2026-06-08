import React from 'react';
import { Pixel } from '../contexts/pixel.context';

const permissionLabels: Array<{ key: keyof Pick<Pixel, 'marketing' | 'analytics' | 'preferences'>; label: string }> = [
  { key: 'marketing', label: 'Marketing' },
  { key: 'analytics', label: 'Analytics' },
  { key: 'preferences', label: 'Preferences' },
];

type PermissionMode = 'required' | 'not_required';

interface PixelPermissionSectionProps {
  permission: PermissionMode;
  purposes: {
    marketing: boolean;
    analytics: boolean;
    preferences: boolean;
  };
  onPermissionChange: (value: PermissionMode) => void;
  onPurposeChange: (key: 'marketing' | 'analytics' | 'preferences') => void;
}

const PixelPermissionSection: React.FC<PixelPermissionSectionProps> = ({
  permission,
  purposes,
  onPermissionChange,
  onPurposeChange,
}) => {
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-4">
      <h3 className="text-base font-semibold text-gray-900 mb-2">Permission</h3>
      <fieldset>
        <div className="space-y-3">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="radio"
              name="permission"
              value="required"
              checked={permission === 'required'}
              onChange={(e) => onPermissionChange(e.target.value as PermissionMode)}
              className="mt-1 w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
            />
            <div className="flex-1">
              <span className="text-sm text-gray-900">Required</span>
              <p className="text-sm text-gray-600 mt-1 mb-2">
                The pixel will collect data when permission is granted for selected purposes.
              </p>
              <div className="flex flex-col gap-2 ml-6 mb-3">
                {permissionLabels.map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={purposes[key]}
                      onChange={() => onPurposeChange(key)}
                      disabled={permission !== 'required'}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <span className={`text-sm ${permission !== 'required' ? 'text-gray-400' : 'text-gray-900'}`}>
                      {label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              name="permission"
              value="not_required"
              checked={permission === 'not_required'}
              onChange={(e) => onPermissionChange(e.target.value as PermissionMode)}
              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-900">Not required</span>
          </label>
        </div>
      </fieldset>
    </div>
  );
};

export default PixelPermissionSection;

