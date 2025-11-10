import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Skeleton } from "../components/ui/skeleton";
import { ScrollArea } from "../components/ui/scroll-area";
import {
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  CheckSquare,
  Calendar,
  Mail,
  Plus,
  FileText,
  Briefcase,
  Target,
  Activity,
  Clock,
  CheckCircle2,
  AlertCircle,
  Zap,
} from "lucide-react";
import {
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

// Mock data for dashboard
const mockKPIs = {
  totalContacts: { value: 1247, trend: 12.5, isPositive: true },
  dealsValue: { value: 524800, trend: 8.3, isPositive: true },
  tasks: { value: 34, trend: -5.2, isPositive: false },
  revenue: { value: 892400, trend: 15.7, isPositive: true },
};

const mockActivities = [
  {
    id: "1",
    type: "deal",
    action: "New deal created",
    description: "Enterprise Solution for TechCorp",
    timestamp: "2 minutes ago",
    user: "John Doe",
  },
  {
    id: "2",
    type: "contact",
    action: "Contact added",
    description: "Sarah Johnson from Acme Inc.",
    timestamp: "15 minutes ago",
    user: "Jane Smith",
  },
  {
    id: "3",
    type: "task",
    action: "Task completed",
    description: "Follow-up call with client",
    timestamp: "1 hour ago",
    user: "Mike Wilson",
  },
  {
    id: "4",
    type: "email",
    action: "Email sent",
    description: "Proposal sent to 5 prospects",
    timestamp: "2 hours ago",
    user: "System",
  },
  {
    id: "5",
    type: "meeting",
    action: "Meeting scheduled",
    description: "Product demo with potential client",
    timestamp: "3 hours ago",
    user: "John Doe",
  },
];

const mockDealsData = [
  { stage: "Lead", count: 45, value: 125000 },
  { stage: "Qualified", count: 32, value: 180000 },
  { stage: "Proposal", count: 18, value: 145000 },
  { stage: "Negotiation", count: 12, value: 98000 },
  { stage: "Closed Won", count: 8, value: 76800 },
];

const mockRevenueData = [
  { month: "Jan", revenue: 65000, target: 70000 },
  { month: "Feb", revenue: 72000, target: 75000 },
  { month: "Mar", revenue: 81000, target: 80000 },
  { month: "Apr", revenue: 78000, target: 85000 },
  { month: "May", revenue: 89000, target: 90000 },
  { month: "Jun", revenue: 95000, target: 95000 },
];

const mockTasksData = [
  { name: "To Do", value: 12, color: "#3b82f6" },
  { name: "In Progress", value: 8, color: "#f59e0b" },
  { name: "Review", value: 6, color: "#8b5cf6" },
  { name: "Completed", value: 24, color: "#10b981" },
];

const mockUpcomingEvents = [
  {
    id: "1",
    title: "Team Stand-up",
    time: "09:00 AM",
    date: "Today",
    type: "meeting",
  },
  {
    id: "2",
    title: "Client Presentation",
    time: "02:00 PM",
    date: "Today",
    type: "meeting",
  },
  {
    id: "3",
    title: "Product Demo",
    time: "11:00 AM",
    date: "Tomorrow",
    type: "demo",
  },
  {
    id: "4",
    title: "Weekly Review",
    time: "04:00 PM",
    date: "Tomorrow",
    type: "meeting",
  },
];

const mockIntegrations = [
  { name: "HubSpot", status: "connected", lastSync: "2 mins ago", icon: "🎯" },
  { name: "Trello", status: "connected", lastSync: "5 mins ago", icon: "📋" },
  { name: "OneDrive", status: "warning", lastSync: "1 hour ago", icon: "📁" },
  { name: "Teams", status: "connected", lastSync: "Just now", icon: "💬" },
];

export default function Dashboard() {
  // Mock query for user data
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ["user"],
    queryFn: async () => ({
      name: "John Doe",
      email: "john.doe@company.com",
      role: "Executive",
      avatar: null,
    }),
  });

  // Mock query for dashboard data
  const { data: dashboardData, isLoading: dashboardLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => ({
      kpis: mockKPIs,
      activities: mockActivities,
      deals: mockDealsData,
      revenue: mockRevenueData,
      tasks: mockTasksData,
      events: mockUpcomingEvents,
      integrations: mockIntegrations,
    }),
  });

  if (userLoading || dashboardLoading) {
    return (
      <div className="p-8 space-y-8">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="p-4 md:p-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Here's what's happening with your business today.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Calendar className="h-4 w-4 mr-2" />
              Today
            </Button>
            <Button size="sm" className="bg-gradient-to-r from-blue-600 to-indigo-600">
              <Plus className="h-4 w-4 mr-2" />
              Quick Action
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Contacts</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dashboardData?.kpis.totalContacts.value.toLocaleString()}
              </div>
              <div className="flex items-center text-xs mt-1">
                {dashboardData?.kpis.totalContacts.isPositive ? (
                  <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-600 mr-1" />
                )}
                <span
                  className={
                    dashboardData?.kpis.totalContacts.isPositive
                      ? "text-green-600"
                      : "text-red-600"
                  }
                >
                  {dashboardData?.kpis.totalContacts.trend}%
                </span>
                <span className="text-muted-foreground ml-1">from last month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Deals Value</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${(dashboardData?.kpis.dealsValue.value || 0).toLocaleString()}
              </div>
              <div className="flex items-center text-xs mt-1">
                {dashboardData?.kpis.dealsValue.isPositive ? (
                  <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-600 mr-1" />
                )}
                <span
                  className={
                    dashboardData?.kpis.dealsValue.isPositive
                      ? "text-green-600"
                      : "text-red-600"
                  }
                >
                  {dashboardData?.kpis.dealsValue.trend}%
                </span>
                <span className="text-muted-foreground ml-1">from last month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Tasks</CardTitle>
              <CheckSquare className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dashboardData?.kpis.tasks.value}
              </div>
              <div className="flex items-center text-xs mt-1">
                {dashboardData?.kpis.tasks.isPositive ? (
                  <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-600 mr-1" />
                )}
                <span
                  className={
                    dashboardData?.kpis.tasks.isPositive
                      ? "text-green-600"
                      : "text-red-600"
                  }
                >
                  {Math.abs(dashboardData?.kpis.tasks.trend || 0)}%
                </span>
                <span className="text-muted-foreground ml-1">from last week</span>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <Target className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${(dashboardData?.kpis.revenue.value || 0).toLocaleString()}
              </div>
              <div className="flex items-center text-xs mt-1">
                {dashboardData?.kpis.revenue.isPositive ? (
                  <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-600 mr-1" />
                )}
                <span
                  className={
                    dashboardData?.kpis.revenue.isPositive
                      ? "text-green-600"
                      : "text-red-600"
                  }
                >
                  {dashboardData?.kpis.revenue.trend}%
                </span>
                <span className="text-muted-foreground ml-1">from last quarter</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks to get you started</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button variant="outline" className="h-auto flex-col py-4">
                <Users className="h-6 w-6 mb-2" />
                <span className="text-sm">Create Contact</span>
              </Button>
              <Button variant="outline" className="h-auto flex-col py-4">
                <Briefcase className="h-6 w-6 mb-2" />
                <span className="text-sm">New Deal</span>
              </Button>
              <Button variant="outline" className="h-auto flex-col py-4">
                <CheckSquare className="h-6 w-6 mb-2" />
                <span className="text-sm">New Task</span>
              </Button>
              <Button variant="outline" className="h-auto flex-col py-4">
                <Mail className="h-6 w-6 mb-2" />
                <span className="text-sm">Send Email</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          {/* Charts Section */}
          <div className="lg:col-span-4 space-y-4">
            {/* Deals by Stage */}
            <Card>
              <CardHeader>
                <CardTitle>Deals by Stage</CardTitle>
                <CardDescription>Current pipeline distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dashboardData?.deals}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="stage" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#3b82f6" name="Deals" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Revenue Over Time */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue vs Target</CardTitle>
                <CardDescription>Monthly performance overview</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dashboardData?.revenue}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#10b981"
                      strokeWidth={2}
                      name="Revenue"
                    />
                    <Line
                      type="monotone"
                      dataKey="target"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      name="Target"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Side Panel */}
          <div className="lg:col-span-3 space-y-4">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest updates from your team</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px] pr-4">
                  <div className="space-y-4">
                    {dashboardData?.activities.map((activity) => (
                      <div key={activity.id} className="flex gap-3">
                        <div className="flex-shrink-0">
                          <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                            <Activity className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          </div>
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium">{activity.action}</p>
                          <p className="text-sm text-muted-foreground">
                            {activity.description}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {activity.timestamp} • {activity.user}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Tasks Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Tasks Overview</CardTitle>
                <CardDescription>Current task distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={dashboardData?.tasks}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {dashboardData?.tasks.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {dashboardData?.tasks.map((task) => (
                    <div key={task.name} className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: task.color }}
                      />
                      <span className="text-xs text-muted-foreground">
                        {task.name}: {task.value}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Upcoming Events */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Events</CardTitle>
              <CardDescription>Your schedule for today and tomorrow</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dashboardData?.events.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{event.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {event.date} at {event.time}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline">{event.type}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Integration Status */}
          <Card>
            <CardHeader>
              <CardTitle>Integration Status</CardTitle>
              <CardDescription>Connected services and last sync</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dashboardData?.integrations.map((integration) => (
                  <div
                    key={integration.name}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{integration.icon}</div>
                      <div>
                        <p className="font-medium text-sm">{integration.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Last sync: {integration.lastSync}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={
                        integration.status === "connected"
                          ? "default"
                          : integration.status === "warning"
                          ? "secondary"
                          : "destructive"
                      }
                    >
                      {integration.status === "connected" && (
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                      )}
                      {integration.status === "warning" && (
                        <AlertCircle className="h-3 w-3 mr-1" />
                      )}
                      {integration.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
