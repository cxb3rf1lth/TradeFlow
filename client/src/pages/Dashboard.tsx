import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Building2, TrendingUp, Trello, Cloud, Bot } from "lucide-react";
import { Link } from "wouter";
import type { Contact, Company, Deal, Board } from "@/types/api";

export default function Dashboard() {
  const { data: contacts = [] } = useQuery<Contact[]>({
    queryKey: ["/api/crm/contacts"],
  });

  const { data: companies = [] } = useQuery<Company[]>({
    queryKey: ["/api/crm/companies"],
  });

  const { data: deals = [] } = useQuery<Deal[]>({
    queryKey: ["/api/crm/deals"],
  });

  const { data: boards = [] } = useQuery<Board[]>({
    queryKey: ["/api/boards"],
  });

  const stats = [
    {
      title: "Contacts",
      value: contacts?.length || 0,
      icon: Users,
      href: "/crm/contacts",
      color: "bg-blue-500",
    },
    {
      title: "Companies",
      value: companies?.length || 0,
      icon: Building2,
      href: "/crm/companies",
      color: "bg-green-500",
    },
    {
      title: "Active Deals",
      value: deals?.filter((d: any) => d.status === "open").length || 0,
      icon: TrendingUp,
      href: "/crm/deals",
      color: "bg-yellow-500",
    },
    {
      title: "Project Boards",
      value: boards?.length || 0,
      icon: Trello,
      href: "/projects",
      color: "bg-purple-500",
    },
  ];

  const quickActions = [
    {
      title: "OneDrive Files",
      description: "Access and manage your OneDrive files",
      icon: Cloud,
      href: "/onedrive",
    },
    {
      title: "AI Assistant",
      description: "Get intelligent insights and automation",
      icon: Bot,
      href: "/ai",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">
          Welcome to TradeFlow - Your enterprise business platform
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Link key={stat.title} href={stat.href}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <div className={`${stat.color} p-2 rounded-lg`}>
                  <stat.icon className="w-4 h-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {quickActions.map((action) => (
            <Link key={action.title} href={action.href}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <div className="bg-blue-100 p-3 rounded-lg">
                      <action.icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle>{action.title}</CardTitle>
                      <p className="text-sm text-gray-500 mt-1">
                        {action.description}
                      </p>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Recent Activity
        </h2>
        <Card>
          <CardContent className="pt-6">
            <p className="text-gray-500 text-center py-8">
              Activity tracking will appear here
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
