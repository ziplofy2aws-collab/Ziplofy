import {
  ArrowRightIcon,
  CalendarDaysIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  Square2StackIcon,
} from '@heroicons/react/24/outline';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  adminListPrimaryButtonClass,
  adminListSecondaryButtonClass,
} from '../admin-list-ui';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

type PresetId =
  | 'today'
  | 'yesterday'
  | 'last-7'
  | 'last-30'
  | 'last-90'
  | 'last-365'
  | 'last-month'
  | 'last-year'
  | 'week-to-date'
  | 'month-to-date'
  | 'quarter-to-date'
  | 'year-to-date'
  | 'q1'
  | 'q2'
  | 'q3'
  | 'q4'
  | 'custom';

const DEFAULT_PRESET: PresetId = 'quarter-to-date';

type DateRange = { start: Date; end: Date };

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function sameRange(a: DateRange, b: DateRange): boolean {
  return sameDay(a.start, b.start) && sameDay(a.end, b.end);
}

function formatChipDate(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatInputDate(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function formatMonthTitle(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function rangeForPreset(id: PresetId, today: Date): DateRange | null {
  const t = startOfDay(today);
  switch (id) {
    case 'today':
      return { start: t, end: t };
    case 'yesterday': {
      const y = addDays(t, -1);
      return { start: y, end: y };
    }
    case 'last-7':
      return { start: addDays(t, -6), end: t };
    case 'last-30':
      return { start: addDays(t, -29), end: t };
    case 'last-90':
      return { start: addDays(t, -89), end: t };
    case 'last-365':
      return { start: addDays(t, -364), end: t };
    case 'last-month': {
      const start = new Date(t.getFullYear(), t.getMonth() - 1, 1);
      const end = new Date(t.getFullYear(), t.getMonth(), 0);
      return { start, end };
    }
    case 'last-year': {
      const start = new Date(t.getFullYear() - 1, 0, 1);
      const end = new Date(t.getFullYear() - 1, 11, 31);
      return { start, end };
    }
    case 'week-to-date': {
      const start = addDays(t, -t.getDay());
      return { start, end: t };
    }
    case 'month-to-date':
      return { start: new Date(t.getFullYear(), t.getMonth(), 1), end: t };
    case 'quarter-to-date': {
      const qStartMonth = Math.floor(t.getMonth() / 3) * 3;
      return { start: new Date(t.getFullYear(), qStartMonth, 1), end: t };
    }
    case 'year-to-date':
      return { start: new Date(t.getFullYear(), 0, 1), end: t };
    case 'q1':
      return { start: new Date(t.getFullYear(), 0, 1), end: new Date(t.getFullYear(), 2, 31) };
    case 'q2':
      return { start: new Date(t.getFullYear(), 3, 1), end: new Date(t.getFullYear(), 5, 30) };
    case 'q3':
      return { start: new Date(t.getFullYear(), 6, 1), end: new Date(t.getFullYear(), 8, 30) };
    case 'q4':
      return { start: new Date(t.getFullYear(), 9, 1), end: new Date(t.getFullYear(), 11, 31) };
    case 'custom':
      return null;
    default:
      return null;
  }
}

function labelForPreset(id: PresetId): string {
  switch (id) {
    case 'today':
      return 'Today';
    case 'yesterday':
      return 'Yesterday';
    case 'last-7':
      return 'Last 7 days';
    case 'last-30':
      return 'Last 30 days';
    case 'last-90':
      return 'Last 90 days';
    case 'last-365':
      return 'Last 365 days';
    case 'last-month':
      return 'Last month';
    case 'last-year':
      return 'Last year';
    case 'week-to-date':
      return 'Week to date';
    case 'month-to-date':
      return 'Month to date';
    case 'quarter-to-date':
      return 'Quarter to date';
    case 'year-to-date':
      return 'Year to date';
    case 'q1':
      return 'Q1';
    case 'q2':
      return 'Q2';
    case 'q3':
      return 'Q3';
    case 'q4':
      return 'Q4';
    case 'custom':
      return 'Custom';
    default:
      return 'Custom';
  }
}

function chipLabelForPreset(id: PresetId, range: DateRange): string {
  if (id === 'today' || id === 'yesterday') return labelForPreset(id);
  if (id === 'custom' || sameDay(range.start, range.end)) return formatChipDate(range.start);
  return `${formatChipDate(range.start)} – ${formatChipDate(range.end)}`;
}

const filterChipClass =
  'inline-flex items-center gap-1.5 rounded-lg border border-admin-border bg-admin-surface px-2.5 py-1.5 text-[13px] font-medium text-admin-text transition-colors hover:bg-admin-row-hover';

const filterChipActiveClass =
  'inline-flex items-center gap-1.5 rounded-lg border border-[#b5b5b5] bg-[#e3e3e3] px-2.5 py-1.5 text-[13px] font-medium text-admin-text shadow-[inset_0_1px_0_rgba(0,0,0,0.04)]';

type SidebarRow =
  | { kind: 'preset'; id: PresetId }
  | { kind: 'group'; id: 'last' | 'period' | 'quarters'; label: string; children: PresetId[] }
  | { kind: 'divider' };

const SIDEBAR_ROWS: SidebarRow[] = [
  { kind: 'preset', id: 'today' },
  { kind: 'preset', id: 'yesterday' },
  {
    kind: 'group',
    id: 'last',
    label: 'Last',
    children: ['last-7', 'last-30', 'last-90', 'last-365', 'last-month', 'last-year'],
  },
  {
    kind: 'group',
    id: 'period',
    label: 'Period to date',
    children: ['week-to-date', 'month-to-date', 'quarter-to-date', 'year-to-date'],
  },
  { kind: 'divider' },
  {
    kind: 'group',
    id: 'quarters',
    label: 'Quarters',
    children: ['q1', 'q2', 'q3', 'q4'],
  },
  { kind: 'divider' },
  { kind: 'preset', id: 'custom' },
];

function MonthCalendar({
  month,
  today,
  selected,
  onSelect,
  showLeftNav,
  showRightNav,
  onPrev,
  onNext,
}: {
  month: Date;
  today: Date;
  selected: DateRange;
  onSelect: (day: Date) => void;
  showLeftNav?: boolean;
  showRightNav?: boolean;
  onPrev?: () => void;
  onNext?: () => void;
}) {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const firstDow = new Date(year, monthIndex, 1).getDay();
  const totalDays = daysInMonth(year, monthIndex);
  const cells: Array<number | null> = [
    ...Array.from({ length: firstDow }, () => null),
    ...Array.from({ length: totalDays }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="min-w-0 flex-1 px-3 py-2">
      <div className="mb-2 flex items-center justify-between">
        <button
          type="button"
          aria-label="Previous month"
          onClick={onPrev}
          disabled={!showLeftNav}
          className={`inline-flex h-7 w-7 items-center justify-center rounded-lg text-admin-text-secondary transition-colors ${
            showLeftNav ? 'hover:bg-admin-row-hover' : 'invisible'
          }`}
        >
          <ChevronLeftIcon className="h-4 w-4" />
        </button>
        <p className="text-[13px] font-semibold text-admin-text">{formatMonthTitle(month)}</p>
        <button
          type="button"
          aria-label="Next month"
          onClick={onNext}
          disabled={!showRightNav}
          className={`inline-flex h-7 w-7 items-center justify-center rounded-lg text-admin-text-secondary transition-colors ${
            showRightNav ? 'hover:bg-admin-row-hover' : 'invisible'
          }`}
        >
          <ChevronRightIcon className="h-4 w-4" />
        </button>
      </div>
      <div className="mb-1 grid grid-cols-7 gap-y-1">
        {WEEKDAYS.map((day) => (
          <div key={day} className="py-1 text-center text-[11px] font-medium text-admin-text-subdued">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-0.5">
        {cells.map((day, index) => {
          if (day == null) {
            return <div key={`empty-${index}`} className="h-8" />;
          }
          const date = new Date(year, monthIndex, day);
          const isFuture = date > today;
          const isSelected = sameDay(date, selected.start) || sameDay(date, selected.end);
          const inRange =
            !isSelected &&
            date >= startOfDay(selected.start) &&
            date <= startOfDay(selected.end) &&
            !sameDay(selected.start, selected.end);

          return (
            <button
              key={day}
              type="button"
              disabled={isFuture}
              onClick={() => onSelect(date)}
              className={`mx-auto flex h-8 w-8 items-center justify-center rounded-lg text-[13px] transition-colors ${
                isSelected
                  ? 'bg-admin-text font-semibold text-white'
                  : inRange
                    ? 'bg-[#e3e3e3] text-admin-text'
                    : isFuture
                      ? 'cursor-not-allowed text-[#c9c9c9]'
                      : 'text-admin-text hover:bg-admin-row-hover'
              }`}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function addYears(date: Date, years: number): Date {
  const next = new Date(date);
  next.setFullYear(next.getFullYear() + years);
  return startOfDay(next);
}

function shiftRangeByDays(range: DateRange, days: number): DateRange {
  return { start: addDays(range.start, days), end: addDays(range.end, days) };
}

export type CompareMode = 'none' | 'yesterday' | 'previous-year' | 'previous-year-dow' | 'custom';

export function resolveCompareRange(
  mode: CompareMode,
  primary: DateRange,
  custom: DateRange | null,
): DateRange | null {
  switch (mode) {
    case 'none':
      return null;
    case 'yesterday':
      return shiftRangeByDays(primary, -1);
    case 'previous-year':
      return { start: addYears(primary.start, -1), end: addYears(primary.end, -1) };
    case 'previous-year-dow':
      return shiftRangeByDays(primary, -364);
    case 'custom':
      return custom;
    default:
      return null;
  }
}

function formatCompareChipLabel(mode: CompareMode, range: DateRange | null): string {
  if (mode === 'none' || !range) return 'Compare';
  if (sameDay(range.start, range.end)) return formatChipDate(range.start);
  return `${formatChipDate(range.start)} – ${formatChipDate(range.end)}`;
}

const COMPARE_OPTIONS: { id: CompareMode; label: string }[] = [
  { id: 'none', label: 'No comparison' },
  { id: 'yesterday', label: 'Yesterday' },
  { id: 'previous-year', label: 'Previous year' },
  { id: 'previous-year-dow', label: 'Previous year (match day of week)' },
  { id: 'custom', label: 'Custom' },
];

export type AnalyticsPickerRange = { start: Date; end: Date };

type AnalyticsDateRangePickerProps = {
  onRangeChange?: (range: AnalyticsPickerRange) => void;
  onCompareChange?: (payload: {
    mode: CompareMode;
    range: AnalyticsPickerRange | null;
  }) => void;
};

export default function AnalyticsDateRangePicker({
  onRangeChange,
  onCompareChange,
}: AnalyticsDateRangePickerProps) {
  const today = useMemo(() => startOfDay(new Date()), []);
  const defaultRange = useMemo(
    () => rangeForPreset(DEFAULT_PRESET, today) ?? { start: today, end: today },
    [today],
  );
  const [openPanel, setOpenPanel] = useState<'range' | 'compare' | null>(null);
  const [preset, setPreset] = useState<PresetId>(DEFAULT_PRESET);
  const [applied, setApplied] = useState<DateRange>(defaultRange);
  const [draft, setDraft] = useState<DateRange>(defaultRange);
  const [draftPreset, setDraftPreset] = useState<PresetId>(DEFAULT_PRESET);
  const [leftMonth, setLeftMonth] = useState(() => new Date(today.getFullYear(), today.getMonth() - 1, 1));
  const [pickingEnd, setPickingEnd] = useState(false);
  const [expandedGroup, setExpandedGroup] = useState<'last' | 'period' | 'quarters' | null>(null);
  const [compareMode, setCompareMode] = useState<CompareMode>('yesterday');
  const [compareCustom, setCompareCustom] = useState<DateRange>(() => ({
    start: addDays(today, -1),
    end: addDays(today, -1),
  }));
  const [compareCustomDraft, setCompareCustomDraft] = useState<DateRange>(() => ({
    start: addDays(today, -1),
    end: addDays(today, -1),
  }));
  const [compareCustomPickingEnd, setCompareCustomPickingEnd] = useState(false);
  const [compareLeftMonth, setCompareLeftMonth] = useState(
    () => new Date(today.getFullYear(), today.getMonth() - 1, 1),
  );
  const [compareCustomOpen, setCompareCustomOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const onRangeChangeRef = useRef(onRangeChange);
  const onCompareChangeRef = useRef(onCompareChange);
  onRangeChangeRef.current = onRangeChange;
  onCompareChangeRef.current = onCompareChange;

  const compareApplied = useMemo(
    () => resolveCompareRange(compareMode, applied, compareCustom),
    [compareMode, applied, compareCustom],
  );

  const rightMonth = useMemo(
    () => new Date(leftMonth.getFullYear(), leftMonth.getMonth() + 1, 1),
    [leftMonth],
  );
  const compareRightMonth = useMemo(
    () => new Date(compareLeftMonth.getFullYear(), compareLeftMonth.getMonth() + 1, 1),
    [compareLeftMonth],
  );

  const canApply = !sameRange(draft, applied) || draftPreset !== preset;
  const rangeOpen = openPanel === 'range';
  const compareOpen = openPanel === 'compare';

  const emitCompare = useCallback(
    (mode: CompareMode, primary: DateRange, custom: DateRange) => {
      const next = resolveCompareRange(mode, primary, custom);
      onCompareChangeRef.current?.({
        mode,
        range: next ? { start: next.start, end: next.end } : null,
      });
    },
    [],
  );

  useEffect(() => {
    onRangeChangeRef.current?.({ start: defaultRange.start, end: defaultRange.end });
    emitCompare('yesterday', defaultRange, {
      start: addDays(today, -1),
      end: addDays(today, -1),
    });
  }, [today, defaultRange, emitCompare]);

  useEffect(() => {
    if (!openPanel) return;
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (rootRef.current?.contains(target)) return;
      setOpenPanel(null);
      setCompareCustomOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpenPanel(null);
        setCompareCustomOpen(false);
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [openPanel]);

  const openRangePanel = () => {
    setDraft(applied);
    setDraftPreset(preset);
    setPickingEnd(false);
    setLeftMonth(new Date(applied.end.getFullYear(), applied.end.getMonth() - 1, 1));
    setExpandedGroup(
      ['last-7', 'last-30', 'last-90', 'last-365', 'last-month', 'last-year'].includes(preset)
        ? 'last'
        : ['week-to-date', 'month-to-date', 'quarter-to-date', 'year-to-date'].includes(preset)
          ? 'period'
          : ['q1', 'q2', 'q3', 'q4'].includes(preset)
            ? 'quarters'
            : null,
    );
    setCompareCustomOpen(false);
    setOpenPanel((prev) => (prev === 'range' ? null : 'range'));
  };

  const applyPreset = (id: PresetId) => {
    const next = rangeForPreset(id, today);
    setDraftPreset(id);
    if (next) {
      setDraft(next);
      setPickingEnd(false);
      setLeftMonth(new Date(next.end.getFullYear(), next.end.getMonth() - 1, 1));
    }
  };

  const onSelectDay = (day: Date) => {
    setDraftPreset('custom');
    if (!pickingEnd || day < draft.start) {
      setDraft({ start: day, end: day });
      setPickingEnd(true);
      return;
    }
    setDraft({ start: draft.start, end: day });
    setPickingEnd(false);
  };

  const handleApply = () => {
    setApplied(draft);
    setPreset(draftPreset);
    setOpenPanel(null);
    onRangeChangeRef.current?.({ start: draft.start, end: draft.end });
    emitCompare(compareMode, draft, compareCustom);
  };

  const handleCancel = () => {
    setDraft(applied);
    setDraftPreset(preset);
    setOpenPanel(null);
  };

  const selectCompareMode = (mode: CompareMode) => {
    if (mode === 'custom') {
      setCompareMode('custom');
      setCompareCustomDraft(compareCustom);
      setCompareCustomPickingEnd(false);
      setCompareLeftMonth(
        new Date(compareCustom.end.getFullYear(), compareCustom.end.getMonth() - 1, 1),
      );
      setCompareCustomOpen(true);
      return;
    }
    setCompareCustomOpen(false);
    setCompareMode(mode);
    setOpenPanel(null);
    emitCompare(mode, applied, compareCustom);
  };

  const onSelectCompareCustomDay = (day: Date) => {
    if (!compareCustomPickingEnd || day < compareCustomDraft.start) {
      setCompareCustomDraft({ start: day, end: day });
      setCompareCustomPickingEnd(true);
      return;
    }
    setCompareCustomDraft({ start: compareCustomDraft.start, end: day });
    setCompareCustomPickingEnd(false);
  };

  const applyCompareCustom = () => {
    setCompareCustom(compareCustomDraft);
    setCompareMode('custom');
    setCompareCustomOpen(false);
    setOpenPanel(null);
    emitCompare('custom', applied, compareCustomDraft);
  };

  const isRowActive = (id: PresetId) => draftPreset === id;

  return (
    <div ref={rootRef} className="relative flex flex-wrap items-center gap-2">
      <div className="relative">
        <button
          type="button"
          aria-expanded={rangeOpen}
          aria-haspopup="dialog"
          onClick={openRangePanel}
          className={rangeOpen ? filterChipActiveClass : filterChipClass}
        >
          <CalendarDaysIcon className="h-3.5 w-3.5 text-admin-text-secondary" aria-hidden />
          <span>{chipLabelForPreset(preset, applied)}</span>
          <ChevronDownIcon className="h-3.5 w-3.5 text-admin-text-subdued" aria-hidden />
        </button>

        {rangeOpen ? (
          <div
            role="dialog"
            aria-label="Select date range"
            className="absolute left-0 top-full z-30 mt-2 flex w-[min(720px,calc(100vw-2rem))] overflow-hidden rounded-xl border border-admin-border bg-admin-surface shadow-[0_8px_24px_rgba(0,0,0,0.12)]"
          >
            <aside className="w-[168px] shrink-0 border-r border-admin-border bg-admin-table-header py-2">
              {SIDEBAR_ROWS.map((row, index) => {
                if (row.kind === 'divider') {
                  return <div key={`divider-${index}`} className="my-2 border-t border-admin-border" />;
                }
                if (row.kind === 'preset') {
                  return (
                    <button
                      key={row.id}
                      type="button"
                      onClick={() => applyPreset(row.id)}
                      className={`mx-2 flex w-[calc(100%-1rem)] items-center rounded-lg px-2.5 py-1.5 text-left text-[13px] transition-colors ${
                        isRowActive(row.id)
                          ? 'bg-[#e3e3e3] font-medium text-admin-text'
                          : 'text-admin-text hover:bg-[#ebebeb]'
                      }`}
                    >
                      {labelForPreset(row.id)}
                    </button>
                  );
                }

                const open = expandedGroup === row.id;
                const childActive = row.children.includes(draftPreset);
                return (
                  <div key={row.id}>
                    <button
                      type="button"
                      onClick={() => setExpandedGroup(open ? null : row.id)}
                      className={`mx-2 flex w-[calc(100%-1rem)] items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-[13px] transition-colors ${
                        childActive
                          ? 'bg-[#e3e3e3] font-medium text-admin-text'
                          : 'text-admin-text hover:bg-[#ebebeb]'
                      }`}
                    >
                      <span>{row.label}</span>
                      <ChevronRightIcon
                        className={`h-3.5 w-3.5 text-admin-text-subdued transition-transform ${open ? 'rotate-90' : ''}`}
                      />
                    </button>
                    {open
                      ? row.children.map((childId) => (
                          <button
                            key={childId}
                            type="button"
                            onClick={() => applyPreset(childId)}
                            className={`mx-2 flex w-[calc(100%-1rem)] items-center rounded-lg py-1.5 pl-5 pr-2.5 text-left text-[12px] transition-colors ${
                              isRowActive(childId)
                                ? 'bg-[#e3e3e3] font-medium text-admin-text'
                                : 'text-admin-text-secondary hover:bg-[#ebebeb]'
                            }`}
                          >
                            {labelForPreset(childId)}
                          </button>
                        ))
                      : null}
                  </div>
                );
              })}
            </aside>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 border-b border-admin-border px-4 py-3">
                <input
                  readOnly
                  value={formatInputDate(draft.start)}
                  aria-label="Start date"
                  className="h-8 min-w-0 flex-1 rounded-lg border border-admin-border bg-admin-surface px-2.5 text-[13px] text-admin-text outline-none"
                />
                <ArrowRightIcon className="h-3.5 w-3.5 shrink-0 text-admin-text-subdued" aria-hidden />
                <input
                  readOnly
                  value={formatInputDate(draft.end)}
                  aria-label="End date"
                  className="h-8 min-w-0 flex-1 rounded-lg border border-admin-border bg-admin-surface px-2.5 text-[13px] text-admin-text outline-none"
                />
                <button
                  type="button"
                  className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-admin-text-secondary hover:bg-admin-row-hover"
                  aria-label="Time options"
                >
                  <ClockIcon className="h-4 w-4" />
                </button>
              </div>

              <div className="flex divide-x divide-admin-border px-1 py-2">
                <MonthCalendar
                  month={leftMonth}
                  today={today}
                  selected={draft}
                  onSelect={onSelectDay}
                  showLeftNav
                  onPrev={() =>
                    setLeftMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
                  }
                />
                <MonthCalendar
                  month={rightMonth}
                  today={today}
                  selected={draft}
                  onSelect={onSelectDay}
                  showRightNav
                  onNext={() =>
                    setLeftMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
                  }
                />
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-admin-border px-4 py-3">
                <button type="button" onClick={handleCancel} className={adminListSecondaryButtonClass}>
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!canApply}
                  onClick={handleApply}
                  className={adminListPrimaryButtonClass}
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <div className="relative">
        <button
          type="button"
          aria-expanded={compareOpen}
          onClick={() => {
            setCompareCustomOpen(false);
            setOpenPanel((prev) => (prev === 'compare' ? null : 'compare'));
          }}
          className={compareOpen ? filterChipActiveClass : filterChipClass}
        >
          <Square2StackIcon className="h-3.5 w-3.5 text-admin-text-secondary" aria-hidden />
          <span>{formatCompareChipLabel(compareMode, compareApplied)}</span>
          <ChevronDownIcon
            className={`h-3.5 w-3.5 text-admin-text-subdued transition-transform ${compareOpen ? 'rotate-180' : ''}`}
            aria-hidden
          />
        </button>

        {compareOpen ? (
          <div className="absolute left-0 top-full z-30 mt-2 overflow-hidden rounded-xl border border-admin-border bg-admin-surface shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
            {!compareCustomOpen ? (
              <div className="min-w-[280px] p-1.5">
                {COMPARE_OPTIONS.map((option) => {
                  const active = compareMode === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => selectCompareMode(option.id)}
                      className={`flex w-full items-center rounded-lg px-3 py-2 text-left text-[13px] transition-colors ${
                        active
                          ? 'bg-[#e3e3e3] font-medium text-admin-text'
                          : 'text-admin-text hover:bg-admin-row-hover'
                      }`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="w-[min(560px,calc(100vw-2rem))]">
                <div className="border-b border-admin-border px-3 py-2 text-[13px] font-semibold text-admin-text">
                  Custom comparison range
                </div>
                <div className="flex divide-x divide-admin-border px-1 py-2">
                  <MonthCalendar
                    month={compareLeftMonth}
                    today={today}
                    selected={compareCustomDraft}
                    onSelect={onSelectCompareCustomDay}
                    showLeftNav
                    onPrev={() =>
                      setCompareLeftMonth(
                        (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1),
                      )
                    }
                  />
                  <MonthCalendar
                    month={compareRightMonth}
                    today={today}
                    selected={compareCustomDraft}
                    onSelect={onSelectCompareCustomDay}
                    showRightNav
                    onNext={() =>
                      setCompareLeftMonth(
                        (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1),
                      )
                    }
                  />
                </div>
                <div className="flex items-center justify-end gap-2 border-t border-admin-border px-3 py-2.5">
                  <button
                    type="button"
                    onClick={() => setCompareCustomOpen(false)}
                    className={adminListSecondaryButtonClass}
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={applyCompareCustom}
                    className={adminListPrimaryButtonClass}
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
