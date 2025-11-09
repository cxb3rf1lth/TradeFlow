import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useUser } from "@/hooks/use-user";
import { apiRequest } from "@/lib/api-request";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/lib/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { Integration } from "@shared/schema";
import { CheckCircle, XCircle, RefreshCw, Settings, TrendingUp, AlertTriangle, Zap } from "lucide-react";

const AVAILABLE_INTEGRATIONS = [
  {
    type: "trello",
    name: "Trello",
    description: "Sync tasks from Trello boards",
    icon: "📋",
    color: "bg-blue-500",
  },
  {
    type: "jira",
    name: "Jira",
    description: "Import issues and tasks from Jira",
    icon: "🔷",
    color: "bg-blue-600",
  },
  {
    type: "hubspot",
    name: "HubSpot",
    description: "Sync contacts and deals",
    icon: "🧡",
    color: "bg-orange-500",
  },
  {
    type: "salesforce",
    name: "Salesforce",
    description: "Connect with Salesforce CRM",
    icon: "☁️",
    color: "bg-cyan-500",
  },
  {
    type: "slack",
    name: "Slack",
    description: "Receive notifications in Slack",
    icon: "💬",
    color: "bg-purple-500",
  },
  {
    type: "gmail",
    name: "Gmail",
    description: "Send emails through Gmail",
    icon: "📧",
    color: "bg-red-500",
  },
  {
    type: "calendar",
    name: "Google Calendar",
    description: "Sync tasks with calendar events",
    icon: "📅",
    color: "bg-green-500",
  },
  {
    type: "asana",
    name: "Asana",
    description: "Import tasks from Asana projects",
    icon: "🎯",
    color: "bg-pink-500",
  },
];

interface IntegrationHealth {
  status: "healthy" | "warning" | "error";
  lastError?: string;
  syncCount?: number;
}

