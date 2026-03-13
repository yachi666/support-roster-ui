import { ArrowRight, AlertTriangle, FileSpreadsheet, CheckCircle2, MoreHorizontal, Clock } from "lucide-react";
import { Link } from "react-router";

export function OverviewDashboard() {
  return (
    <div className="p-8 max-w-[1200px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800 tracking-tight">Overview Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Operational view for October 2023 roster status.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-md hover:bg-slate-50 transition-colors shadow-sm">
            Generate Report
          </button>
          <Link to="/import-export" className="px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-md hover:bg-teal-700 transition-colors shadow-sm">
            Import Data
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6">
        {[
          { label: "Completion Progress", value: "84%", trend: "+2% from last month", status: "good" },
          { label: "Unresolved Issues", value: "12", trend: "-5 since yesterday", status: "warning" },
          { label: "Missing Primary Coverage", value: "4", trend: "Needs attention", status: "error" },
          { label: "Draft Shifts", value: "28", trend: "Pending review", status: "neutral" },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col gap-3 relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">{stat.label}</span>
              {stat.status === "good" && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
              {stat.status === "warning" && <AlertTriangle className="w-4 h-4 text-amber-500" />}
              {stat.status === "error" && <AlertTriangle className="w-4 h-4 text-rose-500" />}
              {stat.status === "neutral" && <Clock className="w-4 h-4 text-blue-500" />}
            </div>
            <div className="text-3xl font-semibold text-slate-800">{stat.value}</div>
            <div className="text-xs text-slate-400">{stat.trend}</div>
            <div className="absolute bottom-0 left-0 h-1 bg-slate-100 w-full">
              {stat.status === "good" && <div className="h-full bg-emerald-400 w-[84%]"></div>}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm flex flex-col h-full">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50">
              <h2 className="text-sm font-semibold text-slate-800">Recent Roster Activity</h2>
              <button className="text-xs text-teal-600 hover:text-teal-700 font-medium">View All</button>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                {[
                  { user: "Sarah Admin", action: "imported L1 shift schedule", time: "10 mins ago", type: "import" },
                  { user: "Alex Chen", action: "resolved 3 missing primary coverage errors", time: "2 hrs ago", type: "resolve" },
                  { user: "System", action: "flagged 4 overlapping shifts in EMEA L2", time: "4 hrs ago", type: "alert" },
                  { user: "Maria Lopez", action: "updated shift definitions for 'HoL'", time: "Yesterday", type: "update" },
                ].map((act, i) => (
                  <div key={i} className="flex gap-4 items-start">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5 border border-slate-200 text-xs font-semibold text-slate-600">
                      {act.user[0]}
                    </div>
                    <div>
                      <p className="text-sm text-slate-700 font-medium">{act.user} <span className="font-normal text-slate-500">{act.action}</span></p>
                      <p className="text-xs text-slate-400 mt-1">{act.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-1 space-y-6">
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50">
              <h2 className="text-sm font-semibold text-slate-800">Quick Actions</h2>
              <MoreHorizontal className="w-4 h-4 text-slate-400" />
            </div>
            <div className="p-4 space-y-2">
              <button className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all text-left group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-teal-50 text-teal-600 flex items-center justify-center group-hover:bg-teal-100 transition-colors">
                    <FileSpreadsheet className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-700">Export Final Roster</div>
                    <div className="text-xs text-slate-500 mt-0.5">Download validated schedule</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-teal-500 transition-colors" />
              </button>

              <button className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all text-left group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-rose-50 text-rose-600 flex items-center justify-center group-hover:bg-rose-100 transition-colors">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-700">Review Open Issues</div>
                    <div className="text-xs text-slate-500 mt-0.5">12 items need attention</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-rose-500 transition-colors" />
              </button>
              
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
