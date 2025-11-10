import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { CommandDialog } from "../ui/command";

interface MainLayoutProps {
  children: React.ReactNode;
  user: any;
}

export default function MainLayout({ children, user }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [commandOpen, setCommandOpen] = useState(false);

  // Global keyboard shortcuts
  useState(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCommandOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  });

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        user={user}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
        <Header
          user={user}
          onCommandOpen={() => setCommandOpen(true)}
          onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
        />

        <main className="p-6 max-w-7xl mx-auto">
          {children}
        </main>
      </div>

      <CommandDialog open={commandOpen} onOpenChange={setCommandOpen} />
    </div>
  );
}
