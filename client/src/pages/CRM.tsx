import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Users, Building, DollarSign, Plus, Search } from "lucide-react";
import { ContactDialog } from "@/components/ContactDialog";
import { CompanyDialog } from "@/components/CompanyDialog";
import { DealDialog } from "@/components/DealDialog";

type Tab = "contacts" | "companies" | "deals";

export default function CRM() {
  const [activeTab, setActiveTab] = useState<Tab>("contacts");
  const [searchQuery, setSearchQuery] = useState("");
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [companyDialogOpen, setCompanyDialogOpen] = useState(false);
  const [dealDialogOpen, setDealDialogOpen] = useState(false);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-black mb-2">CRM</h1>
        <p className="text-zinc-400">Manage your contacts, companies, and deals</p>
      </div>

      <div className="flex items-center gap-4 mb-6 border-b border-zinc-800">
        <TabButton active={activeTab === "contacts"} onClick={() => setActiveTab("contacts")} icon={Users} label="Contacts" />
        <TabButton active={activeTab === "companies"} onClick={() => setActiveTab("companies")} icon={Building} label="Companies" />
        <TabButton active={activeTab === "deals"} onClick={() => setActiveTab("deals")} icon={DollarSign} label="Deals" />
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
          <input
            type="text"
            placeholder={`Search ${activeTab}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-zinc-900/50 border border-zinc-800 rounded-lg text-black placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
        </div>
        <button 
          onClick={() => {
            if (activeTab === "contacts") setContactDialogOpen(true);
            else if (activeTab === "companies") setCompanyDialogOpen(true);
            else if (activeTab === "deals") setDealDialogOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add {activeTab.slice(0, -1)}
        </button>
      </div>

      <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-xl p-6">
        {activeTab === "contacts" && <ContactsList searchQuery={searchQuery} />}
        {activeTab === "companies" && <CompaniesList searchQuery={searchQuery} />}
        {activeTab === "deals" && <DealsList searchQuery={searchQuery} />}
      </div>

      <ContactDialog open={contactDialogOpen} onOpenChange={setContactDialogOpen} />
      <CompanyDialog open={companyDialogOpen} onOpenChange={setCompanyDialogOpen} />
      <DealDialog open={dealDialogOpen} onOpenChange={setDealDialogOpen} />
    </div>
  );
}

function TabButton({ active, onClick, icon: Icon, label }: any) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-all ${
        active ? "border-yellow-500 text-yellow-400" : "border-transparent text-zinc-400 hover:text-black"
      }`}
    >
      <Icon className="w-5 h-5" />
      <span className="font-medium">{label}</span>
    </button>
  );
}

function ContactsList({ searchQuery }: { searchQuery: string }) {
  const { data: contacts, isLoading } = useQuery({ queryKey: ["/api/contacts"] });

  if (isLoading) return <LoadingState />;
  if (!contacts || !Array.isArray(contacts) || contacts.length === 0) {
    return <EmptyState icon={Users} title="No contacts yet" description="Start by adding your first contact" />;
  }

  const filtered = contacts.filter((contact: any) => 
    searchQuery === "" || 
    contact.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (filtered.length === 0) {
    return <EmptyState icon={Users} title="No contacts found" description="Try adjusting your search" />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {filtered.map((contact: any) => (
        <div key={contact.id} className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4 hover:border-yellow-500 transition-all">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-black font-semibold">
              {contact.firstName[0]}{contact.lastName[0]}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-black font-semibold truncate">{contact.firstName} {contact.lastName}</h3>
              <p className="text-zinc-400 text-sm truncate">{contact.email}</p>
              <p className="text-zinc-500 text-xs mt-1">{contact.phone}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function CompaniesList({ searchQuery }: { searchQuery: string }) {
  const { data: companies, isLoading } = useQuery({ queryKey: ["/api/companies"] });

  if (isLoading) return <LoadingState />;
  if (!companies || !Array.isArray(companies) || companies.length === 0) {
    return <EmptyState icon={Building} title="No companies yet" description="Start by adding your first company" />;
  }

  const filtered = companies.filter((company: any) => 
    searchQuery === "" || 
    company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    company.domain?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    company.industry?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (filtered.length === 0) {
    return <EmptyState icon={Building} title="No companies found" description="Try adjusting your search" />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {filtered.map((company: any) => (
        <div key={company.id} className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4 hover:border-yellow-500 transition-all">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
              <Building className="w-6 h-6 text-black" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-black font-semibold truncate">{company.name}</h3>
              <p className="text-zinc-400 text-sm truncate">{company.domain}</p>
              <p className="text-zinc-500 text-xs mt-1">{company.industry}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function DealsList({ searchQuery }: { searchQuery: string }) {
  const { data: deals, isLoading } = useQuery({ queryKey: ["/api/deals"] });

  if (isLoading) return <LoadingState />;
  if (!deals || !Array.isArray(deals) || deals.length === 0) {
    return <EmptyState icon={DollarSign} title="No deals yet" description="Start by adding your first deal" />;
  }

  const filtered = deals.filter((deal: any) => 
    searchQuery === "" || 
    deal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    deal.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (filtered.length === 0) {
    return <EmptyState icon={DollarSign} title="No deals found" description="Try adjusting your search" />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {filtered.map((deal: any) => (
        <div key={deal.id} className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4 hover:border-yellow-500 transition-all">
          <h3 className="text-black font-semibold mb-2">{deal.title}</h3>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-green-400">
              ${deal.value ? parseFloat(deal.value).toLocaleString() : '0'}
            </span>
            <span className="px-2 py-1 bg-yellow-600/20 text-yellow-400 text-xs rounded">{deal.status}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ icon: Icon, title, description }: any) {
  return (
    <div className="text-center py-12">
      <Icon className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
      <h3 className="text-xl font-semibold text-black mb-2">{title}</h3>
      <p className="text-zinc-400">{description}</p>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4 animate-pulse">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-full bg-zinc-700" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-zinc-700 rounded w-3/4" />
              <div className="h-3 bg-zinc-700 rounded w-1/2" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
