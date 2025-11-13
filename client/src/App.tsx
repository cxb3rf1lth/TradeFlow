import { useState, useEffect } from "react";
import { Route, Switch, useLocation } from "wouter";
import Dashboard from "./pages/Dashboard";
import CRM from "./pages/CRM";
import Boards from "./pages/Boards";
import Automations from "./pages/Automations";
import Email from "./pages/Email";
import Integrations from "./pages/Integrations";
import Admin from "./pages/Admin";
import Login from "./pages/Login";
import Sidebar from "./components/Sidebar";
import { Toaster } from "./components/ui/toaster";

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useLocation();

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem("token");
    if (token) {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsAuthenticated(false);
    setLocation("/login");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-zinc-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login page if not authenticated
  if (!isAuthenticated || location === "/login") {
    return (
      <>
        <Login onLoginSuccess={() => setIsAuthenticated(true)} />
        <Toaster />
      </>
    );
  }

  return (
    <div className="flex h-screen bg-black dark">
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        onLogout={handleLogout}
      />

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
