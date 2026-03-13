import { Plus, Search, Filter, Edit2, Archive, Clock } from "lucide-react";
import { cn } from "../../lib/utils";

const shifts = [
  { code: "DS", role: "L1, L2", meaning: "Day Shift", start: "08:00", end: "16:00", tz: "Local", primary: true, show: true },
  { code: "NS", role: "L1, L2", meaning: "Night Shift", start: "16:00", end: "00:00", tz: "Local", primary: true, show: true },
  { code: "OC", role: "All", meaning: "On Call", start: "00:00", end: "08:00", tz: "Local", primary: false, show: true },
  { code: "A", role: "AP L2, AP L3", meaning: "APAC Shift A", start: "00:00", end: "08:00", tz: "UTC", primary: true, show: true },
  { code: "B", role: "EMEA L2", meaning: "EMEA Shift B", start: "08:00", end: "16:00", tz: "UTC", primary: true, show: true },
  { code: "HoL", role: "All", meaning: "Holiday Leave", start: "00:00", end: "23:59", tz: "Local", primary: false, show: true },
  { code: "TR", role: "All", meaning: "Training", start: "09:00", end: "17:00", tz: "Local", primary: false, show: false },
];

export function ShiftDefinitions() {
  return (
    <div className="flex flex-col h-full bg-slate-50 relative animate-in fade-in duration-300">
      {/* Top Toolbar */}
      <div className="flex-shrink-0 border-b border-slate-200 px-8 py-6 bg-white flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800 tracking-tight">Shift Definitions</h1>
          <p className="text-sm text-slate-500 mt-1">Manage shift codes, timelines, and primary status.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Search codes..." className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-md bg-slate-50 w-64 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 placeholder:text-slate-400 text-slate-700" />
          </div>
          <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 shadow-sm">
            <Filter className="w-4 h-4" />
            <span>Filter</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-md hover:bg-teal-700 shadow-sm transition-colors">
            <Plus className="w-4 h-4" />
            <span>New Shift Code</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50/80 text-xs uppercase font-semibold text-slate-500 tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 w-20">Code</th>
                <th className="px-6 py-3">Meaning</th>
                <th className="px-6 py-3">Role Groups</th>
                <th className="px-6 py-3">Time (24h)</th>
                <th className="px-6 py-3 w-48">Timeline Preview</th>
                <th className="px-6 py-3 text-center">Type</th>
                <th className="px-6 py-3 text-center">Visible</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {shifts.map((shift) => (
                <tr key={shift.code} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded bg-slate-100 border border-slate-200 font-mono text-sm font-semibold text-slate-800 shadow-sm">
                      {shift.code}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-800">{shift.meaning}</td>
                  <td className="px-6 py-4 text-slate-500 text-xs">{shift.role}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 font-mono text-xs text-slate-600">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{shift.start} - {shift.end}</span>
                      <span className="text-[10px] text-slate-400 bg-slate-100 px-1 rounded">{shift.tz}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {/* Compact timeline preview bar */}
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden relative border border-slate-200">
                      {shift.code === "DS" && <div className="absolute left-[33%] right-[33%] h-full bg-sky-400"></div>}
                      {shift.code === "NS" && <div className="absolute left-[66%] right-0 h-full bg-indigo-400"></div>}
                      {shift.code === "OC" && <div className="absolute left-0 right-[66%] h-full bg-amber-400"></div>}
                      {shift.code === "A" && <div className="absolute left-0 right-[66%] h-full bg-emerald-400"></div>}
                      {shift.code === "B" && <div className="absolute left-[33%] right-[33%] h-full bg-teal-400"></div>}
                      {shift.code === "HoL" && <div className="absolute left-0 right-0 h-full bg-rose-400"></div>}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {shift.primary ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                        Primary
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                        Secondary
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center">
                      <div className={cn("w-2.5 h-2.5 rounded-full", shift.show ? "bg-emerald-500 shadow-[0_0_0_2px_#d1fae5]" : "bg-slate-300")}></div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors">
                        <Archive className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
