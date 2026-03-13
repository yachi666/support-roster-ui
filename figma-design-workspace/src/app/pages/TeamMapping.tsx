import { Layers, HelpCircle, GripVertical, Settings2, Eye } from "lucide-react";
import { cn } from "../../lib/utils";

const teams = [
  { id: "T1", name: "L1", roleGroups: ["L1 Engineer", "L1 Lead"], color: "bg-sky-500", order: 1, visible: true },
  { id: "T2", name: "AP L2", roleGroups: ["L2 Engineer", "Subject Matter Expert"], color: "bg-emerald-500", order: 2, visible: true },
  { id: "T3", name: "EMEA L2", roleGroups: ["L2 Engineer", "Subject Matter Expert"], color: "bg-teal-500", order: 3, visible: true },
  { id: "T4", name: "Incident Manager", roleGroups: ["Global IM", "Regional IM"], color: "bg-amber-500", order: 4, visible: true },
  { id: "T5", name: "DevOps", roleGroups: ["Platform Engineer", "SRE"], color: "bg-indigo-500", order: 5, visible: false },
];

export function TeamMapping() {
  return (
    <div className="flex flex-col h-full bg-slate-50 relative animate-in fade-in duration-300">
      <div className="flex-shrink-0 border-b border-slate-200 px-8 py-6 bg-white flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800 tracking-tight">Team & Role Mapping</h1>
          <p className="text-sm text-slate-500 mt-1">Configure team groupings, display orders, and downstream dashboard visibility.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-slate-800 rounded-md shadow-sm transition-colors hover:bg-slate-700">
            Save Mapping Rules
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-8 max-w-6xl mx-auto w-full">
        
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-8 flex gap-4">
          <div className="mt-0.5 text-blue-600">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-blue-900">How mapping works</h3>
            <p className="text-sm text-blue-800/80 mt-1 leading-relaxed">
              These rules control how staff members are grouped on the public On-Call Dashboard. 
              The display order here dictates the vertical stacking of teams. Teams marked as hidden 
              will still be scheduled in this workspace but won't appear in read-only downstream views.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-8">
          <div className="col-span-2 space-y-4">
            <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide px-2">Active Teams</h2>
            
            <div className="space-y-3">
              {teams.map((team) => (
                <div key={team.id} className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 flex items-center gap-4 group hover:border-slate-300 transition-colors">
                  <div className="cursor-grab text-slate-300 hover:text-slate-500">
                    <GripVertical className="w-5 h-5" />
                  </div>
                  
                  <div className={cn("w-3 h-10 rounded-full", team.color)}></div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-base font-semibold text-slate-800">{team.name}</h3>
                      {!team.visible && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-500 uppercase tracking-wider">Hidden</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Layers className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-xs text-slate-500">Contains roles: {team.roleGroups.join(", ")}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                      <Settings2 className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <button className="w-full py-4 border-2 border-dashed border-slate-200 rounded-xl text-sm font-medium text-slate-500 hover:border-teal-400 hover:text-teal-600 hover:bg-teal-50/50 transition-colors">
              + Create New Team Group
            </button>
          </div>

          <div className="col-span-1">
            <div className="sticky top-8 space-y-4">
              <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide px-2">Dashboard Preview</h2>
              
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="bg-slate-800 px-4 py-3 flex items-center justify-between">
                  <span className="text-xs font-semibold text-white">Public On-Call Viewer</span>
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-slate-600"></div>
                    <div className="w-2 h-2 rounded-full bg-slate-600"></div>
                    <div className="w-2 h-2 rounded-full bg-slate-600"></div>
                  </div>
                </div>
                
                <div className="p-4 space-y-4 bg-slate-50">
                  {teams.filter(t => t.visible).map((team) => (
                    <div key={team.id} className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className={cn("w-2 h-2 rounded-full", team.color)}></div>
                        <span className="text-xs font-semibold text-slate-700 uppercase tracking-wide">{team.name}</span>
                      </div>
                      <div className="bg-white border border-slate-200 rounded p-2 text-[11px] text-slate-500 flex gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-100 flex-shrink-0"></div>
                        <div>
                          <div className="font-medium text-slate-700 w-16 h-2 bg-slate-200 rounded mb-1"></div>
                          <div className="w-12 h-1.5 bg-slate-100 rounded"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
