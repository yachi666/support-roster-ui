import { useMemo, useState, useEffect } from 'react';
import { format, addHours, differenceInMinutes, startOfDay, parseISO } from 'date-fns';
import { fromZonedTime, toZonedTime } from 'date-fns-tz';
import { Shift, Team } from '../data/mockData';
import * as Tooltip from '@radix-ui/react-tooltip';
import { User, Mail, Phone, MessageSquare, Star, Clock } from 'lucide-react';
import { cn } from '../lib/utils';

// Constants
const HOUR_WIDTH = 120; // px
const TOTAL_WIDTH = 24 * HOUR_WIDTH;
const BLOCK_HEIGHT = 36; // px
const BLOCK_GAP = 8; // px
const ROW_PADDING = 16; // px
const MIN_ROW_HEIGHT = 80; // px

interface TimelineProps {
  selectedDate: Date;
  selectedTimezone: string;
  teams: Team[];
  shifts: Shift[];
}

interface LayoutShift {
  shift: Shift;
  laneIndex: number;
  left: number;
  width: number;
}

interface TeamLayout {
  team: Team;
  height: number;
  shifts: LayoutShift[];
}

export function Timeline({ selectedDate, selectedTimezone, teams, shifts }: TimelineProps) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // 1. Calculate View Window (00:00 - 24:00 in selected Timezone)
  const viewWindow = useMemo(() => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    // Start of the day in the selected timezone, converted to UTC timestamp logic
    // We treat this start time as the 0-point for the grid.
    const start = fromZonedTime(dateStr + ' 00:00:00', selectedTimezone);
    const end = addHours(start, 24);
    return { start, end };
  }, [selectedDate, selectedTimezone]);

  // 2. Process Shifts into Layout
  const layout = useMemo(() => {
    const teamLayouts: TeamLayout[] = [];

    teams.forEach(team => {
      const teamShifts = shifts.filter(s => s.teamId === team.id);
      
      // Sort by start time
      const sorted = [...teamShifts].sort((a, b) => 
        new Date(a.start).getTime() - new Date(b.start).getTime()
      );

      const lanes: Date[] = []; // End time of last shift in each lane
      const layoutShifts: LayoutShift[] = [];

      sorted.forEach(shift => {
        const shiftStart = new Date(shift.start);
        const shiftEnd = new Date(shift.end);

        // Clip to view window
        if (shiftEnd <= viewWindow.start || shiftStart >= viewWindow.end) return;

        // Calculate Position
        const visibleStart = shiftStart < viewWindow.start ? viewWindow.start : shiftStart;
        const visibleEnd = shiftEnd > viewWindow.end ? viewWindow.end : shiftEnd;

        const startDiff = differenceInMinutes(visibleStart, viewWindow.start);
        const duration = differenceInMinutes(visibleEnd, visibleStart);

        const left = (startDiff / 60) * HOUR_WIDTH;
        const width = (duration / 60) * HOUR_WIDTH;

        // Find Lane
        let laneIndex = -1;
        for (let i = 0; i < lanes.length; i++) {
          if (lanes[i] <= shiftStart) {
            laneIndex = i;
            lanes[i] = shiftEnd;
            break;
          }
        }
        if (laneIndex === -1) {
          laneIndex = lanes.length;
          lanes.push(shiftEnd);
        }

        layoutShifts.push({ shift, laneIndex, left, width });
      });

      const height = Math.max(
        MIN_ROW_HEIGHT, 
        (lanes.length * (BLOCK_HEIGHT + BLOCK_GAP)) + (ROW_PADDING * 2)
      );
      
      teamLayouts.push({ team, height, shifts: layoutShifts });
    });

    return teamLayouts;
  }, [teams, shifts, viewWindow]);

  // 3. Current Time Indicator Position
  const currentTimeLeft = useMemo(() => {
    const diff = differenceInMinutes(now, viewWindow.start);
    if (diff < 0 || diff > 24 * 60) return null;
    return (diff / 60) * HOUR_WIDTH;
  }, [now, viewWindow]);

  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <Tooltip.Provider delayDuration={200}>
      <div className="h-full overflow-auto bg-white relative scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
        <div className="min-w-max flex flex-col">
          
          {/* Header Row */}
          <div className="sticky top-0 z-30 flex bg-gray-50 border-b border-gray-200 shadow-sm h-12">
            {/* Corner (Sticky Left) */}
            <div className="sticky left-0 z-40 w-60 bg-gray-50 border-r border-gray-200 flex items-center px-4 font-semibold text-xs text-gray-500 uppercase tracking-wider shadow-[1px_0_0_0_rgba(229,231,235,1)]">
              Teams
            </div>
            {/* Time Scale */}
            <div className="flex relative" style={{ width: TOTAL_WIDTH }}>
              {hours.map(h => (
                <div key={h} className="flex-none border-r border-gray-200/50 flex items-center px-2 text-xs font-mono text-gray-400 select-none" style={{ width: HOUR_WIDTH }}>
                  {h.toString().padStart(2, '0')}:00
                </div>
              ))}
              
              {/* Current Time Marker on Header */}
              {currentTimeLeft !== null && (
                 <div className="absolute top-0 bottom-0 z-50 w-px bg-red-500 pointer-events-none" style={{ left: currentTimeLeft }}>
                   <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] border-t-red-500 -ml-[4.5px]"></div>
                 </div>
              )}
            </div>
          </div>

          {/* Grid Rows */}
          <div className="relative">
            {/* Vertical Grid Lines (Background) */}
             <div className="absolute inset-0 pointer-events-none flex pl-60" style={{ width: TOTAL_WIDTH + 240 }}>
                {hours.map(h => (
                   <div key={h} className="flex-none border-r border-dashed border-gray-100 h-full" style={{ width: HOUR_WIDTH }}></div>
                ))}
             </div>

            {/* Current Time Line (Vertical) */}
            {currentTimeLeft !== null && (
               <div className="absolute top-0 bottom-0 w-px bg-red-500/50 z-20 pointer-events-none ml-60 dashed" style={{ left: currentTimeLeft }}></div>
            )}

            {layout.map(({ team, height, shifts }) => (
              <div key={team.id} className="flex border-b border-gray-100 group hover:bg-gray-50/50 transition-colors">
                
                {/* Team Sidebar (Sticky Left) */}
                <div className="sticky left-0 z-20 w-60 bg-white border-r border-gray-200 flex flex-col justify-center px-4 group-hover:bg-gray-50/50 transition-colors shadow-[1px_0_0_0_rgba(229,231,235,1)]" style={{ height }}>
                  <div className="font-semibold text-gray-800 text-sm flex items-center">
                    <span className={cn("w-2 h-2 rounded-full mr-2", {
                      'bg-blue-500': team.color === 'blue',
                      'bg-emerald-500': team.color === 'green',
                      'bg-orange-500': team.color === 'orange',
                      'bg-purple-500': team.color === 'purple',
                      'bg-red-500': team.color === 'red',
                    })}></span>
                    {team.name}
                  </div>
                  <div className="text-xs text-gray-400 mt-1 pl-4">
                    {shifts.length} active shifts
                  </div>
                </div>

                {/* Shifts Container */}
                <div className="relative flex-1" style={{ width: TOTAL_WIDTH, height }}>
                   {shifts.length === 0 && (
                      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImEiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTTAgNDBMODAgMCIgc3Ryb2tlPSIjRjNGNEY2IiBzdHJva2Utd2lkdGg9IjIiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjYSkiLz48L3N2Zz4=')] opacity-50"></div>
                   )}

                   {shifts.map(({ shift, laneIndex, left, width }) => (
                      <ShiftBlock 
                        key={shift.id} 
                        shift={shift} 
                        style={{ 
                          left, 
                          width: Math.max(width, 4), // Min width for visibility
                          top: ROW_PADDING + laneIndex * (BLOCK_HEIGHT + BLOCK_GAP),
                          height: BLOCK_HEIGHT
                        }} 
                        teamColor={team.color}
                      />
                   ))}
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </Tooltip.Provider>
  );
}

function ShiftBlock({ shift, style, teamColor }: { shift: Shift, style: React.CSSProperties, teamColor: string }) {
  const bgColor = {
    blue: 'bg-blue-100 border-blue-200 text-blue-900 hover:bg-blue-200',
    green: 'bg-emerald-100 border-emerald-200 text-emerald-900 hover:bg-emerald-200',
    orange: 'bg-orange-100 border-orange-200 text-orange-900 hover:bg-orange-200',
    purple: 'bg-purple-100 border-purple-200 text-purple-900 hover:bg-purple-200',
    red: 'bg-red-100 border-red-200 text-red-900 hover:bg-red-200',
  }[teamColor as string] || 'bg-gray-100 border-gray-200';

  const formatShiftTime = (iso: string) => {
    return format(new Date(iso), 'HH:mm');
  };

  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <div 
          className={cn(
            "absolute rounded-lg border px-3 flex items-center justify-between overflow-hidden cursor-pointer shadow-sm hover:shadow-md transition-all select-none z-10 hover:z-20",
            bgColor
          )} 
          style={style}
        >
          <div className="flex items-center space-x-2 min-w-0">
            {shift.isPrimary && <Star className="w-3 h-3 flex-shrink-0 fill-current opacity-70" />}
            <img src={shift.userAvatar} alt="" className="w-5 h-5 rounded-full bg-white/50 flex-shrink-0 object-cover border border-white/30" />
            <span className="font-semibold text-xs truncate">{shift.userName}</span>
          </div>
          
          {parseInt(style.width as any) > 80 && (
             <span className="text-xs font-mono opacity-80 whitespace-nowrap ml-2 hidden sm:inline-block">
               {formatShiftTime(shift.start)} - {formatShiftTime(shift.end)}
             </span>
          )}
        </div>
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content className="z-50 bg-white rounded-lg shadow-xl border border-gray-200 p-4 w-72 animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95" sideOffset={5}>
          <div className="flex items-start justify-between mb-3">
             <div className="flex items-center space-x-3">
               <img src={shift.userAvatar} className="w-10 h-10 rounded-full object-cover border border-gray-100" />
               <div>
                 <div className="font-bold text-gray-900">{shift.userName}</div>
                 <div className="text-xs text-gray-500 flex items-center mt-0.5">
                   {shift.isPrimary ? 'Primary On-call' : 'Secondary Support'}
                 </div>
               </div>
             </div>
             <div className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium uppercase tracking-wide border", 
                bgColor.replace('text-', 'text-').replace('bg-', 'bg-').replace('border-', 'border-').split(' ')[0] + " bg-opacity-20 border-opacity-30"
             )}>
               {shift.role}
             </div>
          </div>
          
          <div className="space-y-2 text-sm text-gray-600">
             <div className="flex items-center">
               <Clock className="w-3.5 h-3.5 mr-2 text-gray-400" />
               <span className="font-mono text-xs">
                 {format(new Date(shift.start), 'MMM d, HH:mm')} - {format(new Date(shift.end), 'HH:mm')}
               </span>
             </div>
             <div className="h-px bg-gray-100 my-2"></div>
             <div className="flex items-center hover:text-gray-900 cursor-pointer transition-colors">
               <MessageSquare className="w-3.5 h-3.5 mr-2 text-gray-400" />
               <span className="select-all">{shift.contact.slack}</span>
             </div>
             <div className="flex items-center hover:text-gray-900 cursor-pointer transition-colors">
               <Mail className="w-3.5 h-3.5 mr-2 text-gray-400" />
               <span className="select-all">{shift.contact.email}</span>
             </div>
             <div className="flex items-center hover:text-gray-900 cursor-pointer transition-colors">
               <Phone className="w-3.5 h-3.5 mr-2 text-gray-400" />
               <span className="select-all">{shift.contact.phone}</span>
             </div>
          </div>

          {shift.backup && (
            <div className="mt-3 pt-3 border-t border-gray-100">
               <div className="text-xs font-semibold text-gray-500 mb-1">Backup</div>
               <div className="flex items-center text-sm">
                 <User className="w-3.5 h-3.5 mr-2 text-gray-400" />
                 {shift.backup.name} <span className="text-gray-400 ml-1">({shift.backup.contact})</span>
               </div>
            </div>
          )}
          <Tooltip.Arrow className="fill-white" />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}
