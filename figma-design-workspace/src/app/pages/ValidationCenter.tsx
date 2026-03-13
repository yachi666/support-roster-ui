import { useState } from "react";
import { AlertCircle, AlertTriangle, ArrowRight, CheckSquare, Search, Filter, PlayCircle } from "lucide-react";
import { cn } from "../../lib/utils";

const issues = [
  { id: 1, severity: "high", type: "Missing Primary Coverage", description: "No primary shift scheduled for AP L2 on Oct 14.", team: "AP L2", date: "Oct 14", status: "open" },
  { id: 2, severity: "high", type: "Overlapping Assignment", description: "David Kim assigned DS and NS on the same day.", team: "L1", date: "Oct 18", status: "open" },
  { id: 3, severity: "medium", type: "Invalid Shift Code", description: "Code 'XX' not found in shift definitions.", team: "EMEA L2", date: "Oct 22", status: "open" },
  { id: 4, severity: "low", type: "Time Zone Ambiguity", description: "Staff James Wilson has no timezone assigned.", team: "DevOps", date: "-", status: "open" },
  { id: 5, severity: "high", type: "Missing Primary Coverage", description: "No primary shift scheduled for Incident Manager on Oct 05.", team: "Incident Manager", date: "Oct 05", status: "open" },
];

export function ValidationCenter() {
  const [selectedIssues, setSelectedIssues] = useState<number[]>([]);

  const toggleSelect = (id: number) => {
    setSelectedIssues(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selectedIssues.length === issues.length) {
      setSelectedIssues([]);
    } else {
      setSelectedIssues(issues.map(i => i.id));
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 relative animate-in fade-in duration-300">
      <div className="flex-shrink-0 border-b border-slate-200 px-8 py-6 bg-white flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800 tracking-tight flex items-center gap-3">
            Validation Center
            <span className="inline-flex items-center justify-center px-2.5 py-0.5 text-xs font-semibold bg-rose-100 text-rose-700 rounded-full border border-rose-200">
              5 Issues
            </span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">Resolve scheduling conflicts and data integrity problems.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 shadow-sm">
            <Filter className="w-4 h-4" />
            <span>All Severities</span>
          </button>
          <div className="h-6 w-px bg-slate-200"></div>
          <button 
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-slate-800 rounded-md shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={selectedIssues.length === 0}
          >
            <CheckSquare className="w-4 h-4" />
            <span>Resolve Selected ({selectedIssues.length})</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-8 max-w-6xl mx-auto w-full">
        
        {/* Severity Summary */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-5 rounded-xl border border-rose-200 shadow-sm flex items-center gap-4 relative overflow-hidden">
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-semibold text-slate-800">3</div>
              <div className="text-sm text-slate-500 font-medium">Critical Errors</div>
            </div>
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-500"></div>
          </div>
          
          <div className="bg-white p-5 rounded-xl border border-amber-200 shadow-sm flex items-center gap-4 relative overflow-hidden">
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-semibold text-slate-800">1</div>
              <div className="text-sm text-slate-500 font-medium">Warnings</div>
            </div>
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500"></div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-blue-200 shadow-sm flex items-center gap-4 relative overflow-hidden">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
              <PlayCircle className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-semibold text-slate-800">1</div>
              <div className="text-sm text-slate-500 font-medium">Notices</div>
            </div>
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="flex items-center gap-4 p-4 border-b border-slate-100 bg-slate-50/50">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="Search issues..." className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-md bg-white w-full focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 placeholder:text-slate-400 text-slate-700 shadow-sm" />
            </div>
          </div>
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50/80 text-xs uppercase font-semibold text-slate-500 tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 w-12">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                    checked={selectedIssues.length === issues.length && issues.length > 0}
                    onChange={toggleAll}
                  />
                </th>
                <th className="px-6 py-3 w-24">Severity</th>
                <th className="px-6 py-3">Issue Type & Description</th>
                <th className="px-6 py-3 w-32">Team</th>
                <th className="px-6 py-3 w-24">Date</th>
                <th className="px-6 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {issues.map((issue) => (
                <tr key={issue.id} className={cn("hover:bg-slate-50/80 transition-colors", selectedIssues.includes(issue.id) && "bg-teal-50/30")}>
                  <td className="px-6 py-4">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                      checked={selectedIssues.includes(issue.id)}
                      onChange={() => toggleSelect(issue.id)}
                    />
                  </td>
                  <td className="px-6 py-4">
                    {issue.severity === "high" && <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-700 uppercase tracking-wider">High</span>}
                    {issue.severity === "medium" && <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-700 uppercase tracking-wider">Med</span>}
                    {issue.severity === "low" && <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-700 uppercase tracking-wider">Low</span>}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-800">{issue.type}</div>
                    <div className="text-slate-500 mt-0.5">{issue.description}</div>
                  </td>
                  <td className="px-6 py-4 text-slate-500">{issue.team}</td>
                  <td className="px-6 py-4 font-mono text-xs text-slate-600">{issue.date}</td>
                  <td className="px-6 py-4 text-right">
                    <button className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-600 hover:text-teal-700 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded transition-colors">
                      Fix <ArrowRight className="w-3 h-3" />
                    </button>
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
