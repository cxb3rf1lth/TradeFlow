import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import {
  ChevronLeft,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Unplug,
  Save,
  TestTube,
  Clock,
  AlertCircle,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Switch } from "../../components/ui/switch";
import { Separator } from "../../components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";

const configSchema = z.object({
  syncDirection: z.enum(["bidirectional", "pull", "push"]),
  syncFrequency: z.enum(["realtime", "hourly", "daily"]),
  autoSync: z.boolean(),
});

type ConfigFormData = z.infer<typeof configSchema>;

interface SyncHistory {
  id: string;
  timestamp: string;
  status: "success" | "failed";
  recordsSynced: number;
  errors?: string;
}

interface FieldMapping {
  tradeflowField: string;
  integrationField: string;
  direction: "bidirectional" | "pull" | "push";
}

// Mock data
const mockSyncHistory: SyncHistory[] = [
  {
    id: "1",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    status: "success",
    recordsSynced: 42,
  },
  {
    id: "2",
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    status: "success",
    recordsSynced: 18,
  },
  {
    id: "3",
    timestamp: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
    status: "failed",
    recordsSynced: 0,
    errors: "API rate limit exceeded. Please try again later.",
  },
  {
    id: "4",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    status: "success",
    recordsSynced: 67,
  },
];

const defaultFieldMappings: FieldMapping[] = [
  {
    tradeflowField: "firstName",
    integrationField: "first_name",
    direction: "bidirectional",
  },
  {
    tradeflowField: "lastName",
    integrationField: "last_name",
    direction: "bidirectional",
  },
  {
    tradeflowField: "email",
    integrationField: "email_address",
    direction: "bidirectional",
  },
  {
    tradeflowField: "phone",
    integrationField: "phone_number",
    direction: "bidirectional",
  },
  {
    tradeflowField: "company",
    integrationField: "company_name",
    direction: "bidirectional",
  },
];

