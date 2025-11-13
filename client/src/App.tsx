import { useState } from "react";
import { Route, Switch } from "wouter";
import Dashboard from "./pages/Dashboard";
import CRM from "./pages/CRM";
import Boards from "./pages/Boards";
import Automations from "./pages/Automations";
import Email from "./pages/Email";
import Integrations from "./pages/Integrations";
import Admin from "./pages/Admin";
import Sidebar from "./components/Sidebar";
import { Toaster } from "./components/ui/toaster";

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-black dark">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      <main className={`flex-1 overflow-auto transition-all duration-300 bg-gradient-to-br from-black via-zinc-950 to-black ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/crm" component={CRM} />
          <Route path="/boards" component={Boards} />
          <Route path="/automations" component={Automations} />
          <Route path="/email" component={Email} />
          <Route path="/integrations" component={Integrations} />
          <Route path="/admin" component={Admin} />
          <Route>
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-white mb-4">404</h1>
                <p className="text-zinc-500">Page not found</p>
              </div>
            </div>
          </Route>
        </Switch>
      </main>

      <Toaster />
    </div>
  );
}
