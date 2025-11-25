import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Building2,
  TrendingUp,
  BarChart3,
  Trello,
  Cloud,
  Calendar,
  MessageSquare,
  Bot,
  Settings,
} from "lucide-react";
import GlobalSearch from "../GlobalSearch";
import { useAuth } from "@/contexts/auth-context";

interface AppLayoutProps {
  children: ReactNode;
}

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  {
    name: "CRM",
    icon: Users,
    children: [
      { name: "Contacts", href: "/crm/contacts", icon: Users },
      { name: "Companies", href: "/crm/companies", icon: Building2 },
      { name: "Deals", href: "/crm/deals", icon: TrendingUp },
    ],
  },
  { name: "Projects", href: "/projects", icon: Trello },
  {
    name: "Microsoft 365",
    icon: Cloud,
    children: [
      { name: "OneDrive", href: "/onedrive", icon: Cloud },
      { name: "Calendar", href: "/calendar", icon: Calendar },
      { name: "Teams", href: "/teams", icon: MessageSquare },
    ],
  },
  { name: "AI Assistant", href: "/ai", icon: Bot },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function AppLayout({ children }: AppLayoutProps) {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">TradeFlow</h1>
          <p className="text-sm text-gray-500">Enterprise Platform</p>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-1">
            {navigation.map((item) => (
              <li key={item.name}>
                {item.children ? (
                  <div>
                    <div className="flex items-center px-3 py-2 text-sm font-medium text-gray-700">
                      <item.icon className="w-5 h-5 mr-3" />
                      {item.name}
                    </div>
                    <ul className="ml-8 space-y-1 mt-1">
                      {item.children.map((child) => (
                        <li key={child.href}>
                          <Link href={child.href}>
                            <a
                              className={cn(
                                "flex items-center px-3 py-2 text-sm rounded-lg transition-colors",
                                location === child.href
                                  ? "bg-blue-50 text-blue-700 font-medium"
                                  : "text-gray-600 hover:bg-gray-50"
                              )}
                            >
                              <child.icon className="w-4 h-4 mr-3" />
                              {child.name}
                            </a>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <Link href={item.href!}>
                    <a
                      className={cn(
                        "flex items-center px-3 py-2 text-sm rounded-lg transition-colors",
                        location === item.href
                          ? "bg-blue-50 text-blue-700 font-medium"
                          : "text-gray-600 hover:bg-gray-50"
                      )}
                    >
                      <item.icon className="w-5 h-5 mr-3" />
                      {item.name}
                    </a>
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-blue-700">
                  {user?.name?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase() || "U"}
                </span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">{user?.name || user?.username}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role || "member"}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="text-xs font-medium text-blue-600 hover:text-blue-500"
            >
              Sign out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Top bar with search */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 max-w-xl">
              <GlobalSearch />
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">Welcome back!</span>
            </div>
          </div>
        </div>
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
