import { Outlet, NavLink } from "react-router";
import { 
  CalendarDays, 
  Users, 
  Clock, 
  Network, 
  UploadCloud, 
  AlertTriangle, 
  LayoutDashboard,
  Bell,
  Search,
  Settings,
  HelpCircle
} from "lucide-react";
import { cn } from "../../lib/utils";

const navigation = [
  { name: "Overview", href: "/", icon: LayoutDashboard },
  { name: "Monthly Roster", href: "/roster", icon: CalendarDays },
  { name: "Staff Directory", href: "/staff", icon: Users },
  { name: "Shift Definitions", href: "/shifts", icon: Clock },
  { name: "Team Mapping", href: "/teams", icon: Network },
  { name: "Import / Export", href: "/import-export", icon: UploadCloud },
  { name: "Validation", href: "/validation", icon: AlertTriangle, count: 12 },
];

export function AppLayout() {
  return (
    <div className="flex h-screen w-full bg-[#f8f9fa] text-[#1e293b] font-sans overflow-hidden selection:bg-teal-100">
      {/* Sidebar */}
      <div className="w-64 flex-shrink-0 bg-white border-r border-slate-200 flex flex-col z-20 shadow-[1px_0_4px_rgba(0,0,0,0.02)]">
        <div className="h-16 flex items-center px-6 border-b border-slate-100">
          <div className="flex items-center gap-2 text-slate-800">
            <div className="w-7 h-7 bg-teal-600 rounded flex items-center justify-center text-white shadow-sm">
              <CalendarDays className="w-4 h-4" />
            </div>
            <span className="font-semibold text-sm tracking-tight">Roster Workspace</span>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
          <div className="px-3 pb-2 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">Menu</div>
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 group",
                  isActive
                    ? "bg-teal-50 text-teal-700 shadow-sm shadow-teal-100/50"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    className={cn(
                      "w-4 h-4 flex-shrink-0 transition-colors",
                      isActive ? "text-teal-600" : "text-slate-400 group-hover:text-slate-600"
                    )}
                  />
                  <span className="flex-1">{item.name}</span>
                  {item.count ? (
                    <span
                      className={cn(
                        "inline-flex items-center justify-center px-2 py-0.5 text-xs font-semibold rounded-full",
                        isActive
                          ? "bg-teal-100 text-teal-700"
                          : "bg-rose-100 text-rose-600"
                      )}
                    >
                      {item.count}
                    </span>
                  ) : null}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 px-2 py-2 cursor-pointer hover:bg-slate-50 rounded-md transition-colors">
            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-semibold text-xs border border-slate-300">
              SA
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-slate-700">Sarah Admin</span>
              <span className="text-[11px] text-slate-500">Super Admin</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <header className="h-16 flex-shrink-0 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-10 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search staff, shifts, or codes (CMD+K)" 
                className="pl-9 pr-4 py-1.5 w-80 bg-slate-50 border border-slate-200 rounded-md text-sm outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all placeholder:text-slate-400 text-slate-700"
              />
            </div>
          </div>
          <div className="flex items-center gap-3 text-slate-500">
            <button className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-slate-100 transition-colors relative">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-rose-500 rounded-full"></span>
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-slate-100 transition-colors">
              <HelpCircle className="w-4 h-4" />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-slate-100 transition-colors">
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Content Wrapper */}
        <main className="flex-1 overflow-auto bg-[#fafafa]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
