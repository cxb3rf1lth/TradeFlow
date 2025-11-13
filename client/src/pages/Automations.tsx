import { useState } from "react";
import { Zap, Plus, Play, Pause, Settings, Trash2 } from "lucide-react";
import { Button } from "../components/ui/button";

export default function Automations() {
  const [automations] = useState([
    { id: "1", name: "Welcome Email Sequence", trigger: "New Contact", status: "active", runs: 124 },
    { id: "2", name: "Deal Stage Update", trigger: "Deal Updated", status: "active", runs: 87 },
    { id: "3", name: "Task Assignment", trigger: "New Deal", status: "paused", runs: 45 },
  ]);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Workflow Automations</h1>
          <p className="text-zinc-400">Automate your business processes with powerful workflows</p>
        </div>
        <Button className="bg-yellow-600 hover:bg-yellow-700 text-black">
          <Plus className="w-4 h-4 mr-2" />
          New Automation
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatsCard title="Total Automations" value="3" icon={Zap} />
        <StatsCard title="Active Workflows" value="2" icon={Play} />
        <StatsCard title="Total Runs" value="256" icon={Settings} />
      </div>

      <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Your Automations</h2>
        <div className="space-y-4">
          {automations.map((automation) => (
            <div
              key={automation.id}
              className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4 hover:border-yellow-500/50 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-yellow-600/10 border border-yellow-600/20">
                    <Zap className="w-5 h-5 text-yellow-500" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">{automation.name}</h3>
                    <p className="text-zinc-400 text-sm">
                      Trigger: <span className="text-yellow-500">{automation.trigger}</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
                      automation.status === "active"
                        ? "bg-green-600/10 text-green-500 border border-green-600/20"
                        : "bg-zinc-700/50 text-zinc-400 border border-zinc-700"
                    }`}>
                      {automation.status === "active" ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
                      {automation.status}
                    </div>
                    <p className="text-zinc-500 text-xs mt-1">{automation.runs} runs</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-yellow-500">
                      <Settings className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-xl p-8">
        <h2 className="text-xl font-bold text-white mb-4">Automation Templates</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <TemplateCard title="Lead Nurture" description="Automatically follow up with new leads" />
          <TemplateCard title="Deal Pipeline" description="Move deals through stages automatically" />
          <TemplateCard title="Task Creation" description="Create tasks based on triggers" />
        </div>
      </div>
    </div>
  );
}

function StatsCard({ title, value, icon: Icon }: any) {
  return (
    <div className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 rounded-lg bg-yellow-600/10 border border-yellow-600/20">
          <Icon className="w-6 h-6 text-yellow-500" />
        </div>
      </div>
      <h3 className="text-zinc-400 text-sm mb-1">{title}</h3>
      <p className="text-3xl font-bold text-white">{value}</p>
    </div>
  );
}

function TemplateCard({ title, description }: any) {
  return (
    <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4 hover:border-yellow-500/50 hover:bg-yellow-500/5 transition-all group cursor-pointer">
      <h3 className="text-white font-semibold mb-2 group-hover:text-yellow-400 transition-colors">{title}</h3>
      <p className="text-zinc-400 text-sm mb-3">{description}</p>
      <button className="text-yellow-500 text-sm font-medium">Use Template →</button>
    </div>
  );
}
