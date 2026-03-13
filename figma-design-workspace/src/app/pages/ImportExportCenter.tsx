import { useState } from "react";
import { UploadCloud, FileSpreadsheet, Download, CheckCircle2, AlertTriangle, ArrowRight, RefreshCw, ChevronRight } from "lucide-react";
import { cn } from "../../lib/utils";

export function ImportExportCenter() {
  const [dragActive, setDragActive] = useState(false);
  const [fileStatus, setFileStatus] = useState<"idle" | "uploading" | "mapping" | "success">("idle");

  const simulateUpload = () => {
    setFileStatus("uploading");
    setTimeout(() => setFileStatus("mapping"), 1500);
    setTimeout(() => setFileStatus("success"), 3000);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 relative animate-in fade-in duration-300">
      <div className="flex-shrink-0 border-b border-slate-200 px-8 py-6 bg-white flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800 tracking-tight">Import / Export Center</h1>
          <p className="text-sm text-slate-500 mt-1">Sync your master roster via Excel or download the latest schedule.</p>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-8 max-w-5xl mx-auto w-full space-y-8">
        
        {/* Export Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600">
              <Download className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-800">Export Current Roster</h2>
              <p className="text-sm text-slate-500 mt-0.5">Download the active schedule for October 2023</p>
            </div>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 font-medium text-sm rounded-md shadow-sm hover:bg-slate-50 transition-colors">
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            Export .xlsx
          </button>
        </div>

        {/* Import Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2 bg-slate-50/50">
            <UploadCloud className="w-5 h-5 text-slate-400" />
            <h2 className="text-base font-semibold text-slate-800">Import Master Excel</h2>
          </div>
          
          <div className="p-6 space-y-6">
            
            {/* Step Indicators */}
            <div className="flex items-center max-w-2xl mx-auto mb-8">
              <div className="flex flex-col items-center gap-2 flex-1">
                <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-colors", fileStatus !== "idle" ? "bg-teal-50 border-teal-500 text-teal-600" : "bg-white border-slate-300 text-slate-400")}>
                  1
                </div>
                <span className={cn("text-xs font-medium", fileStatus !== "idle" ? "text-teal-700" : "text-slate-500")}>Upload</span>
              </div>
              <div className="h-px bg-slate-200 w-16 -mt-6"></div>
              <div className="flex flex-col items-center gap-2 flex-1">
                <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-colors", fileStatus === "mapping" || fileStatus === "success" ? "bg-teal-50 border-teal-500 text-teal-600" : "bg-white border-slate-300 text-slate-400")}>
                  2
                </div>
                <span className={cn("text-xs font-medium", fileStatus === "mapping" || fileStatus === "success" ? "text-teal-700" : "text-slate-500")}>Map & Validate</span>
              </div>
              <div className="h-px bg-slate-200 w-16 -mt-6"></div>
              <div className="flex flex-col items-center gap-2 flex-1">
                <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-colors", fileStatus === "success" ? "bg-teal-50 border-teal-500 text-teal-600" : "bg-white border-slate-300 text-slate-400")}>
                  3
                </div>
                <span className={cn("text-xs font-medium", fileStatus === "success" ? "text-teal-700" : "text-slate-500")}>Apply</span>
              </div>
            </div>

            {fileStatus === "idle" && (
              <div 
                className={cn(
                  "border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center transition-colors text-center cursor-pointer",
                  dragActive ? "border-teal-400 bg-teal-50/50" : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                )}
                onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                onDragLeave={() => setDragActive(false)}
                onDrop={(e) => { e.preventDefault(); setDragActive(false); simulateUpload(); }}
                onClick={simulateUpload}
              >
                <div className="w-16 h-16 bg-white border border-slate-100 rounded-full flex items-center justify-center shadow-sm mb-4">
                  <FileSpreadsheet className="w-8 h-8 text-emerald-500" />
                </div>
                <h3 className="text-lg font-semibold text-slate-700 mb-1">Click to upload or drag & drop</h3>
                <p className="text-sm text-slate-500 mb-6 max-w-sm">Support for standard .xlsx schedule formats. Dates must be in YYYY-MM-DD format.</p>
                <button className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 font-medium text-sm rounded-md shadow-sm hover:bg-slate-50 transition-colors">
                  Browse Files
                </button>
              </div>
            )}

            {fileStatus === "uploading" && (
              <div className="border border-slate-200 rounded-xl p-12 flex flex-col items-center justify-center bg-slate-50">
                <RefreshCw className="w-8 h-8 text-teal-500 animate-spin mb-4" />
                <h3 className="text-base font-semibold text-slate-700">Uploading and Parsing...</h3>
                <div className="w-64 h-2 bg-slate-200 rounded-full mt-4 overflow-hidden">
                  <div className="h-full bg-teal-500 w-1/2 animate-pulse"></div>
                </div>
              </div>
            )}

            {fileStatus === "mapping" && (
              <div className="border border-slate-200 rounded-xl p-12 flex flex-col items-center justify-center bg-slate-50">
                <RefreshCw className="w-8 h-8 text-teal-500 animate-spin mb-4" />
                <h3 className="text-base font-semibold text-slate-700">Validating Shift Codes...</h3>
                <p className="text-sm text-slate-500 mt-2">Checking team rules and cross-day conflicts</p>
              </div>
            )}

            {fileStatus === "success" && (
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-emerald-50/30">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                    <div>
                      <h3 className="text-base font-semibold text-slate-800">Validation Complete</h3>
                      <p className="text-sm text-slate-500 mt-0.5">October_Roster_v2.xlsx • 142 records parsed</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-semibold text-emerald-600 block">98% Match Confidence</span>
                  </div>
                </div>
                
                <div className="p-6 bg-slate-50 flex items-start gap-6 border-b border-slate-100">
                  <div className="flex-1 bg-white border border-slate-200 rounded-lg p-4">
                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      Issues Found
                    </h4>
                    <ul className="space-y-2 text-sm text-slate-700">
                      <li className="flex items-center justify-between">
                        <span>Missing shift code mapping for 'X'</span>
                        <span className="text-xs text-slate-400">2 occurrences</span>
                      </li>
                      <li className="flex items-center justify-between">
                        <span>Unrecognized staff ID 'S-099'</span>
                        <span className="text-xs text-slate-400">1 row ignored</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="flex-1 bg-white border border-slate-200 rounded-lg p-4">
                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      Changes Summary
                    </h4>
                    <ul className="space-y-2 text-sm text-slate-700">
                      <li className="flex items-center justify-between">
                        <span>New shift assignments</span>
                        <span className="text-xs font-medium text-emerald-600">+1,204</span>
                      </li>
                      <li className="flex items-center justify-between">
                        <span>Updates to existing</span>
                        <span className="text-xs font-medium text-blue-600">~34</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="p-6 flex items-center justify-end gap-3">
                  <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-medium text-sm rounded-md hover:bg-slate-50 transition-colors" onClick={() => setFileStatus("idle")}>
                    Cancel Import
                  </button>
                  <button className="px-4 py-2 bg-teal-600 text-white font-medium text-sm rounded-md shadow-sm hover:bg-teal-700 transition-colors flex items-center gap-2">
                    Apply Changes <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
