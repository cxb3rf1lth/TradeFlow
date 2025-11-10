import { Router, Route, Switch, Redirect } from "wouter";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

// Layout Components
import MainLayout from "./components/layout/MainLayout";
import AuthLayout from "./components/layout/AuthLayout";

// Auth Pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

// Dashboard
import Dashboard from "./pages/Dashboard";

// CRM Pages (HubSpot-like + Bigin)
import Contacts from "./pages/crm/Contacts";
import ContactDetail from "./pages/crm/ContactDetail";
import Companies from "./pages/crm/Companies";
import CompanyDetail from "./pages/crm/CompanyDetail";
import Deals from "./pages/crm/Deals";
import DealDetail from "./pages/crm/DealDetail";
import Pipeline from "./pages/crm/Pipeline";

// Project Management Pages (Trello-like)
import Boards from "./pages/projects/Boards";
import BoardDetail from "./pages/projects/BoardDetail";
import TaskList from "./pages/projects/TaskList";
import TaskDetail from "./pages/projects/TaskDetail";

// Microsoft 365 Integration Pages
import OneDrive from "./pages/microsoft/OneDrive";
import OneNote from "./pages/microsoft/OneNote";
import Outlook from "./pages/microsoft/Outlook";
import OutlookCalendar from "./pages/microsoft/OutlookCalendar";
import Teams from "./pages/microsoft/Teams";
import TeamsChat from "./pages/microsoft/TeamsChat";

// Claude AI Integration
import ClaudeAssistant from "./pages/ai/ClaudeAssistant";

// Email & Communication
import EmailInbox from "./pages/email/EmailInbox";
import EmailCompose from "./pages/email/EmailCompose";
import EmailTemplates from "./pages/email/EmailTemplates";

// Team & Collaboration
import TeamLounge from "./pages/team/TeamLounge";
import TeamDirectory from "./pages/team/TeamDirectory";

// Automation & Workflows
import Workflows from "./pages/automation/Workflows";
import WorkflowBuilder from "./pages/automation/WorkflowBuilder";
import Automations from "./pages/automation/Automations";

// Integrations
import Integrations from "./pages/integrations/Integrations";
import IntegrationSetup from "./pages/integrations/IntegrationSetup";

// Settings
import Settings from "./pages/settings/Settings";
import Profile from "./pages/settings/Profile";

// Documents
import Documents from "./pages/documents/Documents";

// Analytics
import Analytics from "./pages/analytics/Analytics";

// Notes
import Notes from "./pages/notes/Notes";

