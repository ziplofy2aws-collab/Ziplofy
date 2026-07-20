import {
  CalendarIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EllipsisHorizontalIcon,
} from '@heroicons/react/24/outline';
import React, { useCallback, useEffect, useRef, useState } from 'react';

export interface CalendarEvent {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  date: string;
  attendees?: number;
  meetingLink?: string;
}

interface CalendarCardProps {
  events?: CalendarEvent[];
  onEventClick?: (eventId: string) => void;
}

const CalendarCard: React.FC<CalendarCardProps> = ({
  events = [
    {
      id: '1',
      title: 'Meeting with VP',
      startTime: '10:00',
      endTime: '11:00',
      date: new Date().toISOString().split('T')[0],
      attendees: 6,
      meetingLink: '#',
    },
  ],
  onEventClick,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isMonthDropdownOpen, setIsMonthDropdownOpen] = useState(false);
  const monthDropdownRef = useRef<HTMLDivElement>(null);

  const months = [
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

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Get the current week's dates
  const getWeekDates = useCallback(() => {
    const today = new Date(currentDate);
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
    const monday = new Date(today.setDate(diff));

    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      weekDates.push(date);
    }
    return weekDates;
  }, [currentDate]);

  const weekDates = getWeekDates();

  const handlePreviousWeek = useCallback(() => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() - 7);
      return newDate;
    });
  }, []);

  const handleNextWeek = useCallback(() => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() + 7);
      return newDate;
    });
  }, []);

  const handleDateSelect = useCallback((date: Date) => {
    setSelectedDate(date);
  }, []);

  const isToday = useCallback((date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }, []);

  const isSelected = useCallback(
    (date: Date) => {
      return (
        date.getDate() === selectedDate.getDate() &&
        date.getMonth() === selectedDate.getMonth() &&
        date.getFullYear() === selectedDate.getFullYear()
      );
    },
    [selectedDate]
  );

  // Get event for today
  const todayEvent = events.find((event) => {
    const eventDate = new Date(event.date);
    return isToday(eventDate);
  });

  const formatTime = useCallback((time: string) => {
    return time; // Assuming time is already in format like "10:00"
  }, []);

  const formatEventTime = useCallback((startTime: string, endTime: string, date: string) => {
    const eventDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    eventDate.setHours(0, 0, 0, 0);

    if (eventDate.getTime() === today.getTime()) {
      return `Today ${startTime}-${endTime} am`;
    }
    return `${startTime}-${endTime} am`;
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (monthDropdownRef.current && !monthDropdownRef.current.contains(event.target as Node)) {
        setIsMonthDropdownOpen(false);
      }
    };

    if (isMonthDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMonthDropdownOpen]);

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
      {/* Calendar Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          {/* Month Selector */}
          <div className="relative" ref={monthDropdownRef}>
            <button
              onClick={() => setIsMonthDropdownOpen(!isMonthDropdownOpen)}
              className="flex items-center gap-2 text-sm font-medium text-gray-900 hover:text-gray-700 transition-colors"
            >
              <CalendarIcon className="w-5 h-5 text-gray-500" />
              <span>
                Calendar {months[currentDate.getMonth()].toLowerCase()}
              </span>
              <ChevronDownIcon className="w-4 h-4 text-gray-500" />
            </button>

            {isMonthDropdownOpen && (
              <div className="absolute left-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10 min-w-[150px]">
                {months.map((month, index) => (
                  <button
                    key={month}
                    onClick={() => {
                      setCurrentDate((prev) => {
                        const newDate = new Date(prev);
                        newDate.setMonth(index);
                        return newDate;
                      });
                      setIsMonthDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    {month}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Navigation Arrows */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePreviousWeek}
              className="p-1 text-gray-500 hover:bg-gray-100 rounded transition-colors"
              aria-label="Previous week"
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </button>
            <button
              onClick={handleNextWeek}
              className="p-1 text-gray-500 hover:bg-gray-100 rounded transition-colors"
              aria-label="Next week"
            >
              <ChevronRightIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Week View */}
        <div className="flex items-center justify-center gap-3">
          {weekDates.map((date, index) => {
            const dayName = daysOfWeek[date.getDay()];
            const dayNumber = date.getDate();
            const isTodayDate = isToday(date);
            const isSelectedDate = isSelected(date);

            return (
              <button
                key={index}
                onClick={() => handleDateSelect(date)}
                className={`py-2 px-3 rounded-lg transition-colors text-sm ${
                  isSelectedDate
                    ? 'bg-blue-100 text-blue-700'
                    : isTodayDate
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span className={`${isSelectedDate || isTodayDate ? 'font-semibold' : 'font-normal'}`}>
                  {dayName} {dayNumber.toString().padStart(2, '0')}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Event Detail Card */}
      {todayEvent && (
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h4 className="text-base font-semibold text-gray-900 mb-1">{todayEvent.title}</h4>
              <p className="text-sm text-gray-600">{formatEventTime(todayEvent.startTime, todayEvent.endTime, todayEvent.date)}</p>
            </div>
            <button
              onClick={() => {}}
              className="p-1 text-gray-500 hover:bg-gray-200 rounded transition-colors"
              aria-label="More options"
            >
              <EllipsisHorizontalIcon className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center justify-between">
            {/* Google Meet Button */}
            {todayEvent.meetingLink && (
              <a
                href={todayEvent.meetingLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {/* Google Meet Logo - Colored Squares */}
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                  <rect x="4" y="4" width="8" height="8" rx="1" fill="#00832D" />
                  <rect x="10" y="4" width="8" height="8" rx="1" fill="#0066DA" />
                  <rect x="4" y="10" width="8" height="8" rx="1" fill="#EA4335" />
                  <rect x="10" y="10" width="8" height="8" rx="1" fill="#FFBA00" />
                </svg>
                <span>Google Meet</span>
              </a>
            )}

            {/* Attendees */}
            {todayEvent.attendees && todayEvent.attendees > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {Array.from({ length: Math.min(4, todayEvent.attendees) }).map((_, index) => (
                    <div
                      key={index}
                      className="w-8 h-8 rounded-full bg-gray-200 border-2 border-gray-50 flex items-center justify-center relative"
                    >
                      <svg
                        className="w-6 h-6 text-gray-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  ))}
                </div>
                {todayEvent.attendees > 4 && (
                  <div className="w-8 h-8 rounded-full bg-purple-400 border-2 border-gray-50 flex items-center justify-center -ml-2">
                    <span className="text-xs font-medium text-white">+{todayEvent.attendees - 4}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarCard;

