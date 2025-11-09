import { useState } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { SearchBar } from "@/components/search-bar";
import { QuickActions } from "@/components/quick-actions";
import { RoleSwitcher, type UserRole } from "@/components/role-switcher";
import { Bell, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Dashboard from "@/pages/dashboard";
import EmailCenter from "@/pages/email-center";
import Notes from "@/pages/notes";
import TeamLounge from "@/pages/team-lounge";
import NetSuite from "@/pages/netsuite";
import NotFound from "@/pages/not-found";

const pageNames: Record<string, string> = {
  "/": "Dashboard",
  "/tasks": "Tasks",
  "/analytics": "Analytics",
  "/communications": "Communications",
  "/documents": "Documents",
  "/notes": "Notes",
  "/team-lounge": "Team Lounge",
  "/team": "Team Overview",
  "/automation": "Automation",
  "/email": "Email Center",
  "/netsuite": "NetSuite",
  "/settings": "Settings",
};

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/tasks" component={() => <div className="p-6"><h1 className="text-2xl font-semibold">Tasks</h1><p className="text-muted-foreground mt-2">Task management page coming soon...</p></div>} />
      <Route path="/analytics" component={() => <div className="p-6"><h1 className="text-2xl font-semibold">Analytics</h1><p className="text-muted-foreground mt-2">Analytics dashboard coming soon...</p></div>} />
      <Route path="/communications" component={() => <div className="p-6"><h1 className="text-2xl font-semibold">Communications</h1><p className="text-muted-foreground mt-2">Team communications coming soon...</p></div>} />
      <Route path="/documents" component={() => <div className="p-6"><h1 className="text-2xl font-semibold">Documents</h1><p className="text-muted-foreground mt-2">Document management coming soon...</p></div>} />
      <Route path="/notes" component={Notes} />
      <Route path="/team-lounge" component={TeamLounge} />
      <Route path="/team" component={() => <div className="p-6"><h1 className="text-2xl font-semibold">Team Overview</h1><p className="text-muted-foreground mt-2">Team overview coming soon...</p></div>} />
      <Route path="/automation" component={() => <div className="p-6"><h1 className="text-2xl font-semibold">Automation</h1><p className="text-muted-foreground mt-2">Automation rules coming soon...</p></div>} />
      <Route path="/email" component={EmailCenter} />
      <Route path="/netsuite" component={NetSuite} />
      <Route path="/settings" component={() => <div className="p-6"><h1 className="text-2xl font-semibold">Settings</h1><p className="text-muted-foreground mt-2">Settings page coming soon...</p></div>} />
      <Route component={NotFound} />
    </Switch>
  );
}

function NavigationBreadcrumb() {
  const [location] = useLocation();
  const currentPage = pageNames[location] || "Page";

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/" className="flex items-center gap-1" data-testid="link-breadcrumb-home">
            <Home className="h-3.5 w-3.5" />
            <span className="sr-only">Home</span>
          </BreadcrumbLink>
        </BreadcrumbItem>
        {location !== "/" && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{currentPage}</BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

export default function App() {
  const [userRole, setUserRole] = useState<UserRole>("executive");
  
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <SidebarProvider style={style as React.CSSProperties}>
            <div className="flex h-screen w-full">
              <AppSidebar 
                userRole={userRole} 
                userName={userRole === "pa" ? "Virtual PA" : "Sarah Johnson"} 
              />
              <div className="flex flex-col flex-1 overflow-hidden">
                <header className="flex items-center justify-between gap-4 px-6 py-3 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <SidebarTrigger data-testid="button-sidebar-toggle" />
                    <NavigationBreadcrumb />
                    <div className="hidden md:block flex-1 max-w-md">
                      <SearchBar />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <RoleSwitcher currentRole={userRole} onRoleChange={setUserRole} />
                    <QuickActions />
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="relative" 
                      data-testid="button-notifications"
                      aria-label="Notifications"
                    >
                      <Bell className="h-5 w-5" />
                      <Badge 
                        variant="destructive" 
                        className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                        aria-label="3 unread notifications"
                      >
                        3
                      </Badge>
                    </Button>
                    <ThemeToggle />
                  </div>
                </header>
                <div className="md:hidden px-6 py-3 border-b">
                  <SearchBar />
                </div>
                <main className="flex-1 overflow-auto p-6" role="main" aria-label="Main content">
                  <Router />
                </main>
              </div>
            </div>
          </SidebarProvider>
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
