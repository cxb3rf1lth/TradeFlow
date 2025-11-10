import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import {
  Search,
  CheckCircle2,
  ExternalLink,
  Settings,
  Tag,
  Star,
  TrendingUp,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Skeleton } from "../../components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Separator } from "../../components/ui/separator";

interface Integration {
  id: string;
  name: string;
  description: string;
  category: string;
  logo: string;
  isConnected: boolean;
  isPremium: boolean;
  features: string[];
  setupInstructions: string[];
}

// Mock data
const mockIntegrations: Integration[] = [
  {
    id: "hubspot",
    name: "HubSpot",
    description: "Sync contacts, deals, and companies with HubSpot CRM",
    category: "CRM",
    logo: "https://cdn.worldvectorlogo.com/logos/hubspot.svg",
    isConnected: true,
    isPremium: false,
    features: [
      "Bi-directional contact sync",
      "Deal stage synchronization",
      "Company data sync",
      "Real-time updates",
    ],
    setupInstructions: [
      "Click the Connect button",
      "Log in to your HubSpot account",
      "Authorize TradeFlow to access your data",
      "Configure sync settings",
    ],
  },
  {
    id: "salesforce",
    name: "Salesforce",
    description: "Connect with Salesforce to sync your CRM data",
    category: "CRM",
    logo: "https://cdn.worldvectorlogo.com/logos/salesforce-2.svg",
    isConnected: false,
    isPremium: true,
    features: [
      "Full CRM synchronization",
      "Custom object support",
      "Field mapping",
      "Workflow automation",
    ],
    setupInstructions: [
      "Click the Connect button",
      "Log in to your Salesforce account",
      "Grant necessary permissions",
      "Map fields between systems",
    ],
  },
  {
    id: "trello",
    name: "Trello",
    description: "Create Trello cards from deals and tasks",
    category: "Project Management",
    logo: "https://cdn.worldvectorlogo.com/logos/trello.svg",
    isConnected: true,
    isPremium: false,
    features: [
      "Auto-create cards from deals",
      "Task synchronization",
      "Board integration",
      "Label mapping",
    ],
    setupInstructions: [
      "Click the Connect button",
      "Authorize with Trello",
      "Select boards to sync",
      "Configure card creation rules",
    ],
  },
  {
    id: "jira",
    name: "Jira",
    description: "Integrate with Jira for project management",
    category: "Project Management",
    logo: "https://cdn.worldvectorlogo.com/logos/jira-1.svg",
    isConnected: false,
    isPremium: false,
    features: [
      "Issue creation from tasks",
      "Project synchronization",
      "Sprint planning integration",
      "Time tracking",
    ],
    setupInstructions: [
      "Click the Connect button",
      "Enter your Jira site URL",
      "Provide API credentials",
      "Map project fields",
    ],
  },
  {
    id: "slack",
    name: "Slack",
    description: "Get notifications and updates in Slack channels",
    category: "Communication",
    logo: "https://cdn.worldvectorlogo.com/logos/slack-new-logo.svg",
    isConnected: true,
    isPremium: false,
    features: [
      "Real-time notifications",
      "Channel integration",
      "Direct message alerts",
      "Custom message formatting",
    ],
    setupInstructions: [
      "Click the Connect button",
      "Select your Slack workspace",
      "Choose notification channels",
      "Configure alert preferences",
    ],
  },
  {
    id: "teams",
    name: "Microsoft Teams",
    description: "Collaborate with your team using Microsoft Teams",
    category: "Communication",
    logo: "https://cdn.worldvectorlogo.com/logos/microsoft-teams-1.svg",
    isConnected: false,
    isPremium: false,
    features: [
      "Team notifications",
      "Channel integration",
      "Meeting scheduling",
      "File sharing",
    ],
    setupInstructions: [
      "Click the Connect button",
      "Sign in with Microsoft account",
      "Select Teams workspace",
      "Configure notification settings",
    ],
  },
  {
    id: "onedrive",
    name: "OneDrive",
    description: "Store and sync files with OneDrive",
    category: "Storage",
    logo: "https://cdn.worldvectorlogo.com/logos/microsoft-onedrive-1.svg",
    isConnected: false,
    isPremium: false,
    features: [
      "Document storage",
      "File versioning",
      "Real-time sync",
      "Shared folders",
    ],
    setupInstructions: [
      "Click the Connect button",
      "Sign in with Microsoft account",
      "Grant file access permissions",
      "Select sync folders",
    ],
  },
  {
    id: "gmail",
    name: "Gmail",
    description: "Sync emails and track conversations",
    category: "Communication",
    logo: "https://cdn.worldvectorlogo.com/logos/gmail-icon.svg",
    isConnected: true,
    isPremium: false,
    features: [
      "Email tracking",
      "Auto-log conversations",
      "Template integration",
      "Send from TradeFlow",
    ],
    setupInstructions: [
      "Click the Connect button",
      "Sign in with Google account",
      "Grant email permissions",
      "Configure tracking settings",
    ],
  },
  {
    id: "mailchimp",
    name: "Mailchimp",
    description: "Sync contacts with Mailchimp for email marketing",
    category: "Marketing",
    logo: "https://cdn.worldvectorlogo.com/logos/mailchimp-freddie-icon.svg",
    isConnected: false,
    isPremium: false,
    features: [
      "Contact synchronization",
      "Campaign integration",
      "List management",
      "Analytics tracking",
    ],
    setupInstructions: [
      "Click the Connect button",
      "Log in to Mailchimp",
      "Select audience lists",
      "Configure sync preferences",
    ],
  },
  {
    id: "zapier",
    name: "Zapier",
    description: "Connect with 3,000+ apps through Zapier",
    category: "Integration",
    logo: "https://cdn.worldvectorlogo.com/logos/zapier.svg",
    isConnected: false,
    isPremium: true,
    features: [
      "Custom automation",
      "Multi-step workflows",
      "3000+ app integrations",
      "Advanced triggers",
    ],
    setupInstructions: [
      "Click the Connect button",
      "Sign in to Zapier",
      "Create your first Zap",
      "Configure triggers and actions",
    ],
  },
];

