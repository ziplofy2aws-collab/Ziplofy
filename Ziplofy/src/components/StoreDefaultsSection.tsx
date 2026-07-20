import React from 'react';

interface TimeZone {
  value: string;
  label: string;
}

interface StoreDefaultsSectionProps {
  backupRegion: string;
  unitSystem: string;
  weightUnit: string;
  timeZone: string;
  timeZones: TimeZone[];
  onBackupRegionChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onUnitSystemChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onWeightUnitChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onTimeZoneChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export default function StoreDefaultsSection({
  backupRegion,
  unitSystem,
  weightUnit,
  timeZone,
  timeZones,
  onBackupRegionChange,
  onUnitSystemChange,
  onWeightUnitChange,
  onTimeZoneChange,
}: StoreDefaultsSectionProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-5">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-gray-900">Store defaults</h2>
        <p className="mt-1 text-sm text-gray-500">Configure currency, measurement units, and time zone.</p>
      </div>

      {/* Currency display */}
      <div className="mb-6">
        <label htmlFor="currency-label" className="block text-xs text-gray-600 mb-1">
          Currency display
        </label>
        <select
          id="currency-label"
          value="INR"
          disabled
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
        >
          <option value="INR">Indian Rupee (INR ₹)</option>
        </select>
        <p className="text-xs text-gray-600 mt-2">
          To manage the currencies customers see, go to{' '}
          <a href="/settings/markets" className="text-gray-700 hover:underline">
            Markets
          </a>
        </p>
      </div>

      {/* Backup Region */}
      <div className="mb-6">
        <label htmlFor="backup-region-label" className="block text-xs text-gray-600 mb-1">
          Backup Region
        </label>
        <select
          id="backup-region-label"
          value={backupRegion}
          onChange={onBackupRegionChange}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white outline-none transition-all focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
        >
          <option value="India">India</option>
          <option value="United States">United States</option>
          <option value="United Kingdom">United Kingdom</option>
          <option value="Canada">Canada</option>
        </select>
        <p className="text-xs text-gray-600 mt-2">
          Determines settings for customers outside of your markets.
        </p>
      </div>

      {/* Unit system */}
      <div className="mb-6">
        <label htmlFor="unit-system-label" className="block text-xs text-gray-600 mb-1">
          Unit system
        </label>
        <select
          id="unit-system-label"
          value={unitSystem}
          onChange={onUnitSystemChange}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white outline-none transition-all focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
        >
          <option value="metric">Metric system</option>
          <option value="imperial">Imperial system</option>
        </select>
      </div>

      {/* Default weight unit */}
      <div className="mb-6">
        <label htmlFor="weight-unit-label" className="block text-xs text-gray-600 mb-1">
          Default weight unit
        </label>
        <select
          id="weight-unit-label"
          value={weightUnit}
          onChange={onWeightUnitChange}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white outline-none transition-all focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
        >
          <option value="kg">Kilogram (kg)</option>
          <option value="g">Gram (g)</option>
          <option value="lb">Pound (lb)</option>
          <option value="oz">Ounce (oz)</option>
        </select>
      </div>

      {/* Time zone */}
      <div>
        <label htmlFor="timezone-label" className="block text-xs text-gray-600 mb-1">
          Time zone
        </label>
        <select
          id="timezone-label"
          value={timeZone}
          onChange={onTimeZoneChange}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white outline-none transition-all focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
        >
          {timeZones.map((tz) => (
            <option key={tz.value} value={tz.value}>
              {tz.label}
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-600 mt-2">
          Sets the time for when orders and analytics are recorded.
        </p>
      </div>
    </div>
  );
}

