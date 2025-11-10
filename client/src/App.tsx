import { useState } from "react";
import { Route, Switch } from "wouter";
import Dashboard from "./pages/Dashboard";
import CRM from "./pages/CRM";
import Sidebar from "./components/Sidebar";
import { Toaster } from "./components/ui/toaster";

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      
      <main className={`flex-1 overflow-auto transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/crm" component={CRM} />
          <Route>
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-white mb-4">404</h1>
                <p className="text-slate-400">Page not found</p>
              </div>
            </div>
          </Route>
        </Switch>
      </main>
      
      <Toaster />
    </div>
  );
}
