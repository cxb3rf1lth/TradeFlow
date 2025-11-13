import { Settings, Users, Shield, Database, Bell, Palette, Key } from "lucide-react";
import { Button } from "../components/ui/button";

export default function Admin() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Admin Panel</h1>
        <p className="text-zinc-400">Manage your TradeFlow instance settings and configuration</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard title="Total Users" value="12" icon={Users} />
        <StatsCard title="API Calls" value="1,234" icon={Database} />
        <StatsCard title="Active Sessions" value="8" icon={Shield} />
        <StatsCard title="Storage Used" value="2.4 GB" icon={Database} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5 text-yellow-500" />
            System Settings
          </h2>
          <div className="space-y-3">
            <SettingItem
              icon={<Palette className="w-4 h-4" />}
              title="Theme Settings"
              description="Customize your workspace appearance"
            />
            <SettingItem
              icon={<Bell className="w-4 h-4" />}
              title="Notifications"
              description="Configure notification preferences"
            />
            <SettingItem
              icon={<Key className="w-4 h-4" />}
              title="API Keys"
              description="Manage API keys and webhooks"
            />
            <SettingItem
              icon={<Shield className="w-4 h-4" />}
              title="Security"
              description="Configure security and permissions"
            />
          </div>
        </div>

        <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-yellow-500" />
            User Management
          </h2>
          <div className="space-y-3">
            <UserRow name="John Doe" email="john@company.com" role="Admin" status="active" />
            <UserRow name="Jane Smith" email="jane@company.com" role="Manager" status="active" />
            <UserRow name="Bob Johnson" email="bob@company.com" role="User" status="active" />
            <UserRow name="Alice Williams" email="alice@company.com" role="User" status="inactive" />
          </div>
          <Button className="w-full mt-4 bg-yellow-600 hover:bg-yellow-700 text-black">
            Add New User
          </Button>
        </div>

        <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Database className="w-5 h-5 text-yellow-500" />
            Database Management
          </h2>
          <div className="space-y-4">
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white text-sm font-medium">Database Size</span>
                <span className="text-yellow-500 text-sm">2.4 GB / 10 GB</span>
              </div>
              <div className="w-full bg-zinc-700 rounded-full h-2">
                <div className="bg-yellow-500 h-2 rounded-full" style={{ width: "24%" }}></div>
              </div>
            </div>
            <div className="space-y-2">
              <Button variant="outline" className="w-full border-zinc-700 text-zinc-300 hover:border-yellow-500 hover:text-yellow-500">
                Backup Database
              </Button>
              <Button variant="outline" className="w-full border-zinc-700 text-zinc-300 hover:border-yellow-500 hover:text-yellow-500">
                Export Data
              </Button>
              <Button variant="outline" className="w-full border-zinc-700 text-zinc-300 hover:border-yellow-500 hover:text-yellow-500">
                View Logs
              </Button>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-yellow-500" />
            Security & Compliance
          </h2>
          <div className="space-y-4">
            <SecurityItem title="Two-Factor Authentication" enabled={true} />
            <SecurityItem title="Password Policy" enabled={true} />
            <SecurityItem title="Session Timeout" enabled={true} />
            <SecurityItem title="IP Whitelist" enabled={false} />
            <SecurityItem title="Audit Logging" enabled={true} />
            <SecurityItem title="Data Encryption" enabled={true} />
          </div>
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
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  );
}

function SettingItem({ icon, title, description }: any) {
  return (
    <div className="flex items-center justify-between p-3 bg-zinc-800/50 border border-zinc-700 rounded-lg hover:border-yellow-500/50 transition-all cursor-pointer group">
      <div className="flex items-center gap-3">
        <div className="text-zinc-400 group-hover:text-yellow-500 transition-colors">{icon}</div>
        <div>
          <h4 className="text-white text-sm font-medium">{title}</h4>
          <p className="text-zinc-500 text-xs">{description}</p>
        </div>
      </div>
      <span className="text-zinc-600 group-hover:text-yellow-500 transition-colors">→</span>
    </div>
  );
}

function UserRow({ name, email, role, status }: any) {
  return (
    <div className="flex items-center justify-between p-3 bg-zinc-800/50 border border-zinc-700 rounded-lg">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-yellow-600/10 border border-yellow-600/20 flex items-center justify-center">
          <span className="text-yellow-500 text-sm font-medium">{name[0]}</span>
        </div>
        <div>
          <h4 className="text-white text-sm font-medium">{name}</h4>
          <p className="text-zinc-500 text-xs">{email}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs px-2 py-1 rounded bg-zinc-700 text-zinc-300">{role}</span>
        <span
          className={`w-2 h-2 rounded-full ${
            status === "active" ? "bg-green-500" : "bg-zinc-600"
          }`}
        ></span>
      </div>
    </div>
  );
}

function SecurityItem({ title, enabled }: any) {
  return (
    <div className="flex items-center justify-between p-3 bg-zinc-800/50 border border-zinc-700 rounded-lg">
      <span className="text-white text-sm">{title}</span>
      <div
        className={`w-10 h-5 rounded-full transition-colors ${
          enabled ? "bg-green-500" : "bg-zinc-700"
        }`}
      >
        <div
          className={`w-4 h-4 rounded-full bg-white transition-transform ${
            enabled ? "translate-x-5" : "translate-x-0.5"
          } mt-0.5`}
        ></div>
      </div>
    </div>
  );
}