function App() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication status
  const { data: authData } = useQuery({
    queryKey: ["/api/user"],
    retry: false,
  });

  useEffect(() => {
    if (authData) {
      setUser(authData);
    }
    setIsLoading(false);
  }, [authData]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading TradeFlow...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Switch>
        {/* Auth Routes */}
        <Route path="/login">
          {user ? <Redirect to="/" /> : <AuthLayout><Login /></AuthLayout>}
        </Route>
        <Route path="/register">
          {user ? <Redirect to="/" /> : <AuthLayout><Register /></AuthLayout>}
        </Route>

        {/* Protected Routes */}
        <Route path="/">
          {!user ? <Redirect to="/login" /> : (
            <MainLayout user={user}>
              <Dashboard />
            </MainLayout>
          )}
        </Route>

        {/* CRM Routes */}
        <Route path="/crm/contacts">
          {!user ? <Redirect to="/login" /> : (
            <MainLayout user={user}>
              <Contacts />
            </MainLayout>
          )}
        </Route>
        <Route path="/crm/contacts/:id">
          {!user ? <Redirect to="/login" /> : (
            <MainLayout user={user}>
              <ContactDetail />
            </MainLayout>
          )}
        </Route>
        <Route path="/crm/companies">
          {!user ? <Redirect to="/login" /> : (
            <MainLayout user={user}>
              <Companies />
            </MainLayout>
          )}
        </Route>
        <Route path="/crm/companies/:id">
          {!user ? <Redirect to="/login" /> : (
            <MainLayout user={user}>
              <CompanyDetail />
            </MainLayout>
          )}
        </Route>
        <Route path="/crm/deals">
          {!user ? <Redirect to="/login" /> : (
            <MainLayout user={user}>
              <Deals />
            </MainLayout>
          )}
        </Route>
        <Route path="/crm/deals/:id">
          {!user ? <Redirect to="/login" /> : (
            <MainLayout user={user}>
              <DealDetail />
            </MainLayout>
          )}
        </Route>
        <Route path="/crm/pipeline">
          {!user ? <Redirect to="/login" /> : (
            <MainLayout user={user}>
              <Pipeline />
            </MainLayout>
          )}
        </Route>

        {/* Project Management Routes */}
        <Route path="/projects/boards">
          {!user ? <Redirect to="/login" /> : (
            <MainLayout user={user}>
              <Boards />
            </MainLayout>
          )}
        </Route>
        <Route path="/projects/boards/:id">
          {!user ? <Redirect to="/login" /> : (
            <MainLayout user={user}>
              <BoardDetail />
            </MainLayout>
          )}
        </Route>
        <Route path="/projects/tasks">
          {!user ? <Redirect to="/login" /> : (
            <MainLayout user={user}>
              <TaskList />
            </MainLayout>
          )}
        </Route>
        <Route path="/projects/tasks/:id">
          {!user ? <Redirect to="/login" /> : (
            <MainLayout user={user}>
              <TaskDetail />
            </MainLayout>
          )}
        </Route>

        {/* Microsoft 365 Routes */}
        <Route path="/microsoft/onedrive">
          {!user ? <Redirect to="/login" /> : (
            <MainLayout user={user}>
              <OneDrive />
            </MainLayout>
          )}
        </Route>
        <Route path="/microsoft/onenote">
          {!user ? <Redirect to="/login" /> : (
            <MainLayout user={user}>
              <OneNote />
            </MainLayout>
          )}
        </Route>
        <Route path="/microsoft/outlook">
          {!user ? <Redirect to="/login" /> : (
            <MainLayout user={user}>
              <Outlook />
            </MainLayout>
          )}
        </Route>
        <Route path="/microsoft/outlook/calendar">
          {!user ? <Redirect to="/login" /> : (
            <MainLayout user={user}>
              <OutlookCalendar />
            </MainLayout>
          )}
        </Route>
        <Route path="/microsoft/teams">
          {!user ? <Redirect to="/login" /> : (
            <MainLayout user={user}>
              <Teams />
            </MainLayout>
          )}
        </Route>
        <Route path="/microsoft/teams/chat/:id">
          {!user ? <Redirect to="/login" /> : (
            <MainLayout user={user}>
              <TeamsChat />
            </MainLayout>
          )}
        </Route>

        {/* AI Assistant Route */}
        <Route path="/ai/assistant">
          {!user ? <Redirect to="/login" /> : (
            <MainLayout user={user}>
              <ClaudeAssistant />
            </MainLayout>
          )}
        </Route>

        {/* Email Routes */}
        <Route path="/email/inbox">
          {!user ? <Redirect to="/login" /> : (
            <MainLayout user={user}>
              <EmailInbox />
            </MainLayout>
          )}
        </Route>
        <Route path="/email/compose">
          {!user ? <Redirect to="/login" /> : (
            <MainLayout user={user}>
              <EmailCompose />
            </MainLayout>
          )}
        </Route>
        <Route path="/email/templates">
          {!user ? <Redirect to="/login" /> : (
            <MainLayout user={user}>
              <EmailTemplates />
            </MainLayout>
          )}
        </Route>

        {/* Team Routes */}
        <Route path="/team/lounge">
          {!user ? <Redirect to="/login" /> : (
            <MainLayout user={user}>
              <TeamLounge />
            </MainLayout>
          )}
        </Route>
        <Route path="/team/directory">
          {!user ? <Redirect to="/login" /> : (
            <MainLayout user={user}>
              <TeamDirectory />
            </MainLayout>
          )}
        </Route>

        {/* Automation Routes */}
        <Route path="/automation/workflows">
          {!user ? <Redirect to="/login" /> : (
            <MainLayout user={user}>
              <Workflows />
            </MainLayout>
          )}
        </Route>
        <Route path="/automation/workflows/builder">
          {!user ? <Redirect to="/login" /> : (
            <MainLayout user={user}>
              <WorkflowBuilder />
            </MainLayout>
          )}
        </Route>
        <Route path="/automation/rules">
          {!user ? <Redirect to="/login" /> : (
            <MainLayout user={user}>
              <Automations />
            </MainLayout>
          )}
        </Route>

        {/* Integration Routes */}
        <Route path="/integrations">
          {!user ? <Redirect to="/login" /> : (
            <MainLayout user={user}>
              <Integrations />
            </MainLayout>
          )}
        </Route>
        <Route path="/integrations/:provider">
          {!user ? <Redirect to="/login" /> : (
            <MainLayout user={user}>
              <IntegrationSetup />
            </MainLayout>
          )}
        </Route>

        {/* Documents Route */}
        <Route path="/documents">
          {!user ? <Redirect to="/login" /> : (
            <MainLayout user={user}>
              <Documents />
            </MainLayout>
          )}
        </Route>

        {/* Analytics Route */}
        <Route path="/analytics">
          {!user ? <Redirect to="/login" /> : (
            <MainLayout user={user}>
              <Analytics />
            </MainLayout>
          )}
        </Route>

        {/* Notes Route */}
        <Route path="/notes">
          {!user ? <Redirect to="/login" /> : (
            <MainLayout user={user}>
              <Notes />
            </MainLayout>
          )}
        </Route>

        {/* Settings Routes */}
        <Route path="/settings">
          {!user ? <Redirect to="/login" /> : (
            <MainLayout user={user}>
              <Settings />
            </MainLayout>
          )}
        </Route>
        <Route path="/settings/profile">
          {!user ? <Redirect to="/login" /> : (
            <MainLayout user={user}>
              <Profile />
            </MainLayout>
          )}
        </Route>

        {/* 404 */}
        <Route>
          {!user ? <Redirect to="/login" /> : (
            <MainLayout user={user}>
              <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                  <h1 className="text-6xl font-bold text-muted-foreground">404</h1>
                  <p className="mt-4 text-xl">Page not found</p>
                </div>
              </div>
            </MainLayout>
          )}
        </Route>
      </Switch>
    </Router>
  );
}

export default App;
