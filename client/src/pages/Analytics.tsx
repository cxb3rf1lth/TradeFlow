import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Users,
  Building2,
  DollarSign,
  Target,
  Activity,
  Calendar,
} from "lucide-react";

export default function Analytics() {
  const { data: contacts } = useQuery({ queryKey: ["/api/crm/contacts"] });
  const { data: companies } = useQuery({ queryKey: ["/api/crm/companies"] });
  const { data: deals } = useQuery({ queryKey: ["/api/crm/deals"] });
  const { data: activities } = useQuery({ queryKey: ["/api/activities"] });

  // Calculate metrics
  const totalContacts = contacts?.length || 0;
  const totalCompanies = companies?.length || 0;
  const totalDeals = deals?.length || 0;
  const openDeals = deals?.filter((d: any) => d.status === "open").length || 0;
  const wonDeals = deals?.filter((d: any) => d.status === "won").length || 0;
  const totalRevenue = deals
    ?.filter((d: any) => d.status === "won")
    .reduce((sum: number, d: any) => sum + parseFloat(d.value || 0), 0) || 0;

  // Deal pipeline data
  const pipelineData = deals
    ? Object.entries(
        deals.reduce((acc: any, deal: any) => {
          acc[deal.status] = (acc[deal.status] || 0) + 1;
          return acc;
        }, {})
      ).map(([name, value]) => ({ name, value }))
    : [];

  // Revenue by month (mock data - in production, calculate from actual data)
  const revenueData = [
    { month: "Jan", revenue: 45000, deals: 12 },
    { month: "Feb", revenue: 52000, deals: 15 },
    { month: "Mar", revenue: 61000, deals: 18 },
    { month: "Apr", revenue: 58000, deals: 16 },
    { month: "May", revenue: 70000, deals: 22 },
    { month: "Jun", revenue: 85000, deals: 25 },
  ];

  // Activity timeline
  const activityData = [
    { day: "Mon", contacts: 24, deals: 8, tasks: 15 },
    { day: "Tue", contacts: 18, deals: 12, tasks: 22 },
    { day: "Wed", contacts: 32, deals: 6, tasks: 18 },
    { day: "Thu", contacts: 28, deals: 15, tasks: 25 },
    { day: "Fri", contacts: 35, deals: 10, tasks: 20 },
  ];

  // Deal stage distribution
  const dealStages = [
    { name: "Prospecting", value: 30, color: "#3b82f6" },
    { name: "Qualification", value: 25, color: "#8b5cf6" },
    { name: "Proposal", value: 20, color: "#ec4899" },
    { name: "Negotiation", value: 15, color: "#f59e0b" },
    { name: "Closed Won", value: 10, color: "#10b981" },
  ];

  const COLORS = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981"];

  // KPI Cards
  const kpis = [
    {
      title: "Total Revenue",
      value: `$${(totalRevenue / 1000).toFixed(1)}K`,
      change: "+12.5%",
      trend: "up",
      icon: DollarSign,
      color: "bg-green-500",
    },
    {
      title: "Active Deals",
      value: openDeals,
      change: "+8.2%",
      trend: "up",
      icon: Target,
      color: "bg-blue-500",
    },
    {
      title: "Total Contacts",
      value: totalContacts,
      change: "+15.3%",
      trend: "up",
      icon: Users,
      color: "bg-purple-500",
    },
    {
      title: "Companies",
      value: totalCompanies,
      change: "+5.7%",
      trend: "up",
      icon: Building2,
      color: "bg-orange-500",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p className="text-gray-500 mt-1">
          Comprehensive insights into your business performance
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi) => (
          <Card key={kpi.title} className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{kpi.title}</p>
                  <h3 className="text-2xl font-bold mt-2">{kpi.value}</h3>
                  <div className="flex items-center mt-2">
                    {kpi.trend === "up" ? (
                      <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                    )}
                    <span
                      className={`text-sm font-medium ${
                        kpi.trend === "up" ? "text-green-500" : "text-red-500"
                      }`}
                    >
                      {kpi.change}
                    </span>
                    <span className="text-sm text-gray-500 ml-1">vs last month</span>
                  </div>
                </div>
                <div className={`${kpi.color} p-3 rounded-lg`}>
                  <kpi.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Revenue Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#3b82f6"
                fillOpacity={1}
                fill="url(#colorRevenue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="day" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Bar dataKey="contacts" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                <Bar dataKey="deals" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                <Bar dataKey="tasks" fill="#ec4899" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Deal Pipeline Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Deal Pipeline Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={dealStages}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {dealStages.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Deals by Month */}
        <Card>
          <CardHeader>
            <CardTitle>Deals Closed by Month</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="deals"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ fill: "#10b981", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Conversion Funnel */}
        <Card>
          <CardHeader>
            <CardTitle>Conversion Funnel</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">Leads</span>
                  <span className="text-gray-600">500 (100%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className="bg-blue-500 h-3 rounded-full" style={{ width: "100%" }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">Qualified</span>
                  <span className="text-gray-600">350 (70%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className="bg-purple-500 h-3 rounded-full" style={{ width: "70%" }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">Proposal</span>
                  <span className="text-gray-600">200 (40%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className="bg-pink-500 h-3 rounded-full" style={{ width: "40%" }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">Negotiation</span>
                  <span className="text-gray-600">100 (20%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className="bg-orange-500 h-3 rounded-full" style={{ width: "20%" }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">Closed Won</span>
                  <span className="text-gray-600">75 (15%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className="bg-green-500 h-3 rounded-full" style={{ width: "15%" }}></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Contacts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "John Doe", company: "Acme Corp", deals: 12, value: "$125K" },
                { name: "Jane Smith", company: "Tech Inc", deals: 10, value: "$98K" },
                { name: "Bob Johnson", company: "StartupXYZ", deals: 8, value: "$87K" },
              ].map((contact, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-700">
                        {contact.name.split(" ").map((n) => n[0]).join("")}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{contact.name}</p>
                      <p className="text-sm text-gray-500">{contact.company}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-green-600">{contact.value}</p>
                    <p className="text-sm text-gray-500">{contact.deals} deals</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  type: "deal",
                  action: "Deal closed",
                  description: "$50K deal with Acme Corp",
                  time: "2 hours ago",
                },
                {
                  type: "contact",
                  action: "New contact added",
                  description: "Sarah Wilson from Tech Inc",
                  time: "4 hours ago",
                },
                {
                  type: "meeting",
                  action: "Meeting scheduled",
                  description: "Product demo with StartupXYZ",
                  time: "1 day ago",
                },
              ].map((activity, idx) => (
                <div
                  key={idx}
                  className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg"
                >
                  <Activity className="w-5 h-5 text-blue-500 mt-1" />
                  <div className="flex-1">
                    <p className="font-medium">{activity.action}</p>
                    <p className="text-sm text-gray-600">{activity.description}</p>
                    <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
