import { Link, useLocation } from "wouter";
import {
  Home,
  Users,
  Building2,
  TrendingUp,
  Trello,
  CheckSquare,
  Cloud,
  FileText,
  Mail,
  Calendar,
  MessageSquare,
  Bot,
  Workflow,
  Zap,
  Settings,
  BarChart3,
  FolderOpen,
  StickyNote,
  Link2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { ScrollArea } from "../ui/scroll-area";
import { Badge } from "../ui/badge";

interface SidebarProps {
  user: any;
  isOpen: boolean;
  onToggle: () => void;
}

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  subItems?: NavItem[];
}

export default function Sidebar({ user, isOpen, onToggle }: SidebarProps) {
  const [location] = useLocation();

  const navigation: NavItem[] = [
    {
      title: "Dashboard",
      href: "/",
      icon: Home,
    },
    {
      title: "CRM",
      href: "/crm/contacts",
      icon: Users,
      subItems: [
        { title: "Contacts", href: "/crm/contacts", icon: Users },
        { title: "Companies", href: "/crm/companies", icon: Building2 },
        { title: "Deals", href: "/crm/deals", icon: TrendingUp },
        { title: "Pipeline", href: "/crm/pipeline", icon: BarChart3 },
      ],
    },
    {
      title: "Projects",
      href: "/projects/boards",
      icon: Trello,
      subItems: [
        { title: "Boards", href: "/projects/boards", icon: Trello },
        { title: "Tasks", href: "/projects/tasks", icon: CheckSquare },
      ],
    },
    {
      title: "Microsoft 365",
      href: "/microsoft/onedrive",
      icon: Cloud,
      badge: "NEW",
      subItems: [
        { title: "OneDrive", href: "/microsoft/onedrive", icon: FolderOpen },
        { title: "OneNote", href: "/microsoft/onenote", icon: StickyNote },
        { title: "Outlook", href: "/microsoft/outlook", icon: Mail },
        { title: "Calendar", href: "/microsoft/outlook/calendar", icon: Calendar },
        { title: "Teams", href: "/microsoft/teams", icon: MessageSquare },
      ],
    },
    {
      title: "Email",
      href: "/email/inbox",
      icon: Mail,
      subItems: [
        { title: "Inbox", href: "/email/inbox", icon: Mail },
        { title: "Compose", href: "/email/compose", icon: FileText },
        { title: "Templates", href: "/email/templates", icon: FileText },
      ],
    },
    {
      title: "AI Assistant",
      href: "/ai/assistant",
      icon: Bot,
      badge: "AI",
    },
    {
      title: "Team",
      href: "/team/lounge",
      icon: MessageSquare,
      subItems: [
        { title: "Team Lounge", href: "/team/lounge", icon: MessageSquare },
        { title: "Directory", href: "/team/directory", icon: Users },
      ],
    },
    {
      title: "Automation",
      href: "/automation/workflows",
      icon: Workflow,
      subItems: [
        { title: "Workflows", href: "/automation/workflows", icon: Workflow },
        { title: "Rules", href: "/automation/rules", icon: Zap },
      ],
    },
    {
      title: "Integrations",
      href: "/integrations",
      icon: Link2,
    },
    {
      title: "Documents",
      href: "/documents",
      icon: FolderOpen,
    },
    {
      title: "Notes",
      href: "/notes",
      icon: StickyNote,
    },
    {
      title: "Analytics",
      href: "/analytics",
      icon: BarChart3,
    },
  ];

  const isActive = (href: string) => {
    if (href === "/") return location === "/";
    return location.startsWith(href);
  };

  return (
    <div
      className={cn(
        "fixed left-0 top-0 h-screen bg-card border-r border-border transition-all duration-300 z-40",
        isOpen ? "w-64" : "w-16"
      )}
    >
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-border">
          {isOpen ? (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">TF</span>
              </div>
              <span className="font-bold text-lg">TradeFlow</span>
            </div>
          ) : (
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mx-auto">
              <span className="text-primary-foreground font-bold text-sm">TF</span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 px-2 py-4">
          <nav className="space-y-1">
            {navigation.map((item) => (
              <div key={item.href}>
                <Link href={item.href}>
                  <a
                    className={cn(
                      "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      isActive(item.href)
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                      !isOpen && "justify-center"
                    )}
                  >
                    <item.icon className={cn("h-5 w-5", !isOpen && "h-6 w-6")} />
                    {isOpen && (
                      <>
                        <span className="flex-1">{item.title}</span>
                        {item.badge && (
                          <Badge variant="secondary" className="text-xs">
                            {item.badge}
                          </Badge>
                        )}
                      </>
                    )}
                  </a>
                </Link>

                {/* Sub-items */}
                {isOpen && item.subItems && isActive(item.href) && (
                  <div className="ml-8 mt-1 space-y-1">
                    {item.subItems.map((subItem) => (
                      <Link key={subItem.href} href={subItem.href}>
                        <a
                          className={cn(
                            "flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm transition-colors",
                            location === subItem.href
                              ? "text-primary font-medium"
                              : "text-muted-foreground hover:text-foreground"
                          )}
                        >
                          <subItem.icon className="h-4 w-4" />
                          <span>{subItem.title}</span>
                        </a>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </ScrollArea>

        {/* Settings */}
        <div className="p-2 border-t border-border">
          <Link href="/settings">
            <a
              className={cn(
                "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                location === "/settings"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                !isOpen && "justify-center"
              )}
            >
              <Settings className={cn("h-5 w-5", !isOpen && "h-6 w-6")} />
              {isOpen && <span>Settings</span>}
            </a>
          </Link>
        </div>

        {/* Toggle Button */}
        <div className="p-2 border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="w-full"
          >
            {isOpen ? (
              <ChevronLeft className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
