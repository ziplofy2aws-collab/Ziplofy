import {
  CalendarDaysIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

type ExpiryPreset = 'none' | '1y' | '3y' | '5y' | 'custom';

export type GiftCardExpiryValue = {
  mode: 'none' | 'date';
  date: string;
};

type GiftCardExpiryDatePickerProps = {
  value: GiftCardExpiryValue;
  onChange: (value: GiftCardExpiryValue) => void;
};

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const DAY_HEADERS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function formatIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseIsoDate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = Number(match[3]);
  const parsed = new Date(year, month, day);
  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month ||
    parsed.getDate() !== day
  ) {
    return null;
  }
  return parsed;
}

function addYears(base: Date, years: number): Date {
  const next = new Date(base);
  next.setFullYear(next.getFullYear() + years);
  return next;
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function getMinSelectableDate(): Date {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return startOfDay(tomorrow);
}

function getCalendarDays(year: number, month: number): Array<Date | null> {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const padding = firstDay.getDay();
  const days: Array<Date | null> = [];

  for (let i = 0; i < padding; i += 1) {
    days.push(null);
  }
  for (let day = 1; day <= lastDay.getDate(); day += 1) {
    days.push(new Date(year, month, day));
  }

  return days;
}

function formatDisplayDate(isoDate: string): string {
  const parsed = parseIsoDate(isoDate);
  if (!parsed) return isoDate;
  return parsed.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function resolvePreset(value: GiftCardExpiryValue): ExpiryPreset {
  if (value.mode === 'none') return 'none';
  const parsed = parseIsoDate(value.date);
  if (!parsed) return 'custom';

  const today = startOfDay(new Date());
  for (const years of [1, 3, 5] as const) {
    const presetDate = formatIsoDate(addYears(today, years));
    if (presetDate === value.date) {
      return years === 1 ? '1y' : years === 3 ? '3y' : '5y';
    }
  }

  return 'custom';
}

function presetToDate(preset: ExpiryPreset): string {
  const today = startOfDay(new Date());
  if (preset === '1y') return formatIsoDate(addYears(today, 1));
  if (preset === '3y') return formatIsoDate(addYears(today, 3));
  if (preset === '5y') return formatIsoDate(addYears(today, 5));
  return '';
}

function valuesEqual(a: GiftCardExpiryValue, b: GiftCardExpiryValue): boolean {
  return a.mode === b.mode && a.date === b.date;
}

function isExpiryValueValid(value: GiftCardExpiryValue): boolean {
  if (value.mode === 'none') return true;
  const parsed = parseIsoDate(value.date);
  if (!parsed) return false;
  return startOfDay(parsed) >= getMinSelectableDate();
}

const triggerClass =
  'flex w-full items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-left text-sm text-gray-900 outline-none transition-colors hover:bg-gray-50 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20';

export function GiftCardExpiryDatePicker({ value, onChange }: GiftCardExpiryDatePickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState<GiftCardExpiryValue>(value);
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const parsed = value.mode === 'date' ? parseIsoDate(value.date) : null;
    const base = parsed ?? getMinSelectableDate();
    return { year: base.getFullYear(), month: base.getMonth() };
  });

  const minSelectableDate = useMemo(() => getMinSelectableDate(), []);
  const draftPreset = useMemo(() => resolvePreset(draft), [draft]);
  const hasChanges = useMemo(() => !valuesEqual(value, draft), [draft, value]);
  const isDraftValid = useMemo(() => isExpiryValueValid(draft), [draft]);

  useEffect(() => {
    if (!isOpen) return;
    setDraft(value);
    const parsed = value.mode === 'date' ? parseIsoDate(value.date) : null;
    const base = parsed ?? getMinSelectableDate();
    setVisibleMonth({ year: base.getFullYear(), month: base.getMonth() });
  }, [isOpen, value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
        setDraft(value);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [value]);

  const handleOpen = useCallback(() => {
    setIsOpen(true);
  }, []);

  const handleCancel = useCallback(() => {
    setDraft(value);
    setIsOpen(false);
  }, [value]);

  const handleDone = useCallback(() => {
    onChange(draft);
    setIsOpen(false);
  }, [draft, onChange]);

  const handlePresetSelect = useCallback((preset: ExpiryPreset) => {
    if (preset === 'none') {
      setDraft({ mode: 'none', date: '' });
      return;
    }

    const nextDate = presetToDate(preset);
    setDraft({ mode: 'date', date: nextDate });
    const parsed = parseIsoDate(nextDate);
    if (parsed) {
      setVisibleMonth({ year: parsed.getFullYear(), month: parsed.getMonth() });
    }
  }, []);

  const handleManualDateChange = useCallback((nextValue: string) => {
    setDraft({ mode: 'date', date: nextValue });
    const parsed = parseIsoDate(nextValue);
    if (parsed) {
      setVisibleMonth({ year: parsed.getFullYear(), month: parsed.getMonth() });
    }
  }, []);

  const handleDaySelect = useCallback((day: Date) => {
    const iso = formatIsoDate(day);
    setDraft({ mode: 'date', date: iso });
  }, []);

  const handlePrevMonth = useCallback(() => {
    setVisibleMonth((current) => {
      const nextMonth = current.month - 1;
      if (nextMonth < 0) {
        return { year: current.year - 1, month: 11 };
      }
      return { ...current, month: nextMonth };
    });
  }, []);

  const handleNextMonth = useCallback(() => {
    setVisibleMonth((current) => {
      const nextMonth = current.month + 1;
      if (nextMonth > 11) {
        return { year: current.year + 1, month: 0 };
      }
      return { ...current, month: nextMonth };
    });
  }, []);

  const calendarDays = useMemo(
    () => getCalendarDays(visibleMonth.year, visibleMonth.month),
    [visibleMonth.month, visibleMonth.year]
  );

  const triggerLabel =
    value.mode === 'none' || !value.date ? "Doesn't expire" : formatDisplayDate(value.date);

  const presets: Array<{ id: ExpiryPreset; label: string }> = [
    { id: 'none', label: 'No expiration' },
    { id: '1y', label: '1 year from now' },
    { id: '3y', label: '3 years from now' },
    { id: '5y', label: '5 years from now' },
  ];

  return (
    <div ref={containerRef} className="relative">
      <label htmlFor="gift-card-expiry-trigger" className="mb-2 block text-sm font-medium text-gray-700">
        Expiry date
      </label>
      <button
        id="gift-card-expiry-trigger"
        type="button"
        onClick={handleOpen}
        className={triggerClass}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
      >
        <CalendarDaysIcon className="h-4 w-4 shrink-0 text-gray-500" />
        <span>{triggerLabel}</span>
      </button>

      {isOpen ? (
        <div
          role="dialog"
          aria-label="Select expiry date"
          className="absolute left-0 z-30 mt-2 w-[min(100vw-2rem,560px)] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl"
        >
          <div className="flex flex-col sm:flex-row">
            <div className="border-b border-gray-100 sm:w-52 sm:border-b-0 sm:border-r">
              <ul className="py-2">
                {presets.map((preset) => {
                  const isSelected = draftPreset === preset.id;
                  return (
                    <li key={preset.id}>
                      <button
                        type="button"
                        onClick={() => handlePresetSelect(preset.id)}
                        className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition-colors ${
                          isSelected ? 'bg-gray-100 font-medium text-gray-900' : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <span>{preset.label}</span>
                        {isSelected ? <CheckIcon className="h-4 w-4 text-gray-700" /> : null}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="min-w-0 flex-1 p-4">
              <div className="relative mb-4">
                <CalendarDaysIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={draft.mode === 'date' ? draft.date : ''}
                  onChange={(e) => handleManualDateChange(e.target.value)}
                  placeholder="YYYY-MM-DD"
                  disabled={draft.mode === 'none'}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 pl-9 text-sm outline-none transition-colors focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
                />
              </div>

              <div className="mb-3 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800"
                  aria-label="Previous month"
                >
                  <ChevronLeftIcon className="h-4 w-4" />
                </button>
                <p className="text-sm font-medium text-gray-900">
                  {MONTH_NAMES[visibleMonth.month]} {visibleMonth.year}
                </p>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800"
                  aria-label="Next month"
                >
                  <ChevronRightIcon className="h-4 w-4" />
                </button>
              </div>

              <div className="mb-1 grid grid-cols-7 gap-1">
                {DAY_HEADERS.map((day) => (
                  <div key={day} className="py-1 text-center text-xs font-medium text-gray-400">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, index) => {
                  if (!day) {
                    return <div key={`empty-${index}`} className="h-9" />;
                  }

                  const iso = formatIsoDate(day);
                  const isSelected = draft.mode === 'date' && draft.date === iso;
                  const isDisabled = startOfDay(day) < minSelectableDate;
                  const isToday = formatIsoDate(startOfDay(new Date())) === iso;

                  return (
                    <button
                      key={iso}
                      type="button"
                      disabled={isDisabled}
                      onClick={() => handleDaySelect(day)}
                      className={`h-9 rounded-lg text-sm transition-colors ${
                        isSelected
                          ? 'border border-gray-900 bg-white font-medium text-gray-900'
                          : isDisabled
                            ? 'cursor-not-allowed text-gray-300'
                            : isToday
                              ? 'text-gray-900 hover:bg-gray-100'
                              : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {day.getDate()}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t border-gray-100 px-4 py-3">
            <button
              type="button"
              onClick={handleCancel}
              className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDone}
              disabled={!hasChanges || !isDraftValid}
              className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              Done
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