export default function IntegrationSetup() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isConnected, setIsConnected] = useState(true);
  const [fieldMappings, setFieldMappings] = useState<FieldMapping[]>(defaultFieldMappings);

  // Mock integration data - in real app, get this from URL params
  const integration = {
    id: "hubspot",
    name: "HubSpot",
    logo: "https://cdn.worldvectorlogo.com/logos/hubspot.svg",
  };

  // Fetch sync history
  const { data: syncHistory } = useQuery<SyncHistory[]>({
    queryKey: ["/api/integrations", integration.id, "sync-history"],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return mockSyncHistory;
    },
  });

  // Test connection mutation
  const testConnectionMutation = useMutation({
    mutationFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: "Connection successful",
        description: "Your integration is working correctly.",
      });
    },
    onError: () => {
      toast({
        title: "Connection failed",
        description: "Could not connect to the integration. Please check your settings.",
        variant: "destructive",
      });
    },
  });

  // Sync now mutation
  const syncNowMutation = useMutation({
    mutationFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 3000));
      return { recordsSynced: 25 };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["/api/integrations", integration.id, "sync-history"],
      });
      toast({
        title: "Sync completed",
        description: `Successfully synced ${data.recordsSynced} records.`,
      });
    },
    onError: () => {
      toast({
        title: "Sync failed",
        description: "Could not complete the sync. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Disconnect mutation
  const disconnectMutation = useMutation({
    mutationFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return { success: true };
    },
    onSuccess: () => {
      setIsConnected(false);
      toast({
        title: "Integration disconnected",
        description: "The integration has been disconnected.",
      });
      navigate("/integrations");
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ConfigFormData>({
    resolver: zodResolver(configSchema),
    defaultValues: {
      syncDirection: "bidirectional",
      syncFrequency: "hourly",
      autoSync: true,
    },
  });

  const onSave = (data: ConfigFormData) => {
    toast({
      title: "Settings saved",
      description: "Your integration settings have been updated.",
    });
  };

  const lastSync = syncHistory?.[0];

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/integrations")}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <img src={integration.logo} alt={integration.name} className="h-10 w-10 object-contain" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{integration.name} Integration</h1>
            <p className="text-muted-foreground">Configure your integration settings</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={isConnected ? "bg-green-500" : "bg-destructive"}>
            {isConnected ? (
              <>
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Connected
              </>
            ) : (
              <>
                <XCircle className="h-3 w-3 mr-1" />
                Disconnected
              </>
            )}
          </Badge>
        </div>
      </div>

      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle>Connection Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium">Last Sync</p>
              <p className="text-sm text-muted-foreground">
                {lastSync
                  ? format(new Date(lastSync.timestamp), "MMM d, yyyy 'at' h:mm a")
                  : "Never synced"}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => testConnectionMutation.mutate()}
                disabled={testConnectionMutation.isPending || !isConnected}
              >
                <TestTube className="h-4 w-4 mr-2" />
                {testConnectionMutation.isPending ? "Testing..." : "Test Connection"}
              </Button>
              <Button
                onClick={() => syncNowMutation.mutate()}
                disabled={syncNowMutation.isPending || !isConnected}
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${syncNowMutation.isPending ? "animate-spin" : ""}`}
                />
                {syncNowMutation.isPending ? "Syncing..." : "Sync Now"}
              </Button>
            </div>
          </div>
          {lastSync?.status === "failed" && lastSync.errors && (
            <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive rounded-lg">
              <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-destructive">Last Sync Failed</p>
                <p className="text-sm text-muted-foreground">{lastSync.errors}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {!isConnected && (
        <Card className="border-primary">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <AlertCircle className="h-12 w-12 text-primary mx-auto" />
              <div>
                <h3 className="font-semibold text-lg mb-2">Connect to {integration.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Click the button below to authorize TradeFlow to access your {integration.name}{" "}
                  account.
                </p>
                <Button
                  size="lg"
                  onClick={() => {
                    // In real app, this would redirect to OAuth flow
                    setTimeout(() => {
                      setIsConnected(true);
                      toast({
                        title: "Connected successfully",
                        description: `Your ${integration.name} account has been connected.`,
                      });
                    }, 1000);
                  }}
                >
                  Connect to {integration.name}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {isConnected && (
        <>
          {/* Sync Settings */}
          <form onSubmit={handleSubmit(onSave)}>
            <Card>
              <CardHeader>
                <CardTitle>Sync Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="syncDirection">Sync Direction</Label>
                    <Select defaultValue="bidirectional" {...register("syncDirection")}>
                      <SelectTrigger id="syncDirection">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bidirectional">Bidirectional (Two-way sync)</SelectItem>
                        <SelectItem value="pull">Pull Only (Import from {integration.name})</SelectItem>
                        <SelectItem value="push">Push Only (Export to {integration.name})</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Choose how data should sync between TradeFlow and {integration.name}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="syncFrequency">Sync Frequency</Label>
                    <Select defaultValue="hourly" {...register("syncFrequency")}>
                      <SelectTrigger id="syncFrequency">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="realtime">Real-time</SelectItem>
                        <SelectItem value="hourly">Every Hour</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      How often should data be synchronized
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="autoSync">Automatic Sync</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically sync data based on the frequency setting
                    </p>
                  </div>
                  <Switch id="autoSync" defaultChecked {...register("autoSync")} />
                </div>

                <Separator />

                <div className="flex justify-end gap-2">
                  <Button type="submit">
                    <Save className="h-4 w-4 mr-2" />
                    Save Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>

          {/* Field Mapping */}
          <Card>
            <CardHeader>
              <CardTitle>Field Mapping</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>TradeFlow Field</TableHead>
                    <TableHead>{integration.name} Field</TableHead>
                    <TableHead>Sync Direction</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fieldMappings.map((mapping, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{mapping.tradeflowField}</TableCell>
                      <TableCell>{mapping.integrationField}</TableCell>
                      <TableCell>
                        <Select
                          defaultValue={mapping.direction}
                          onValueChange={(value) => {
                            const newMappings = [...fieldMappings];
                            newMappings[index].direction = value as any;
                            setFieldMappings(newMappings);
                          }}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="bidirectional">Bidirectional</SelectItem>
                            <SelectItem value="pull">Pull Only</SelectItem>
                            <SelectItem value="push">Push Only</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="mt-4">
                <Button variant="outline" size="sm">
                  Add Field Mapping
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Sync History */}
          <Card>
            <CardHeader>
              <CardTitle>Sync History</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Records Synced</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {syncHistory?.map((sync) => (
                    <TableRow key={sync.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          {format(new Date(sync.timestamp), "MMM d, yyyy h:mm a")}
                        </div>
                      </TableCell>
                      <TableCell>
                        {sync.status === "success" ? (
                          <Badge className="bg-green-500">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Success
                          </Badge>
                        ) : (
                          <Badge variant="destructive">
                            <XCircle className="h-3 w-3 mr-1" />
                            Failed
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{sync.recordsSynced}</TableCell>
                      <TableCell>
                        {sync.errors ? (
                          <span className="text-sm text-destructive">{sync.errors}</span>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            Sync completed successfully
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="font-medium">Disconnect Integration</p>
                  <p className="text-sm text-muted-foreground">
                    This will stop all data synchronization and remove the connection to{" "}
                    {integration.name}
                  </p>
                </div>
                <Button
                  variant="destructive"
                  onClick={() => disconnectMutation.mutate()}
                  disabled={disconnectMutation.isPending}
                >
                  <Unplug className="h-4 w-4 mr-2" />
                  {disconnectMutation.isPending ? "Disconnecting..." : "Disconnect"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
