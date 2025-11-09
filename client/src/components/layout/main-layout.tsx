import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useUser } from "@/hooks/use-user";
import {
  LayoutDashboard,
  CheckSquare,
  Mail,
  FileText,
  Users,
  Plug,
  Zap,
  BarChart3,
  LogOut,
  Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";

interface MainLayoutProps {
  children: ReactNode;
}

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/email", label: "Email Center", icon: Mail, role: "virtual_pa" },
  { href: "/notes", label: "Notes", icon: FileText },
  { href: "/team-lounge", label: "Team Lounge", icon: Users },
  { href: "/integrations", label: "Integrations", icon: Plug },
  { href: "/automation", label: "Automation", icon: Zap },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
];

export default function MainLayout({ children }: MainLayoutProps) {
  const [location] = useLocation();
  const { user, logout } = useUser();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const filteredNavItems = navItems.filter(
    (item) => !item.role || item.role === user?.role
  );

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="h-screen flex bg-background">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } border-r bg-card transition-all duration-300 flex flex-col`}
      >
        {/* Header */}
        <div className="p-4 flex items-center justify-between">
          {sidebarOpen && (
            <h1 className="text-xl font-bold text-primary">TradeFlow</h1>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        <Separator />

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;

            return (
              <Link key={item.href} href={item.href}>
                <a
                  className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-accent"
                  } ${!sidebarOpen ? "justify-center" : ""}`}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {sidebarOpen && <span>{item.label}</span>}
                </a>
              </Link>
            );
          })}
        </nav>

        <Separator />

        {/* User Profile */}
        <div className="p-4">
          <div
            className={`flex items-center gap-3 ${
              !sidebarOpen ? "justify-center" : ""
            }`}
          >
            <Avatar>
              <AvatarFallback>{user ? getInitials(user.name) : "U"}</AvatarFallback>
            </Avatar>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{user?.name}</p>
                <p className="text-sm text-muted-foreground capitalize">
                  {user?.role?.replace("_", " ")}
                </p>
              </div>
            )}
          </div>
          {sidebarOpen && (
            <Button
              variant="ghost"
              className="w-full mt-2 justify-start"
              onClick={logout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto p-6">{children}</div>
      </main>
    </div>
  );
}
