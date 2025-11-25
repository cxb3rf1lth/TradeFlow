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
import { AuthProvider } from "@/contexts/auth-context";
import AuthPage from "@/pages/auth/AuthPage";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function App() {
  return (
    <AuthProvider>
      <Switch>
        <Route path="/login" component={AuthPage} />
        <Route>
          <ProtectedRoute>
            <AppLayout>
              <Switch>
                <Route path="/" component={Dashboard} />
                <Route path="/crm/contacts" component={Contacts} />
                <Route path="/crm/companies" component={Companies} />
                <Route path="/crm/deals" component={Deals} />
                <Route path="/analytics" component={Analytics} />
                <Route path="/projects" component={Boards} />
                <Route path="/onedrive" component={OneDrive} />
                <Route path="/calendar" component={Calendar} />
                <Route path="/teams" component={Teams} />
                <Route path="/ai" component={AIAssistant} />
                <Route>404 - Page Not Found</Route>
              </Switch>
            </AppLayout>
          </ProtectedRoute>
        </Route>
      </Switch>
      <Toaster />
    </AuthProvider>
  );
}
