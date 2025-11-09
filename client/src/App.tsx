import { Route, Router, Switch } from "wouter";
import { useUser } from "@/hooks/use-user";
import { Loader2 } from "lucide-react";

// Pages
import LoginPage from "@/pages/login";
import DashboardPage from "@/pages/dashboard";
import TasksPage from "@/pages/tasks";
import EmailPage from "@/pages/email";
import NotesPage from "@/pages/notes";
import TeamLoungePage from "@/pages/team-lounge";
import IntegrationsPage from "@/pages/integrations";
import AutomationPage from "@/pages/automation";
import AnalyticsPage from "@/pages/analytics";

// Layout
import MainLayout from "@/components/layout/main-layout";

function App() {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user && window.location.pathname !== "/login") {
    window.location.href = "/login";
    return null;
  }

  return (
    <Router>
      <Switch>
        <Route path="/login" component={LoginPage} />

        <Route path="/">
          <MainLayout>
            <Switch>
              <Route path="/" component={DashboardPage} />
              <Route path="/tasks" component={TasksPage} />
              <Route path="/email" component={EmailPage} />
              <Route path="/notes" component={NotesPage} />
              <Route path="/team-lounge" component={TeamLoungePage} />
              <Route path="/integrations" component={IntegrationsPage} />
              <Route path="/automation" component={AutomationPage} />
              <Route path="/analytics" component={AnalyticsPage} />
            </Switch>
          </MainLayout>
        </Route>
      </Switch>
    </Router>
  );
}

export default App;
