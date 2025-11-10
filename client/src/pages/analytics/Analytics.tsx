import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Download,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  Percent,
  Activity,
  Calendar,
  Filter,
  BarChart3,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Skeleton } from "../../components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

interface AnalyticsData {
  revenue: {
    total: number;
    change: number;
  };
  dealsWon: {
    total: number;
    change: number;
  };
  conversionRate: {
    rate: number;
    change: number;
  };
  avgDealSize: {
    amount: number;
    change: number;
  };
  revenueByMonth: Array<{
    month: string;
    revenue: number;
    target: number;
  }>;
  dealsBySource: Array<{
    name: string;
    value: number;
  }>;
  winRateBySalesRep: Array<{
    name: string;
    winRate: number;
    deals: number;
  }>;
  pipelineVelocity: Array<{
    week: string;
    deals: number;
    avgDays: number;
  }>;
  activityHeatmap: Array<{
    day: string;
    activities: number;
  }>;
}

// Mock data
const mockAnalyticsData: AnalyticsData = {
  revenue: {
    total: 2450000,
    change: 12.5,
  },
  dealsWon: {
    total: 145,
    change: 8.3,
  },
  conversionRate: {
    rate: 23.5,
    change: -2.1,
  },
  avgDealSize: {
    amount: 16897,
    change: 5.7,
  },
  revenueByMonth: [
    { month: "Jan", revenue: 180000, target: 200000 },
    { month: "Feb", revenue: 220000, target: 200000 },
    { month: "Mar", revenue: 190000, target: 200000 },
    { month: "Apr", revenue: 240000, target: 220000 },
    { month: "May", revenue: 280000, target: 220000 },
    { month: "Jun", revenue: 260000, target: 220000 },
    { month: "Jul", revenue: 310000, target: 250000 },
    { month: "Aug", revenue: 290000, target: 250000 },
    { month: "Sep", revenue: 330000, target: 250000 },
    { month: "Oct", revenue: 340000, target: 280000 },
    { month: "Nov", revenue: 320000, target: 280000 },
    { month: "Dec", revenue: 390000, target: 280000 },
  ],
  dealsBySource: [
    { name: "Website", value: 45 },
    { name: "Referral", value: 30 },
    { name: "Cold Outreach", value: 15 },
    { name: "Partner", value: 25 },
    { name: "Social Media", value: 20 },
    { name: "Events", value: 10 },
  ],
  winRateBySalesRep: [
    { name: "Sarah J.", winRate: 65, deals: 45 },
    { name: "Michael C.", winRate: 58, deals: 38 },
    { name: "Emily D.", winRate: 52, deals: 32 },
    { name: "David R.", winRate: 48, deals: 28 },
    { name: "Jessica L.", winRate: 42, deals: 22 },
  ],
  pipelineVelocity: [
    { week: "W1", deals: 12, avgDays: 28 },
    { week: "W2", deals: 15, avgDays: 26 },
    { week: "W3", deals: 18, avgDays: 24 },
    { week: "W4", deals: 16, avgDays: 25 },
    { week: "W5", deals: 20, avgDays: 22 },
    { week: "W6", deals: 22, avgDays: 20 },
    { week: "W7", deals: 25, avgDays: 18 },
    { week: "W8", deals: 23, avgDays: 19 },
  ],
  activityHeatmap: [
    { day: "Mon", activities: 42 },
    { day: "Tue", activities: 58 },
    { day: "Wed", activities: 65 },
    { day: "Thu", activities: 52 },
    { day: "Fri", activities: 48 },
    { day: "Sat", activities: 15 },
    { day: "Sun", activities: 8 },
  ],
};

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"];

