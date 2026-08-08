import React from 'react';
import { adminListCardClass } from './admin-list-ui';

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

const selectClass =
  'w-full rounded-lg border border-admin-border bg-admin-surface px-3 py-1.5 text-[13px] font-normal text-admin-text focus:border-[#005bd3] focus:outline-none focus:ring-1 focus:ring-[#005bd3]/30';
const labelClass = 'mb-1 block text-[12px] text-admin-text-secondary';
const hintClass = 'mt-2 text-[12px] text-admin-text-secondary';

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
    <div className={`${adminListCardClass} p-5`}>
      <div className="mb-4">
        <h2 className="text-[13px] font-semibold text-admin-text">Store defaults</h2>
        <p className="mt-1 text-[13px] text-admin-text-secondary">
          Configure currency, measurement units, and time zone.
        </p>
      </div>

      {/* Currency display */}
      <div className="mb-6">
        <label htmlFor="currency-label" className={labelClass}>
          Currency display
        </label>
        <select
          id="currency-label"
          value="INR"
          disabled
          className="w-full cursor-not-allowed rounded-lg border border-admin-border bg-admin-secondary px-3 py-1.5 text-[13px] text-admin-text-subdued"
        >
          <option value="INR">Indian Rupee (INR ₹)</option>
        </select>
        <p className={hintClass}>
          To manage the currencies customers see, go to{' '}
          <a href="/settings/markets" className="text-admin-text hover:underline">
            Markets
          </a>
        </p>
      </div>

      {/* Backup Region */}
      <div className="mb-6">
        <label htmlFor="backup-region-label" className={labelClass}>
          Backup Region
        </label>
        <select
          id="backup-region-label"
          value={backupRegion}
          onChange={onBackupRegionChange}
          className={selectClass}
        >
          <option value="India">India</option>
          <option value="United States">United States</option>
          <option value="United Kingdom">United Kingdom</option>
          <option value="Canada">Canada</option>
        </select>
        <p className={hintClass}>Determines settings for customers outside of your markets.</p>
      </div>

      {/* Unit system */}
      <div className="mb-6">
        <label htmlFor="unit-system-label" className={labelClass}>
          Unit system
        </label>
        <select
          id="unit-system-label"
          value={unitSystem}
          onChange={onUnitSystemChange}
          className={selectClass}
        >
          <option value="metric">Metric system</option>
          <option value="imperial">Imperial system</option>
        </select>
      </div>

      {/* Default weight unit */}
      <div className="mb-6">
        <label htmlFor="weight-unit-label" className={labelClass}>
          Default weight unit
        </label>
        <select
          id="weight-unit-label"
          value={weightUnit}
          onChange={onWeightUnitChange}
          className={selectClass}
        >
          <option value="kg">Kilogram (kg)</option>
          <option value="g">Gram (g)</option>
          <option value="lb">Pound (lb)</option>
          <option value="oz">Ounce (oz)</option>
        </select>
      </div>

      {/* Time zone */}
      <div>
        <label htmlFor="timezone-label" className={labelClass}>
          Time zone
        </label>
        <select
          id="timezone-label"
          value={timeZone}
          onChange={onTimeZoneChange}
          className={selectClass}
        >
          {timeZones.map((tz) => (
            <option key={tz.value} value={tz.value}>
              {tz.label}
            </option>
          ))}
        </select>
        <p className={hintClass}>Sets the time for when orders and analytics are recorded.</p>
      </div>
    </div>
  );
}
