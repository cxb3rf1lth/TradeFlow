import { Users, DollarSign, Mail, TrendingUp, Zap, BarChart3, Calendar, CheckSquare } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function Dashboard() {
  const { data: contacts } = useQuery({
    queryKey: ["/api/contacts"],
    queryFn: async () => {
      const res = await fetch("/api/contacts");
      return res.json();
    }
  });

  const { data: deals } = useQuery({
    queryKey: ["/api/deals"],
    queryFn: async () => {
      const res = await fetch("/api/deals");
      return res.json();
    }
  });

  const { data: emailLogs } = useQuery({
    queryKey: ["/api/email/logs"],
    queryFn: async () => {
      const res = await fetch("/api/email/logs");
      return res.json();
    }
  });

  const { data: boards } = useQuery({
    queryKey: ["/api/boards"],
    queryFn: async () => {
      const res = await fetch("/api/boards");
      return res.json();
    }
  });

  const totalContacts = contacts?.length || 0;
  const totalDeals = deals?.length || 0;
  const dealValue = deals?.reduce((sum: number, deal: any) => sum + (deal.value || 0), 0) || 0;
  const emailsSent = emailLogs?.length || 0;
  const activeBoards = boards?.length || 0;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-zinc-400">Welcome to TradeFlow - Your Enterprise Hub</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Contacts" value={totalContacts.toString()} icon={Users} accentColor="border-yellow-600/30 bg-yellow-600/5" />
        <StatCard title="Active Deals" value={`$${dealValue.toLocaleString()}`} icon={DollarSign} accentColor="border-yellow-500/30 bg-yellow-500/5" />
        <StatCard title="Emails Sent" value={emailsSent.toString()} icon={Mail} accentColor="border-yellow-400/30 bg-yellow-400/5" />
        <StatCard title="Active Boards" value={activeBoards.toString()} icon={CheckSquare} accentColor="border-yellow-600/30 bg-yellow-600/5" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-yellow-500" />
            Recent Activity
          </h2>
          <div className="space-y-3">
            <ActivityItem title="New contact added" time="5 minutes ago" />
            <ActivityItem title="Deal updated" time="1 hour ago" />
            <ActivityItem title="Email sent" time="2 hours ago" />
            <ActivityItem title="Board created" time="3 hours ago" />
          </div>
        </div>

        <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-500" />
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <QuickAction title="New Contact" link="/crm" />
            <QuickAction title="New Deal" link="/crm" />
            <QuickAction title="Send Email" link="/email" />
            <QuickAction title="New Board" link="/boards" />
          </div>
        </div>
      </div>

      <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-xl p-8">
        <h2 className="text-2xl font-bold text-white mb-4">TradeFlow Features</h2>
        <p className="text-zinc-400 mb-6">
          Your all-in-one enterprise platform combining CRM, project management, and AI-powered automation.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <FeatureCard title="CRM" description="Manage contacts, companies, and deals" link="/crm" icon={Users} />
          <FeatureCard title="Project Boards" description="Trello-like task management" link="/boards" icon={CheckSquare} />
          <FeatureCard title="Automations" description="Workflow automation engine" link="/automations" icon={Zap} />
          <FeatureCard title="Integrations" description="Connect external services" link="/integrations" icon={Calendar} />
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, accentColor }: any) {
  return (
    <div className={`bg-zinc-900/80 backdrop-blur-sm border ${accentColor} rounded-xl p-6 hover:border-yellow-500/50 transition-all`}>
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

function ActivityItem({ title, time }: any) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-zinc-800/50 last:border-0">
      <span className="text-zinc-300 text-sm">{title}</span>
      <span className="text-zinc-500 text-xs">{time}</span>
    </div>
  );
}

function QuickAction({ title, link }: any) {
  return (
    <a href={link} className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4 hover:border-yellow-500/50 hover:bg-yellow-500/5 transition-all text-center">
      <span className="text-white font-medium text-sm">{title}</span>
    </a>
  );
}

function FeatureCard({ title, description, link, icon: Icon }: any) {
  return (
    <a href={link} className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4 hover:border-yellow-500/50 hover:bg-yellow-500/5 transition-all group">
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 rounded-lg bg-yellow-600/10 border border-yellow-600/20 group-hover:bg-yellow-600/20 transition-all">
          <Icon className="w-4 h-4 text-yellow-500" />
        </div>
        <h3 className="text-white font-semibold group-hover:text-yellow-400 transition-colors">{title}</h3>
      </div>
      <p className="text-zinc-400 text-sm">{description}</p>
    </a>
  );
}