export default function Analytics() {
  const [dateRange, setDateRange] = useState("90days");
  const [teamMemberFilter, setTeamMemberFilter] = useState("all");

  // Fetch analytics data
  const { data: analytics, isLoading } = useQuery<AnalyticsData>({
    queryKey: ["/api/analytics", dateRange, teamMemberFilter],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return mockAnalyticsData;
    },
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat("en-US").format(value);
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">Track your performance and metrics</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select date range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="90days">Last 90 days</SelectItem>
              <SelectItem value="12months">Last 12 months</SelectItem>
              <SelectItem value="ytd">Year to date</SelectItem>
            </SelectContent>
          </Select>
          <Select value={teamMemberFilter} onValueChange={setTeamMemberFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All team members" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Team Members</SelectItem>
              <SelectItem value="sarah">Sarah Johnson</SelectItem>
              <SelectItem value="michael">Michael Chen</SelectItem>
              <SelectItem value="emily">Emily Davis</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(analytics?.revenue.total || 0)}
              </div>
              <div className="flex items-center gap-1 text-xs">
                {(analytics?.revenue.change || 0) >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-destructive" />
                )}
                <span
                  className={
                    (analytics?.revenue.change || 0) >= 0 ? "text-green-500" : "text-destructive"
                  }
                >
                  {Math.abs(analytics?.revenue.change || 0)}%
                </span>
                <span className="text-muted-foreground">vs last period</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Deals Won</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatNumber(analytics?.dealsWon.total || 0)}
              </div>
              <div className="flex items-center gap-1 text-xs">
                {(analytics?.dealsWon.change || 0) >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-destructive" />
                )}
                <span
                  className={
                    (analytics?.dealsWon.change || 0) >= 0 ? "text-green-500" : "text-destructive"
                  }
                >
                  {Math.abs(analytics?.dealsWon.change || 0)}%
                </span>
                <span className="text-muted-foreground">vs last period</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              <Percent className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics?.conversionRate.rate || 0}%</div>
              <div className="flex items-center gap-1 text-xs">
                {(analytics?.conversionRate.change || 0) >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-destructive" />
                )}
                <span
                  className={
                    (analytics?.conversionRate.change || 0) >= 0
                      ? "text-green-500"
                      : "text-destructive"
                  }
                >
                  {Math.abs(analytics?.conversionRate.change || 0)}%
                </span>
                <span className="text-muted-foreground">vs last period</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Deal Size</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(analytics?.avgDealSize.amount || 0)}
              </div>
              <div className="flex items-center gap-1 text-xs">
                {(analytics?.avgDealSize.change || 0) >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-destructive" />
                )}
                <span
                  className={
                    (analytics?.avgDealSize.change || 0) >= 0 ? "text-green-500" : "text-destructive"
                  }
                >
                  {Math.abs(analytics?.avgDealSize.change || 0)}%
                </span>
                <span className="text-muted-foreground">vs last period</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts */}
      <Tabs defaultValue="revenue">
        <TabsList>
          <TabsTrigger value="revenue">Revenue Trend</TabsTrigger>
          <TabsTrigger value="sources">Deal Sources</TabsTrigger>
          <TabsTrigger value="performance">Team Performance</TabsTrigger>
          <TabsTrigger value="pipeline">Pipeline Velocity</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trend</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-[400px]" />
              ) : (
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={analytics?.revenueByMonth}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorTarget" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#8884d8"
                      fillOpacity={1}
                      fill="url(#colorRevenue)"
                      name="Revenue"
                    />
                    <Area
                      type="monotone"
                      dataKey="target"
                      stroke="#82ca9d"
                      fillOpacity={1}
                      fill="url(#colorTarget)"
                      name="Target"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sources" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Deals by Source</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-[350px]" />
                ) : (
                  <ResponsiveContainer width="100%" height={350}>
                    <PieChart>
                      <Pie
                        data={analytics?.dealsBySource}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {analytics?.dealsBySource.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Source Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics?.dealsBySource.map((source, index) => (
                    <div key={source.name} className="flex items-center">
                      <div
                        className="w-3 h-3 rounded-full mr-3"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">{source.name}</span>
                          <span className="text-sm text-muted-foreground">{source.value} deals</span>
                        </div>
                        <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                          <div
                            className="h-full"
                            style={{
                              width: `${
                                (source.value /
                                  analytics.dealsBySource.reduce((sum, s) => sum + s.value, 0)) *
                                100
                              }%`,
                              backgroundColor: COLORS[index % COLORS.length],
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Win Rate by Sales Rep</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-[400px]" />
              ) : (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={analytics?.winRateBySalesRep}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="winRate" fill="#8884d8" name="Win Rate %" />
                    <Bar dataKey="deals" fill="#82ca9d" name="Total Deals" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pipeline" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Pipeline Velocity</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-[400px]" />
              ) : (
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={analytics?.pipelineVelocity}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="deals"
                      stroke="#8884d8"
                      strokeWidth={2}
                      name="Deals Closed"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="avgDays"
                      stroke="#82ca9d"
                      strokeWidth={2}
                      name="Avg Days to Close"
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Activity Heatmap</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-[400px]" />
              ) : (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={analytics?.activityHeatmap}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="activities" fill="#8884d8" name="Activities" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Custom Report Builder Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Custom Report Builder
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Report Type</label>
              <Select defaultValue="revenue">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="revenue">Revenue Report</SelectItem>
                  <SelectItem value="deals">Deals Report</SelectItem>
                  <SelectItem value="contacts">Contacts Report</SelectItem>
                  <SelectItem value="activities">Activities Report</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Group By</label>
              <Select defaultValue="month">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Day</SelectItem>
                  <SelectItem value="week">Week</SelectItem>
                  <SelectItem value="month">Month</SelectItem>
                  <SelectItem value="quarter">Quarter</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Filter By</label>
              <Select defaultValue="all">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Data</SelectItem>
                  <SelectItem value="region">Region</SelectItem>
                  <SelectItem value="product">Product</SelectItem>
                  <SelectItem value="rep">Sales Rep</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-2">
            <Button>
              <BarChart3 className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
            <Button variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
