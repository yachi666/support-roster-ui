import { useState } from "react";
import { Search, Plus, MoreHorizontal, Filter, Mail, Globe, Clock, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "../../lib/utils";
import { motion, AnimatePresence } from "motion/react";

const staffList = [
  { id: "S-001", name: "Sarah Admin", email: "sarah@company.com", role: "Super Admin", team: "Global", timezone: "UTC", status: "Active" },
  { id: "S-002", name: "Alex Chen", email: "alex.c@company.com", role: "L2 Engineer", team: "AP L2", timezone: "Asia/Singapore", status: "Active" },
  { id: "S-003", name: "Maria Lopez", email: "maria.l@company.com", role: "Incident Manager", team: "Incident Manager", timezone: "Europe/Madrid", status: "Active" },
  { id: "S-004", name: "David Kim", email: "david.k@company.com", role: "L1 Engineer", team: "L1", timezone: "America/New_York", status: "Active" },
  { id: "S-005", name: "Emma Smith", email: "emma.s@company.com", role: "L3 Engineer", team: "AP L3", timezone: "Australia/Sydney", status: "Inactive" },
  { id: "S-006", name: "James Wilson", email: "james.w@company.com", role: "DevOps", team: "DevOps", timezone: "Europe/London", status: "Active" },
];

export function StaffDirectory() {
  const [selectedStaff, setSelectedStaff] = useState<typeof staffList[0] | null>(null);

  return (
    <div className="flex flex-col h-full bg-slate-50 relative animate-in fade-in duration-300">
      {/* Top Toolbar */}
      <div className="flex-shrink-0 border-b border-slate-200 px-8 py-6 bg-white flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800 tracking-tight">Staff Directory</h1>
          <p className="text-sm text-slate-500 mt-1">Manage personnel, roles, and regional assignments.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Search staff..." className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-md bg-slate-50 w-64 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 placeholder:text-slate-400 text-slate-700" />
          </div>
          <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 shadow-sm">
            <Filter className="w-4 h-4" />
            <span>Filter</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-md hover:bg-teal-700 shadow-sm transition-colors">
            <Plus className="w-4 h-4" />
            <span>Add Staff</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50/80 text-xs uppercase font-semibold text-slate-500 tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-6 py-3">Staff Name</th>
                <th className="px-6 py-3">Staff ID</th>
                <th className="px-6 py-3">Role Group</th>
                <th className="px-6 py-3">Team</th>
                <th className="px-6 py-3">Timezone</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {staffList.map((staff) => (
                <tr 
                  key={staff.id} 
                  className={cn(
                    "hover:bg-slate-50/80 transition-colors cursor-pointer",
                    selectedStaff?.id === staff.id && "bg-teal-50/30 hover:bg-teal-50/50"
                  )}
                  onClick={() => setSelectedStaff(staff)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-semibold text-slate-600 border border-slate-200 shadow-sm">
                        {staff.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-800">{staff.name}</span>
                        <span className="text-xs text-slate-400">{staff.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-slate-500">{staff.id}</td>
                  <td className="px-6 py-4">{staff.role}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                      {staff.team}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500">{staff.timezone}</td>
                  <td className="px-6 py-4">
                    {staff.status === "Active" ? (
                      <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                        <XCircle className="w-3.5 h-3.5" />
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-1.5 text-slate-400 hover:text-slate-600 rounded hover:bg-slate-100 transition-colors">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Side Profile Drawer */}
      <AnimatePresence>
        {selectedStaff && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-slate-900/10 backdrop-blur-[1px] z-40"
              onClick={() => setSelectedStaff(null)}
            />
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.3 }}
              className="absolute top-0 right-0 bottom-0 w-[420px] bg-white shadow-[-10px_0_40px_rgba(0,0,0,0.05)] border-l border-slate-200 z-50 flex flex-col"
            >
              <div className="px-6 py-8 border-b border-slate-100 bg-slate-50/50 flex flex-col items-center relative">
                <button onClick={() => setSelectedStaff(null)} className="absolute top-4 right-4 p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-600 rounded-md transition-colors">
                  <XCircle className="w-5 h-5" />
                </button>
                <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center text-xl font-semibold text-slate-600 border border-slate-200 shadow-sm mb-4">
                  {selectedStaff.name.split(' ').map(n => n[0]).join('')}
                </div>
                <h3 className="text-xl font-semibold text-slate-800">{selectedStaff.name}</h3>
                <p className="text-sm text-slate-500 mt-1">{selectedStaff.role}</p>
                <div className="flex gap-2 mt-4">
                  <button className="px-4 py-1.5 text-sm font-medium bg-white border border-slate-200 shadow-sm rounded-md hover:bg-slate-50 text-slate-700 transition-colors">Edit Profile</button>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Contact & Location</h4>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-sm">
                      <Mail className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-700">{selectedStaff.email}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Globe className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-700">Region: APAC</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-700">{selectedStaff.timezone}</span>
                    </div>
                  </div>
                </div>

                <div className="h-px w-full bg-slate-100"></div>

                <div>
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Roster Participation</h4>
                  <div className="bg-slate-50 border border-slate-100 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500">Primary Team</span>
                      <span className="font-medium text-slate-800">{selectedStaff.team}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500">Current Monthly Hours</span>
                      <span className="font-medium text-slate-800">144 hrs</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500">On-Call Eligible</span>
                      <span className="font-medium text-slate-800">Yes</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
