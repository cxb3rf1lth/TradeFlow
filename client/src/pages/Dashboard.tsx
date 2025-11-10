import { Users, DollarSign, Mail, TrendingUp } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-slate-400">Welcome to TradeFlow - Your Enterprise Hub</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Contacts" value="0" icon={Users} gradient="from-blue-500 to-cyan-500" />
        <StatCard title="Active Deals" value="$0" icon={DollarSign} gradient="from-purple-500 to-pink-500" />
        <StatCard title="Email Sent" value="0" icon={Mail} gradient="from-green-500 to-emerald-500" />
        <StatCard title="Tasks" value="0" icon={TrendingUp} gradient="from-orange-500 to-red-500" />
      </div>

      <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-8">
        <h2 className="text-2xl font-bold text-white mb-4">🚀 Welcome to TradeFlow</h2>
        <p className="text-slate-400 mb-4">
          Your all-in-one enterprise platform combining CRM, project management, and AI-powered automation.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <FeatureCard title="CRM" description="Manage contacts, companies, and deals" link="/crm" />
          <FeatureCard title="Email Center" description="AI-powered email automation" link="/email" />
          <FeatureCard title="Integrations" description="Connect with HubSpot, Trello, Jira & more" link="/integrations" />
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, gradient }: any) {
  return (
    <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg bg-gradient-to-br ${gradient}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      <h3 className="text-slate-400 text-sm mb-1">{title}</h3>
      <p className="text-3xl font-bold text-white">{value}</p>
    </div>
  );
}

function FeatureCard({ title, description, link }: any) {
  return (
    <a href={link} className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 hover:border-blue-500 transition-all group">
      <h3 className="text-white font-semibold mb-2 group-hover:text-blue-400 transition-colors">{title}</h3>
      <p className="text-slate-400 text-sm">{description}</p>
    </a>
  );
}
