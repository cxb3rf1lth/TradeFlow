import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SiTrello, SiJira } from "react-icons/si";
import { RefreshCw, Settings, Building2, FileText, MessageSquare } from "lucide-react";

const integrations = [
  { name: "Trello", icon: SiTrello, status: "connected", lastSync: "2 min ago", color: "#0079BF" },
  { name: "HubSpot", icon: Building2, status: "connected", lastSync: "5 min ago", color: "#FF7A59" },
  { name: "Jira", icon: SiJira, status: "connected", lastSync: "1 min ago", color: "#0052CC" },
  { name: "OneDrive", icon: FileText, status: "connected", lastSync: "10 min ago", color: "#0078D4" },
  { name: "Teams", icon: MessageSquare, status: "connected", lastSync: "3 min ago", color: "#6264A7" },
];

export function IntegrationStatus() {
  return (
    <Card data-testid="card-integration-status">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold">Integrations</CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => console.log('Refresh all integrations')}
          data-testid="button-refresh-integrations"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {integrations.map((integration) => (
          <div
            key={integration.name}
            className="flex items-center justify-between p-3 rounded-md hover-elevate"
            data-testid={`integration-${integration.name.toLowerCase()}`}
          >
            <div className="flex items-center gap-3">
              <div
                className="h-10 w-10 rounded flex items-center justify-center"
                style={{ backgroundColor: `${integration.color}15` }}
              >
                <integration.icon
                  className="h-5 w-5"
                  style={{ color: integration.color }}
                />
              </div>
              <div>
                <p className="text-sm font-medium">{integration.name}</p>
                <p className="text-xs text-muted-foreground">
                  Synced {integration.lastSync}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                {integration.status}
              </Badge>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => console.log(`Configure ${integration.name}`)}
                data-testid={`button-configure-${integration.name.toLowerCase()}`}
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
