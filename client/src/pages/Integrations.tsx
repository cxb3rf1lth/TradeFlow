import { useState } from "react";
import { Link2, CheckCircle, XCircle, Settings, Plus, ExternalLink } from "lucide-react";
import { Button } from "../components/ui/button";

export default function Integrations() {
  const [integrations] = useState([
    {
      id: "hubspot",
      name: "HubSpot",
      description: "Sync contacts, deals, and companies with HubSpot CRM",
      logo: "🔶",
      status: "connected",
      category: "CRM",
    },
    {
      id: "trello",
      name: "Trello",
      description: "Create and sync cards with Trello boards",
      logo: "📋",
      status: "disconnected",
      category: "Project Management",
    },
    {
      id: "jira",
      name: "Jira",
      description: "Sync issues and projects with Jira",
      logo: "🔷",
      status: "disconnected",
      category: "Project Management",
    },
    {
      id: "netsuite",
      name: "NetSuite",
      description: "Integrate with NetSuite ERP for financial data",
      logo: "💼",
      status: "disconnected",
      category: "ERP",
    },
    {
      id: "slack",
      name: "Slack",
      description: "Send notifications to Slack channels",
      logo: "💬",
      status: "connected",
      category: "Communication",
    },
    {
      id: "gmail",
      name: "Gmail",
      description: "Send and receive emails through Gmail",
      logo: "📧",
      status: "connected",
      category: "Email",
    },
  ]);

  const connectedCount = integrations.filter((i) => i.status === "connected").length;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Integrations</h1>
          <p className="text-zinc-400">Connect TradeFlow with your favorite tools</p>
        </div>
        <Button className="bg-yellow-600 hover:bg-yellow-700 text-black">
          <Plus className="w-4 h-4 mr-2" />
          Request Integration
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatsCard title="Total Integrations" value={integrations.length} />
        <StatsCard title="Connected" value={connectedCount} />
        <StatsCard title="Available" value={integrations.length - connectedCount} />
      </div>

      <div className="mb-6">
        <div className="flex gap-2">
          {["All", "CRM", "Project Management", "Email", "ERP", "Communication"].map((category) => (
            <button
              key={category}
              className="px-4 py-2 rounded-lg bg-zinc-800/50 border border-zinc-700 text-zinc-300 hover:border-yellow-500/50 hover:text-yellow-400 transition-all text-sm"
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {integrations.map((integration) => (
          <div
            key={integration.id}
            className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-xl p-6 hover:border-yellow-500/50 transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="text-4xl">{integration.logo}</div>
                <div>
                  <h3 className="text-white font-semibold">{integration.name}</h3>
                  <span className="text-xs px-2 py-1 rounded bg-zinc-800 text-zinc-400">
                    {integration.category}
                  </span>
                </div>
              </div>
              {integration.status === "connected" ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <XCircle className="w-5 h-5 text-zinc-600" />
              )}
            </div>
            <p className="text-zinc-400 text-sm mb-4">{integration.description}</p>
            <div className="flex gap-2">
              {integration.status === "connected" ? (
                <>
                  <Button variant="outline" size="sm" className="flex-1 border-zinc-700 text-zinc-300 hover:border-red-500 hover:text-red-500">
                    Disconnect
                  </Button>
                  <Button variant="outline" size="sm" className="border-zinc-700 text-zinc-300 hover:border-yellow-500 hover:text-yellow-500">
                    <Settings className="w-4 h-4" />
                  </Button>
                </>
              ) : (
                <Button className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-black" size="sm">
                  <Link2 className="w-4 h-4 mr-2" />
                  Connect
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-xl p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white mb-2">Integration Activity</h2>
            <p className="text-zinc-400 text-sm">Recent sync and connection logs</p>
          </div>
          <Button variant="outline" size="sm" className="border-zinc-700 text-zinc-300">
            View All Logs
          </Button>
        </div>
        <div className="space-y-3">
          <ActivityLog
            integration="HubSpot"
            action="Synced 12 contacts"
            time="5 minutes ago"
            status="success"
          />
          <ActivityLog
            integration="Slack"
            action="Sent notification"
            time="1 hour ago"
            status="success"
          />
          <ActivityLog
            integration="Gmail"
            action="Sent 3 emails"
            time="2 hours ago"
            status="success"
          />
          <ActivityLog
            integration="Trello"
            action="Connection failed"
            time="3 hours ago"
            status="error"
          />
        </div>
      </div>
    </div>
  );
}

function StatsCard({ title, value }: any) {
  return (
    <div className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-xl p-6">
      <h3 className="text-zinc-400 text-sm mb-1">{title}</h3>
      <p className="text-3xl font-bold text-white">{value}</p>
    </div>
  );
}

function ActivityLog({ integration, action, time, status }: any) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-zinc-800/50 last:border-0">
      <div className="flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full ${status === "success" ? "bg-green-500" : "bg-red-500"}`}></div>
        <div>
          <p className="text-white text-sm">
            <span className="font-medium">{integration}</span> • {action}
          </p>
          <p className="text-zinc-500 text-xs">{time}</p>
        </div>
      </div>
      <ExternalLink className="w-4 h-4 text-zinc-600" />
    </div>
  );
}
