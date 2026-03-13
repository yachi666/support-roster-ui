import { useState, Fragment } from "react";
import { ChevronLeft, ChevronRight, Settings, Download, Upload, Filter, Search, MoreHorizontal, User, AlertCircle, X, Check, Save } from "lucide-react";
import { cn } from "../../lib/utils";
import { motion, AnimatePresence } from "motion/react";

const days = Array.from({ length: 31 }, (_, i) => i + 1);
const TEAMS = ["L1", "AP L2", "EMEA L2", "Incident Manager"];

const generateMockData = () => {
  return TEAMS.map(team => ({
    team,
    staff: Array.from({ length: Math.floor(Math.random() * 3) + 2 }, (_, i) => ({
      id: `${team}-${i}`,
      name: `Staff Member ${i + 1}`,
      role: team.includes("Manager") ? "Lead" : "Engineer",
      schedule: Array.from({ length: 31 }, () => {
        const rand = Math.random();
        if (rand > 0.8) return "DS";
        if (rand > 0.6) return "NS";
        if (rand > 0.4) return "A";
        if (rand > 0.3) return "OC";
        if (rand > 0.28) return "HoL";
        return "";
      })
    }))
  }));
};

const mockData = generateMockData();

export function MonthlyRosterPlanner() {
  const [selectedCell, setSelectedCell] = useState<{staffId: string, day: number} | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(true);

  return (
    <div className="flex flex-col h-full bg-white relative animate-in fade-in duration-300">
      {/* Top Toolbar */}
      <div className="flex-shrink-0 border-b border-slate-200 px-4 py-3 bg-white flex items-center justify-between z-20 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-slate-100 rounded-md p-0.5 border border-slate-200 shadow-sm">
            <button className="p-1 text-slate-500 hover:text-slate-800 hover:bg-white rounded transition-colors"><ChevronLeft className="w-4 h-4" /></button>
            <div className="px-3 text-sm font-semibold text-slate-800 min-w-[120px] text-center">October 2023</div>
            <button className="p-1 text-slate-500 hover:text-slate-800 hover:bg-white rounded transition-colors"><ChevronRight className="w-4 h-4" /></button>
          </div>
          <div className="h-4 w-px bg-slate-200"></div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Timezone</span>
            <select className="text-sm bg-transparent border-none text-slate-700 font-medium focus:ring-0 outline-none cursor-pointer hover:text-teal-600">
              <option>UTC (Default)</option>
              <option>Asia/Singapore</option>
              <option>Europe/London</option>
            </select>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Filter staff..." className="pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-md bg-slate-50 w-48 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 placeholder:text-slate-400 text-slate-700" />
          </div>
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 shadow-sm">
            <Filter className="w-3.5 h-3.5" />
            <span>Teams (All)</span>
          </button>
          <div className="h-4 w-px bg-slate-200"></div>
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 shadow-sm">
            <Upload className="w-3.5 h-3.5" />
            <span>Import</span>
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 shadow-sm">
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Main Grid Area */}
      <div className="flex-1 overflow-auto relative bg-[#fcfcfd]">
        <table className="w-max min-w-full border-collapse text-sm text-left font-sans text-slate-700">
          <thead className="sticky top-0 bg-white z-20 shadow-[0_1px_0_0_#e2e8f0]">
            <tr>
              <th className="sticky left-0 bg-white z-30 w-64 min-w-[256px] px-4 py-2 font-semibold text-xs uppercase tracking-wider text-slate-500 border-r border-b border-slate-200 shadow-[1px_0_0_0_#e2e8f0]">
                Staff & Team
              </th>
              {days.map(day => (
                <th key={day} className="px-1 py-2 font-mono font-medium text-xs text-center border-b border-slate-200 min-w-[44px] w-[44px]">
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] text-slate-400 uppercase">
                      {['Su','Mo','Tu','We','Th','Fr','Sa'][(day + 2) % 7]}
                    </span>
                    <span className={cn("mt-0.5", (day+2)%7 === 0 || (day+2)%7 === 6 ? "text-rose-500" : "text-slate-700")}>
                      {day}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mockData.map((teamGroup) => (
              <Fragment key={teamGroup.team}>
                <tr>
                  <td colSpan={32} className="bg-slate-50/80 px-4 py-2 text-xs font-semibold text-slate-800 border-y border-slate-200 shadow-[0_1px_0_rgba(0,0,0,0.02)] sticky left-0 z-20 uppercase tracking-wide">
                    {teamGroup.team}
                  </td>
                </tr>
                {teamGroup.staff.map(staff => (
                  <tr key={staff.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="sticky left-0 bg-white group-hover:bg-slate-50 px-4 py-2.5 border-r border-b border-slate-200 shadow-[1px_0_0_0_#e2e8f0] z-20">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-semibold text-slate-600 border border-slate-200">
                          {staff.name.split(' ')[1]}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium text-slate-800 cursor-pointer hover:text-teal-600 hover:underline decoration-teal-300 underline-offset-2 transition-colors" onClick={() => setDrawerOpen(true)}>
                            {staff.name}
                          </span>
                          <span className="text-[10px] text-slate-400">{staff.role}</span>
                        </div>
                      </div>
                    </td>
                    {staff.schedule.map((shift, dayIdx) => {
                      const isSelected = selectedCell?.staffId === staff.id && selectedCell?.day === dayIdx + 1;
                      const hasError = shift === "NS" && dayIdx % 8 === 0; // Mock error condition
                      
                      return (
                        <td 
                          key={dayIdx} 
                          className={cn(
                            "border-b border-r border-slate-100 p-1 text-center font-mono text-[11px] cursor-cell transition-all relative",
                            isSelected ? "ring-2 ring-teal-500 ring-inset bg-teal-50/50 z-10" : "hover:bg-slate-100/80",
                            shift && !isSelected ? "bg-white" : ""
                          )}
                          onClick={() => {
                            setSelectedCell({staffId: staff.id, day: dayIdx + 1});
                            setDrawerOpen(true);
                          }}
                        >
                          {shift && (
                            <div className={cn(
                              "w-full h-full min-h-[28px] flex items-center justify-center rounded-[3px]",
                              shift === "OC" && "bg-amber-100 text-amber-800 border border-amber-200",
                              shift === "DS" && "bg-sky-50 text-sky-700 border border-sky-200",
                              shift === "NS" && "bg-indigo-50 text-indigo-700 border border-indigo-200",
                              shift === "A" && "bg-emerald-50 text-emerald-700 border border-emerald-200",
                              shift === "HoL" && "bg-rose-50 text-rose-700 border border-rose-200",
                              hasError && "border-2 border-rose-400 text-rose-700 font-bold bg-rose-50"
                            )}>
                              {shift}
                            </div>
                          )}
                          {hasError && (
                            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white"></div>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Unsaved Changes Bar */}
      <AnimatePresence>
        {hasUnsavedChanges && (
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-5 py-3 rounded-xl shadow-lg shadow-slate-900/20 flex items-center gap-6 z-40 border border-slate-700"
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></div>
              <span className="text-sm font-medium">You have unsaved changes</span>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setHasUnsavedChanges(false)}
                className="text-xs font-semibold px-3 py-1.5 hover:bg-slate-700 rounded-md transition-colors"
              >
                Discard
              </button>
              <button 
                onClick={() => setHasUnsavedChanges(false)}
                className="text-xs font-semibold px-4 py-1.5 bg-teal-500 hover:bg-teal-400 text-slate-900 rounded-md transition-colors shadow-sm flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                Save Changes
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Side Drawer Form */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-slate-900/10 backdrop-blur-[1px] z-40"
              onClick={() => setDrawerOpen(false)}
            />
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.3 }}
              className="absolute top-0 right-0 bottom-0 w-[400px] bg-white shadow-[-10px_0_40px_rgba(0,0,0,0.05)] border-l border-slate-200 z-50 flex flex-col"
            >
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h3 className="font-semibold text-slate-800">Edit Assignment</h3>
                <button onClick={() => setDrawerOpen(false)} className="p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-md transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div>
                  <div className="flex items-center gap-3 mb-4 p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-sm font-semibold text-slate-600">
                      S1
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-800">Staff Member 1</div>
                      <div className="text-xs text-slate-500">AP L2 • Engineer</div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5 block">Date Range</label>
                      <div className="flex items-center gap-2">
                        <input type="text" value="Oct 12, 2023" className="w-full text-sm px-3 py-2 border border-slate-200 rounded-md bg-slate-50 font-mono text-slate-700" readOnly />
                        <span className="text-slate-400 text-sm">to</span>
                        <input type="text" value="Oct 12, 2023" className="w-full text-sm px-3 py-2 border border-slate-200 rounded-md bg-slate-50 font-mono text-slate-700" readOnly />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5 block">Shift Code</label>
                      <div className="grid grid-cols-3 gap-2">
                        {["DS", "NS", "A", "B", "OC", "HoL", "Clear"].map(code => (
                          <button 
                            key={code}
                            className={cn(
                              "py-2 px-3 text-sm font-mono border rounded-md transition-colors text-center",
                              code === "NS" ? "bg-indigo-50 border-indigo-200 text-indigo-700 font-semibold shadow-[0_0_0_2px_rgba(99,102,241,0.2)]" : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                            )}
                          >
                            {code}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100">
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex gap-3">
                        <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="text-sm font-medium text-amber-800">Validation Warning</div>
                          <div className="text-xs text-amber-700 mt-0.5 leading-relaxed">Assigning NS creates a rest period violation following their DS shift on Oct 11.</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex gap-3">
                <button className="flex-1 px-4 py-2 border border-slate-200 text-slate-700 font-medium text-sm rounded-md bg-white shadow-sm hover:bg-slate-50 transition-colors" onClick={() => setDrawerOpen(false)}>Cancel</button>
                <button className="flex-1 px-4 py-2 bg-teal-600 text-white font-medium text-sm rounded-md shadow-sm hover:bg-teal-700 transition-colors flex items-center justify-center gap-2" onClick={() => { setDrawerOpen(false); setHasUnsavedChanges(true); }}>
                  <Check className="w-4 h-4" /> Apply
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
