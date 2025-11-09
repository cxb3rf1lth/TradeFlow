import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useUser } from "@/hooks/use-user";
import { apiRequest } from "@/lib/api-request";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Task, User, Integration } from "@shared/schema";
import { TrendingUp, TrendingDown, BarChart3, PieChart, Activity, Sparkles, RefreshCw, Calendar } from "lucide-react";

interface AnalyticsData {
  taskCompletionRate: number;
  averageCompletionTime: number;
  tasksCreatedThisWeek: number;
  tasksCompletedThisWeek: number;
  overdueTasksCount: number;
  productivityScore: number;
}

interface AIInsight {
  type: "success" | "warning" | "info";
  title: string;
  message: string;
  recommendation?: string;
}

export default function AnalyticsPage() {
  const { user } = useUser();
  const [timeRange, setTimeRange] = useState("week");
  const [selectedUser, setSelectedUser] = useState<string>("all");

  // Fetch tasks
  const { data: tasks = [], isLoading: tasksLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
    queryFn: () => apiRequest("/api/tasks"),
  });

  // Fetch users
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
    queryFn: () => apiRequest("/api/users"),
  });

  // Fetch integrations
  const { data: integrations = [] } = useQuery<Integration[]>({
    queryKey: ["/api/integrations"],
    queryFn: () => apiRequest("/api/integrations"),
  });

  // Fetch analytics data
  const { data: analytics, isLoading: analyticsLoading } = useQuery<AnalyticsData>({
    queryKey: ["/api/analytics", timeRange, selectedUser],
    queryFn: () => apiRequest(`/api/analytics?timeRange=${timeRange}&userId=${selectedUser}`),
  });

  // Fetch AI insights
  const { data: aiInsights = [], isLoading: insightsLoading } = useQuery<AIInsight[]>({
    queryKey: ["/api/ai/analytics-insights"],
    queryFn: () => apiRequest("/api/ai/analytics-insights"),
  });

  // Calculate metrics from tasks
  const calculateMetrics = () => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const filteredTasks = selectedUser === "all"
      ? tasks
      : tasks.filter((t) => t.assigneeId === selectedUser);

    const completedTasks = filteredTasks.filter((t) => t.status === "completed");
    const inProgressTasks = filteredTasks.filter((t) => t.status === "in_progress");
    const todoTasks = filteredTasks.filter((t) => t.status === "todo");
    const overdueTasks = filteredTasks.filter(
      (t) => t.dueDate && new Date(t.dueDate) < now && t.status !== "completed"
    );

    const timeRangeDate = timeRange === "week" ? weekAgo : monthAgo;
    const tasksInRange = filteredTasks.filter(
      (t) => t.createdAt && new Date(t.createdAt) >= timeRangeDate
    );
    const completedInRange = tasksInRange.filter((t) => t.status === "completed");

    const completionRate = filteredTasks.length > 0
      ? (completedTasks.length / filteredTasks.length) * 100
      : 0;

    return {
      total: filteredTasks.length,
      completed: completedTasks.length,
      inProgress: inProgressTasks.length,
      todo: todoTasks.length,
      overdue: overdueTasks.length,
      completionRate,
      tasksInRange: tasksInRange.length,
      completedInRange: completedInRange.length,
    };
  };

  // Calculate workload distribution by user
  const calculateWorkloadDistribution = () => {
    const distribution: Record<string, { total: number; completed: number; inProgress: number }> = {};

    users.forEach((user) => {
      const userTasks = tasks.filter((t) => t.assigneeId === user.id);
      distribution[user.id] = {
        total: userTasks.length,
        completed: userTasks.filter((t) => t.status === "completed").length,
        inProgress: userTasks.filter((t) => t.status === "in_progress").length,
      };
    });

    return distribution;
  };

  // Calculate task distribution by priority
  const calculatePriorityDistribution = () => {
    const filteredTasks = selectedUser === "all"
      ? tasks
      : tasks.filter((t) => t.assigneeId === selectedUser);

    return {
      high: filteredTasks.filter((t) => t.priority === "high").length,
      medium: filteredTasks.filter((t) => t.priority === "medium").length,
      low: filteredTasks.filter((t) => t.priority === "low").length,
    };
  };

  // Calculate integration stats
  const calculateIntegrationStats = () => {
    const connected = integrations.filter((i) => i.status === "connected").length;
    const tasksBySource: Record<string, number> = {};

    tasks.forEach((task) => {
      tasksBySource[task.source] = (tasksBySource[task.source] || 0) + 1;
    });

    return {
      connectedIntegrations: connected,
      totalIntegrations: integrations.length,
      tasksBySource,
    };
  };

  const metrics = calculateMetrics();
  const workloadDistribution = calculateWorkloadDistribution();
  const priorityDistribution = calculatePriorityDistribution();
  const integrationStats = calculateIntegrationStats();

  const ProgressBar = ({ value, max, color }: { value: number; max: number; color: string }) => {
    const percentage = max > 0 ? (value / max) * 100 : 0;
    return (
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className={`${color} h-2.5 rounded-full transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    );
  };

  if (tasksLoading || analyticsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">
            Insights into your workflow performance and productivity
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Last 7 Days</SelectItem>
              <SelectItem value="month">Last 30 Days</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedUser} onValueChange={setSelectedUser}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Users</SelectItem>
              {users.map((u) => (
                <SelectItem key={u.id} value={u.id}>
                  {u.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.completionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {metrics.completed} of {metrics.total} tasks completed
            </p>
            <ProgressBar value={metrics.completed} max={metrics.total} color="bg-green-500" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasks This {timeRange === "week" ? "Week" : "Month"}</CardTitle>
            <Calendar className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.tasksInRange}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.completedInRange} completed
            </p>
            <ProgressBar
              value={metrics.completedInRange}
              max={metrics.tasksInRange}
              color="bg-blue-500"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Activity className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.inProgress}</div>
            <p className="text-xs text-muted-foreground">Currently active tasks</p>
            <ProgressBar value={metrics.inProgress} max={metrics.total} color="bg-yellow-500" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.overdue}</div>
            <p className="text-xs text-muted-foreground">Require immediate attention</p>
            <ProgressBar value={metrics.overdue} max={metrics.total} color="bg-red-500" />
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="tasks" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tasks">
            <BarChart3 className="mr-2 h-4 w-4" />
            Task Analytics
          </TabsTrigger>
          <TabsTrigger value="workload">
            <PieChart className="mr-2 h-4 w-4" />
            Workload Distribution
          </TabsTrigger>
          <TabsTrigger value="integrations">
            <Activity className="mr-2 h-4 w-4" />
            Integration Analytics
          </TabsTrigger>
          <TabsTrigger value="insights">
            <Sparkles className="mr-2 h-4 w-4" />
            AI Insights
          </TabsTrigger>
        </TabsList>

        {/* Task Analytics Tab */}
        <TabsContent value="tasks" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Task Status Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Task Status Breakdown</CardTitle>
                <CardDescription>Distribution of tasks by status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Completed</span>
                    <Badge variant="default">{metrics.completed}</Badge>
                  </div>
                  <ProgressBar value={metrics.completed} max={metrics.total} color="bg-green-500" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>In Progress</span>
                    <Badge variant="secondary">{metrics.inProgress}</Badge>
                  </div>
                  <ProgressBar value={metrics.inProgress} max={metrics.total} color="bg-yellow-500" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>To Do</span>
                    <Badge variant="outline">{metrics.todo}</Badge>
                  </div>
                  <ProgressBar value={metrics.todo} max={metrics.total} color="bg-blue-500" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Overdue</span>
                    <Badge variant="destructive">{metrics.overdue}</Badge>
                  </div>
                  <ProgressBar value={metrics.overdue} max={metrics.total} color="bg-red-500" />
                </div>
              </CardContent>
            </Card>

            {/* Priority Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Priority Distribution</CardTitle>
                <CardDescription>Tasks organized by priority level</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>High Priority</span>
                    <Badge variant="destructive">{priorityDistribution.high}</Badge>
                  </div>
                  <ProgressBar
                    value={priorityDistribution.high}
                    max={metrics.total}
                    color="bg-red-500"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Medium Priority</span>
                    <Badge variant="default">{priorityDistribution.medium}</Badge>
                  </div>
                  <ProgressBar
                    value={priorityDistribution.medium}
                    max={metrics.total}
                    color="bg-yellow-500"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Low Priority</span>
                    <Badge variant="secondary">{priorityDistribution.low}</Badge>
                  </div>
                  <ProgressBar
                    value={priorityDistribution.low}
                    max={metrics.total}
                    color="bg-green-500"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Workload Distribution Tab */}
        <TabsContent value="workload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Team Workload Distribution</CardTitle>
              <CardDescription>Task distribution across team members</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {users.map((user) => {
                  const userWorkload = workloadDistribution[user.id] || {
                    total: 0,
                    completed: 0,
                    inProgress: 0,
                  };
                  return (
                    <div key={user.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {user.role.replace("_", " ")}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{userWorkload.total} tasks</p>
                          <p className="text-xs text-muted-foreground">
                            {userWorkload.completed} completed
                          </p>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <ProgressBar
                          value={userWorkload.completed}
                          max={userWorkload.total}
                          color="bg-green-500"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Completed: {userWorkload.completed}</span>
                          <span>In Progress: {userWorkload.inProgress}</span>
                          <span>
                            Remaining: {userWorkload.total - userWorkload.completed - userWorkload.inProgress}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integration Analytics Tab */}
        <TabsContent value="integrations" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Integration Status</CardTitle>
                <CardDescription>Connected services overview</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Connected Integrations</span>
                  <Badge variant="default">{integrationStats.connectedIntegrations}</Badge>
                </div>
                <ProgressBar
                  value={integrationStats.connectedIntegrations}
                  max={integrationStats.totalIntegrations}
                  color="bg-blue-500"
                />
                <p className="text-xs text-muted-foreground">
                  {integrationStats.connectedIntegrations} of {integrationStats.totalIntegrations}{" "}
                  available integrations connected
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tasks by Source</CardTitle>
                <CardDescription>Where your tasks come from</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(integrationStats.tasksBySource).map(([source, count]) => (
                  <div key={source} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="capitalize">{source.replace("_", " ")}</span>
                      <Badge variant="outline">{count}</Badge>
                    </div>
                    <ProgressBar value={count} max={metrics.total} color="bg-purple-500" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* AI Insights Tab */}
        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-500" />
                AI-Generated Insights & Recommendations
              </CardTitle>
              <CardDescription>
                Intelligent analysis of your workflow patterns and suggestions for improvement
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {insightsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin" />
                </div>
              ) : aiInsights.length === 0 ? (
                <Alert>
                  <Sparkles className="h-4 w-4" />
                  <AlertDescription>
                    AI is analyzing your workflow data. Check back soon for personalized insights and
                    recommendations!
                  </AlertDescription>
                </Alert>
              ) : (
                aiInsights.map((insight, index) => (
                  <Alert key={index} variant={insight.type === "warning" ? "destructive" : "default"}>
                    <div className="space-y-2">
                      <div className="font-semibold">{insight.title}</div>
                      <AlertDescription>{insight.message}</AlertDescription>
                      {insight.recommendation && (
                        <div className="mt-2 p-2 bg-muted rounded-md">
                          <p className="text-xs font-medium">Recommendation:</p>
                          <p className="text-xs text-muted-foreground">{insight.recommendation}</p>
                        </div>
                      )}
                    </div>
                  </Alert>
                ))
              )}

              {/* Productivity Score */}
              {analytics && (
                <Card className="border-purple-500 border-2">
                  <CardHeader>
                    <CardTitle className="text-lg">Productivity Score</CardTitle>
                    <CardDescription>Your overall workflow efficiency rating</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4">
                      <div className="text-5xl font-bold text-purple-500">
                        {analytics.productivityScore || 85}
                      </div>
                      <div className="flex-1">
                        <ProgressBar
                          value={analytics.productivityScore || 85}
                          max={100}
                          color="bg-purple-500"
                        />
                        <p className="text-xs text-muted-foreground mt-2">
                          Based on completion rate, timeliness, and workload balance
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