export default function Integrations() {
  const [, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);

  // Fetch integrations
  const { data: integrations, isLoading } = useQuery<Integration[]>({
    queryKey: ["/api/integrations"],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return mockIntegrations;
    },
  });

  const filteredIntegrations = integrations?.filter((integration) => {
    const matchesSearch =
      searchTerm === "" ||
      integration.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      integration.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = categoryFilter === "all" || integration.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const connectedIntegrations = integrations?.filter((i) => i.isConnected);
  const categories = Array.from(new Set(integrations?.map((i) => i.category) || []));

  const popularIntegrations = integrations?.filter((i) =>
    ["hubspot", "slack", "gmail", "trello"].includes(i.id)
  );

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Integrations</h1>
          <p className="text-muted-foreground">
            Connect TradeFlow with your favorite tools and services
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-sm">
            {connectedIntegrations?.length || 0} Connected
          </Badge>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search integrations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Integrations</TabsTrigger>
          <TabsTrigger value="connected">Connected</TabsTrigger>
          <TabsTrigger value="popular">Popular</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6 mt-6">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="pt-6">
                    <Skeleton className="h-16 w-16 rounded mb-4" />
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-3 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredIntegrations?.map((integration) => (
                <Card
                  key={integration.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-4">
                      <img
                        src={integration.logo}
                        alt={integration.name}
                        className="h-12 w-12 object-contain"
                      />
                      {integration.isConnected && (
                        <Badge className="bg-green-500">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Connected
                        </Badge>
                      )}
                      {integration.isPremium && !integration.isConnected && (
                        <Badge variant="secondary">
                          <Star className="h-3 w-3 mr-1" />
                          Premium
                        </Badge>
                      )}
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{integration.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {integration.description}
                    </p>
                    <Badge variant="outline" className="mb-4">
                      <Tag className="h-3 w-3 mr-1" />
                      {integration.category}
                    </Badge>
                    <div className="flex gap-2 mt-4">
                      {integration.isConnected ? (
                        <>
                          <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() =>
                              navigate(`/integrations/setup/${integration.id}`)
                            }
                          >
                            <Settings className="h-4 w-4 mr-2" />
                            Configure
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setSelectedIntegration(integration)}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <Button
                          className="flex-1"
                          onClick={() => setSelectedIntegration(integration)}
                        >
                          Connect
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="connected" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {connectedIntegrations?.map((integration) => (
              <Card key={integration.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <img
                      src={integration.logo}
                      alt={integration.name}
                      className="h-12 w-12 object-contain"
                    />
                    <Badge className="bg-green-500">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Connected
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{integration.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {integration.description}
                  </p>
                  <Badge variant="outline" className="mb-4">
                    <Tag className="h-3 w-3 mr-1" />
                    {integration.category}
                  </Badge>
                  <div className="flex gap-2 mt-4">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => navigate(`/integrations/setup/${integration.id}`)}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Configure
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {connectedIntegrations?.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No connected integrations yet</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="popular" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularIntegrations?.map((integration) => (
              <Card key={integration.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="relative">
                      <img
                        src={integration.logo}
                        alt={integration.name}
                        className="h-12 w-12 object-contain"
                      />
                      <div className="absolute -top-2 -right-2">
                        <TrendingUp className="h-5 w-5 text-orange-500" />
                      </div>
                    </div>
                    {integration.isConnected && (
                      <Badge className="bg-green-500">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Connected
                      </Badge>
                    )}
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{integration.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {integration.description}
                  </p>
                  <Badge variant="outline" className="mb-4">
                    <Tag className="h-3 w-3 mr-1" />
                    {integration.category}
                  </Badge>
                  <div className="flex gap-2 mt-4">
                    {integration.isConnected ? (
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => navigate(`/integrations/setup/${integration.id}`)}
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Configure
                      </Button>
                    ) : (
                      <Button
                        className="flex-1"
                        onClick={() => setSelectedIntegration(integration)}
                      >
                        Connect
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Integration Detail Dialog */}
      <Dialog
        open={selectedIntegration !== null}
        onOpenChange={() => setSelectedIntegration(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <div className="flex items-center gap-4 mb-4">
              <img
                src={selectedIntegration?.logo}
                alt={selectedIntegration?.name}
                className="h-16 w-16 object-contain"
              />
              <div>
                <DialogTitle className="text-2xl">{selectedIntegration?.name}</DialogTitle>
                <DialogDescription>{selectedIntegration?.description}</DialogDescription>
              </div>
            </div>
          </DialogHeader>
          {selectedIntegration && (
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold mb-3">Features</h4>
                <ul className="space-y-2">
                  {selectedIntegration.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold mb-3">Setup Instructions</h4>
                <ol className="space-y-2">
                  {selectedIntegration.setupInstructions.map((instruction, idx) => (
                    <li key={idx} className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold">
                        {idx + 1}
                      </span>
                      <span className="text-sm mt-0.5">{instruction}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <Separator />

              <div className="flex gap-2">
                {selectedIntegration.isConnected ? (
                  <Button
                    className="flex-1"
                    onClick={() => {
                      navigate(`/integrations/setup/${selectedIntegration.id}`);
                      setSelectedIntegration(null);
                    }}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Configure Integration
                  </Button>
                ) : (
                  <Button
                    className="flex-1"
                    onClick={() => {
                      navigate(`/integrations/setup/${selectedIntegration.id}`);
                      setSelectedIntegration(null);
                    }}
                  >
                    Connect {selectedIntegration.name}
                  </Button>
                )}
                <Button variant="outline" onClick={() => setSelectedIntegration(null)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
