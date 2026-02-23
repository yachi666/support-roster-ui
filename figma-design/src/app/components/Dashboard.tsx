import { useState } from 'react';
import { Header } from './Header';
import { Timeline } from './Timeline';
import { TEAMS, generateShifts } from '../data/mockData';

export default function Dashboard() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTimezone, setSelectedTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);

  // Shifts are generated based on the selected date to simulate fetching for that day
  const shifts = generateShifts(selectedDate);

  return (
    <div className="flex flex-col h-full bg-slate-50 text-slate-900 font-sans">
      <Header 
        selectedDate={selectedDate} 
        onDateChange={setSelectedDate}
        selectedTimezone={selectedTimezone}
        onTimezoneChange={setSelectedTimezone}
      />
      <div className="flex-1 overflow-hidden relative">
         <Timeline 
            selectedDate={selectedDate}
            selectedTimezone={selectedTimezone}
            teams={TEAMS}
            shifts={shifts}
         />
      </div>
    </div>
  );
}
