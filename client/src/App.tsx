import { Route, Switch } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import Dashboard from "./pages/Dashboard";
import Contacts from "./pages/crm/Contacts";
import Companies from "./pages/crm/Companies";
import Deals from "./pages/crm/Deals";
import Analytics from "./pages/Analytics";
import Boards from "./pages/projects/Boards";
import AIAssistant from "./pages/ai/Assistant";
import OneDrive from "./pages/microsoft365/OneDrive";
import Calendar from "./pages/microsoft365/Calendar";
import Teams from "./pages/microsoft365/Teams";
import AppLayout from "./components/layout/AppLayout";

export default function App() {
  return (
    <>
      <AppLayout>
        <Switch>
          <Route path="/" component={Dashboard} />

          {/* CRM Routes */}
          <Route path="/crm/contacts" component={Contacts} />
          <Route path="/crm/companies" component={Companies} />
          <Route path="/crm/deals" component={Deals} />

          {/* Analytics */}
          <Route path="/analytics" component={Analytics} />

          {/* Project Management Routes */}
          <Route path="/projects" component={Boards} />

          {/* Microsoft 365 Routes */}
          <Route path="/onedrive" component={OneDrive} />
          <Route path="/calendar" component={Calendar} />
          <Route path="/teams" component={Teams} />

          {/* AI Assistant */}
          <Route path="/ai" component={AIAssistant} />

          {/* Fallback */}
          <Route>404 - Page Not Found</Route>
        </Switch>
      </AppLayout>

      <Toaster />
    </>
  );
}
