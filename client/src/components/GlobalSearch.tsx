import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Search, X, Users, Building2, TrendingUp, Trello, FileText, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import type { SearchResult, Contact, Company, Deal, Board, Activity } from "@/types";

/**
 * GlobalSearch Component
 *
 * A keyboard-shortcut powered global search component that searches across all entities
 * in the application (contacts, companies, deals, boards, and activities).
 *
 * Features:
 * - Keyboard shortcut: Cmd+K (Mac) or Ctrl+K (Windows/Linux)
 * - Debounced search (300ms)
 * - Click-outside-to-close
 * - ESC key to close
 * - Accessible with ARIA labels
 *
 * @returns {JSX.Element} The global search modal component
 */
export default function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [, setLocation] = useLocation();
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch all data for searching
  const { data: contacts } = useQuery<Contact[]>({ queryKey: ["/api/crm/contacts"] });
  const { data: companies } = useQuery<Company[]>({ queryKey: ["/api/crm/companies"] });
  const { data: deals } = useQuery<Deal[]>({ queryKey: ["/api/crm/deals"] });
  const { data: boards } = useQuery<Board[]>({ queryKey: ["/api/projects/boards"] });
  const { data: activities } = useQuery<Activity[]>({ queryKey: ["/api/activities"] });

  // Keyboard shortcut to open search (Cmd+K or Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(true);
        setTimeout(() => inputRef.current?.focus(), 100);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
        setSearchQuery("");
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearchQuery("");
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Perform search across all entities (using debounced query)
  const searchResults: SearchResult[] = [];

  if (debouncedQuery.length >= 2) {
    const query = debouncedQuery.toLowerCase();

    // Search contacts
    contacts?.forEach((contact) => {
      const fullName = `${contact.firstName} ${contact.lastName}`.toLowerCase();
      if (
        fullName.includes(query) ||
        contact.email?.toLowerCase().includes(query) ||
        contact.phone?.includes(query)
      ) {
        searchResults.push({
          id: contact.id,
          type: "contact",
          title: `${contact.firstName} ${contact.lastName}`,
          subtitle: contact.company || contact.email,
          description: contact.jobTitle,
          url: `/crm/contacts`,
        });
      }
    });

    // Search companies
    companies?.forEach((company) => {
      if (
        company.name?.toLowerCase().includes(query) ||
        company.domain?.toLowerCase().includes(query) ||
        company.industry?.toLowerCase().includes(query)
      ) {
        searchResults.push({
          id: company.id,
          type: "company",
          title: company.name,
          subtitle: company.industry,
          description: company.description,
          url: `/crm/companies`,
        });
      }
    });

    // Search deals
    deals?.forEach((deal) => {
      if (
        deal.name?.toLowerCase().includes(query) ||
        deal.description?.toLowerCase().includes(query)
      ) {
        searchResults.push({
          id: deal.id,
          type: "deal",
          title: deal.name,
          subtitle: deal.stage,
          description: `$${deal.value || 0} - ${deal.status}`,
          url: `/crm/deals`,
        });
      }
    });

    // Search boards
    boards?.forEach((board) => {
      if (
        board.name?.toLowerCase().includes(query) ||
        board.description?.toLowerCase().includes(query)
      ) {
        searchResults.push({
          id: board.id,
          type: "board",
          title: board.name,
          subtitle: "Project Board",
          description: board.description,
          url: `/projects`,
        });
      }
    });

    // Search activities
    activities?.forEach((activity) => {
      const metadata = typeof activity.metadata === "string"
        ? (() => {
            try {
              return JSON.parse(activity.metadata);
            } catch (error) {
              console.error("Failed to parse activity metadata:", error);
              return {};
            }
          })()
        : activity.metadata;

      if (
        activity.action?.toLowerCase().includes(query) ||
        activity.entityType?.toLowerCase().includes(query) ||
        metadata?.name?.toLowerCase().includes(query)
      ) {
        searchResults.push({
          id: activity.id,
          type: "activity",
          title: `${activity.action} ${activity.entityType}`,
          subtitle: new Date(activity.createdAt).toLocaleDateString(),
          description: metadata?.name || "",
          url: `/`,
        });
      }
    });
  }

  // Limit to top 10 results
  const limitedResults = searchResults.slice(0, 10);

  const getIcon = (type: SearchResult["type"]) => {
    switch (type) {
      case "contact":
        return <Users className="w-4 h-4" />;
      case "company":
        return <Building2 className="w-4 h-4" />;
      case "deal":
        return <TrendingUp className="w-4 h-4" />;
      case "board":
        return <Trello className="w-4 h-4" />;
      case "card":
        return <FileText className="w-4 h-4" />;
      case "activity":
        return <Calendar className="w-4 h-4" />;
    }
  };

  const handleResultClick = (result: SearchResult) => {
    setLocation(result.url);
    setIsOpen(false);
    setSearchQuery("");
  };

  return (
    <>
      {/* Search trigger button */}
      <button
        onClick={() => {
          setIsOpen(true);
          setTimeout(() => inputRef.current?.focus(), 100);
        }}
        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        aria-label="Open global search"
        aria-keyshortcuts="Control+K Meta+K"
      >
        <Search className="w-4 h-4" aria-hidden="true" />
        <span>Search...</span>
        <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-gray-500 bg-gray-100 border border-gray-200 rounded" aria-hidden="true">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      {/* Search modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black bg-opacity-50"
          role="dialog"
          aria-modal="true"
          aria-label="Global search dialog"
        >
          <div ref={searchRef} className="w-full max-w-2xl mx-4">
            <Card className="overflow-hidden shadow-2xl">
              {/* Search input */}
              <div className="flex items-center gap-3 p-4 border-b border-gray-200">
                <Search className="w-5 h-5 text-gray-400" aria-hidden="true" />
                <Input
                  ref={inputRef}
                  type="text"
                  placeholder="Search contacts, companies, deals, projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 border-0 focus:ring-0 focus:outline-none"
                  autoFocus
                  aria-label="Search across all entities"
                  role="searchbox"
                  aria-autocomplete="list"
                />
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setSearchQuery("");
                  }}
                  className="p-1 hover:bg-gray-100 rounded"
                  aria-label="Close search dialog"
                >
                  <X className="w-4 h-4 text-gray-400" aria-hidden="true" />
                </button>
              </div>

              {/* Search results */}
              <div className="max-h-96 overflow-y-auto">
                {searchQuery.length < 2 && (
                  <div className="p-8 text-center text-gray-500">
                    <Search className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-sm">Type at least 2 characters to search</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Search across contacts, companies, deals, and projects
                    </p>
                  </div>
                )}

                {searchQuery.length >= 2 && limitedResults.length === 0 && (
                  <div className="p-8 text-center text-gray-500">
                    <Search className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-sm">No results found for "{searchQuery}"</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Try different keywords or check your spelling
                    </p>
                  </div>
                )}

                {limitedResults.length > 0 && (
                  <div className="divide-y divide-gray-100" role="listbox" aria-label="Search results">
                    {limitedResults.map((result) => (
                      <button
                        key={`${result.type}-${result.id}`}
                        onClick={() => handleResultClick(result)}
                        className="w-full flex items-start gap-3 p-4 hover:bg-gray-50 transition-colors text-left"
                        role="option"
                        aria-label={`${result.type}: ${result.title}`}
                      >
                        <div
                          className={cn(
                            "p-2 rounded-lg",
                            result.type === "contact" && "bg-blue-50 text-blue-600",
                            result.type === "company" && "bg-purple-50 text-purple-600",
                            result.type === "deal" && "bg-green-50 text-green-600",
                            result.type === "board" && "bg-orange-50 text-orange-600",
                            result.type === "activity" && "bg-gray-50 text-gray-600"
                          )}
                        >
                          {getIcon(result.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-gray-900 truncate">
                              {result.title}
                            </p>
                            <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded capitalize">
                              {result.type}
                            </span>
                          </div>
                          {result.subtitle && (
                            <p className="text-sm text-gray-600 truncate mt-0.5">
                              {result.subtitle}
                            </p>
                          )}
                          {result.description && (
                            <p className="text-xs text-gray-500 truncate mt-0.5">
                              {result.description}
                            </p>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              {limitedResults.length > 0 && (
                <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">
                  Showing {limitedResults.length} of {searchResults.length} results
                </div>
              )}
            </Card>
          </div>
        </div>
      )}
    </>
  );
}
