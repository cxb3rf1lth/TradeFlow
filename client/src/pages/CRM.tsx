import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Users, Building, DollarSign, Plus, Search } from "lucide-react";

type Tab = "contacts" | "companies" | "deals";

export default function CRM() {
  const [activeTab, setActiveTab] = useState<Tab>("contacts");
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">CRM</h1>
        <p className="text-slate-400">Manage your contacts, companies, and deals</p>
      </div>

      <div className="flex items-center gap-4 mb-6 border-b border-slate-800">
        <TabButton active={activeTab === "contacts"} onClick={() => setActiveTab("contacts")} icon={Users} label="Contacts" />
        <TabButton active={activeTab === "companies"} onClick={() => setActiveTab("companies")} icon={Building} label="Companies" />
        <TabButton active={activeTab === "deals"} onClick={() => setActiveTab("deals")} icon={DollarSign} label="Deals" />
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder={`Search ${activeTab}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-900/50 border border-slate-800 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors">
          <Plus className="w-5 h-5" />
          Add {activeTab.slice(0, -1)}
        </button>
      </div>

      <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-6">
        {activeTab === "contacts" && <ContactsList />}
        {activeTab === "companies" && <CompaniesList />}
        {activeTab === "deals" && <DealsList />}
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon: Icon, label }: any) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-all ${
        active ? "border-blue-500 text-blue-400" : "border-transparent text-slate-400 hover:text-white"
      }`}
    >
      <Icon className="w-5 h-5" />
      <span className="font-medium">{label}</span>
    </button>
  );
}

function ContactsList() {
  const { data: contacts, isLoading } = useQuery({ queryKey: ["/api/contacts"] });

  if (isLoading) return <LoadingState />;
  if (!contacts || contacts.length === 0) {
    return <EmptyState icon={Users} title="No contacts yet" description="Start by adding your first contact" />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {contacts.map((contact: any) => (
        <div key={contact.id} className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 hover:border-blue-500 transition-all">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
              {contact.firstName[0]}{contact.lastName[0]}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-semibold truncate">{contact.firstName} {contact.lastName}</h3>
              <p className="text-slate-400 text-sm truncate">{contact.email}</p>
              <p className="text-slate-500 text-xs mt-1">{contact.phone}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function CompaniesList() {
  const { data: companies, isLoading } = useQuery({ queryKey: ["/api/companies"] });

  if (isLoading) return <LoadingState />;
  if (!companies || companies.length === 0) {
    return <EmptyState icon={Building} title="No companies yet" description="Start by adding your first company" />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {companies.map((company: any) => (
        <div key={company.id} className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 hover:border-blue-500 transition-all">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
              <Building className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-semibold truncate">{company.name}</h3>
              <p className="text-slate-400 text-sm truncate">{company.domain}</p>
              <p className="text-slate-500 text-xs mt-1">{company.industry}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function DealsList() {
  const { data: deals, isLoading } = useQuery({ queryKey: ["/api/deals"] });

  if (isLoading) return <LoadingState />;
  if (!deals || deals.length === 0) {
    return <EmptyState icon={DollarSign} title="No deals yet" description="Start by adding your first deal" />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {deals.map((deal: any) => (
        <div key={deal.id} className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 hover:border-blue-500 transition-all">
          <h3 className="text-white font-semibold mb-2">{deal.title}</h3>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-green-400">
              ${deal.value ? parseFloat(deal.value).toLocaleString() : '0'}
            </span>
            <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded">{deal.status}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ icon: Icon, title, description }: any) {
  return (
    <div className="text-center py-12">
      <Icon className="w-16 h-16 text-slate-600 mx-auto mb-4" />
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-slate-400">{description}</p>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 animate-pulse">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-full bg-slate-700" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-slate-700 rounded w-3/4" />
              <div className="h-3 bg-slate-700 rounded w-1/2" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
