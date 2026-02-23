import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { Calendar, Clock, Globe } from 'lucide-react';
import { cn } from '../lib/utils';

// Timezones list
const TIMEZONES = [
  { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
  { value: 'Asia/Shanghai', label: 'CST (China Standard Time)' },
  { value: 'America/Los_Angeles', label: 'PST (Pacific Standard Time)' },
  { value: 'America/New_York', label: 'EST (Eastern Standard Time)' },
  { value: 'Europe/London', label: 'GMT (Greenwich Mean Time)' },
  { value: 'Asia/Tokyo', label: 'JST (Japan Standard Time)' },
];

interface HeaderProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  selectedTimezone: string;
  onTimezoneChange: (tz: string) => void;
}

export function Header({ selectedDate, onDateChange, selectedTimezone, onTimezoneChange }: HeaderProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Format Date for Input: YYYY-MM-DD
  const dateValue = format(selectedDate, 'yyyy-MM-dd');

  const handleDateInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = new Date(e.target.value);
    if (!isNaN(date.getTime())) {
      onDateChange(date);
    }
  };

  const setToday = () => onDateChange(new Date());

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200 shadow-sm z-20 sticky top-0">
      {/* Title Area */}
      <div className="flex flex-col">
        <h1 className="text-xl font-semibold text-gray-900 tracking-tight">On-call Overview</h1>
        <div className="flex items-center text-sm text-gray-500 mt-1 font-mono">
          <Clock className="w-3 h-3 mr-1.5" />
          <span>
            {formatInTimeZone(currentTime, selectedTimezone, 'HH:mm:ss')} {selectedTimezone.split('/')[1] || selectedTimezone}
          </span>
          <span className="mx-2 text-gray-300">|</span>
          <span>{format(selectedDate, 'EEE, MMM d, yyyy')}</span>
        </div>
      </div>

      {/* Actions Area */}
      <div className="flex items-center space-x-4">
        {/* Date Picker Group */}
        <div className="flex items-center bg-gray-50 rounded-lg p-1 border border-gray-200">
          <button 
            onClick={setToday}
            className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-white rounded-md transition-colors"
          >
            Today
          </button>
          <div className="h-4 w-px bg-gray-300 mx-1"></div>
          <div className="relative flex items-center px-2">
            <Calendar className="w-4 h-4 text-gray-400 absolute left-2 pointer-events-none" />
            <input 
              type="date" 
              value={dateValue}
              onChange={handleDateInput}
              className="pl-8 pr-2 py-1 bg-transparent text-sm text-gray-700 focus:outline-none font-medium cursor-pointer"
            />
          </div>
        </div>

        {/* Timezone Switcher */}
        <div className="relative group">
          <div className="flex items-center space-x-2 bg-white border border-gray-200 rounded-lg px-3 py-1.5 hover:border-gray-300 transition-colors shadow-sm">
            <Globe className="w-4 h-4 text-gray-500" />
            <select 
              value={selectedTimezone}
              onChange={(e) => onTimezoneChange(e.target.value)}
              className="appearance-none bg-transparent text-sm font-medium text-gray-700 focus:outline-none pr-6 cursor-pointer"
            >
              {TIMEZONES.map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {tz.label}
                </option>
              ))}
            </select>
            <div className="absolute right-3 pointer-events-none">
              <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
