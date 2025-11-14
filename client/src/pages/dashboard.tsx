import { useState } from "react";
import { StatCard } from "@/components/stat-card";
import { TaskCard } from "@/components/task-card";
import { IntegrationStatus } from "@/components/integration-status";
import { ActivityTimeline } from "@/components/activity-timeline";
import { TeamWorkload } from "@/components/team-workload";
import { AIInsights } from "@/components/ai-insights";
import {
  CheckSquare, Clock, AlertCircle, TrendingUp, Calendar, Filter,
  Download, RefreshCw, Users, Target, BarChart3, Clock4
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";

const mockTasks = [
  {
    id: "1",
    title: "Review Q4 sales pipeline",
    description: "Analyze HubSpot deals and prepare summary for board meeting",
    status: "in-progress",
    priority: "high" as const,
    source: "hubspot" as const,
    dueDate: "Dec 15",
    assignee: { name: "Sarah Chen" },
    progress: 65,
    tags: ["sales", "quarterly"],
  },
  {
    id: "2",
    title: "Update project roadmap",
    description: "Sync with engineering team on delivery timeline",
    status: "todo",
    priority: "medium" as const,
    source: "jira" as const,
    dueDate: "Dec 20",
    assignee: { name: "Mike Ross" },
    progress: 30,
    tags: ["engineering", "planning"],
  },
  {
    id: "3",
    title: "Prepare investor deck",
    description: "Update slides with Q4 metrics and 2024 projections",
    status: "in-progress",
    priority: "high" as const,
    source: "trello" as const,
    dueDate: "Dec 18",
    assignee: { name: "Emma Wilson" },
    progress: 80,
    tags: ["finance", "presentation"],
  },
  {
    id: "4",
    title: "Team performance reviews",
    description: "Complete quarterly reviews for executive team",
    status: "todo",
    priority: "medium" as const,
    source: "teams" as const,
    dueDate: "Dec 22",
    assignee: { name: "John Doe" },
    progress: 10,
    tags: ["hr", "quarterly"],
  },
  {
    id: "5",
    title: "Security audit completion",
    description: "Finalize security review with compliance team",
    status: "in-progress",
    priority: "high" as const,
    source: "jira" as const,
    dueDate: "Dec 12",
    assignee: { name: "Alex Kim" },
    progress: 90,
    tags: ["security", "compliance"],
  },
];

const upcomingEvents = [
  { id: 1, title: "Board Meeting", time: "Today, 2:00 PM", type: "meeting" },
  { id: 2, title: "Q4 Review Deadline", time: "Dec 15", type: "deadline" },
  { id: 3, title: "Team Standup", time: "Tomorrow, 9:00 AM", type: "meeting" },
  { id: 4, title: "Budget Review", time: "Dec 18, 3:00 PM", type: "meeting" },
];

const projectMetrics = [
  { name: "Project Alpha", completion: 85, status: "on-track", tasks: "12/14" },
  { name: "Project Beta", completion: 45, status: "at-risk", tasks: "9/20" },
  { name: "Project Gamma", completion: 92, status: "on-track", tasks: "23/25" },
  { name: "Project Delta", completion: 60, status: "on-track", tasks: "15/25" },
];

export default function Dashboard() {
  const [timeRange, setTimeRange] = useState("7d");
  const [taskFilter, setTaskFilter] = useState("all");
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleExport = () => {
    console.log("Exporting dashboard data...");
  };

  const filteredTasks = mockTasks.filter(task => {
    if (taskFilter === "all") return true;
    if (taskFilter === "high") return task.priority === "high";
    if (taskFilter === "overdue") return false;
    if (taskFilter === "my-tasks") return task.assignee.name === "Sarah Chen";
    return true;
  });

  return (
    <div className="space-y-6" role="region" aria-label="Dashboard overview">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-1">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Welcome back! Here's your team overview and priority tasks.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[140px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24 hours</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="icon" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Export Options</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleExport}>Export as PDF</DropdownMenuItem>
              <DropdownMenuItem onClick={handleExport}>Export as Excel</DropdownMenuItem>
              <DropdownMenuItem onClick={handleExport}>Export as CSV</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" role="region" aria-label="Key metrics">
        <StatCard title="Tasks Completed" value={42} change={12.5} icon={CheckSquare} iconColor="text-green-600" />
        <StatCard title="In Progress" value={18} change={-5} icon={Clock} iconColor="text-blue-600" />
        <StatCard title="Overdue" value={3} icon={AlertCircle} iconColor="text-red-600" />
        <StatCard title="Completion Rate" value="87%" change={3.2} icon={TrendingUp} iconColor="text-purple-600" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />Team Capacity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">73%</div>
            <Progress value={73} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">8 of 11 team members at capacity</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4" />Sprint Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">62%</div>
            <Progress value={62} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">5 days remaining in sprint</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock4 className="h-4 w-4" />Avg. Completion Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3.2d</div>
            <p className="text-xs text-muted-foreground mt-2">
              <span className="text-green-600">↓ 0.5d</span> vs last sprint
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">Priority Tasks</CardTitle>
                <Select value={taskFilter} onValueChange={setTaskFilter}>
                  <SelectTrigger className="w-[160px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tasks</SelectItem>
                    <SelectItem value="high">High Priority</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                    <SelectItem value="my-tasks">My Tasks</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="list" className="w-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="list">List View</TabsTrigger>
                  <TabsTrigger value="board">Board View</TabsTrigger>
                </TabsList>
                <TabsContent value="list" className="space-y-3 mt-0">
                  {filteredTasks.map((task) => (
                    <div key={task.id} className="border rounded-lg p-4 hover:bg-accent/50 transition-colors">
                      <TaskCard {...task} onClick={() => console.log('Task clicked:', task.id)} />
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                          <span>Progress</span><span>{task.progress}%</span>
                        </div>
                        <Progress value={task.progress} className="h-1.5" />
                      </div>
                      <div className="flex gap-1 mt-2">
                        {task.tags?.map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </TabsContent>
                <TabsContent value="board" className="mt-0">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <h4 className="font-medium mb-3 text-sm">To Do</h4>
                      {filteredTasks.filter(t => t.status === 'todo').map((task) => (
                        <div key={task.id} className="border rounded p-3 mb-2 bg-card">
                          <p className="font-medium text-sm">{task.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">{task.assignee.name}</p>
                        </div>
                      ))}
                    </div>
                    <div>
                      <h4 className="font-medium mb-3 text-sm">In Progress</h4>
                      {filteredTasks.filter(t => t.status === 'in-progress').map((task) => (
                        <div key={task.id} className="border rounded p-3 mb-2 bg-card">
                          <p className="font-medium text-sm">{task.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">{task.assignee.name}</p>
                        </div>
                      ))}
                    </div>
                    <div>
                      <h4 className="font-medium mb-3 text-sm">Done</h4>
                      {filteredTasks.filter(t => t.status === 'done').map((task) => (
                        <div key={task.id} className="border rounded p-3 mb-2 bg-card">
                          <p className="font-medium text-sm">{task.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">{task.assignee.name}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />Project Status
              </CardTitle>
              <CardDescription>Overview of all active projects</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {projectMetrics.map((project) => (
                <div key={project.name} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{project.name}</span>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={
                          project.status === 'on-track'
                            ? 'border-green-500 text-green-700'
                            : 'border-yellow-500 text-yellow-700'
                        }
                      >
                        {project.status}
                      </Badge>
                      <span className="text-muted-foreground">{project.tasks}</span>
                    </div>
                  </div>
                  <Progress value={project.completion} />
                </div>
              ))}
            </CardContent>
          </Card>

          <TeamWorkload />
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Calendar className="h-5 w-5" />Upcoming Events
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="flex items-start gap-3 pb-3 border-b last:border-0 last:pb-0">
                  <div className="h-2 w-2 rounded-full bg-blue-500 mt-2" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{event.title}</p>
                    <p className="text-xs text-muted-foreground">{event.time}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">{event.type}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
          <AIInsights />
          <IntegrationStatus />
          <ActivityTimeline />
        </div>
      </div>
    </div>
  );
}
