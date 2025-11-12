import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, FileText, Mail, CheckSquare, MessageSquare, Calendar, TrendingUp } from "lucide-react";
import { useLocation } from "wouter";

const searchResults = [
  { id: 1, type: "task", title: "Review Q4 sales pipeline", path: "/tasks", icon: CheckSquare },
  { id: 2, type: "note", title: "Meeting notes - Q4 Strategy", path: "/notes", icon: FileText },
  { id: 3, type: "email", title: "Weekly Status Email", path: "/email", icon: Mail },
  { id: 4, type: "lounge", title: "Team celebration announcement", path: "/team-lounge", icon: MessageSquare },
  { id: 5, type: "analytics", title: "Performance metrics dashboard", path: "/analytics", icon: TrendingUp },
];

export function EnhancedSearchBar() {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [, setLocation] = useLocation();

  const filteredResults = query.length > 0
    ? searchResults.filter(item =>
        item.title.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const handleSelect = (path: string) => {
    setLocation(path);
    setQuery("");
    setIsOpen(false);
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          data-search-input
          placeholder="Search tasks, notes, emails... (Ctrl+/)"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          className="pl-10 pr-4"
        />
      </div>

      {isOpen && filteredResults.length > 0 && (
        <Card className="absolute top-full mt-2 w-full z-50 shadow-2xl animate-slide-in-up">
          <CardContent className="p-2">
            {filteredResults.map((result) => {
              const Icon = result.icon;
              return (
                <div
                  key={result.id}
                  className="flex items-center gap-3 p-3 rounded-md hover:bg-accent cursor-pointer transition-colors"
                  onClick={() => handleSelect(result.path)}
                >
                  <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{result.title}</p>
                    <p className="text-xs text-muted-foreground capitalize">{result.type}</p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
