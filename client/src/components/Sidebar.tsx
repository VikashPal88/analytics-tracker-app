import { NavLink } from "react-router-dom";
import { Activity, LayoutDashboard, Map, MonitorPlay } from "lucide-react";

const demoUrl = "http://localhost:5000/demo/index.html";

const navItems = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { to: "/sessions", label: "Sessions", icon: Activity },
  { to: "/heatmap", label: "Heatmap", icon: Map },
];

export default function Sidebar() {
  return (
    <>
      <aside className="hidden h-screen w-64 shrink-0 flex-col border-r border-white/10 bg-[#0D0D0D] md:flex">
        <div className="p-6 border-b border-white/10">
          <h1 className="text-xl font-semibold tracking-tight flex items-center space-x-2 text-white">
            <div className="w-8 h-8 bg-emerald-500 rounded flex items-center justify-center text-black font-bold">
              C
            </div>
            <span>CausalFunnel</span>
          </h1>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center space-x-3 rounded-md px-3 py-2 transition-colors ${
                  isActive
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "text-slate-400 hover:bg-white/5 hover:text-emerald-400"
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <a
            href={demoUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center space-x-3 px-3 py-2 bg-white/5 text-slate-300 hover:bg-white/10 rounded-md transition-colors border border-white/10"
          >
            <MonitorPlay className="w-5 h-5" />
            <span className="font-medium text-sm">View Demo Page</span>
          </a>
        </div>
      </aside>

      <nav className="fixed inset-x-0 bottom-0 z-50 flex border-t border-white/10 bg-[#0D0D0D]/95 backdrop-blur md:hidden">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center justify-center gap-1 px-3 py-3 text-xs font-medium ${
                isActive ? "text-emerald-400" : "text-slate-400"
              }`
            }
          >
            <Icon className="h-5 w-5" />
            <span>{label}</span>
          </NavLink>
        ))}
        <a
          href={demoUrl}
          target="_blank"
          rel="noreferrer"
          className="flex flex-1 flex-col items-center justify-center gap-1 px-3 py-3 text-xs font-medium text-slate-400"
        >
          <MonitorPlay className="h-5 w-5" />
          <span>Demo</span>
        </a>
      </nav>
    </>
  );
}
