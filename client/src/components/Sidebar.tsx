import { Link, useLocation } from "wouter";
import { LayoutDashboard, Users, ChevronLeft, ChevronRight } from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const menuItems = [
  { path: "/", icon: LayoutDashboard, label: "Dashboard" },
  { path: "/crm", icon: Users, label: "CRM" },
];

export default function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const [location] = useLocation();

  return (
    <aside
      className={`fixed left-0 top-0 h-full bg-slate-900/80 backdrop-blur-lg border-r border-slate-800 transition-all duration-300 z-50 ${
        isOpen ? "w-64" : "w-16"
      }`}
    >
      <div className="flex items-center justify-between p-4 border-b border-slate-800">
        {isOpen && (
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            TradeFlow
          </h1>
        )}
        <button
          onClick={onToggle}
          className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
        >
          {isOpen ? (
            <ChevronLeft className="w-5 h-5 text-slate-400" />
          ) : (
            <ChevronRight className="w-5 h-5 text-slate-400" />
          )}
        </button>
      </div>

      <nav className="p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.path;

          return (
            <Link key={item.path} href={item.path}>
              <a
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                  isActive
                    ? "bg-blue-500/20 text-blue-400"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {isOpen && <span className="text-sm font-medium">{item.label}</span>}
              </a>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
