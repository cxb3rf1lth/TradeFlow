import { useLocation } from "wouter";
import {
  LayoutDashboard,
  CheckSquare,
  BarChart3,
  MessageSquare,
  FileText,
  Zap,
  Settings,
  Users,
  Building2,
  Mail,
  Notebook,
  Coffee,
} from "lucide-react";
import { SiTrello, SiJira } from "react-icons/si";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const executiveItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "My Tasks", url: "/tasks", icon: CheckSquare },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
  { title: "Communications", url: "/communications", icon: MessageSquare },
  { title: "Notes", url: "/notes", icon: Notebook },
  { title: "Team Lounge", url: "/team-lounge", icon: Coffee },
  { title: "Documents", url: "/documents", icon: FileText },
];

const paItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Task Management", url: "/tasks", icon: CheckSquare },
  { title: "Email Center", url: "/email", icon: Mail },
  { title: "Notes", url: "/notes", icon: Notebook },
  { title: "Team Lounge", url: "/team-lounge", icon: Coffee },
  { title: "Team Overview", url: "/team", icon: Users },
  { title: "Automation", url: "/automation", icon: Zap },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
];

const integrationItems = [
  { title: "Trello", icon: SiTrello, status: "connected", count: 12, url: "/integrations/trello" },
  { title: "HubSpot", icon: Building2, status: "connected", count: 8, url: "/integrations/hubspot" },
  { title: "Jira", icon: SiJira, status: "connected", count: 15, url: "/integrations/jira" },
  { title: "NetSuite", icon: Building2, status: "connected", count: 0, url: "/netsuite" },
  { title: "OneDrive", icon: FileText, status: "connected", count: 0, url: "/integrations/onedrive" },
];

interface AppSidebarProps {
  userRole?: "executive" | "pa";
  userName?: string;
  userAvatar?: string;
}

export function AppSidebar({ 
  userRole = "executive",
  userName = "John Doe",
  userAvatar
}: AppSidebarProps) {
  const items = userRole === "pa" ? paItems : executiveItems;
  const [location] = useLocation();

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-semibold text-sm">EH</span>
          </div>
          <div>
            <h2 className="font-semibold text-base">Executive Hub</h2>
            <p className="text-xs text-muted-foreground">Team Platform</p>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location === item.url}
                    data-testid={`link-sidebar-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <a href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Integrations</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {integrationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild data-testid={`link-integration-${item.title.toLowerCase()}`}>
                    <a href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                      {item.count > 0 && (
                        <Badge variant="secondary" className="ml-auto text-xs">
                          {item.count}
                        </Badge>
                      )}
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  asChild 
                  isActive={location === "/settings"}
                  data-testid="link-sidebar-settings"
                >
                  <a href="/settings">
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={userAvatar} />
            <AvatarFallback>{userName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{userName}</p>
            <p className="text-xs text-muted-foreground capitalize">{userRole}</p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
