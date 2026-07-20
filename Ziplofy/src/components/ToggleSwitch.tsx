import React, { useCallback } from 'react';

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ checked, onChange, disabled = false, label }) => {
  const handleChange = useCallback(() => {
    if (!disabled) {
      onChange(!checked);
    }
  }, [checked, onChange, disabled]);

  return (
    <label className="flex items-center gap-2 cursor-pointer">
      {label && <span className="text-sm text-gray-700">{label}</span>}
      <button
        type="button"
        onClick={handleChange}
        disabled={disabled}
        className={`cursor-pointer relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 ${
          checked ? 'bg-gray-900' : 'bg-gray-300'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </label>
  );
};
export default ToggleSwitch;