export default function IntegrationsPage() {
  const { user } = useUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // UI states
  const [connectDialogOpen, setConnectDialogOpen] = useState(false);
  const [disconnectDialogOpen, setDisconnectDialogOpen] = useState(false);
  const [selectedIntegrationType, setSelectedIntegrationType] = useState<string>("");
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);

  // Form state for connection credentials
  const [connectionData, setConnectionData] = useState({
    apiKey: "",
    apiSecret: "",
    webhookUrl: "",
  });

  // Fetch integrations
  const { data: integrations = [], isLoading } = useQuery<Integration[]>({
    queryKey: ["/api/integrations"],
    queryFn: () => apiRequest("/api/integrations"),
  });

  // Fetch integration health
  const { data: healthData = {} } = useQuery<Record<string, IntegrationHealth>>({
    queryKey: ["/api/integrations/health"],
    queryFn: () => apiRequest("/api/integrations/health"),
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Connect integration mutation
  const connectMutation = useMutation({
    mutationFn: (data: { type: string; name: string; credentials: any }) =>
      apiRequest("/api/integrations/connect", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/integrations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/integrations/health"] });
      toast({
        title: "Success",
        description: "Integration connected successfully",
      });
      setConnectDialogOpen(false);
      setConnectionData({ apiKey: "", apiSecret: "", webhookUrl: "" });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Disconnect integration mutation
  const disconnectMutation = useMutation({
    mutationFn: (id: string) =>
      apiRequest(`/api/integrations/${id}/disconnect`, {
        method: "POST",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/integrations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/integrations/health"] });
      toast({
        title: "Success",
        description: "Integration disconnected successfully",
      });
      setDisconnectDialogOpen(false);
      setSelectedIntegration(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Sync integration mutation
  const syncMutation = useMutation({
    mutationFn: (id: string) =>
      apiRequest(`/api/integrations/${id}/sync`, {
        method: "POST",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/integrations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/integrations/health"] });
      toast({
        title: "Success",
        description: "Integration synced successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleConnect = (e: React.FormEvent) => {
    e.preventDefault();
    const integrationInfo = AVAILABLE_INTEGRATIONS.find((i) => i.type === selectedIntegrationType);
    if (integrationInfo) {
      connectMutation.mutate({
        type: selectedIntegrationType,
        name: integrationInfo.name,
        credentials: connectionData,
      });
    }
  };

  const openConnectDialog = (type: string) => {
    setSelectedIntegrationType(type);
    setConnectDialogOpen(true);
  };

  const openDisconnectDialog = (integration: Integration) => {
    setSelectedIntegration(integration);
    setDisconnectDialogOpen(true);
  };

  const handleDisconnect = () => {
    if (selectedIntegration) {
      disconnectMutation.mutate(selectedIntegration.id);
    }
  };

  const handleSync = (integration: Integration) => {
    syncMutation.mutate(integration.id);
  };

  const getIntegrationInfo = (type: string) => {
    return AVAILABLE_INTEGRATIONS.find((i) => i.type === type);
  };

  const isConnected = (type: string) => {
    return integrations.some((i) => i.type === type && i.status === "connected");
  };

  const getConnectedIntegration = (type: string) => {
    return integrations.find((i) => i.type === type && i.status === "connected");
  };

  const getHealthBadge = (integrationId: string) => {
    const health = healthData[integrationId];
    if (!health) return null;

    switch (health.status) {
      case "healthy":
        return (
          <Badge variant="default" className="bg-green-500">
            <CheckCircle className="mr-1 h-3 w-3" />
            Healthy
          </Badge>
        );
      case "warning":
        return (
          <Badge variant="secondary" className="bg-yellow-500">
            <AlertTriangle className="mr-1 h-3 w-3" />
            Warning
          </Badge>
        );
      case "error":
        return (
          <Badge variant="destructive">
            <XCircle className="mr-1 h-3 w-3" />
            Error
          </Badge>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading integrations...</p>
        </div>
      </div>
    );
  }

  const connectedCount = integrations.filter((i) => i.status === "connected").length;
  const healthyCount = Object.values(healthData).filter((h) => h.status === "healthy").length;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Integrations</h1>
        <p className="text-muted-foreground">
          Connect third-party services to enhance your workflow
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Integrations</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{AVAILABLE_INTEGRATIONS.length}</div>
            <p className="text-xs text-muted-foreground">Services you can connect</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Connected</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{connectedCount}</div>
            <p className="text-xs text-muted-foreground">Active integrations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Health Status</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {healthyCount}/{connectedCount}
            </div>
            <p className="text-xs text-muted-foreground">Healthy integrations</p>
          </CardContent>
        </Card>
      </div>

      {/* Integration Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {AVAILABLE_INTEGRATIONS.map((availableIntegration) => {
          const connected = isConnected(availableIntegration.type);
          const integration = getConnectedIntegration(availableIntegration.type);
          const health = integration ? healthData[integration.id] : null;

          return (
            <Card key={availableIntegration.type}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-3 rounded-lg ${availableIntegration.color} bg-opacity-10 text-2xl`}
                    >
                      {availableIntegration.icon}
                    </div>
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{availableIntegration.name}</CardTitle>
                      <CardDescription className="text-xs">
                        {availableIntegration.description}
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Status */}
                <div className="flex items-center gap-2">
                  <Badge variant={connected ? "default" : "secondary"}>
                    {connected ? (
                      <>
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Connected
                      </>
                    ) : (
                      <>
                        <XCircle className="mr-1 h-3 w-3" />
                        Disconnected
                      </>
                    )}
                  </Badge>
                  {integration && getHealthBadge(integration.id)}
                </div>

                {/* Sync info */}
                {integration && integration.lastSync && (
                  <div className="text-xs text-muted-foreground">
                    Last synced: {new Date(integration.lastSync).toLocaleString()}
                    {health?.syncCount !== undefined && (
                      <span className="block mt-1">Total syncs: {health.syncCount}</span>
                    )}
                  </div>
                )}

                {/* Error message */}
                {health?.lastError && (
                  <Alert variant="destructive" className="py-2">
                    <AlertDescription className="text-xs">{health.lastError}</AlertDescription>
                  </Alert>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  {connected && integration ? (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleSync(integration)}
                        disabled={syncMutation.isPending}
                      >
                        <RefreshCw
                          className={`mr-2 h-4 w-4 ${syncMutation.isPending ? "animate-spin" : ""}`}
                        />
                        Sync
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => openDisconnectDialog(integration)}
                      >
                        Disconnect
                      </Button>
                    </>
                  ) : (
                    <Button
                      className="w-full"
                      size="sm"
                      onClick={() => openConnectDialog(availableIntegration.type)}
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Connect
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Connect Dialog */}
      <Dialog open={connectDialogOpen} onOpenChange={setConnectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Connect {AVAILABLE_INTEGRATIONS.find((i) => i.type === selectedIntegrationType)?.name}
            </DialogTitle>
            <DialogDescription>
              Enter your API credentials to connect this integration
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleConnect} className="space-y-4">
            <Alert>
              <AlertDescription>
                You can find your API credentials in the settings page of the respective service.
              </AlertDescription>
            </Alert>
            <div className="space-y-2">
              <Label htmlFor="api-key">API Key</Label>
              <Input
                id="api-key"
                type="password"
                value={connectionData.apiKey}
                onChange={(e) => setConnectionData({ ...connectionData, apiKey: e.target.value })}
                placeholder="Enter your API key"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="api-secret">API Secret (Optional)</Label>
              <Input
                id="api-secret"
                type="password"
                value={connectionData.apiSecret}
                onChange={(e) => setConnectionData({ ...connectionData, apiSecret: e.target.value })}
                placeholder="Enter your API secret (if required)"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="webhook-url">Webhook URL (Optional)</Label>
              <Input
                id="webhook-url"
                value={connectionData.webhookUrl}
                onChange={(e) => setConnectionData({ ...connectionData, webhookUrl: e.target.value })}
                placeholder="https://your-webhook-url.com"
              />
            </div>
            <Button type="submit" className="w-full" disabled={connectMutation.isPending}>
              {connectMutation.isPending ? "Connecting..." : "Connect Integration"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Disconnect Dialog */}
      <Dialog open={disconnectDialogOpen} onOpenChange={setDisconnectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Disconnect Integration</DialogTitle>
            <DialogDescription>
              Are you sure you want to disconnect {selectedIntegration?.name}? You can reconnect it
              anytime.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDisconnectDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDisconnect}
              disabled={disconnectMutation.isPending}
            >
              {disconnectMutation.isPending ? "Disconnecting..." : "Disconnect"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
